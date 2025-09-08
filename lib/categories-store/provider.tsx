"use client"

import { fetchClient } from "@/lib/fetch"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { Category, CategoriesContextType } from "./types"

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
)

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setError(null)
      const response = await fetchClient("/api/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshCategories = useCallback(async () => {
    setIsLoading(true)
    await fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const value: CategoriesContextType = {
    categories,
    isLoading,
    error,
    fetchCategories,
    refreshCategories,
  }

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}