import { HomepageContainer } from '@/app/components/homepage/homepage-container';
import { LayoutApp } from '@/app/components/layout/layout-app';
import { MessagesProvider } from '@/lib/chat-store/messages/provider';
import { FAQSchema, commonFAQs } from '@/app/components/seo/faq-schema';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Deeplist AI - One Platform, All AI',
  description:
    'Discover the best AI tools for your needs. Access 10+ premium AI models (GPT-4, Claude, Gemini) in one interface. Switch models mid-chat and find specialized AI tools for any task.',
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
    'AI productivity',
    'AI software',
    'AI applications',
  ],
  openGraph: {
    title: 'Deeplist AI - One Platform, All AI',
    description:
      'Discover the best AI tools for your needs. Access 10+ premium AI models in one interface. Switch models mid-chat and find specialized AI tools for any task.',
    type: 'website',
    url: '/',
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
      'Discover the best AI tools for your needs. Access 10+ premium AI models in one interface.',
    images: ['/opengraph-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      <FAQSchema faqs={commonFAQs} />
      <MessagesProvider>
        <LayoutApp>
          <HomepageContainer />
        </LayoutApp>
      </MessagesProvider>
    </>
  );
}
