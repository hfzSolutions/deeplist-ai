import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AgentProvider } from '@/lib/agent-store/provider';
import { CategoriesProvider } from '@/lib/categories-store/provider';
import { ChatsProvider } from '@/lib/chat-store/chats/provider';
import { ChatSessionProvider } from '@/lib/chat-store/session/provider';
import { ExternalAIToolsProvider } from '@/lib/external-ai-tools-store/provider';
import { HomepageProvider } from '@/lib/homepage-store/provider';
import { ModelProvider } from '@/lib/model-store/provider';
import { TanstackQueryProvider } from '@/lib/tanstack-query/tanstack-query-provider';
import { UserPreferencesProvider } from '@/lib/user-preference-store/provider';
import { UserProvider } from '@/lib/user-store/provider';
import { getUserProfile } from '@/lib/user/api';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { LayoutClient } from './layout-client';
import { PerformanceOptimizer } from './components/seo/performance';
import {
  AnalyticsProvider,
  AnalyticsNoScript,
} from './components/analytics/analytics-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Deeplist AI - One Platform, All AI',
    template: '%s | Deeplist AI',
  },
  description:
    'Discover the best AI tools for your needs. Access 10+ premium AI models (GPT-4, Claude, Gemini) in one interface. Switch models mid-chat, create custom AI agents, and post your own AI tools for the community.',
  keywords: [
    'AI tools',
    'artificial intelligence',
    'GPT-4',
    'Claude',
    'Gemini',
    'AI models',
    'AI chat',
    'productivity tools',
    'AI assistant',
    'machine learning',
    'AI platform',
    'multi-model AI',
    'AI comparison',
    'AI toolkit',
    'create AI agent',
    'custom AI agents',
    'post AI tools',
    'AI community',
    'AI writing tools',
    'AI content creation',
    'AI text generator',
    'AI writing assistant',
    'AI for writing',
    'AI content writer',
    'AI blog writer',
    'AI article writer',
    'AI untuk menulis',
    'AI untuk content',
    'AI untuk blog',
    'AI untuk artikel',
    'AI penulis',
    'AI untuk menulis artikel',
    'AI untuk menulis blog',
    'AI untuk menulis konten',
    'AI penulis Indonesia',
    'AI writing tools Malaysia',
    'AI untuk menulis Malaysia',
    'AI content creation Indonesia',
    'AI text generator Malaysia',
  ],
  authors: [{ name: 'Deeplist AI Team' }],
  creator: 'Deeplist AI',
  publisher: 'Deeplist AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://deeplist.com'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Deeplist AI - One Platform, All AI',
    description:
      'Discover the best AI tools for your needs. Access 10+ premium AI models in one interface. Switch models mid-chat, create custom AI agents, and post your own AI tools for the community.',
    siteName: 'Deeplist AI',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Deeplist AI - One Platform, All AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deeplist AI - One Platform, All AI',
    description:
      'Discover the best AI tools for your needs. Access 10+ premium AI models in one interface. Create custom AI agents and post your own AI tools.',
    images: ['/opengraph-image.jpg'],
    creator: '@deeplistai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';
  const isOfficialDeployment = process.env.DEEPLIST_AI_OFFICIAL === 'true';
  const userProfile = await getUserProfile();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Deeplist AI',
    description:
      'Discover the best AI tools for your needs. Access 10+ premium AI models in one interface. Switch models mid-chat, create custom AI agents, and post your own AI tools for the community.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://deeplist.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Deeplist AI Team',
    },
    featureList: [
      'Multi-model AI access',
      'Switch AI models mid-chat',
      'AI tools store',
      'Create custom AI agents',
      'Post your own AI tools',
      'Context preservation',
      'Unified interface',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsNoScript />
        <PerformanceOptimizer />
        <AnalyticsProvider>
          {isOfficialDeployment ? (
            <Script
              defer
              src="https://assets.onedollarstats.com/stonks.js"
              {...(isDev ? { 'data-debug': 'deeplist.ai' } : {})}
            />
          ) : null}
          <TanstackQueryProvider>
            <LayoutClient />
            <UserProvider initialUser={userProfile}>
              <CategoriesProvider>
                <ExternalAIToolsProvider>
                  <AgentProvider>
                    <HomepageProvider>
                      <ModelProvider>
                        <ChatsProvider userId={userProfile?.id}>
                          <ChatSessionProvider>
                            <UserPreferencesProvider
                              userId={userProfile?.id}
                              initialPreferences={userProfile?.preferences}
                            >
                            <TooltipProvider
                              delayDuration={200}
                              skipDelayDuration={500}
                            >
                              <ThemeProvider
                                attribute="class"
                                defaultTheme="light"
                                enableSystem
                                disableTransitionOnChange
                              >
                                <SidebarProvider defaultOpen>
                                  <Toaster position="top-center" />
                                  {children}
                                </SidebarProvider>
                              </ThemeProvider>
                            </TooltipProvider>
                            </UserPreferencesProvider>
                          </ChatSessionProvider>
                        </ChatsProvider>
                      </ModelProvider>
                    </HomepageProvider>
                  </AgentProvider>
                </ExternalAIToolsProvider>
              </CategoriesProvider>
            </UserProvider>
          </TanstackQueryProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
