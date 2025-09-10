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
import { useAgents } from '@/lib/agent-store/provider';
import { useHomepage } from '@/lib/homepage-store/provider';
import { useUser } from '@/lib/user-store/provider';
import {
  ChatTeardropText,
  Gear,
  GithubLogo,
  ListMagnifyingGlass,
  NotePencilIcon,
  Plus,
  SignIn,
  Storefront,
  X,
} from '@phosphor-icons/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { HistoryTrigger } from '../../history/history-trigger';
import { DialogCreateAgent } from './dialog-create-agent';
import { SidebarProject } from './sidebar-project';
import { SidebarUserMenu } from './sidebar-user-menu';

export function AppSidebar() {
  const isMobile = useBreakpoint(768);
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { publicAgentCount } = useAgents();
  const { forceAgentStoreView } = useHomepage();
  const { user } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
          {/* Main Actions */}
          <div className="mt-3 mb-4 space-y-1">
            <button
              className="hover:bg-accent/80 hover:text-foreground group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
              type="button"
              onClick={() => {
                const currentChatUrl = pathname.startsWith('/c/')
                  ? pathname
                  : undefined;
                router.push('/');
                forceAgentStoreView(currentChatUrl);
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="flex items-center gap-2">
                <NotePencilIcon size={20} />
                New Chat
              </div>
              <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
                ⌘⇧U
              </div>
            </button>
            <HistoryTrigger
              hasSidebar={false}
              classNameTrigger="bg-transparent hover:bg-accent/80 hover:text-foreground relative inline-flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors group/search"
              icon={<ListMagnifyingGlass size={20} className="mr-2" />}
              label={
                <div className="flex w-full items-center gap-2">
                  <span>History</span>
                  <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/search:opacity-100">
                    ⌘+K
                  </div>
                </div>
              }
              hasPopover={false}
            />
          </div>

          <SidebarSeparator className="mx-0 mb-4" />

          {/* Agent Management */}
          <div className="mb-4 space-y-1">
            <button
              className="hover:bg-accent/80 hover:text-foreground group/create-agent relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
              type="button"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Plus size={20} />
                Create Agent
              </div>
            </button>
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
                <span className="font-medium">Store</span>
                <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {publicAgentCount}
                </span>
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

      <DialogCreateAgent
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
      />
    </Sidebar>
  );
}
