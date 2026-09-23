import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { runTool } from "@/lib/ai/run";
import { getCurrentUser } from "@/lib/auth/session";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

/**
 * The single endpoint every in-app AI tool posts to.
 *
 * Hardening: JSON-only, body size capped, Zod-validated shape, same-origin
 * required, signed-in users only (so usage is attributable and rate-limited
 * per account), and a token bucket on top. Provider keys stay server-side; the
 * response never contains provider error bodies.
 */

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

const bodySchema = z.object({
  toolId: z.string().min(1).max(80),
  values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser client; the session check still applies
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  if (request.headers.get("content-type")?.includes("application/json") !== true) {
    return NextResponse.json({ error: "Send JSON." }, { status: 415 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That input is too large." }, { status: 413 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to run AI tools.", code: "unauthenticated" },
      { status: 401 },
    );
  }

  // Per-account bucket: 30 runs per 10 minutes, plus a per-IP guard.
  const ip = clientIpFrom(request.headers);
  if (
    isRateLimited(`ai-run:${user.id}`, { windowMs: 10 * 60 * 1000, max: 30 }) ||
    isRateLimited(`ai-run-ip:${ip}`, { windowMs: 10 * 60 * 1000, max: 60 })
  ) {
    return NextResponse.json(
      { error: "You've reached the usage limit. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data.values)) {
    values[key] = String(value);
  }

  const result = await runTool(parsed.data.toolId, values, user.id);
  if (!result.ok) {
    const status =
      result.code === "invalid_input" ? 400 : result.code === "unknown_tool" ? 404 : 502;
    return NextResponse.json({ error: result.message, code: result.code }, { status });
  }

  return NextResponse.json(
    {
      text: result.text,
      provider: result.provider,
      model: result.model,
      durationMs: result.durationMs,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
