import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]

export async function POST(
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

    // Verify agent ownership
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, avatar_url, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found or unauthorized" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.",
        },
        { status: 400 }
      )
    }

    // Delete existing avatar if it exists
    if (agent.avatar_url) {
      try {
        // Extract the file path from the URL
        const urlParts = agent.avatar_url.split("/")
        const pathIndex = urlParts.findIndex((part) => part === "agents")
        if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(pathIndex).join("/")
          await supabase.storage.from("assets").remove([filePath])
        }
      } catch (error) {
        console.warn("Failed to delete existing avatar:", error)
      }
    }

    // Generate unique filename with user-specific folder structure
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `agents/${user.id}/${timestamp}-${randomId}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("assets")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload avatar" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("assets")
      .getPublicUrl(fileName)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get avatar URL" },
        { status: 500 }
      )
    }

    // Update agent with new avatar URL
    const { data: updatedAgent, error: updateError } = await supabase
      .from("agents")
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update agent avatar" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatar_url: urlData.publicUrl,
      agent: updatedAgent,
    })
  } catch (error) {
    console.error("Error uploading agent avatar:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    // Verify agent ownership and get current avatar
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, avatar_url, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete avatar from storage if it exists
    if (agent.avatar_url) {
      try {
        // Extract the file path from the URL
        const urlParts = agent.avatar_url.split("/")
        const pathIndex = urlParts.findIndex((part) => part === "agents")
        if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(pathIndex).join("/")
          await supabase.storage.from("assets").remove([filePath])
        }
      } catch (error) {
        console.warn("Failed to delete avatar from storage:", error)
      }
    }

    // Update agent to remove avatar URL
    const { data: updatedAgent, error: updateError } = await supabase
      .from("agents")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to remove agent avatar" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Avatar removed successfully",
      agent: updatedAgent,
    })
  } catch (error) {
    console.error("Error removing agent avatar:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
