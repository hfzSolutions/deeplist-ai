import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single()
  
  return user?.is_admin || false
}

// GET - Fetch all models (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      )
    }

    const { data: authData } = await supabase.auth.getUser()
    
    if (!authData?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isUserAdmin = await isAdmin(supabase, authData.user.id)
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const offset = (page - 1) * pageSize

    // Get total count
    const { count, error: countError } = await supabase
      .from("models")
      .select("*", { count: 'exact', head: true })

    if (countError) {
      console.error("Error counting models:", countError)
      return NextResponse.json(
        { error: "Failed to count models" },
        { status: 500 }
      )
    }

    // Get paginated models
    const { data: models, error } = await supabase
      .from("models")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("display_name", { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error("Error fetching models:", error)
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      models,
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    })
  } catch (error) {
    console.error("Error in GET /api/admin/models:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new model (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      )
    }

    const { data: authData } = await supabase.auth.getUser()
    
    if (!authData?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isUserAdmin = await isAdmin(supabase, authData.user.id)
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      display_name,
      provider_id,
      provider_name,
      model_id,
      context_length,
      max_tokens,
      is_enabled = true,
      is_free = false,
      requires_api_key = true,
      capabilities = ["chat"],
      description,
      sort_order = 0
    } = body

    if (!name || !display_name || !provider_id || !provider_name) {
      return NextResponse.json(
        { error: "Missing required fields: name, display_name, provider_id, provider_name" },
        { status: 400 }
      )
    }

    const { data: model, error } = await supabase
      .from("models")
      .insert({
        name,
        display_name,
        provider_id,
        provider_name,
        model_id: model_id || name,
        context_length,
        max_tokens,
        is_enabled,
        is_free,
        requires_api_key,
        capabilities,
        description,
        sort_order
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating model:", error)
      return NextResponse.json(
        { error: "Failed to create model" },
        { status: 500 }
      )
    }

    return NextResponse.json({ model }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/admin/models:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}