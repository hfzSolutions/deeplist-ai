// Simplified environment - OpenRouter only
export const env = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
}

// Remove createEnvWithUserKeys function - no longer needed
export function getOpenRouterKey(): string {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required')
  }
  return env.OPENROUTER_API_KEY
}
