import { ModelConfig } from "@/lib/models/types"

/**
 * Utility function to filter and sort models based on favorites, search, and visibility
 * @param models - All available models
 * @param favoriteModels - Array of favorite model IDs
 * @param searchQuery - Search query to filter by model name
 * @param isModelHidden - Function to check if a model is hidden
 * @returns Filtered and sorted models
 */
export function filterAndSortModels(
  models: ModelConfig[],
  favoriteModels: string[],
  searchQuery: string,
  isModelHidden: (modelId: string) => boolean
): ModelConfig[] {
  return models
    .filter((model) => !isModelHidden(model.id))
    .filter((model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort favorites first if they exist
      const aIsFavorite = favoriteModels?.includes(a.id) || false
      const bIsFavorite = favoriteModels?.includes(b.id) || false
      
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      
      // If both are favorites, maintain their order
      if (aIsFavorite && bIsFavorite) {
        const aIndex = favoriteModels.indexOf(a.id)
        const bIndex = favoriteModels.indexOf(b.id)
        return aIndex - bIndex
      }

      // For non-favorites, sort by accessibility (free models first) then by name
      if (a.accessible !== b.accessible) {
        return a.accessible ? -1 : 1
      }
      
      return a.name.localeCompare(b.name)
    })
}
