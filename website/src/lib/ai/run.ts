import "server-only";

import { AiProviderError, runCompletion } from "@/lib/ai/providers";
import { buildPrompt, findTool, type AiTool } from "@/lib/ai/tools";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Generic tool runner: validate the submitted values against the tool's own
 * field list, build the prompt, call the provider layer, and log usage for the
 * signed-in user. Every tool in `lib/ai/tools.ts` runs through this one path.
 */

export type ToolRunResult =
  | { ok: true; text: string; provider: string; model: string; durationMs: number }
  | { ok: false; code: string; message: string };

const MAX_TOTAL_INPUT = 24_000;

export function validateToolInput(
  tool: AiTool,
  raw: Record<string, unknown>,
): { values: Record<string, string> } | { error: string } {
  const values: Record<string, string> = {};
  let total = 0;

  for (const field of tool.fields) {
    const submitted = raw[field.name];
    const value = typeof submitted === "string" ? submitted.trim() : "";

    if (field.required && !value) return { error: `"${field.label}" is required.` };
    if (field.maxLength && value.length > field.maxLength) {
      return { error: `"${field.label}" is longer than ${field.maxLength} characters.` };
    }
    if (field.kind === "select" && value && !(field.options ?? []).includes(value)) {
      return { error: `"${field.label}" has an unexpected value.` };
    }
    values[field.name] = value;
    total += value.length;
  }

  if (total > MAX_TOTAL_INPUT) return { error: "The input is too long for one run." };
  return { values };
}

/** Best-effort usage log. A failed insert never fails the user's run. */
async function recordRun(entry: {
  userId: string | null;
  tool: AiTool;
  provider: string;
  model: string;
  inputChars: number;
  outputChars: number;
  durationMs: number;
  status: string;
  errorCode?: string;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const admin = createSupabaseAdminLooseClient();
    await admin.from("ai_tool_runs").insert({
      user_id: entry.userId,
      tool_id: entry.tool.id,
      tool_name: entry.tool.name,
      provider: entry.provider,
      model: entry.model,
      input_chars: entry.inputChars,
      output_chars: entry.outputChars,
      duration_ms: entry.durationMs,
      status: entry.status,
      error_code: entry.errorCode ?? null,
    });
  } catch {
    // usage analytics are non-critical
  }
}

export async function runTool(
  toolId: string,
  raw: Record<string, unknown>,
  userId: string | null,
): Promise<ToolRunResult> {
  const tool = findTool(toolId);
  if (!tool) return { ok: false, code: "unknown_tool", message: "That tool does not exist." };

  const parsed = validateToolInput(tool, raw);
  if ("error" in parsed) return { ok: false, code: "invalid_input", message: parsed.error };

  const prompt = buildPrompt(tool, parsed.values);
  const startedAt = Date.now();

  try {
    const { text, provider, model } = await runCompletion({
      provider: tool.provider,
      model: tool.model,
      system: tool.system,
      prompt,
      maxTokens: tool.maxTokens,
    });
    const durationMs = Date.now() - startedAt;
    await recordRun({
      userId,
      tool,
      provider,
      model,
      inputChars: prompt.length,
      outputChars: text.length,
      durationMs,
      status: "success",
    });
    return { ok: true, text, provider, model, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const code = error instanceof AiProviderError ? error.code : "unexpected_error";
    const message =
      error instanceof AiProviderError
        ? error.message
        : "Something went wrong running this tool. Please try again.";
    await recordRun({
      userId,
      tool,
      provider: tool.provider,
      model: tool.model,
      inputChars: prompt.length,
      outputChars: 0,
      durationMs,
      status: "error",
      errorCode: code,
    });
    return { ok: false, code, message };
  }
}
