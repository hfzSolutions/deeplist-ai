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

interface NotificationEmailProps {
  userEmail: string
  userName?: string
  title: string
  message: string
  actionText?: string
  actionUrl?: string
  priority?: "low" | "medium" | "high"
}

export const NotificationEmail = ({
  userEmail,
  userName,
  title,
  message,
  actionText,
  actionUrl,
  priority = "medium",
}: NotificationEmailProps) => {
  const displayName = userName || userEmail.split('@')[0]
  const priorityColors = {
    low: { bg: "#f0f9ff", border: "#0ea5e9", text: "#0c4a6e" },
    medium: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    high: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
  }
  
  return (
    <BaseEmailTemplate preview={title}>
      <Preview>{title}</Preview>
      <Heading style={h1}>Hi {displayName},</Heading>
      
      {priority === "high" && (
        <Section style={{
          ...priorityContainer,
          backgroundColor: priorityColors.high.bg,
          borderColor: priorityColors.high.border,
        }}>
          <Text style={{
            ...priorityText,
            color: priorityColors.high.text,
          }}>
            🚨 Important Notification
          </Text>
        </Section>
      )}
      
      <Heading style={h2}>{title}</Heading>
      
      <Text style={text}>
        {message}
      </Text>
      
      {actionText && actionUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={actionUrl}>
            {actionText}
          </Button>
        </Section>
      )}
      
      {actionUrl && (
        <>
          <Text style={text}>
            If the button above doesn't work, you can copy and paste this link into your browser:
          </Text>
          <Link href={actionUrl} style={link}>
            {actionUrl}
          </Link>
        </>
      )}
      
      <Text style={text}>
        If you have any questions or concerns, please don't hesitate to contact our support team.
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
  margin: "0 0 16px",
}

const text = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const priorityContainer = {
  margin: "20px 0",
  padding: "12px 16px",
  borderRadius: "8px",
  borderLeft: "4px solid",
}

const priorityText = {
  fontSize: "14px",
  fontWeight: "600",
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

export default NotificationEmail