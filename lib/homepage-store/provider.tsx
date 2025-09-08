"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type HomepageView = "agents" | "chat"

type HomepageContextType = {
  currentView: HomepageView
  setCurrentView: (view: HomepageView) => void
  forceAgentStoreView: (currentChatUrl?: string) => void
  previousView: HomepageView | null
  setPreviousView: (view: HomepageView | null) => void
  cameFromChat: boolean
  previousChatUrl: string | null
  setPreviousChatUrl: (url: string | null) => void
}

const HomepageContext = createContext<HomepageContextType | undefined>(undefined)

export function HomepageProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<HomepageView>("agents")
  const [previousView, setPreviousView] = useState<HomepageView | null>(null)
  const [previousChatUrl, setPreviousChatUrl] = useState<string | null>(null)

  const forceAgentStoreView = (currentChatUrl?: string) => {
    // Always set previous view to chat when coming from a chat URL
    if (currentChatUrl || currentView === "chat") {
      setPreviousView("chat")
      if (currentChatUrl) {
        setPreviousChatUrl(currentChatUrl)
      }
    }
    setCurrentView("agents")
  }

  const cameFromChat = previousView === "chat" && currentView === "agents"

  return (
    <HomepageContext.Provider
      value={{
        currentView,
        setCurrentView,
        forceAgentStoreView,
        previousView,
        setPreviousView,
        cameFromChat,
        previousChatUrl,
        setPreviousChatUrl,
      }}
    >
      {children}
    </HomepageContext.Provider>
  )
}

export function useHomepage() {
  const context = useContext(HomepageContext)
  if (context === undefined) {
    throw new Error("useHomepage must be used within a HomepageProvider")
  }
  return context
}