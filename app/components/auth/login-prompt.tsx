"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignIn, User } from "@phosphor-icons/react"
import Link from "next/link"

type LoginPromptProps = {
  title?: string
  description?: string
  actionText?: string
  className?: string
  action?: string
  variant?: "card" | "inline"
}

export function LoginPrompt({
  title = "Login Required",
  description,
  actionText = "Sign In",
  className = "",
  action = "perform this action",
  variant = "card",
}: LoginPromptProps) {
  const defaultDescription = `You need to be logged in to ${action}. Please sign in to continue.`
  const finalDescription = description || defaultDescription

  if (variant === "inline") {
    return (
      <div
        className={`flex flex-col items-center gap-3 p-4 text-center ${className}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-foreground mb-1 text-sm font-medium">{title}</p>
          <p className="text-muted-foreground mb-3 text-xs">
            {finalDescription}
          </p>
          <Link href="/auth">
            <Button size="sm" className="w-full">
              <SignIn className="mr-2 h-3 w-3" />
              {actionText}
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  return (
    <Card className={`mx-auto w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">
          {finalDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href="/auth">
          <Button className="w-full">
            <SignIn className="mr-2 h-4 w-4" />
            {actionText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// Compact version for inline use
export function LoginPromptInline({
  title = "Login to continue",
  actionText = "Sign In",
  className = "",
}: Pick<LoginPromptProps, "title" | "actionText" | "className">) {
  return (
    <div
      className={`flex flex-col items-center gap-3 p-4 text-center ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-foreground mb-1 text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mb-3 text-xs">
          Create and save your own agents
        </p>
        <Link href="/auth">
          <Button size="sm" className="w-full">
            <SignIn className="mr-2 h-3 w-3" />
            {actionText}
          </Button>
        </Link>
      </div>
    </div>
  )
}
