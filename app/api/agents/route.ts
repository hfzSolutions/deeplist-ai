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

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const tags = searchParams.get("tags") || ""
    const category = searchParams.get("category") || ""

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query based on authentication status
    let query = supabase
      .from("agents")
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon,
          sort_order
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })

    if (user) {
      // Authenticated user: show their own agents + public agents
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`)
    } else {
      // Unauthenticated user: show only public agents
      query = query.eq("is_public", true)
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Add category filter if provided
    if (category) {
      query = query.eq('category_id', category)
    }

    // Add tag filter if provided
    if (tags) {
      const tagIds = tags.split(',').filter(Boolean)
      if (tagIds.length > 0) {
        // Filter agents that have any of the specified tags
        const { data: agentIdsData } = await supabase
          .from('agent_tags')
          .select('agent_id')
          .in('tag_id', tagIds)
        
        if (agentIdsData && agentIdsData.length > 0) {
          const agentIds = agentIdsData.map(item => item.agent_id)
          query = query.in('id', agentIds)
        } else {
          // No agents found with these tags, return empty result
          return NextResponse.json({
            agents: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          })
        }
      }
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: agents, error, count } = await query

    if (error) {
      console.error("Error fetching agents:", error)
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  } catch (error) {
    console.error("Error in agents API:", error)
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

    const { name, description, system_prompt, model, avatar_url, is_public, category_id } =
      await request.json()

    if (!name) {
      return NextResponse.json(
        { error: "Agent name is required" },
        { status: 400 }
      )
    }

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name,
        description,
        system_prompt,
        model,
        avatar_url,
        is_public: is_public || false,
        category_id,
        user_id: user.id,
      })
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon,
          sort_order
        )
      `)
      .single()

    if (error) {
      console.error("Error creating agent:", error)
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      )
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("Error in agents API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
