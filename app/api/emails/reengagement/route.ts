import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    // Get the current user (admin or system)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      recipientEmail,
      daysSinceLastLogin,
      lastLoginDate,
      messageCount,
      favoriteModels,
      unsubscribeToken
    } = body

    // Validate required fields
    if (!recipientEmail || daysSinceLastLogin === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientEmail, daysSinceLastLogin' },
        { status: 400 }
      )
    }

    // Get recipient user info
    const { data: recipientUser } = await supabase
      .from('users')
      .select('name')
      .eq('email', recipientEmail)
      .single()

    // Get user stats if not provided
    let userMessageCount = messageCount
    let userFavoriteModels = favoriteModels

    if (!userMessageCount || !userFavoriteModels) {
      // Get message count
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', recipientUser?.id || '')

      userMessageCount = msgCount || 0

      // Get favorite models (most used)
      const { data: modelUsage } = await supabase
        .from('messages')
        .select('model')
        .eq('user_id', recipientUser?.id || '')
        .not('model', 'is', null)
        .limit(100)

      if (modelUsage) {
        const modelCounts = modelUsage.reduce((acc: Record<string, number>, msg) => {
          if (msg.model) {
            acc[msg.model] = (acc[msg.model] || 0) + 1
          }
          return acc
        }, {})

        userFavoriteModels = Object.entries(modelCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([model]) => model)
      }
    }

    const getSubject = () => {
      if (daysSinceLastLogin <= 7) {
        return "We miss you at Deeplist AI! 👋"
      } else if (daysSinceLastLogin <= 30) {
        return "Come back and explore what's new! 🚀"
      } else {
        return "Your AI assistant is waiting for you 🤖"
      }
    }

    // Send the email
    const result = await EmailService.sendReengagementEmail(
      {
        to: recipientEmail,
        subject: getSubject(),
      },
      {
        userEmail: recipientEmail,
        userName: recipientUser?.name,
        daysSinceLastLogin,
        lastLoginDate,
        messageCount: userMessageCount,
        favoriteModels: userFavoriteModels || [],
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        unsubscribeUrl: unsubscribeToken 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${unsubscribeToken}`
          : undefined,
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Re-engagement email sent successfully',
      emailId: result.data?.id 
    })

  } catch (error) {
    console.error('Error sending re-engagement email:', error)
    return NextResponse.json(
      { error: 'Failed to send re-engagement email' },
      { status: 500 }
    )
  }
}

// GET endpoint to find inactive users for re-engagement campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user (admin only)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const minDays = parseInt(searchParams.get('minDays') || '7')
    const maxDays = parseInt(searchParams.get('maxDays') || '90')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Calculate date range
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() - minDays)
    
    const minDate = new Date()
    minDate.setDate(minDate.getDate() - maxDays)

    // Find users who haven't logged in within the specified range
    const { data: inactiveUsers, error } = await supabase
      .from('users')
      .select('id, email, name, last_sign_in_at')
      .lt('last_sign_in_at', maxDate.toISOString())
      .gte('last_sign_in_at', minDate.toISOString())
      .limit(limit)

    if (error) {
      throw error
    }

    // Calculate days since last login for each user
    const usersWithStats = inactiveUsers?.map(user => {
      const lastLogin = new Date(user.last_sign_in_at)
      const daysSince = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...user,
        daysSinceLastLogin: daysSince,
        lastLoginDate: lastLogin.toISOString().split('T')[0]
      }
    }) || []

    return NextResponse.json({ 
      success: true, 
      users: usersWithStats,
      count: usersWithStats.length
    })

  } catch (error) {
    console.error('Error fetching inactive users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inactive users' },
      { status: 500 }
    )
  }
}