import { LayoutApp } from "@/app/components/layout/layout-app"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminModelsPage } from "./components/admin-models-page"

export default async function AdminPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect("/auth")
  }

  const { data: authData } = await supabase.auth.getUser()

  if (!authData?.user?.id) {
    redirect("/auth")
  }

  // Check if user is admin (premium user)
  // For now, we'll assume all authenticated users can access admin
  // You can add proper admin role checking later
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("id", authData.user.id)
    .single()

  if (!user) {
    redirect("/")
  }

  return (
    <MessagesProvider>
      <LayoutApp>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b px-4 py-6 backdrop-blur sm:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage AI models and system settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <AdminModelsPage />
            </div>
          </div>
        </div>
      </LayoutApp>
    </MessagesProvider>
  )
}
