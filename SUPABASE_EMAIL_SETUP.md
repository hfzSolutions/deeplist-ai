# Supabase Email Configuration with Resend

This guide explains how to configure Supabase to use Resend as the email provider for authentication emails, including password reset emails.

## Why Configure Custom SMTP?

By default, Supabase sends emails from `noreply@mail.app.supabase.io` with significant limitations:
- Only 2-4 emails per hour rate limit
- Emails only sent to authorized team members
- No custom branding
- Not suitable for production use

## Configuration Steps

### 1. Resend SMTP Credentials

Use these SMTP settings for Resend:
- **Host**: `smtp.resend.com`
- **Port**: `465`
- **Username**: `resend`
- **Password**: Your Resend API key (from `.env`: `RESEND_API_KEY`)

### 2. Configure Supabase SMTP

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings** → **Authentication**
4. Find the **SMTP Settings** section
5. Toggle **Enable Custom SMTP**
6. Fill in the following:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `465`
   - **SMTP Username**: `resend`
   - **SMTP Password**: Your Resend API key
   - **Sender Email**: `team@deeplistai.com` (from your `.env`)
   - **Sender Name**: `DeepList AI`

### 3. Update Rate Limits (Optional)

After configuring custom SMTP:
1. Go to **Project Settings** → **Rate Limits**
2. Adjust the email rate limit from the default 30/hour to your needs

## Benefits After Configuration

✅ **Branded Emails**: All auth emails sent from your domain  
✅ **Higher Limits**: No more 2-4 emails/hour restriction  
✅ **Production Ready**: Reliable email delivery  
✅ **Automatic Integration**: Password reset emails automatically use Resend  
✅ **Consistent Branding**: All Supabase auth emails match your brand  

## Email Templates Affected

Once configured, these Supabase auth emails will use Resend:
- Password reset emails
- Email confirmation emails
- Magic link emails
- User invitation emails
- Email change confirmation emails

## Verification

After configuration:
1. Test the forgot password flow
2. Check that emails are sent from `team@deeplistai.com`
3. Verify emails have proper branding
4. Monitor Resend dashboard for delivery statistics

## Notes

- The current implementation in `/app/api/auth/forgot-password/route.ts` now uses only Supabase's `resetPasswordForEmail()` function
- Supabase will generate secure reset links with proper tokens
- No need for custom email templates when using Supabase's built-in system
- All email sending is handled automatically by Supabase through Resend