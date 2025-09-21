'use client';

import { useGoogleAnalytics } from '@/app/components/analytics/analytics-provider';

export function useAnalytics() {
  const { trackEvent, trackPageView } = useGoogleAnalytics();

  // Track AI model usage
  const trackModelUsage = (
    modelName: string,
    action: 'start' | 'switch' | 'complete'
  ) => {
    trackEvent(action, 'AI Model', modelName);
  };

  // Track AI tool usage
  const trackToolUsage = (
    toolName: string,
    action: 'view' | 'use' | 'share'
  ) => {
    trackEvent(action, 'AI Tool', toolName);
  };

  // Track agent creation
  const trackAgentCreation = (agentName: string, isPublic: boolean) => {
    trackEvent('create', 'AI Agent', agentName, isPublic ? 1 : 0);
  };

  // Track chat interactions
  const trackChatInteraction = (
    action: 'start' | 'message' | 'share' | 'export'
  ) => {
    trackEvent(action, 'Chat', undefined);
  };

  // Track user engagement
  const trackEngagement = (
    action: 'login' | 'signup' | 'logout' | 'premium_upgrade'
  ) => {
    trackEvent(action, 'User', undefined);
  };

  // Track page views
  const trackPage = (pageName: string) => {
    trackPageView(`/${pageName}`);
  };

  // Track search queries
  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', 'Search', query, resultsCount);
  };

  // Track errors
  const trackError = (errorType: string, errorMessage: string) => {
    trackEvent('error', 'Error', `${errorType}: ${errorMessage}`);
  };

  return {
    trackModelUsage,
    trackToolUsage,
    trackAgentCreation,
    trackChatInteraction,
    trackEngagement,
    trackPage,
    trackSearch,
    trackError,
  };
}
