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

interface ReengagementEmailProps {
  userEmail: string
  userName?: string
  daysSinceLastLogin: number
  lastLoginDate?: string
  messageCount?: number
  favoriteModels?: string[]
  loginUrl: string
  unsubscribeUrl?: string
}

export const ReengagementEmail = ({
  userEmail,
  userName,
  daysSinceLastLogin,
  lastLoginDate,
  messageCount = 0,
  favoriteModels = [],
  loginUrl,
  unsubscribeUrl,
}: ReengagementEmailProps) => {
  const displayName = userName || userEmail.split('@')[0]
  
  const getTitle = () => {
    if (daysSinceLastLogin <= 7) {
      return "We miss you at Deeplist AI!"
    } else if (daysSinceLastLogin <= 30) {
      return "Come back and explore what's new!"
    } else {
      return "Your AI assistant is waiting for you"
    }
  }

  const getMessage = () => {
    if (daysSinceLastLogin <= 7) {
      return `It's been ${daysSinceLastLogin} day${daysSinceLastLogin > 1 ? 's' : ''} since your last visit to Deeplist AI. We hope you're doing well! Your AI assistant is ready to help with any questions or tasks you might have.`
    } else if (daysSinceLastLogin <= 30) {
      return `It's been ${daysSinceLastLogin} days since you last used Deeplist AI. We've been busy improving the platform and adding new features that we think you'll love!`
    } else {
      return `It's been over a month since your last visit to Deeplist AI. We miss having you as part of our community! A lot has changed since you were last here, and we'd love to show you what's new.`
    }
  }

  const getCallToAction = () => {
    if (daysSinceLastLogin <= 7) {
      return "Continue Your Conversations"
    } else if (daysSinceLastLogin <= 30) {
      return "Explore New Features"
    } else {
      return "Welcome Back to Deeplist AI"
    }
  }

  const getWhatsNew = () => {
    const features = [
      "🤖 New AI models and improved responses",
      "⚡ Faster processing and better performance",
      "🎨 Enhanced user interface and experience",
      "🔧 New tools and capabilities",
      "📱 Better mobile experience"
    ]
    
    if (daysSinceLastLogin <= 7) {
      return features.slice(0, 2)
    } else if (daysSinceLastLogin <= 30) {
      return features.slice(0, 3)
    } else {
      return features
    }
  }
  
  return (
    <BaseEmailTemplate preview={getTitle()}>
      <Preview>{getTitle()}</Preview>
      <Heading style={h1}>Hi {displayName}!</Heading>
      
      <Section style={heroContainer}>
        <Text style={heroEmoji}>👋</Text>
        <Heading style={h2}>{getTitle()}</Heading>
      </Section>
      
      <Text style={text}>
        {getMessage()}
      </Text>
      
      {messageCount > 0 && (
        <Section style={statsContainer}>
          <Text style={statsLabel}>Your Deeplist AI Journey:</Text>
          <Text style={statsItem}>💬 {messageCount} conversation{messageCount > 1 ? 's' : ''} started</Text>
          {lastLoginDate && (
            <Text style={statsItem}>📅 Last visit: {lastLoginDate}</Text>
          )}
          {favoriteModels.length > 0 && (
            <Text style={statsItem}>🤖 Favorite models: {favoriteModels.slice(0, 2).join(', ')}{favoriteModels.length > 2 ? ` +${favoriteModels.length - 2} more` : ''}</Text>
          )}
        </Section>
      )}
      
      {daysSinceLastLogin > 7 && (
        <>
          <Text style={text}>
            <strong>Here's what's new since your last visit:</strong>
          </Text>
          
          <Section style={featuresContainer}>
            {getWhatsNew().map((feature, index) => (
              <Text key={index} style={featureItem}>{feature}</Text>
            ))}
          </Section>
        </>
      )}
      
      <Text style={text}>
        Ready to dive back in? Your AI assistant is waiting to help with any questions, creative projects, or tasks you have in mind.
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          {getCallToAction()}
        </Button>
      </Section>
      
      <Text style={text}>
        If the button above doesn't work, you can copy and paste this link into your browser:
      </Text>
      <Link href={loginUrl} style={link}>
        {loginUrl}
      </Link>
      
      <Text style={text}>
        We're excited to have you back and can't wait to see what you'll create with Deeplist AI!
      </Text>
      
      {unsubscribeUrl && (
        <Text style={footerText}>
          Don't want to receive these emails? <Link href={unsubscribeUrl} style={unsubscribeLink}>Unsubscribe here</Link>
        </Text>
      )}
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

const statsContainer = {
  margin: "20px 0",
  padding: "16px",
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  borderLeft: "4px solid #0ea5e9",
}

const statsLabel = {
  color: "#0c4a6e",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
}

const statsItem = {
  color: "#1a1a1a",
  fontSize: "14px",
  margin: "0 0 6px",
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

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "20px 0 0",
  textAlign: "center" as const,
}

const unsubscribeLink = {
  color: "#6b7280",
  textDecoration: "underline",
  fontSize: "12px",
}

export default ReengagementEmail