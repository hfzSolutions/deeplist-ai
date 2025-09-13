// Default model is now fetched from API endpoint
import { isSupabaseEnabled } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const returnUrl = searchParams.get('returnUrl');

  if (!isSupabaseEnabled) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent('Supabase is not enabled in this deployment.')}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent('Missing authentication code')}`
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent('Supabase is not enabled in this deployment.')}`
    );
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error.message)}`
    );
  }

  const user = data?.user;
  if (!user || !user.id || !user.email) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent('Missing user info')}`
    );
  }

  try {
    // Get the default model from database
    const { data: defaultModelData } = await supabase
      .from('models')
      .select('name')
      .eq('is_enabled', true)
      .eq('is_default', true)
      .single();

    const defaultModel = defaultModelData?.name || null;

    // Try to insert user only if not exists
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
      message_count: 0,
      premium: false,
      favorite_models: defaultModel ? [defaultModel] : [],
    });

    if (insertError && insertError.code !== '23505') {
      console.error('Error inserting user:', insertError);
    } else if (!insertError) {
      // New user created successfully, send welcome email
      try {
        const host = request.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const loginUrl = `${protocol}://${host}`;
        await EmailService.sendWelcomeEmail(
          {
            to: user.email,
            subject: 'Welcome to Deeplist AI!',
          },
          {
            userEmail: user.email,
            userName:
              user.user_metadata?.display_name || user.user_metadata?.full_name,
            loginUrl,
          }
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the auth flow if email fails
      }
    }
  } catch (err) {
    console.error('Unexpected user insert error:', err);
  }

  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';

  // Use returnUrl if available, otherwise use next parameter
  const redirectPath = returnUrl ? decodeURIComponent(returnUrl) : next;
  const redirectUrl = `${protocol}://${host}${redirectPath}`;

  return NextResponse.redirect(redirectUrl);
}
