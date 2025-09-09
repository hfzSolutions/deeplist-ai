'use client';

import { HistoryTrigger } from '@/app/components/history/history-trigger';
import { AppInfoTrigger } from '@/app/components/layout/app-info/app-info-trigger';
import { ButtonNewChat } from '@/app/components/layout/button-new-chat';
import { ButtonStore } from '@/app/components/layout/button-store';
import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { DeeplistAIIcon } from '@/components/icons/deeplist-ai';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/config';
import { useUserPreferences } from '@/lib/user-preference-store/provider';
import { useUser } from '@/lib/user-store/provider';
import { Info } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DialogPublish } from './dialog-publish';
import { HeaderSidebarTrigger } from './header-sidebar-trigger';

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768);
  const { user } = useUser();
  const { preferences } = useUserPreferences();
  const { open, openMobile } = useSidebar();
  const isMultiModelEnabled = preferences.multiModelEnabled;
  const pathname = usePathname();

  const isLoggedIn = !!user;
  const isOnStorePage = pathname === '/';
  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <header className="h-app-header pointer-events-none fixed top-0 right-0 left-0 z-[9999]">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-2 sm:px-4 md:px-6 lg:bg-transparent lg:px-8">
        <div className="flex flex-1 items-center justify-between min-w-0">
          <div className="flex flex-1 items-center gap-1 sm:gap-2 lg:-ml-2.5">
            <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
              <Link
                href="/"
                className="pointer-events-auto inline-flex items-center text-lg font-medium tracking-tight sm:text-xl min-w-0"
              >
                <DeeplistAIIcon className="mr-1 size-5 sm:size-6 flex-shrink-0" />
                <span className="truncate">{APP_NAME}</span>
              </Link>
              {hasSidebar && isMobile && !isSidebarOpen && (
                <HeaderSidebarTrigger />
              )}
            </div>
          </div>
          <div className="flex-shrink-0" />
          {!isLoggedIn ? (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2 sm:gap-4">
              {/* <AppInfoTrigger
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background hover:bg-muted text-muted-foreground h-8 w-8 rounded-full"
                    aria-label={`About ${APP_NAME}`}
                  >
                    <Info className="size-4" />
                  </Button>
                }
              /> */}
              {/* Login button hidden as requested */}
              {/* <Link
                href="/auth"
                className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
              >
                Login
              </Link> */}
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-1 sm:gap-2">
              {!isMultiModelEnabled && <DialogPublish />}
              {!isOnStorePage && <ButtonStore />}
              <ButtonNewChat />
              <HistoryTrigger hasSidebar={hasSidebar} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
