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

interface WelcomeEmailProps {
  userEmail: string
  userName?: string
  loginUrl: string
}

export const WelcomeEmail = ({
  userEmail,
  userName,
  loginUrl,
}: WelcomeEmailProps) => {
  const displayName = userName || userEmail.split('@')[0]
  
  return (
    <BaseEmailTemplate preview="Welcome to Deeplist AI">
      <Preview>Welcome to Deeplist AI - Your AI-powered assistant</Preview>
      <Heading style={h1}>Welcome to Deeplist AI, {displayName}!</Heading>
      <Text style={heroText}>
        Thank you for joining Deeplist AI. We're excited to have you on board!
      </Text>
      <Text style={text}>
        Deeplist AI is your intelligent assistant that helps you with various tasks,
        from answering questions to helping with creative projects. Here's what you can do:
      </Text>
      <Section style={featuresContainer}>
        <Text style={featureItem}>✨ Ask questions and get intelligent responses</Text>
        <Text style={featureItem}>💬 Have natural conversations with AI</Text>
        <Text style={featureItem}>🔧 Get help with coding and technical tasks</Text>
        <Text style={featureItem}>📝 Assist with writing and content creation</Text>
        <Text style={featureItem}>🎨 Generate creative ideas and solutions</Text>
      </Section>
      <Text style={text}>
        Ready to get started? Click the button below to access your account:
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          Start Using Deeplist AI
        </Button>
      </Section>
      <Text style={text}>
        If you have any questions or need help getting started, don't hesitate to reach out.
        We're here to help you make the most of your Deeplist AI experience.
      </Text>
      <Text style={text}>
        If the button above doesn't work, you can copy and paste this link into your browser:
      </Text>
      <Link href={loginUrl} style={link}>
        {loginUrl}
      </Link>
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

const heroText = {
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
  color: "#484848",
}

const text = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const featuresContainer = {
  margin: "20px 0",
  padding: "16px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
}

const featureItem = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 8px",
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

export default WelcomeEmail