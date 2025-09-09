'use client';

import { useKeyShortcut } from '@/app/hooks/use-key-shortcut';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Storefront } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';

export function ButtonStore() {
  const router = useRouter();

  const handleStoreClick = () => {
    router.push('/store');
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
