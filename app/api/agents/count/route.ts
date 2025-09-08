import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      )
    }

    // Get count of public agents - no authentication required
    const { count, error } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)

    if (error) {
      console.error("Error fetching agent count:", error)
      return NextResponse.json(
        { error: "Failed to fetch agent count" },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error("Error in agent count API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}