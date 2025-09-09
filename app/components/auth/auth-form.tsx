'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useState } from 'react';
import { ForgotPasswordForm } from './forgot-password-form';

type AuthFormProps = {
  onSuccess?: () => void;
};

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const supabase = createClient();
    if (!supabase) {
      setError('Authentication service is not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isSignUp) {
        const data = await signUpWithEmail(
          supabase,
          formData.email,
          formData.password
        );
        if (data.user && !data.user.email_confirmed_at) {
          setError(
            'Please check your email and click the confirmation link to complete your registration.'
          );
          return;
        }
      } else {
        await signInWithEmail(supabase, formData.email, formData.password);
      }

      // For signup, switch to login form instead of redirecting
      if (isSignUp) {
        setIsSignUp(false);
        setFormData({ email: '', password: '', confirmPassword: '' });
        setError(null);
        return;
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error('Error with email authentication:', err);
      const errorMessage = (err as Error).message;

      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (errorMessage.includes('User already registered')) {
        setError(
          'An account with this email already exists. Please sign in instead.'
        );
      } else if (errorMessage.includes('Email not confirmed')) {
        setError(
          'Please check your email and click the confirmation link before signing in.'
        );
      } else {
        setError(
          errorMessage || 'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const supabase = createClient();
    if (!supabase) {
      setError('Authentication service is not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await signInWithGoogle(supabase);
      if (data?.url) {
        // For Google auth, we redirect to the OAuth provider
        // The callback will handle the redirect back to the original page
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error('Error signing in with Google:', err);
      setError(
        (err as Error).message ||
          'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onBack={() => setShowForgotPassword(false)}
        // Don't pass onSuccess - we want users to stay on the forgot password success page
      />
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-muted-foreground mt-3">
          {isSignUp
            ? 'Sign up to get started with Deeplist AI'
            : 'Sign in to access your account'}
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              required
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeSlash className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
        )}

        {!isSignUp && (
          <div className="text-right">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading
            ? 'Processing...'
            : isSignUp
              ? 'Create Account'
              : 'Sign In'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full text-base"
        size="lg"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google logo"
          width={20}
          height={20}
          className="mr-2 size-4"
        />
        <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setFormData({ email: '', password: '', confirmPassword: '' });
          }}
          disabled={isLoading}
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
