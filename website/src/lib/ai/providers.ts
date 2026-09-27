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
import {
  activeCustomProviders,
  markCustomProviderFailed,
  markCustomProviderOk,
} from "@/lib/ai/custom-providers";

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
  openai: "gpt-4.1-mini",
  anthropic: "claude-haiku-4-5",
  google: "gemini-flash-latest",
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

async function postJson(url: string, headers: HeadersInit, body: unknown, timeoutMs = TIMEOUT_MS) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
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

/**
 * Any OpenAI-compatible endpoint (OpenRouter, AgentRouter, Groq, Together,
 * DeepSeek, Mistral, local gateways…) added from the admin panel.
 */
export async function runOpenaiCompatible(
  baseUrl: string,
  key: string,
  model: string,
  request: Pick<CompletionRequest, "system" | "prompt" | "maxTokens" | "temperature">,
  timeoutMs = 35_000,
): Promise<string> {
  const data = await postJson(
    `${baseUrl}/chat/completions`,
    {
      authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ajsystemsoft.in",
      "X-Title": "AJ System Soft AI Tools",
    },
    {
      model,
      max_tokens: request.maxTokens ?? 1400,
      temperature: request.temperature ?? 0.4,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.prompt },
      ],
    },
    timeoutMs,
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
): Promise<{ text: string; provider: string; model: string }> {
  // Admin-managed keys first (priority order, recently failed ones last), then
  // the built-in env keys — the customer only ever sees a working answer.
  let lastError = new AiProviderError("provider_error", "The AI provider could not complete this request.");
  const customs = await activeCustomProviders();
  for (const custom of customs) {
    try {
      const text = await runOpenaiCompatible(custom.baseUrl, custom.key, custom.model, request);
      if (text) {
        markCustomProviderOk(custom.id);
        return { text, provider: custom.label, model: custom.model };
      }
      lastError = new AiProviderError("empty_result", "The AI provider returned an empty result.");
    } catch (error) {
      lastError =
        error instanceof AiProviderError
          ? error
          : new AiProviderError("provider_unreachable", "Could not reach the AI provider.");
    }
    markCustomProviderFailed(custom.id);
  }

  const available = configuredProviders();
  if (available.length === 0) {
    if (customs.length > 0) throw lastError;
    throw new AiProviderError(
      "not_configured",
      "AI tools are not configured yet. Add an AI provider API key to enable them.",
    );
  }

  // Requested provider first, then every other configured one — a revoked key,
  // retired model or outage on one provider never takes the tool down.
  const order = [
    ...available.filter((p) => p === request.provider),
    ...available.filter((p) => p !== request.provider),
  ];
  for (const provider of order) {
    const key = readKey(provider);
    if (!key) continue;
    const model = provider === request.provider ? request.model : FALLBACK_MODEL[provider];
    const effective: CompletionRequest = { ...request, provider, model };
    try {
      const text =
        provider === "openai"
          ? await runOpenai(effective, key)
          : provider === "anthropic"
            ? await runAnthropic(effective, key)
            : await runGoogle(effective, key);
      if (text) return { text, provider, model };
      lastError = new AiProviderError("empty_result", "The AI provider returned an empty result.");
    } catch (error) {
      lastError =
        error instanceof AiProviderError
          ? error
          : new AiProviderError("provider_unreachable", "Could not reach the AI provider.");
    }
  }
  throw lastError;
}
