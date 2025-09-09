'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '../components/auth/auth-form';
import { HeaderGoBack } from '../components/header-go-back';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAuthSuccess = () => {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      // Decode and validate the return URL
      try {
        const decodedUrl = decodeURIComponent(returnUrl);
        // Basic validation to ensure it's a relative URL
        if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
          router.push(decodedUrl);
          return;
        }
      } catch (error) {
        console.error('Invalid return URL:', error);
      }
    }
    // Fallback to home page
    router.push('/');
  };

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <AuthForm onSuccess={handleAuthSuccess} />
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
