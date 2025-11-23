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
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/user-store/provider';
import { useState } from 'react';
import { FeedbackTrigger } from './feedback/feedback-trigger';
import { SettingsTrigger } from './settings/settings-trigger';
import { User } from '@phosphor-icons/react';

export function HeaderUserMenu() {
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
    <DropdownMenu
      open={isMenuOpen}
      onOpenChange={setMenuOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profile_image ?? undefined} />
            <AvatarFallback>
              {user?.display_name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
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
          <span className="text-muted-foreground max-w-full truncate text-xs">
            {user?.email}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SettingsTrigger onOpenChange={handleSettingsOpenChange} />
        <FeedbackTrigger />
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
  );
}

