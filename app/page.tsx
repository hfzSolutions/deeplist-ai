import { HomepageContainer } from '@/app/components/homepage/homepage-container';
import { LayoutApp } from '@/app/components/layout/layout-app';
import { MessagesProvider } from '@/lib/chat-store/messages/provider';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <HomepageContainer />
      </LayoutApp>
    </MessagesProvider>
  );
}
