import { StoreContainer } from '@/app/components/store/store-container';
import { LayoutApp } from '@/app/components/layout/layout-app';
import { MessagesProvider } from '@/lib/chat-store/messages/provider';
import { ExternalAIToolsProvider } from '@/lib/external-ai-tools-store/provider';

export const dynamic = 'force-dynamic';

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
