'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user is authenticated (Supabase handles this automatically after reset link click)
    const checkSession = async () => {
      const supabase = createClient();
      if (!supabase) {
        setError('Failed to initialize authentication. Please try again.');
        setIsCheckingSession(false);
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check error:', error);
        setError(
          'Invalid or expired reset link. Please request a new password reset.'
        );
        setIsCheckingSession(false);
        return;
      }

      if (!session) {
        setError(
          'Invalid or expired reset link. Please request a new password reset.'
        );
        setIsCheckingSession(false);
        return;
      }

      setIsValidSession(true);
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const validateForm = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!isValidSession) {
      setError('Invalid session. Please request a new password reset.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      if (!supabase) {
        throw new Error(
          'Failed to initialize authentication. Please try again.'
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw new Error(error.message || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
            Verifying Reset Link...
          </h1>
          <p className="text-muted-foreground mt-3">
            Please wait while we verify your reset link
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
            Password Reset Successful
          </h1>
          <p className="text-muted-foreground mt-3">
            Your password has been successfully updated
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800 text-sm">
            <p className="font-medium mb-2">Success!</p>
            <p>
              Your password has been changed. You can now sign in with your new
              password.
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            const returnUrl = encodeURIComponent(
              window.location.pathname + window.location.search
            );
            router.push(`/auth?returnUrl=${returnUrl}`);
          }}
        >
          Continue to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
          Set New Password
        </h1>
        <p className="text-muted-foreground mt-3">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {error}
          {error.includes('Invalid or expired') && (
            <div className="mt-2">
              <Link
                href="/auth"
                className="text-destructive hover:underline font-medium"
              >
                Request a new password reset
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              required
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeSlash className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !isValidSession}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/auth"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md space-y-6">
              <div className="text-center">
                <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
                  Loading...
                </h1>
              </div>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        <p>
          By continuing, you agree to our{' '}
          <Link href="/" className="text-foreground hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/" className="text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
