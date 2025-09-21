import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deeplist.com';

  return {
    name: 'Deeplist AI - One Platform, All AI',
    short_name: 'Deeplist AI',
    description:
      'Discover the best AI tools for your needs. Access 10+ premium AI models in one interface. Switch models mid-chat and find specialized AI tools for any task.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      {
        src: '/deeplistai-logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: '/opengraph-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        form_factor: 'wide',
      },
    ],
  };
}
