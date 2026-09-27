import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

/**
 * First-party page-view beacon (real visitors only). Bots, headless browsers,
 * admin/API paths and floods are dropped before anything is stored. The raw
 * visitor id never reaches the database — only a salted SHA-256 hash.
 */
export const dynamic = "force-dynamic";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|scrapy|phantom|puppeteer|playwright|selenium/i;

const bodySchema = z.object({
  path: z.string().min(1).max(300).startsWith("/"),
  visitorId: z.string().regex(/^[a-z0-9-]{8,64}$/i),
  sessionId: z.string().regex(/^[a-z0-9-]{8,64}$/i),
  referrer: z.string().max(500).optional(),
});

function deviceFrom(ua: string): "desktop" | "mobile" | "tablet" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

function referrerHost(referrer: string | undefined, ownHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").slice(0, 200);
    return host && host !== ownHost?.split(":")[0].replace(/^www\./, "") ? host : null;
  } catch {
    return null;
  }
}

const skip = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return skip();
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return skip();

  let body: z.infer<typeof bodySchema>;
  try {
    const text = await request.text();
    if (text.length > 2048) return skip();
    body = bodySchema.parse(JSON.parse(text));
  } catch {
    return skip();
  }

  const path = body.path.split(/[?#]/)[0] || "/";
  if (/^\/(ajadmin|api|_next|auth)(\/|$)/.test(path)) return skip();

  const ip = clientIpFrom(request.headers);
  if (isRateLimited(`track:${ip}`, { windowMs: 60 * 1000, max: 40 })) return skip();

  const salt = process.env.DATA_ENCRYPTION_KEY ?? "ajs-analytics";
  const visitorHash = createHash("sha256").update(`${salt}:${body.visitorId}`).digest("hex");

  try {
    await createSupabaseAdminLooseClient().from("page_views").insert({
      path,
      visitor_hash: visitorHash,
      session_id: body.sessionId,
      referrer_host: referrerHost(body.referrer, request.headers.get("host")),
      device: deviceFrom(ua),
    });
  } catch {
    // Analytics must never affect the visitor.
  }
  return skip();
}
