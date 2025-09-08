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

interface AgentNotificationEmailProps {
  userEmail: string
  userName?: string
  agentName: string
  agentId: string
  notificationType: "usage" | "milestone" | "shared"
  details: {
    usageCount?: number
    milestone?: string
    sharedBy?: string
  }
  agentUrl: string
}

export const AgentNotificationEmail = ({
  userEmail,
  userName,
  agentName,
  agentId,
  notificationType,
  details,
  agentUrl,
}: AgentNotificationEmailProps) => {
  const displayName = userName || userEmail.split('@')[0]
  
  const getTitle = () => {
    switch (notificationType) {
      case "usage":
        return `Your agent "${agentName}" is being used!`
      case "milestone":
        return `🎉 Your agent "${agentName}" reached a milestone!`
      case "shared":
        return `Your agent "${agentName}" was shared`
      default:
        return `Update about your agent "${agentName}"`
    }
  }

  const getMessage = () => {
    switch (notificationType) {
      case "usage":
        return `Great news! Your public agent "${agentName}" has been used ${details.usageCount || 1} time${(details.usageCount || 1) > 1 ? 's' : ''} by other users. People are finding value in your AI agent!`
      case "milestone":
        return `Congratulations! Your agent "${agentName}" has reached an important milestone: ${details.milestone}. Your contribution to the Deeplist AI community is making a real impact!`
      case "shared":
        return `Your agent "${agentName}" was shared by ${details.sharedBy || 'another user'}. Your AI agent is helping more people discover the power of custom AI assistants!`
      default:
        return `There's an update about your agent "${agentName}".`
    }
  }

  const getEmoji = () => {
    switch (notificationType) {
      case "usage":
        return "🚀"
      case "milestone":
        return "🎉"
      case "shared":
        return "📤"
      default:
        return "🤖"
    }
  }

  const getStatsText = () => {
    switch (notificationType) {
      case "usage":
        return `Used ${details.usageCount || 1} time${(details.usageCount || 1) > 1 ? 's' : ''}`
      case "milestone":
        return `Milestone: ${details.milestone || 'Achievement unlocked'}`
      case "shared":
        return `Shared by: ${details.sharedBy || 'Community member'}`
      default:
        return "Status update"
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
      
      <Section style={agentContainer}>
        <Text style={agentLabel}>Agent Details:</Text>
        <Text style={agentNameStyle}>🤖 {agentName}</Text>
        <Text style={agentIdStyle}>📊 {getStatsText()}</Text>
      </Section>
      
      <Text style={text}>
        Want to see how your agent is performing or make updates?
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={agentUrl}>
          View Agent
        </Button>
      </Section>
      
      <Text style={text}>
        If the button above doesn't work, you can copy and paste this link into your browser:
      </Text>
      <Link href={agentUrl} style={link}>
        {agentUrl}
      </Link>
      
      <Text style={text}>
        Keep creating amazing AI agents! The community appreciates your contributions.
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

const agentContainer = {
  margin: "20px 0",
  padding: "16px",
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  borderLeft: "4px solid #0ea5e9",
}

const agentLabel = {
  color: "#0c4a6e",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
}

const agentNameStyle = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px",
}

const agentIdStyle = {
  color: "#6b7280",
  fontSize: "12px",
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

export default AgentNotificationEmail