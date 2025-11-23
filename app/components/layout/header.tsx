'use client';

import { AppInfoTrigger } from '@/app/components/layout/app-info/app-info-trigger';
import { ButtonStore } from '@/app/components/layout/button-store';
import { HeaderUserMenu } from '@/app/components/layout/header-user-menu';
import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { DeeplistAIIcon } from '@/components/icons/deeplist-ai';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/config';
import { useUserPreferences } from '@/lib/user-preference-store/provider';
import { useUser } from '@/lib/user-store/provider';
import { Gear, SignIn } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DialogPublish } from './dialog-publish';

export function Header() {
  const isMobile = useBreakpoint(768);
  const { user } = useUser();
  const { preferences } = useUserPreferences();
  const isMultiModelEnabled = preferences.multiModelEnabled;
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = !!user;
  const isOnStorePage = pathname === '/';

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
            </div>
          </div>
          <div className="flex-shrink-0" />
          <div className="pointer-events-auto flex flex-1 items-center justify-end gap-1 sm:gap-2">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const returnUrl = encodeURIComponent(
                      pathname + (typeof window !== 'undefined' ? window.location.search : '')
                    );
                    router.push(`/auth?returnUrl=${returnUrl}`);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SignIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </>
            ) : (
              <>
                {!isMultiModelEnabled && <DialogPublish />}
                {!isOnStorePage && <ButtonStore />}
                {user?.is_admin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/admin')}
                    className="h-8 w-8"
                    aria-label="Admin Panel"
                  >
                    <Gear className="h-4 w-4" />
                  </Button>
                )}
                <HeaderUserMenu />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
