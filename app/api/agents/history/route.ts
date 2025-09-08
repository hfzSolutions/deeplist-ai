import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ agents: [] })
    }

    const { data: historyData, error } = await supabase
      .from('user_agent_history')
      .select(`
        id,
        created_at,
        updated_at,
        agent_id,
        agents (
          id,
          name,
          description,
          avatar_url,
          is_public,
          user_id
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching agent history:', error)
      return NextResponse.json({ error: 'Failed to fetch agent history' }, { status: 500 })
    }

    // Transform the data to extract just the agent objects
    const agents = historyData?.map(item => item.agents).filter(Boolean) || []
    
    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error in GET /api/agents/history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agent_id } = await request.json()
    
    if (!agent_id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    // Check if agent exists in history
    const { data: existingHistory, error: selectError } = await supabase
      .from('user_agent_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('agent_id', agent_id)
      .maybeSingle()

    if (selectError) {
      console.error('Error checking existing history:', selectError)
      return NextResponse.json({ error: 'Failed to check agent history' }, { status: 500 })
    }

    if (existingHistory) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_agent_history')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingHistory.id)

      if (updateError) {
        console.error('Error updating agent history:', updateError)
        return NextResponse.json({ error: 'Failed to update agent history' }, { status: 500 })
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('user_agent_history')
        .insert({
          user_id: user.id,
          agent_id: agent_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error inserting agent history:', insertError)
        return NextResponse.json({ error: 'Failed to add agent to history' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/agents/history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_agent_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing agent history:', error)
      return NextResponse.json({ error: 'Failed to clear agent history' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/agents/history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}