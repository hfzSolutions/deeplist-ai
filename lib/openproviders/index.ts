import type { LanguageModelV1 } from "@ai-sdk/provider"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { getProviderForModel } from "./provider-map"

export type OpenProvidersOptions = Record<string, any>



export function openproviders(
  modelId: string,
  settings?: OpenProvidersOptions,
  apiKey?: string
): LanguageModelV1 {
  const provider = getProviderForModel(modelId)

  if (provider !== "openrouter") {
    throw new Error(`Only OpenRouter models are supported. Received: ${modelId}`)
  }

  if (!apiKey) {
    throw new Error("OpenRouter API key is required")
  }

  // Extract the actual model name from the openrouter: prefix
  const actualModelId = modelId.replace(/^openrouter:/, "")
  
  const openrouterProvider = createOpenRouter({ apiKey })
  return openrouterProvider(actualModelId, settings)
}
