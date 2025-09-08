"use client"

import { useKeyShortcut } from "@/app/hooks/use-key-shortcut"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useHomepage } from "@/lib/homepage-store/provider"
import { NotePencilIcon } from "@phosphor-icons/react/dist/ssr"
import { usePathname, useRouter } from "next/navigation"

export function ButtonNewChat() {
  const pathname = usePathname()
  const router = useRouter()
  const { forceAgentStoreView } = useHomepage()

  const handleNewChat = () => {
    const currentChatUrl = pathname.startsWith('/c/') ? pathname : undefined
    router.push('/')
    forceAgentStoreView(currentChatUrl)
  }

  useKeyShortcut(
    (e) => (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    handleNewChat
  )

  if (pathname === "/") return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleNewChat}
          className="text-muted-foreground hover:text-foreground hover:bg-muted bg-background rounded-full p-1.5 transition-colors"
          aria-label="New Chat"
        >
          <NotePencilIcon size={24} />
        </button>
      </TooltipTrigger>
      <TooltipContent>New Chat ⌘⇧U</TooltipContent>
    </Tooltip>
  )
}
