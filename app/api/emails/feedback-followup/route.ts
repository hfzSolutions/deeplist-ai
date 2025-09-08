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

    // Get the current user (admin or system)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feedbackType, feedbackId, feedbackSnippet, recipientEmail } = body;

    // Validate required fields
    if (!feedbackType || !feedbackId || !recipientEmail) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: feedbackType, feedbackId, recipientEmail',
        },
        { status: 400 }
      );
    }

    // Validate feedback type
    if (!['bug', 'feature', 'general', 'support'].includes(feedbackType)) {
      return NextResponse.json(
        {
          error:
            'Invalid feedback type. Must be: bug, feature, general, or support',
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

    // Get feedback details if not provided
    let snippet = feedbackSnippet;
    if (!snippet) {
      const { data: feedback } = await supabase
        .from('feedback')
        .select('message')
        .eq('id', feedbackId)
        .single();

      if (feedback?.message) {
        // Truncate to first 100 characters
        snippet =
          feedback.message.length > 100
            ? feedback.message.substring(0, 100) + '...'
            : feedback.message;
      }
    }

    const getSubject = () => {
      switch (feedbackType) {
        case 'bug':
          return `Thank you for reporting a bug - We're on it!`;
        case 'feature':
          return `Thanks for your feature request!`;
        case 'support':
          return `We're here to help - Support ticket update`;
        case 'general':
          return `Thank you for your feedback!`;
        default:
          return `Thank you for your feedback!`;
      }
    };

    // Send the email
    const result = await EmailService.sendFeedbackFollowupEmail(
      {
        to: recipientEmail,
        subject: getSubject(),
      },
      {
        userEmail: recipientEmail,
        userName: recipientUser?.display_name || undefined,
        feedbackType,
        feedbackId,
        feedbackSnippet: snippet,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${feedbackId}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback follow-up email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Error sending feedback follow-up email:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback follow-up email' },
      { status: 500 }
    );
  }
}
