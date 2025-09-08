import { env } from "./openproviders/env"

// Simplified - only return system OpenRouter key
export async function getEffectiveApiKey(): Promise<string> {
  return env.OPENROUTER_API_KEY
}

// Remove all other functions:
// - getUserKey()
// - ProviderWithoutOllama type
// - Provider type exports
