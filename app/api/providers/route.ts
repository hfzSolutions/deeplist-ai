import { getEffectiveApiKey } from "@/lib/user-keys"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // Only support OpenRouter
    if (provider !== "openrouter") {
      return NextResponse.json(
        { error: "Only OpenRouter provider is supported" },
        { status: 400 }
      )
    }

    const apiKey = await getEffectiveApiKey()

    return NextResponse.json({
      hasUserKey: false, // Always false since we only use system keys
      provider: "openrouter",
    })
  } catch (error) {
    console.error("Error checking provider keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
