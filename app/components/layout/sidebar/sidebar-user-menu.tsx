'use client';

import XIcon from '@/components/icons/x';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser } from '@/lib/user-store/provider';
import { CaretUp } from '@phosphor-icons/react';
import { useState } from 'react';
import { AppInfoTrigger } from '../app-info/app-info-trigger';
import { FeedbackTrigger } from '../feedback/feedback-trigger';
import { SettingsTrigger } from '../settings/settings-trigger';

export function SidebarUserMenu() {
  const { user } = useUser();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  if (!user) return null;

  const handleSettingsOpenChange = (isOpen: boolean) => {
    setSettingsOpen(isOpen);
    if (!isOpen) {
      setMenuOpen(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu
          open={isMenuOpen}
          onOpenChange={setMenuOpen}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.profile_image ?? undefined} />
                <AvatarFallback className="rounded-lg">
                  {user?.display_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.display_name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {user?.email}
                </span>
              </div>
              <CaretUp className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
            forceMount
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (isSettingsOpen) {
                e.preventDefault();
                return;
              }
              setMenuOpen(false);
            }}
          >
            <DropdownMenuItem className="flex flex-col items-start gap-0 no-underline hover:bg-transparent focus:bg-transparent">
              <span>{user?.display_name}</span>
              <span className="text-muted-foreground max-w-full truncate">
                {user?.email}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SettingsTrigger onOpenChange={handleSettingsOpenChange} />
            <FeedbackTrigger />
            {/* <AppInfoTrigger /> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="https://x.com/deeplistai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <XIcon className="size-4 p-0.5" />
                <span>@deeplistai</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
