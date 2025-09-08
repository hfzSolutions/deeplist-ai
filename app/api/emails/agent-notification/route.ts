import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentName, agentId, notificationType, details, recipientEmail } =
      body;

    // Validate required fields
    if (!agentName || !agentId || !notificationType || !recipientEmail) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: agentName, agentId, notificationType, recipientEmail',
        },
        { status: 400 }
      );
    }

    // Validate notification type
    if (!['usage', 'milestone', 'shared'].includes(notificationType)) {
      return NextResponse.json(
        {
          error:
            'Invalid notification type. Must be: usage, milestone, or shared',
        },
        { status: 400 }
      );
    }

    // Get recipient user info
    const { data: recipientUser } = await supabase
      .from('users')
      .select('display_name')
      .eq('email', recipientEmail)
      .single();

    const getSubject = () => {
      switch (notificationType) {
        case 'usage':
          return `Your agent "${agentName}" has been used ${details.usageCount} times!`;
        case 'milestone':
          return `🎉 Your agent "${agentName}" reached a milestone!`;
        case 'shared':
          return `Agent "${agentName}" was shared with you`;
        default:
          return `Update about your agent "${agentName}"`;
      }
    };

    // Send the email
    const result = await EmailService.sendAgentNotificationEmail(
      {
        to: recipientEmail,
        subject: getSubject(),
      },
      {
        userEmail: recipientEmail,
        userName: recipientUser?.display_name || undefined,
        agentName,
        agentId,
        notificationType,
        details,
        agentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/agents/${agentId}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Agent notification email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Error sending agent notification email:', error);
    return NextResponse.json(
      { error: 'Failed to send agent notification email' },
      { status: 500 }
    );
  }
}
