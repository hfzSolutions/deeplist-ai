import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      )
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify tool ownership and get current logo
    const { data: tool, error: toolError } = await supabase
      .from("external_ai_tools")
      .select("id, logo, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (toolError || !tool) {
      return NextResponse.json(
        { error: "External AI tool not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete logo from storage if it exists
    if (tool.logo) {
      try {
        // Extract the file path from the URL
        const urlParts = tool.logo.split("/")
        const pathIndex = urlParts.findIndex(
          (part) => part === "external-ai-tools"
        )
        if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(pathIndex).join("/")
          await supabase.storage.from("assets").remove([filePath])
        }
      } catch (error) {
        console.warn("Failed to delete logo from storage:", error)
      }
    }

    // Update tool to remove logo URL
    const { error: updateError } = await supabase
      .from("external_ai_tools")
      .update({ logo: null })
      .eq("id", id)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update tool" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Logo removed successfully",
    })
  } catch (error) {
    console.error("Error removing logo:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
