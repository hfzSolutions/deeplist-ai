import { HomepageContainer } from '@/app/components/homepage/homepage-container';
import { LayoutApp } from '@/app/components/layout/layout-app';
import { FAQSchema, commonFAQs } from '@/app/components/seo/faq-schema';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Deeplist AI - One Platform, All AI',
  description:
    'Discover the best AI tools for your needs. Find specialized AI tools for any task and explore what the community has shared.',
  keywords: [
    'AI tools',
    'artificial intelligence',
    'GPT-4',
    'Claude',
    'Gemini',
    'productivity tools',
    'machine learning',
    'AI platform',
    'AI toolkit',
    'AI productivity',
    'AI software',
    'AI applications',
  ],
  openGraph: {
    title: 'Deeplist AI - One Platform, All AI',
    description:
      'Discover the best AI tools for your needs. Find specialized AI tools for any task and explore what the community has shared.',
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
      'Discover the best AI tools for your needs. Find specialized AI tools for any task.',
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
      <LayoutApp>
        <HomepageContainer />
      </LayoutApp>
    </>
  );
}
