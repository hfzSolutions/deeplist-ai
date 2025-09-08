import { supabase } from "../supabase/client"
import { ModelConfig } from "./types"

// Database models cache
let modelsCache: ModelConfig[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to convert database model to ModelConfig
function dbModelToConfig(dbModel: any): ModelConfig {
  return {
    id: dbModel.name,
    name: dbModel.display_name,
    provider: dbModel.provider_name,
    providerId: dbModel.provider_id,
    baseProviderId: dbModel.provider_id,
    contextWindow: dbModel.context_length || 4096,
    description: dbModel.description,
    free: dbModel.is_free || false,
    vision: dbModel.capabilities?.includes("vision") || false,
    tools: dbModel.capabilities?.includes("tools") || false,
    reasoning: dbModel.capabilities?.includes("reasoning") || false,
  }
}

// Function to get all models from database
export async function getAllModels(): Promise<ModelConfig[]> {
  const now = Date.now()

  // Use cache if it's still valid
  if (modelsCache && now - lastFetchTime < CACHE_DURATION) {
    return modelsCache || []
  }

  try {
    if (!supabase) {
      console.error("Supabase client not available")
      return []
    }

    const { data: models, error } = await supabase
      .from("models")
      .select("*")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching models:", error)
      return modelsCache || []
    }

    modelsCache = models.map(dbModelToConfig)
    lastFetchTime = now
    return modelsCache
  } catch (error) {
    console.warn("Failed to load models from database:", error)
    return modelsCache || []
  }
}

export async function getModelsWithAccessFlags(): Promise<ModelConfig[]> {
  const models = await getAllModels()

  return models.map((model) => ({
    ...model,
    accessible: true, // All models are accessible
  }))
}

export async function getModelsForProvider(
  provider: string
): Promise<ModelConfig[]> {
  const models = await getAllModels()

  return models
    .filter((model) => model.providerId === provider)
    .map((model) => ({
      ...model,
      accessible: true,
    }))
}

// Function to get models based on user's available providers
export async function getModelsForUserProviders(
  providers: string[]
): Promise<ModelConfig[]> {
  const providerModels = await Promise.all(
    providers.map((provider) => getModelsForProvider(provider))
  )

  return providerModels.flat()
}

// Synchronous function to get model info for simple lookups
// This uses cached data if available
export function getModelInfo(modelId: string): ModelConfig | undefined {
  // Check the cache if it exists
  if (modelsCache) {
    return modelsCache.find((model) => model.id === modelId)
  }

  return undefined
}

// Async function to get model info with database fallback
export async function getModelInfoAsync(
  modelId: string
): Promise<ModelConfig | undefined> {
  const models = await getAllModels()
  return models.find((model) => model.id === modelId)
}

// Function to refresh the models cache
export function refreshModelsCache(): void {
  modelsCache = null
  lastFetchTime = 0
}
