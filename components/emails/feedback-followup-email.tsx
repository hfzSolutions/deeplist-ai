import {
  Button,
  Heading,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseEmailTemplate } from "./base-email-template"

interface FeedbackFollowupEmailProps {
  userEmail: string
  userName?: string
  feedbackType: "bug" | "feature" | "general" | "support"
  feedbackId: string
  feedbackSnippet?: string
  dashboardUrl: string
}

export const FeedbackFollowupEmail = ({
  userEmail,
  userName,
  feedbackType,
  feedbackId,
  feedbackSnippet,
  dashboardUrl,
}: FeedbackFollowupEmailProps) => {
  const displayName = userName || userEmail.split('@')[0]
  
  const getTitle = () => {
    switch (feedbackType) {
      case "bug":
        return "Thank you for reporting a bug!"
      case "feature":
        return "Thank you for your feature request!"
      case "support":
        return "We received your support request"
      case "general":
        return "Thank you for your feedback!"
      default:
        return "Thank you for your feedback!"
    }
  }

  const getMessage = () => {
    switch (feedbackType) {
      case "bug":
        return "We've received your bug report and our development team will investigate it promptly. Bug fixes are a top priority for us, and we'll work to resolve this issue as quickly as possible."
      case "feature":
        return "We've received your feature request and added it to our product roadmap for consideration. Feature requests from our users help us prioritize what to build next."
      case "support":
        return "We've received your support request and our team will get back to you within 24 hours. In the meantime, you might find helpful information in our documentation."
      case "general":
        return "We've received your feedback and truly appreciate you taking the time to share your thoughts. Your input helps us improve Deeplist AI for everyone."
      default:
        return "We've received your feedback and appreciate your input."
    }
  }

  const getEmoji = () => {
    switch (feedbackType) {
      case "bug":
        return "🐛"
      case "feature":
        return "💡"
      case "support":
        return "🤝"
      case "general":
        return "💬"
      default:
        return "📝"
    }
  }

  const getNextSteps = () => {
    switch (feedbackType) {
      case "bug":
        return "We'll investigate this issue and may reach out if we need additional information. You'll receive an update once we have a fix ready."
      case "feature":
        return "We'll evaluate this request alongside other feature proposals. Popular requests often get prioritized, so thank you for sharing your ideas!"
      case "support":
        return "Our support team will review your request and respond with a solution or next steps within 24 hours."
      case "general":
        return "We review all feedback regularly and use it to guide our product development decisions."
      default:
        return "We'll review your feedback and take appropriate action."
    }
  }
  
  return (
    <BaseEmailTemplate preview={getTitle()}>
      <Preview>{getTitle()}</Preview>
      <Heading style={h1}>Hi {displayName}!</Heading>
      
      <Section style={heroContainer}>
        <Text style={heroEmoji}>{getEmoji()}</Text>
        <Heading style={h2}>{getTitle()}</Heading>
      </Section>
      
      <Text style={text}>
        {getMessage()}
      </Text>
      
      {feedbackSnippet && (
        <Section style={feedbackContainer}>
          <Text style={feedbackLabel}>Your feedback:</Text>
          <Text style={feedbackText}>"{feedbackSnippet}"</Text>
        </Section>
      )}
      
      <Section style={infoContainer}>
        <Text style={infoLabel}>Reference ID:</Text>
        <Text style={infoValue}>{feedbackId}</Text>
      </Section>
      
      <Text style={text}>
        <strong>What happens next?</strong>
      </Text>
      
      <Text style={text}>
        {getNextSteps()}
      </Text>
      
      <Text style={text}>
        Want to check on your feedback or submit additional details?
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          View Dashboard
        </Button>
      </Section>
      
      <Text style={text}>
        If the button above doesn't work, you can copy and paste this link into your browser:
      </Text>
      <Link href={dashboardUrl} style={link}>
        {dashboardUrl}
      </Link>
      
      <Text style={text}>
        Thank you for helping us make Deeplist AI better! Your feedback is invaluable to our continuous improvement.
      </Text>
      
      <Text style={footerText}>
        Need immediate help? Reply to this email or contact our support team.
      </Text>
    </BaseEmailTemplate>
  )
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
}

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0",
}

const text = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const heroContainer = {
  textAlign: "center" as const,
  margin: "20px 0 30px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
}

const heroEmoji = {
  fontSize: "48px",
  margin: "0 0 16px",
}

const feedbackContainer = {
  margin: "20px 0",
  padding: "16px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  borderLeft: "4px solid #f59e0b",
}

const feedbackLabel = {
  color: "#92400e",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
}

const feedbackText = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "22px",
  margin: "0",
}

const infoContainer = {
  margin: "20px 0",
  padding: "12px 16px",
  backgroundColor: "#f3f4f6",
  borderRadius: "6px",
}

const infoLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0 0 4px",
}

const infoValue = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontFamily: "monospace",
  margin: "0",
}

const buttonContainer = {
  padding: "27px 0 27px",
}

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
}

const link = {
  color: "#067df7",
  textDecoration: "underline",
  fontSize: "14px",
  margin: "0 0 10px",
  wordBreak: "break-all" as const,
}

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "20px 0 0",
  fontStyle: "italic",
}

export default FeedbackFollowupEmail