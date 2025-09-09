'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokens, setTokens] = useState<{
    access_token: string | null;
    refresh_token: string | null;
  }>({ access_token: null, refresh_token: null });

  useEffect(() => {
    // Extract tokens from URL hash (Supabase auth callback format)
    const hash = window.location.hash.substring(1);
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(hash);

    // Check for tokens in hash first (Supabase redirect format)
    let access_token = hashParams.get('access_token');
    let refresh_token = hashParams.get('refresh_token');
    let error_description = hashParams.get('error_description');

    // If not in hash, check search parameters (fallback)
    if (!access_token || !refresh_token) {
      access_token = searchParams.get('access_token');
      refresh_token = searchParams.get('refresh_token');
      error_description = searchParams.get('error_description');
    }

    if (error_description) {
      setError(decodeURIComponent(error_description));
      return;
    }

    if (!access_token || !refresh_token) {
      console.error('Missing tokens:', {
        access_token: !!access_token,
        refresh_token: !!refresh_token,
        hash: window.location.hash,
        search: window.location.search,
      });
      setError(
        'Invalid or expired reset link. Please request a new password reset.'
      );
      return;
    }

    setTokens({ access_token, refresh_token });
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

    if (!tokens.access_token || !tokens.refresh_token) {
      setError('Invalid reset tokens. Please request a new password reset.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
          disabled={isLoading || !tokens.access_token}
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
