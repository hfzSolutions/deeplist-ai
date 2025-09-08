"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useAgents } from "@/lib/agent-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { cn } from "@/lib/utils"
import { CaretDown, Robot } from "@phosphor-icons/react"
import { useState } from "react"
import { SidebarAgentItem } from "./sidebar-agent-item"

export function SidebarAgents() {
  const { sidebarAgents, isSidebarLoading } = useAgents()
  const { user } = useUser()
  const [isExpanded, setIsExpanded] = useState(false)

  // Hide section completely for unauthenticated users
  if (!user) {
    return null
  }

  if (isSidebarLoading) {
    return (
      <div className="px-2">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    )
  }

  // Filter to show only user-owned agents
  const myAgents = sidebarAgents.filter(agent => agent.user_id === user.id)

  if (myAgents.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-accent/80 hover:text-foreground group/agents relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
      >
        <div className="flex items-center gap-2">
          <Robot size={20} />
          <span>My Agents</span>
          <span className="text-muted-foreground text-xs">
            ({myAgents.length})
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
          {myAgents.map((agent) => (
            <SidebarAgentItem
              key={agent.id}
              agent={agent}
              showFavoriteAction={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
