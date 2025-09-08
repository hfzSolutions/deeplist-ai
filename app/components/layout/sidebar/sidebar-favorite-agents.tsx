"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useAgents } from "@/lib/agent-store/provider"
import { cn } from "@/lib/utils"
import { CaretDown, Bookmark } from "@phosphor-icons/react"
import { useState } from "react"
import { SidebarAgentItem } from "./sidebar-agent-item"

export function SidebarFavoriteAgents() {
  const { favoriteAgents, isFavoritesLoading } = useAgents()
  const [isExpanded, setIsExpanded] = useState(false)

  if (isFavoritesLoading) {
    return (
      <div className="px-2">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    )
  }

  // Always show the section, even with 0 favorites

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-accent/80 hover:text-foreground group/favorites relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bookmark size={20} />
          <span>Saved</span>
          <span className="text-muted-foreground text-xs">
            ({favoriteAgents.length})
          </span>
        </div>
        <CaretDown
          size={14}
          className={cn(
            "text-muted-foreground ml-auto transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="space-y-0.5 pl-4">
          {favoriteAgents.length === 0 ? (
            <div className="text-muted-foreground px-2 py-3 text-sm">
              No saved agents yet.
            </div>
          ) : (
            favoriteAgents.map((agent) => (
              <SidebarAgentItem
                key={agent.id}
                agent={agent}
                showFavoriteAction={true}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
