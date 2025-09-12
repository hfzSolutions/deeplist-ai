'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default function AgentRedirectPage({ params }: Props) {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { id } = await params;

      // Validate the ID parameter
      if (!id || typeof id !== 'string' || id.trim() === '') {
        // Invalid ID - redirect to homepage without agent parameter
        router.replace('/');
        return;
      }

      // Redirect to store page with agent ID as a query parameter
      // The store page will detect this and open the agent details dialog
      router.replace(`/store?agent=${encodeURIComponent(id.trim())}`);
    };

    handleRedirect();
  }, [params, router]);

  // Show a simple loading state while redirecting
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
