// Simplified provider mapping - OpenRouter only
export function getProviderForModel(model: string): 'openrouter' {
  if (!model.startsWith('openrouter:')) {
    throw new Error(`Invalid model format. Expected 'openrouter:' prefix, got: ${model}`)
  }
  return 'openrouter'
}

// Remove all other provider mappings and functions
