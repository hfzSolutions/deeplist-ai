import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

interface BaseEmailTemplateProps {
  children: React.ReactNode
  preview?: string
}

export const BaseEmailTemplate = ({
  children,
  preview = "Deeplist AI",
}: BaseEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://deeplist.ai/deeplistai-logo.png"
              width="40"
              height="40"
              alt="Deeplist AI"
              style={logo}
            />
          </Section>
          {children}
          <Text style={footer}>
            Best regards,<br />
            The Deeplist AI Team
          </Text>
          <Text style={disclaimer}>
            This email was sent to you because you have an account with Deeplist AI.
            If you have any questions, please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
}

const logoContainer = {
  marginTop: "32px",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "32px",
  marginBottom: "12px",
}

const disclaimer = {
  color: "#898989",
  fontSize: "11px",
  lineHeight: "18px",
  marginTop: "12px",
  marginBottom: "24px",
}

export default BaseEmailTemplate