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
import { HomepageProvider } from '@/lib/homepage-store/provider';
import { ModelProvider } from '@/lib/model-store/provider';
import { TanstackQueryProvider } from '@/lib/tanstack-query/tanstack-query-provider';
import { UserPreferencesProvider } from '@/lib/user-preference-store/provider';
import { UserProvider } from '@/lib/user-store/provider';
import { getUserProfile } from '@/lib/user/api';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { LayoutClient } from './layout-client';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Deeplist AI',
  description:
    'Discover the best AI tools for your needs. Our collection helps boost your productivity and creativity.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';
  const isOfficialDeployment = process.env.DEEPLIST_AI_OFFICIAL === 'true';
  const userProfile = await getUserProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      {isOfficialDeployment ? (
        <Script
          defer
          src="https://assets.onedollarstats.com/stonks.js"
          {...(isDev ? { 'data-debug': 'deeplist.ai' } : {})}
        />
      ) : null}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanstackQueryProvider>
          <LayoutClient />
          <UserProvider initialUser={userProfile}>
            <CategoriesProvider>
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
            </CategoriesProvider>
          </UserProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
