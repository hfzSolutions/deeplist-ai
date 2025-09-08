import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ agents: [] })
    }

    // Get user's favorite agent IDs
    const { data: favoriteAgents, error: favError } = await supabase
      .from("favorite_agents")
      .select("agent_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (favError) {
      console.error("Error fetching favorite agents:", favError)
      return NextResponse.json(
        { error: "Failed to fetch favorite agents" },
        { status: 500 }
      )
    }

    if (!favoriteAgents || favoriteAgents.length === 0) {
      return NextResponse.json({ agents: [] })
    }

    // Get the actual agent details
    const agentIds = favoriteAgents.map((fav) => fav.agent_id)
    const { data: agents, error } = await supabase
      .from("agents")
      .select("*")
      .in("id", agentIds)
      .or(`user_id.eq.${user.id},is_public.eq.true`) // Ensure user has access

    if (error) {
      console.error("Error fetching agent details:", error)
      return NextResponse.json(
        { error: "Failed to fetch agent details" },
        { status: 500 }
      )
    }

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Error in favorite agents API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { agent_id } = await request.json()

    if (!agent_id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      )
    }

    // Check if agent exists and user has access to it
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, user_id, is_public")
      .eq("id", agent_id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Check if user has access to this agent (own agent or public agent)
    if (agent.user_id !== user.id && !agent.is_public) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Add to favorites (will fail if already exists due to unique constraint)
    const { data: favorite, error } = await supabase
      .from("favorite_agents")
      .insert({
        user_id: user.id,
        agent_id: agent_id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "Agent is already in favorites" },
          { status: 409 }
        )
      }
      console.error("Error adding to favorites:", error)
      return NextResponse.json(
        { error: "Failed to add to favorites" },
        { status: 500 }
      )
    }

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error("Error in favorite agents API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { agent_id } = await request.json()

    if (!agent_id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      )
    }

    // Remove from favorites
    const { error } = await supabase
      .from("favorite_agents")
      .delete()
      .eq("user_id", user.id)
      .eq("agent_id", agent_id)

    if (error) {
      console.error("Error removing from favorites:", error)
      return NextResponse.json(
        { error: "Failed to remove from favorites" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in favorite agents API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
