import { Agent } from "@/lib/agent-store/types"
import { useAgents } from "@/lib/agent-store/provider"
import { Button } from "@/components/ui/button"
import {
  ArrowSquareOutIcon,
  BrainIcon,
  CalendarIcon,
  UserIcon,
  Heart,
  HeartStraight,
} from "@phosphor-icons/react"

type SubMenuProps = {
  hoveredAgentData: Agent
}

export function SubMenu({ hoveredAgentData }: SubMenuProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useAgents()
  const isFav = isFavorite(hoveredAgentData.id)

  const handleToggleFavorite = async () => {
    if (isFav) {
      await removeFromFavorites(hoveredAgentData.id)
    } else {
      await addToFavorites(hoveredAgentData.id)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-popover border-border w-[280px] rounded-md border p-3 shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hoveredAgentData.avatar_url ? (
              <img
                src={hoveredAgentData.avatar_url}
                alt={hoveredAgentData.name}
                className="size-5 rounded-full"
              />
            ) : (
              <UserIcon className="size-5" />
            )}
            <h3 className="font-medium">{hoveredAgentData.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent"
            onClick={handleToggleFavorite}
          >
            {isFav ? (
              <Heart size={14} className="text-red-500" />
            ) : (
              <HeartStraight size={14} className="text-muted-foreground hover:text-red-500" />
            )}
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">
          {hoveredAgentData.description || "No description available"}
        </p>

        <div className="flex flex-col gap-1">
          <div className="mt-1 flex flex-wrap gap-2">
            {hoveredAgentData.is_public && (
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-800 dark:text-green-100">
                <BrainIcon className="size-3" />
                <span>Public</span>
              </div>
            )}

            {hoveredAgentData.model && (
              <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-800 dark:text-blue-100">
                <BrainIcon className="size-3" />
                <span>Model: {hoveredAgentData.model}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {hoveredAgentData.system_prompt && (
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-medium">System Prompt</span>
              <p className="text-muted-foreground text-xs max-h-20 overflow-y-auto">
                {hoveredAgentData.system_prompt}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">Created</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              {formatDate(hoveredAgentData.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">Updated</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              {formatDate(hoveredAgentData.updated_at)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex-1 font-medium">Agent ID</span>
            <span className="text-muted-foreground truncate text-xs">
              {hoveredAgentData.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}