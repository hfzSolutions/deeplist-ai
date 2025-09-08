'use client';

import { useKeyShortcut } from '@/app/hooks/use-key-shortcut';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useHomepage } from '@/lib/homepage-store/provider';
import { Storefront } from '@phosphor-icons/react/dist/ssr';
import { usePathname, useRouter } from 'next/navigation';

export function ButtonStore() {
  const pathname = usePathname();
  const router = useRouter();
  const { forceAgentStoreView } = useHomepage();

  const handleStoreClick = () => {
    const currentChatUrl = pathname.startsWith('/c/') ? pathname : undefined;
    router.push('/');
    forceAgentStoreView(currentChatUrl);
  };

  useKeyShortcut(
    (e) => (e.key === 's' || e.key === 'S') && e.metaKey && e.shiftKey,
    handleStoreClick
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleStoreClick}
          className="text-muted-foreground hover:text-foreground hover:bg-muted bg-background rounded-full p-1.5 transition-colors"
          aria-label="Open Store"
        >
          <Storefront size={24} />
        </button>
      </TooltipTrigger>
      <TooltipContent>Store ⌘⇧S</TooltipContent>
    </Tooltip>
  );
}
