# Email Implementation Guide

This guide covers the implementation and usage of all email types in Deeplist AI, including welcome emails, agent notifications, feedback follow-ups, and re-engagement campaigns.

## Overview

The email system is built using:
- **React Email** for email templates
- **Resend** as the email service provider
- **Supabase** for authentication emails (password reset, email confirmation)
- **Custom EmailService** for application-specific emails

## Email Types

### 1. Authentication Emails (Handled by Supabase)

- Password reset
- Email confirmation
- Magic link login
- User invitation
- Email change confirmation

**Configuration:** See `SUPABASE_EMAIL_SETUP.md` for setup instructions.

### 2. Welcome Emails

**When to send:**
- Automatically sent when a new user completes registration
- Triggered in `app/auth/callback/route.ts`

**Implementation:**
```typescript
// In app/auth/callback/route.ts
import { EmailService } from '@/lib/email'

// After successful user creation
try {
  await EmailService.sendWelcomeEmail(
    {
      to: email,
      subject: 'Welcome to Deeplist AI! 🎉',
    },
    {
      userEmail: email,
      userName: name,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    }
  )
} catch (error) {
  console.error('Failed to send welcome email:', error)
  // Don't fail the registration process
}
```

### 3. Agent Notification Emails

**When to send:**
- Agent usage milestones (10, 50, 100+ uses)
- Agent shared with another user
- Agent performance updates

**API Endpoint:** `POST /api/emails/agent-notification`

**Usage Example:**
```typescript
// When an agent reaches a usage milestone
const response = await fetch('/api/emails/agent-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentName: 'Marketing Assistant',
    agentId: 'agent_123',
    notificationType: 'usage',
    details: { usageCount: 100 },
    recipientEmail: 'user@example.com'
  })
})
```

**Integration Points:**
- Agent usage tracking in chat messages
- Agent sharing functionality
- Agent analytics dashboard

### 4. Feedback Follow-up Emails

**When to send:**
- Immediately after feedback submission
- When feedback status changes
- Follow-up for unresolved issues

**API Endpoint:** `POST /api/emails/feedback-followup`

**Usage Example:**
```typescript
// After feedback submission
const response = await fetch('/api/emails/feedback-followup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feedbackType: 'bug',
    feedbackId: 'feedback_123',
    feedbackSnippet: 'The chat interface freezes when...',
    recipientEmail: 'user@example.com'
  })
})
```

**Integration Points:**
- Feedback submission forms
- Admin feedback management system
- Support ticket system

### 5. Re-engagement Emails

**When to send:**
- 3 days after last login (gentle reminder)
- 1 week after last login (feature highlights)
- 1 month+ after last login (comprehensive re-engagement)

**API Endpoint:** `POST /api/emails/reengagement`

**Automated Campaign Setup:**
```typescript
// Scheduled job (e.g., daily cron)
const inactiveUsers = await fetch('/api/emails/reengagement?minDays=7&maxDays=30')
const users = await inactiveUsers.json()

for (const user of users.users) {
  await fetch('/api/emails/reengagement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientEmail: user.email,
      daysSinceLastLogin: user.daysSinceLastLogin,
      lastLoginDate: user.lastLoginDate,
      unsubscribeToken: generateUnsubscribeToken(user.id)
    })
  })
}
```

## Implementation Steps

### Step 1: Environment Setup

1. Add Resend API key to `.env.local`:
```bash
RESEND_API_KEY=re_your_api_key_here
```

2. Configure Supabase SMTP (see `SUPABASE_EMAIL_SETUP.md`)

### Step 2: Welcome Email Integration

The welcome email is already integrated in `app/auth/callback/route.ts`. No additional setup required.

### Step 3: Agent Notification Integration

Add agent notification triggers:

```typescript
// In agent usage tracking
const incrementAgentUsage = async (agentId: string, userId: string) => {
  // Update usage count
  const { data: agent } = await supabase
    .from('agents')
    .select('usage_count, name, user_id')
    .eq('id', agentId)
    .single()

  const newCount = (agent.usage_count || 0) + 1
  
  await supabase
    .from('agents')
    .update({ usage_count: newCount })
    .eq('id', agentId)

  // Send milestone notification
  if ([10, 50, 100, 500, 1000].includes(newCount)) {
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', agent.user_id)
      .single()

    if (user) {
      await fetch('/api/emails/agent-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agent.name,
          agentId,
          notificationType: 'usage',
          details: { usageCount: newCount },
          recipientEmail: user.email
        })
      })
    }
  }
}
```

### Step 4: Feedback Follow-up Integration

Add to feedback submission:

```typescript
// In feedback submission handler
const submitFeedback = async (feedbackData) => {
  // Save feedback to database
  const { data: feedback } = await supabase
    .from('feedback')
    .insert(feedbackData)
    .select()
    .single()

  // Send follow-up email
  await fetch('/api/emails/feedback-followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feedbackType: feedbackData.type,
      feedbackId: feedback.id,
      feedbackSnippet: feedbackData.message.substring(0, 100),
      recipientEmail: feedbackData.user_email
    })
  })
}
```

### Step 5: Re-engagement Campaign Setup

Create a scheduled job (using Vercel Cron or similar):

```typescript
// app/api/cron/reengagement/route.ts
export async function GET() {
  try {
    // Get users inactive for 3-7 days
    const shortTerm = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/reengagement?minDays=3&maxDays=7`)
    const shortTermUsers = await shortTerm.json()

    // Get users inactive for 7-30 days
    const mediumTerm = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/reengagement?minDays=7&maxDays=30`)
    const mediumTermUsers = await mediumTerm.json()

    // Get users inactive for 30+ days
    const longTerm = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/reengagement?minDays=30&maxDays=90`)
    const longTermUsers = await longTerm.json()

    // Send re-engagement emails
    const allUsers = [...shortTermUsers.users, ...mediumTermUsers.users, ...longTermUsers.users]
    
    for (const user of allUsers) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/reengagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: user.email,
          daysSinceLastLogin: user.daysSinceLastLogin,
          lastLoginDate: user.lastLoginDate,
          unsubscribeToken: generateUnsubscribeToken(user.id)
        })
      })
    }

    return Response.json({ success: true, emailsSent: allUsers.length })
  } catch (error) {
    console.error('Re-engagement cron error:', error)
    return Response.json({ error: 'Failed to send re-engagement emails' }, { status: 500 })
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reengagement",
      "schedule": "0 10 * * *"
    }
  ]
}
```

## Best Practices

### Email Frequency
- **Welcome emails:** Immediate
- **Agent notifications:** Real-time for milestones, daily digest for regular updates
- **Feedback follow-ups:** Immediate acknowledgment, weekly status updates
- **Re-engagement:** 3 days, 1 week, 1 month, then monthly

### Personalization
- Use user's name when available
- Include relevant usage statistics
- Reference user's favorite models/agents
- Customize content based on user activity level

### Unsubscribe Management
- Always include unsubscribe links in marketing emails
- Respect user preferences
- Implement granular email preferences (notifications vs marketing)

### Error Handling
- Never fail core functionality due to email errors
- Log email failures for monitoring
- Implement retry logic for transient failures
- Provide fallback communication methods

### Testing
- Test all email templates in different email clients
- Verify responsive design on mobile devices
- Test with and without user data
- Validate all dynamic content rendering

## Monitoring and Analytics

### Email Metrics to Track
- Delivery rates
- Open rates
- Click-through rates
- Unsubscribe rates
- User engagement after email campaigns

### Implementation
```typescript
// Add tracking to email service
const result = await EmailService.sendWelcomeEmail(config, data)

// Log metrics
if (result.data?.id) {
  await supabase.from('email_metrics').insert({
    email_id: result.data.id,
    email_type: 'welcome',
    recipient: data.userEmail,
    sent_at: new Date().toISOString()
  })
}
```

## Troubleshooting

### Common Issues
1. **Emails not sending:** Check RESEND_API_KEY configuration
2. **Templates not rendering:** Verify React Email component syntax
3. **Missing user data:** Add null checks and fallbacks
4. **Rate limiting:** Implement email queuing for bulk sends

### Debug Mode
Enable email debugging in development:
```typescript
// In development, log email content instead of sending
if (process.env.NODE_ENV === 'development') {
  console.log('Email would be sent:', { config, data })
  return { success: true, data: { id: 'dev-email-id' } }
}
```

This comprehensive email system provides a solid foundation for user engagement and communication throughout the user lifecycle.