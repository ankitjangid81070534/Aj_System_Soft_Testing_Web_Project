/**
 * Provider identifiers shared by the server runner and the client UI.
 * Kept separate from `providers.ts` because that module is server-only
 * (it reads API keys) while the tool catalogue is imported by client code.
 */
export const AI_PROVIDERS = ["openai", "anthropic", "google"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: "OpenAI GPT",
  anthropic: "Anthropic Claude",
  google: "Google Gemini",
};
