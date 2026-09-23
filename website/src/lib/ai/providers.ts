import "server-only";

/**
 * Unified AI provider layer.
 *
 * One function — runCompletion() — hides OpenAI, Anthropic and Google Gemini
 * behind a single call so a tool config only names a provider + model. Each
 * provider is reached over plain fetch (no SDK dependency) and normalised to
 * `{ text }`. Keys are read from the environment at call time and never leave
 * the server; no key is ever surfaced in an error message.
 */

import { AI_PROVIDERS, type AiProvider } from "@/lib/ai/providers.shared";

export { AI_PROVIDERS };
export type { AiProvider };

export type CompletionRequest = {
  provider: AiProvider;
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
};

export class AiProviderError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const KEY_ENV: Record<AiProvider, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_AI_API_KEY",
};

/** Model used when a tool's preferred provider has no key configured. */
export const FALLBACK_MODEL: Record<AiProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  google: "gemini-2.0-flash",
};

const PLACEHOLDER_MARKER = "REPLACE_WITH";

function readKey(provider: AiProvider): string | null {
  const raw = (process.env[KEY_ENV[provider]] ?? "").trim();
  if (!raw || raw.includes(PLACEHOLDER_MARKER) || raw.length < 12) return null;
  return raw;
}

/** Providers that actually have a usable key configured. */
export function configuredProviders(): AiProvider[] {
  return AI_PROVIDERS.filter((provider) => readKey(provider) !== null);
}

export function isAnyProviderConfigured(): boolean {
  return configuredProviders().length > 0;
}

const TIMEOUT_MS = 60_000;

async function postJson(url: string, headers: HeadersInit, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) {
    // Provider error bodies can echo request content — never surface them.
    throw new AiProviderError(
      response.status === 429 ? "provider_busy" : "provider_error",
      response.status === 429
        ? "The AI provider is rate limiting requests. Please try again in a moment."
        : "The AI provider could not complete this request.",
    );
  }
  return (await response.json()) as Record<string, unknown>;
}

async function runOpenai(request: CompletionRequest, key: string): Promise<string> {
  const data = await postJson(
    "https://api.openai.com/v1/chat/completions",
    { authorization: `Bearer ${key}` },
    {
      model: request.model,
      max_completion_tokens: request.maxTokens ?? 1400,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.prompt },
      ],
    },
  );
  const choices = data.choices as { message?: { content?: string } }[] | undefined;
  return choices?.[0]?.message?.content?.trim() ?? "";
}

async function runAnthropic(request: CompletionRequest, key: string): Promise<string> {
  const data = await postJson(
    "https://api.anthropic.com/v1/messages",
    { "x-api-key": key, "anthropic-version": "2023-06-01" },
    {
      model: request.model,
      max_tokens: request.maxTokens ?? 1400,
      temperature: request.temperature ?? 0.4,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
    },
  );
  const content = data.content as { type?: string; text?: string }[] | undefined;
  return (content ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

async function runGoogle(request: CompletionRequest, key: string): Promise<string> {
  const data = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(request.model)}:generateContent?key=${encodeURIComponent(key)}`,
    {},
    {
      systemInstruction: { parts: [{ text: request.system }] },
      contents: [{ role: "user", parts: [{ text: request.prompt }] }],
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 1400,
        temperature: request.temperature ?? 0.4,
      },
    },
  );
  const candidates = data.candidates as
    | { content?: { parts?: { text?: string }[] } }[]
    | undefined;
  return (candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

/**
 * Run one completion against the requested provider, falling back to any other
 * configured provider when the requested one has no key — so a site with a
 * single API key still runs every tool.
 */
export async function runCompletion(
  request: CompletionRequest,
): Promise<{ text: string; provider: AiProvider; model: string }> {
  const available = configuredProviders();
  if (available.length === 0) {
    throw new AiProviderError(
      "not_configured",
      "AI tools are not configured yet. Add an AI provider API key to enable them.",
    );
  }

  const provider = available.includes(request.provider) ? request.provider : available[0];
  const model = provider === request.provider ? request.model : FALLBACK_MODEL[provider];
  const key = readKey(provider);
  if (!key) {
    throw new AiProviderError("not_configured", "AI tools are not configured yet.");
  }

  const effective: CompletionRequest = { ...request, provider, model };
  let text = "";
  try {
    if (provider === "openai") text = await runOpenai(effective, key);
    else if (provider === "anthropic") text = await runAnthropic(effective, key);
    else text = await runGoogle(effective, key);
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    throw new AiProviderError("provider_unreachable", "Could not reach the AI provider.");
  }

  if (!text) {
    throw new AiProviderError("empty_result", "The AI provider returned an empty result.");
  }
  return { text, provider, model };
}
