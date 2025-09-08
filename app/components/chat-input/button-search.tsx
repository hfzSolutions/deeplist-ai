import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GlobeIcon } from "@phosphor-icons/react"
import React, { useState } from "react"
import { LoginPrompt } from "@/app/components/auth/login-prompt"
import { X } from "lucide-react"

type ButtonSearchProps = {
  isSelected?: boolean
  onToggle?: (isSelected: boolean) => void
  isAuthenticated: boolean
}

export function ButtonSearch({
  isSelected = false,
  onToggle,
  isAuthenticated,
}: ButtonSearchProps) {
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)

  const handleClick = () => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true)
      return
    }
    const newState = !isSelected
    onToggle?.(newState)
  }

  return (
    <>
      <Button
        variant="secondary"
        className={cn(
          "border-border dark:bg-secondary rounded-full border bg-transparent transition-all duration-150 has-[>svg]:px-1.75 md:has-[>svg]:px-3",
          isSelected &&
            "border-[#0091FF]/20 bg-[#E5F3FE] text-[#0091FF] hover:bg-[#E5F3FE] hover:text-[#0091FF]"
        )}
        onClick={handleClick}
      >
        <GlobeIcon className="size-5" />
        <span className="hidden md:block">Search</span>
      </Button>

      {/* Login Prompt Dialog */}
      {loginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full p-0"
              onClick={() => setLoginPromptOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
            <LoginPrompt
              title="Login Required"
              description="You need to be logged in to use search functionality. Please sign in to continue."
              action="use search"
              actionText="Sign In"
            />
          </div>
        </div>
      )}
    </>
  )
}
