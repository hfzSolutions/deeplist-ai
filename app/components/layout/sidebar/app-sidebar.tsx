'use client';

import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useHomepage } from '@/lib/homepage-store/provider';
import { useUser } from '@/lib/user-store/provider';
import {
  Gear,
  SignIn,
  Storefront,
  X,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { SidebarProject } from './sidebar-project';
import { SidebarUserMenu } from './sidebar-user-menu';

export function AppSidebar() {
  const isMobile = useBreakpoint(768);
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const { user } = useUser();

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" className="border-none">
      <SidebarHeader className="h-14 pl-3">
        <div className="flex justify-end">
          {isMobile ? (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-md bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <X size={24} />
            </button>
          ) : (
            <div className="h-full" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="mask-t-from-98% mask-t-to-100% mask-b-from-98% mask-b-to-100% px-3">
        <ScrollArea className="flex h-full [&>div>div]:!block">

          {/* AI Tools Store */}
          <div className="mb-4 space-y-1">
            <button
              className="hover:bg-accent/80 hover:text-foreground group/agent-store relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors border border-primary/20 hover:border-primary/40"
              type="button"
              onClick={() => {
                router.push('/store');
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded">
                  <Storefront size={14} className="text-primary" />
                </div>
                <span className="font-medium">AI Tools</span>
              </div>
            </button>
          </div>

          <SidebarSeparator className="mx-0 mb-4" />

          {/* Admin Section - Only show for admin users */}
          {user?.is_admin && (
            <>
              <div className="mb-4 space-y-1">
                <button
                  className="hover:bg-accent/80 hover:text-foreground group/admin relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
                  type="button"
                  onClick={() => {
                    router.push('/admin');
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Gear size={20} />
                    Admin Panel
                  </div>
                </button>
              </div>
              <SidebarSeparator className="mx-0 mb-4" />
            </>
          )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <SidebarUserMenu />
        ) : (
          <button
            onClick={() => {
              const returnUrl = encodeURIComponent(
                window.location.pathname + window.location.search
              );
              router.push(`/auth?returnUrl=${returnUrl}`);
              if (isMobile) {
                setOpenMobile(false);
              }
            }}
            className="hover:bg-muted flex items-center gap-2 rounded-md p-2 w-full"
            aria-label="Login to your account"
          >
            <div className="rounded-full border p-1">
              <SignIn className="size-4" />
            </div>
            <div className="flex flex-col">
              <div className="text-sidebar-foreground text-sm font-medium">
                Login
              </div>
            </div>
          </button>
        )}
      </SidebarFooter>

    </Sidebar>
  );
}
