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

// PUT - Update model (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      is_enabled,
      is_free,
      requires_api_key,
      capabilities,
      description,
      sort_order,
    } = body

    const { data: model, error } = await supabase
      .from("models")
      .update({
        ...(name && { name }),
        ...(display_name && { display_name }),
        ...(provider_id && { provider_id }),
        ...(provider_name && { provider_name }),
        ...(model_id && { model_id }),
        ...(context_length !== undefined && { context_length }),
        ...(max_tokens !== undefined && { max_tokens }),
        ...(is_enabled !== undefined && { is_enabled }),
        ...(is_free !== undefined && { is_free }),
        ...(requires_api_key !== undefined && { requires_api_key }),
        ...(capabilities && { capabilities }),
        ...(description !== undefined && { description }),
        ...(sort_order !== undefined && { sort_order }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating model:", error)
      return NextResponse.json(
        { error: "Failed to update model" },
        { status: 500 }
      )
    }

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error in PUT /api/admin/models/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete model (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin(supabase, authData.user.id)
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { error } = await supabase.from("models").delete().eq("id", id)

    if (error) {
      console.error("Error deleting model:", error)
      return NextResponse.json(
        { error: "Failed to delete model" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Model deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/admin/models/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Get single model (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin(supabase, authData.user.id)
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { data: model, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching model:", error)
      return NextResponse.json(
        { error: "Failed to fetch model" },
        { status: 500 }
      )
    }

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error in GET /api/admin/models/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
