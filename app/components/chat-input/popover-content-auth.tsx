"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { signInWithEmail, signInWithGoogle } from "@/lib/api"
import { APP_NAME } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { Eye, EyeSlash } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

/**
 * @deprecated This component has been deprecated in favor of LoginPrompt.
 * Please use LoginPrompt component from @/app/components/auth/login-prompt instead.
 * This component will be removed in a future version.
 */
export function PopoverContentAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  if (!isSupabaseEnabled) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Authentication service is not available")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await signInWithEmail(supabase, formData.email, formData.password)
      // The page will refresh automatically after successful sign-in
    } catch (err: unknown) {
      console.error("Error signing in with email:", err)
      const errorMessage = (err as Error).message
      
      if (errorMessage.includes("Invalid login credentials")) {
        setError("Invalid email or password")
      } else {
        setError(errorMessage || "An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInWithGoogle = async () => {
    const supabase = createClient()

    if (!supabase) {
      throw new Error("Supabase is not configured")
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await signInWithGoogle(supabase)

      // Redirect to the provider URL
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <PopoverContent
      className="w-[320px] overflow-hidden rounded-xl p-0"
      side="top"
      align="start"
    >
      <Image
        src="/banner_forest.jpg"
        alt={`calm paint generate by ${APP_NAME}`}
        width={320}
        height={128}
        className="h-32 w-full object-cover"
      />
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}
      <div className="p-4">
        <p className="text-primary mb-1 text-base font-medium">
          Login to try more features for free
        </p>
        <p className="text-muted-foreground mb-4 text-sm">
          Add files, use more models, BYOK, and more.
        </p>
        
        {!showEmailForm ? (
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full text-sm"
              size="sm"
              onClick={handleSignInWithGoogle}
              disabled={isLoading}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google logo"
                width={16}
                height={16}
                className="mr-2 size-4"
              />
              <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full text-sm"
              size="sm"
              onClick={() => setShowEmailForm(true)}
              disabled={isLoading}
            >
              Sign in with Email
            </Button>
            
            <div className="text-center">
              <Link
                href="/auth"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Need an account? Sign up
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="popover-email" className="text-xs">Email</Label>
              <Input
                id="popover-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="popover-password" className="text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="popover-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  className="text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlash className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  setShowEmailForm(false)
                  setFormData({ email: "", password: "" })
                  setError(null)
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 text-xs"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
            
            <div className="text-center">
              <Link
                href="/auth"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Need an account? Sign up
              </Link>
            </div>
          </form>
        )}
      </div>
    </PopoverContent>
  )
}
