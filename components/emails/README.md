# Email Templates System

This directory contains reusable email templates for the Deeplist AI application. The email system is built using [React Email](https://react.email/) and [Resend](https://resend.com/) for delivery.

## Setup

### Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Dependencies

The following packages are required:

- `resend` - Email delivery service
- `@react-email/components` - React Email components

## Available Templates

### 1. Base Email Template

**File:** `base-email-template.tsx`

A foundational template that provides consistent branding and structure for all emails. All other templates extend this base template.

**Features:**
- Consistent branding with logo
- Responsive design
- Footer with company information
- Social media links

### 2. Welcome Email

**File:** `welcome-email.tsx`

Sent to new users after registration.

**Props:**
- `userEmail: string` - The user's email address
- `userName?: string` - The user's name (optional)
- `loginUrl: string` - URL to login page

**Usage:**
```typescript
import { EmailService } from '@/lib/email'

await EmailService.sendWelcomeEmail(
  {
    to: ['user@example.com'],
    subject: 'Welcome to Deeplist AI!',
  },
  {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    loginUrl: 'https://app.com/auth',
  }
)
```

### 3. Notification Email

**File:** `notification-email.tsx`

General-purpose template for system notifications.

**Props:**
- `userEmail: string` - The user's email address
- `userName?: string` - The user's name (optional)
- `title: string` - Notification title
- `message: string` - Notification message
- `actionText?: string` - Call-to-action button text (optional)
- `actionUrl?: string` - Call-to-action URL (optional)
- `priority?: 'low' | 'medium' | 'high'` - Notification priority (optional, default: 'medium')

**Usage:**
```typescript
import { EmailService } from '@/lib/email'

const result = await EmailService.sendNotificationEmail(
  {
    to: 'user@example.com',
    subject: 'Subscription Expiring Soon',
  },
  {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    title: 'Your subscription expires in 3 days',
    message: 'Don\'t miss out on premium features. Renew your subscription to continue enjoying unlimited access.',
    actionText: 'Renew Subscription',
    actionUrl: 'https://app.deeplist.ai/billing',
    priority: 'high',
  }
)

if (result.success) {
  console.log('Notification email sent successfully')
} else {
  console.error('Failed to send notification email:', result.error)
}
```

## 3. Agent Notification Email

**File:** `agent-notification-email.tsx`

Notifications related to AI agents - usage milestones, sharing, and activity updates.

**Props:**
- `userEmail: string` - The user's email address
- `userName?: string` - The user's name (optional)
- `agentName: string` - Name of the agent
- `agentId: string` - Unique identifier for the agent
- `notificationType: 'usage' | 'shared' | 'activity'` - Type of notification
- `details: object` - Type-specific details (usageCount, sharedBy, etc.)
- `agentUrl: string` - URL to view the agent

**Usage:**
```typescript
import { EmailService } from '@/lib/email'

// Usage milestone notification
const result = await EmailService.sendAgentNotificationEmail(
  {
    to: 'user@example.com',
    subject: 'Your agent "Marketing Assistant" has been used 100 times!',
  },
  {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    agentName: 'Marketing Assistant',
    agentId: 'agent_123',
    notificationType: 'usage',
    details: {
      usageCount: 100,
    },
    agentUrl: 'https://app.deeplist.ai/agents/agent_123',
  }
)

// Agent shared notification
const shareResult = await EmailService.sendAgentNotificationEmail(
  {
    to: 'user@example.com',
    subject: 'Agent "Data Analyzer" was shared with you',
  },
  {
    userEmail: 'user@example.com',
    userName: 'Jane Smith',
    agentName: 'Data Analyzer',
    agentId: 'agent_456',
    notificationType: 'shared',
    details: {
      sharedBy: 'John Doe',
    },
    agentUrl: 'https://app.deeplist.ai/agents/agent_456',
  }
)
```

## 4. Feedback Follow-up Email

**File:** `feedback-followup-email.tsx`

Follow-up emails for user feedback submissions (bugs, feature requests, support).

**Props:**
- `userEmail: string` - The user's email address
- `userName?: string` - The user's name (optional)
- `feedbackType: 'bug' | 'feature' | 'support'` - Type of feedback
- `feedbackId: string` - Unique identifier for the feedback
- `feedbackSnippet: string` - Brief excerpt of the feedback
- `dashboardUrl: string` - URL to view feedback status

**Usage:**
```typescript
import { EmailService } from '@/lib/email'

// Bug report follow-up
const result = await EmailService.sendFeedbackFollowupEmail(
  {
    to: 'user@example.com',
    subject: 'Thank you for reporting a bug - We\'re on it!',
  },
  {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    feedbackType: 'bug',
    feedbackId: 'feedback_123',
    feedbackSnippet: 'The chat interface freezes when uploading large files...',
    dashboardUrl: 'https://app.deeplist.ai/feedback/feedback_123',
  }
)

// Feature request follow-up
const featureResult = await EmailService.sendFeedbackFollowupEmail(
  {
    to: 'user@example.com',
    subject: 'Thanks for your feature request!',
  },
  {
    userEmail: 'user@example.com',
    userName: 'Jane Smith',
    feedbackType: 'feature',
    feedbackId: 'feedback_456',
    feedbackSnippet: 'It would be great to have voice input for the chat...',
    dashboardUrl: 'https://app.deeplist.ai/feedback/feedback_456',
  }
)
```

## 5. Re-engagement Email

**File:** `reengagement-email.tsx`

Emails to bring back inactive users with personalized content based on their activity.

**Props:**
- `userEmail: string` - The user's email address
- `userName?: string` - The user's name (optional)
- `daysSinceLastLogin: number` - Days since last login
- `lastLoginDate: string` - Date of last login
- `messageCount: number` - Total messages sent by user
- `favoriteModels: string[]` - User's most used AI models
- `loginUrl: string` - URL to login page
- `unsubscribeUrl: string` - URL to unsubscribe from emails

**Usage:**
```typescript
import { EmailService } from '@/lib/email'

// Short-term re-engagement (1-7 days)
const result = await EmailService.sendReengagementEmail(
  {
    to: 'user@example.com',
    subject: 'We miss you at Deeplist AI! 👋',
  },
  {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    daysSinceLastLogin: 3,
    lastLoginDate: '2024-01-15',
    messageCount: 25,
    favoriteModels: ['GPT-4', 'Claude-3'],
    loginUrl: 'https://app.deeplist.ai/login',
    unsubscribeUrl: 'https://app.deeplist.ai/unsubscribe?token=abc123',
  }
)

// Long-term re-engagement (30+ days)
const longTermResult = await EmailService.sendReengagementEmail(
  {
    to: 'inactive@example.com',
    subject: 'Your AI assistant is waiting for you 🤖',
  },
  {
    userEmail: 'inactive@example.com',
    userName: 'Jane Smith',
    daysSinceLastLogin: 45,
    lastLoginDate: '2023-12-01',
    messageCount: 150,
    favoriteModels: ['GPT-4', 'Claude-3', 'Gemini'],
    loginUrl: 'https://app.deeplist.ai/login',
    unsubscribeUrl: 'https://app.deeplist.ai/unsubscribe?token=def456',
  }
)
```

## Email Service

**File:** `lib/email.ts`

The `EmailService` class provides a centralized way to send emails with proper error handling and configuration checks.

### Available Methods

- `sendWelcomeEmail()` - Send welcome emails to new users
- `sendNotificationEmail()` - Send general notifications
- `sendAgentNotificationEmail()` - Send agent-related notifications
- `sendFeedbackFollowupEmail()` - Send feedback follow-up emails
- `sendReengagementEmail()` - Send re-engagement emails to inactive users
- `sendCustomEmail()` - Send custom HTML emails
- `sendTextEmail()` - Send plain text emails
- `getStatus()` - Check if email service is configured

### Authentication Emails

For authentication-related emails (password reset, email confirmation, etc.), the system now uses **Supabase's built-in email functionality** with Resend as the SMTP provider:

- Password reset emails are handled by `supabase.auth.resetPasswordForEmail()`
- Email confirmations are handled by Supabase Auth
- All authentication emails use the configured SMTP settings in Supabase Dashboard

See `SUPABASE_EMAIL_SETUP.md` for configuration instructions.

### Error Handling

All email methods include proper error handling:
- Configuration validation
- Detailed error logging
- Graceful fallbacks

### Example Usage

```typescript
import { EmailService } from '@/lib/email'

// Check if email service is configured
const status = EmailService.getStatus()
if (!status.configured) {
  console.warn('Email service not configured')
  return
}

// Send welcome email
await EmailService.sendWelcomeEmail(
  {
    to: ['user@example.com'],
    subject: 'Welcome to Our App',
  },
  {
    userName: 'John Doe',
    loginUrl: 'https://yourapp.com/login',
  }
);

// Send notification email
await EmailService.sendNotificationEmail(
  {
    to: ['user@example.com'],
    subject: 'Important Notification',
  },
  {
    title: 'System Maintenance',
    message: 'We will be performing maintenance tonight.',
    priority: 'high',
    actionUrl: 'https://yourapp.com/status',
    actionText: 'View Status',
  }
);

// Send a custom email
try {
  await EmailService.sendCustomEmail({
    to: 'user@example.com',
    subject: 'Custom Email',
    html: '<h1>Hello World</h1>',
  })
} catch (error) {
  console.error('Failed to send email:', error)
}
```

## Creating New Templates

To create a new email template:

1. Create a new file in this directory
2. Import and use the `BaseEmailTemplate` component
3. Define the props interface
4. Export the component
5. Add the template to `EmailService` if needed

**Example:**

```typescript
import { BaseEmailTemplate } from './base-email-template'
import { Heading, Text } from '@react-email/components'

interface MyEmailProps {
  userName: string
  message: string
}

export const MyEmail = ({ userName, message }: MyEmailProps) => {
  return (
    <BaseEmailTemplate preview="Custom Email">
      <Heading>Hello {userName}!</Heading>
      <Text>{message}</Text>
    </BaseEmailTemplate>
  )
}
```

## Best Practices

1. **Always use the BaseEmailTemplate** for consistency
2. **Include preview text** for better email client support
3. **Test emails** in multiple email clients
4. **Keep templates responsive** for mobile devices
5. **Use semantic HTML** for accessibility
6. **Include fallback text** for action buttons
7. **Handle errors gracefully** in your application code

## Testing

To test email templates during development:

1. Use the React Email preview server:
   ```bash
   npx react-email dev
   ```

2. Create test API routes to send sample emails

3. Use email testing services like [Mailtrap](https://mailtrap.io/) for development

## Troubleshooting

### Common Issues

1. **Emails not sending:**
   - Check `RESEND_API_KEY` is set correctly
   - Verify domain is configured in Resend dashboard
   - Check API key permissions

2. **Styling issues:**
   - Email clients have limited CSS support
   - Use inline styles for critical styling
   - Test in multiple email clients

3. **Template errors:**
   - Ensure all required props are provided
   - Check for TypeScript errors
   - Verify React Email component usage

### Debug Mode

Enable debug logging by setting the log level in your email service calls:

```typescript
console.log('Email service status:', EmailService.getStatus())
```