import { StoreContainer } from '@/app/components/store/store-container';
import { LayoutApp } from '@/app/components/layout/layout-app';
import { MessagesProvider } from '@/lib/chat-store/messages/provider';
import { ExternalAIToolsProvider } from '@/lib/external-ai-tools-store/provider';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Tools Store',
  description:
    'Discover and access specialized AI tools for coding, design, research, and more. Find the perfect AI tool for any task in our curated collection.',
  keywords: [
    'AI tools store',
    'AI applications',
    'specialized AI tools',
    'AI productivity tools',
    'AI coding tools',
    'AI design tools',
    'AI research tools',
    'AI toolkit',
    'AI software',
    'AI utilities',
  ],
  openGraph: {
    title: 'AI Tools Store - Find the Perfect AI Tool for Any Task',
    description:
      'Discover and access specialized AI tools for coding, design, research, and more. Find the perfect AI tool for any task in our curated collection.',
    type: 'website',
  },
  twitter: {
    title: 'AI Tools Store - Find the Perfect AI Tool for Any Task',
    description:
      'Discover and access specialized AI tools for coding, design, research, and more.',
  },
};

export default function StorePage() {
  return (
    <MessagesProvider>
      <ExternalAIToolsProvider>
        <LayoutApp>
          <StoreContainer />
        </LayoutApp>
      </ExternalAIToolsProvider>
    </MessagesProvider>
  );
}
