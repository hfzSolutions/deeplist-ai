import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database connection failed" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const { data: authData } = await supabase.auth.getUser()
    const isAuthenticated = !!authData?.user?.id

    // Fetch models from database
    const { data: dbModels, error: modelsError } = await supabase
      .from("models")
      .select("*")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true })
      .order("display_name", { ascending: true })

    if (modelsError) {
      console.error("Error fetching models from database:", modelsError)
      return new Response(JSON.stringify({ error: "Failed to fetch models" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // If user is authenticated, check their API keys to determine accessibility
    let userProviders: string[] = []
    if (isAuthenticated && authData.user) {
      const { data: userKeys } = await supabase
        .from("user_keys")
        .select("provider")
        .eq("user_id", authData.user.id)
      
      userProviders = userKeys?.map((k) => k.provider) || []
    }

    // Transform database models to the expected format
    const models = dbModels.map((model) => ({
      id: model.name,
      name: model.display_name,
      provider: model.provider_name,
      providerId: model.provider_id,
      baseProviderId: model.provider_id,
      contextWindow: model.context_length,
      description: model.description,
      icon: model.provider_id, // Use provider_id for icon matching
      accessible: model.is_free || 
                 model.provider_id === "ollama" || 
                 (isAuthenticated && userProviders.includes(model.provider_id)),
      // Map capabilities to boolean flags
      vision: model.capabilities?.includes("vision") || false,
      tools: model.capabilities?.includes("function_calling") || false,
      // Default values for other fields
      speed: "Medium" as const,
      intelligence: "Medium" as const,
      openSource: model.provider_id === "ollama"
    }))

    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch models" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      )
    }

    // Fetch current models from database
    const { data: models, error } = await supabase
      .from("models")
      .select("*")
      .order("display_name")

    if (error) {
      console.error("Failed to fetch models:", error)
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Models fetched from database",
      models,
      timestamp: new Date().toISOString(),
      count: models.length,
    })
  } catch (error) {
    console.error("Failed to fetch models:", error)
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    )
  }
}
