import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { NotificationEmail } from '@/components/emails/notification-email';
import { AgentNotificationEmail } from '@/components/emails/agent-notification-email';
import { FeedbackFollowupEmail } from '@/components/emails/feedback-followup-email';
import { ReengagementEmail } from '@/components/emails/reengagement-email';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailConfig {
  to: string | string[];
  subject: string;
  from?: string;
}

interface WelcomeEmailData {
  userEmail: string;
  userName?: string;
  loginUrl: string;
}

interface NotificationEmailData {
  userEmail: string
  userName?: string
  title: string
  message: string
  actionText?: string
  actionUrl?: string
  priority?: 'low' | 'medium' | 'high'
}

interface AgentNotificationEmailData {
  userEmail: string
  userName?: string
  agentName: string
  agentId: string
  notificationType: 'usage' | 'milestone' | 'shared'
  details: {
    usageCount?: number
    milestone?: string
    sharedBy?: string
  }
  agentUrl: string
}

interface FeedbackFollowupEmailData {
  userEmail: string
  userName?: string
  feedbackType: 'bug' | 'feature' | 'general' | 'support'
  feedbackId: string
  feedbackSnippet?: string
  dashboardUrl: string
}

interface ReengagementEmailData {
  userEmail: string
  userName?: string
  daysSinceLastLogin: number
  lastLoginDate?: string
  messageCount?: number
  favoriteModels?: string[]
  loginUrl: string
  unsubscribeUrl?: string
}

export class EmailService {
  private static getFromEmail(): string {
    return process.env.RESEND_FROM_EMAIL || 'noreply@deeplist.ai';
  }

  private static isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
  }

  /**
   * Send a welcome email
   */
  static async sendWelcomeEmail(config: EmailConfig, data: WelcomeEmailData) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: config.from || this.getFromEmail(),
        to: config.to,
        subject: config.subject,
        react: WelcomeEmail(data),
      });

      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  /**
   * Send a notification email
   */
  static async sendNotificationEmail(
    config: EmailConfig,
    data: NotificationEmailData
  ) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: config.from || this.getFromEmail(),
        to: config.to,
        subject: config.subject,
        react: NotificationEmail(data),
      });

      return result;
    } catch (error) {
      console.error('Failed to send notification email:', error);
      throw error;
    }
  }

  /**
   * Send a custom HTML email
   */
  static async sendCustomEmail({
    to,
    subject,
    html,
    from,
  }: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
  }) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: from || this.getFromEmail(),
        to,
        subject,
        html,
      });

      return result;
    } catch (error) {
      console.error('Failed to send custom email:', error);
      throw error;
    }
  }

  /**
   * Send a plain text email
   */
  static async sendTextEmail({
    to,
    subject,
    text,
    from,
  }: {
    to: string | string[];
    subject: string;
    text: string;
    from?: string;
  }) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: from || this.getFromEmail(),
        to,
        subject,
        text,
      });

      return result;
    } catch (error) {
      console.error('Failed to send text email:', error);
      throw error;
    }
  }

  /**
   * Send an agent notification email
   */
  static async sendAgentNotificationEmail(
    config: EmailConfig,
    data: AgentNotificationEmailData
  ) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: config.from || this.getFromEmail(),
        to: config.to,
        subject: config.subject,
        react: AgentNotificationEmail(data),
      });

      return result;
    } catch (error) {
      console.error('Failed to send agent notification email:', error);
      throw error;
    }
  }

  /**
   * Send a feedback followup email
   */
  static async sendFeedbackFollowupEmail(
    config: EmailConfig,
    data: FeedbackFollowupEmailData
  ) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: config.from || this.getFromEmail(),
        to: config.to,
        subject: config.subject,
        react: FeedbackFollowupEmail(data),
      });

      return result;
    } catch (error) {
      console.error('Failed to send feedback followup email:', error);
      throw error;
    }
  }

  /**
   * Send a reengagement email
   */
  static async sendReengagementEmail(
    config: EmailConfig,
    data: ReengagementEmailData
  ) {
    if (!this.isConfigured()) {
      throw new Error(
        'Resend is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      const result = await resend.emails.send({
        from: config.from || this.getFromEmail(),
        to: config.to,
        subject: config.subject,
        react: ReengagementEmail(data),
      });

      return result;
    } catch (error) {
      console.error('Failed to send reengagement email:', error);
      throw error;
    }
  }

  /**
   * Check if email service is properly configured
   */
  static getStatus() {
    return {
      configured: this.isConfigured(),
      fromEmail: this.getFromEmail(),
    };
  }
}

export default EmailService;
