'use client';

import { GoogleAnalytics, useGoogleAnalytics } from './google-analytics';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from './google-tag-manager';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-SX9RHML1D5';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      {children}
    </>
  );
}

export function AnalyticsNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return gtmId ? <GoogleTagManagerNoScript gtmId={gtmId} /> : null;
}

// Export the hook for use in components
export { useGoogleAnalytics };
