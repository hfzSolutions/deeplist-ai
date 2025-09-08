'use client';

import { LoginPrompt } from '@/app/components/auth/login-prompt';
import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { useKeyShortcut } from '@/app/hooks/use-key-shortcut';
import { X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useModel } from '@/lib/model-store/provider';
import { filterAndSortModels } from '@/lib/model-store/utils';
import { ModelConfig } from '@/lib/models/types';
import { PROVIDERS } from '@/lib/providers';
import { useUserPreferences } from '@/lib/user-preference-store/provider';
import { cn } from '@/lib/utils';
import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

import { SubMenu } from './sub-menu';

type ModelSelectorProps = {
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
  className?: string;
  isUserAuthenticated?: boolean;
};

export function ModelSelector({
  selectedModelId,
  setSelectedModelId,
  className,
  isUserAuthenticated = true,
}: ModelSelectorProps) {
  const { models, isLoading: isLoadingModels, favoriteModels } = useModel();
  const { isModelHidden } = useUserPreferences();

  const currentModel = models.find((model) => model.id === selectedModelId);
  const currentProvider = PROVIDERS.find(
    (provider) => provider.id === currentModel?.icon
  );
  const isMobile = useBreakpoint(768);

  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Ref for input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyShortcut(
    (e) => (e.key === 'p' || e.key === 'P') && e.metaKey && e.shiftKey,
    () => {
      if (isMobile) {
        setIsDrawerOpen((prev) => !prev);
      } else {
        setIsDropdownOpen((prev) => !prev);
      }
    }
  );

  const renderModelItem = (model: ModelConfig) => {
    const provider = PROVIDERS.find((provider) => provider.id === model.icon);

    return (
      <div
        key={model.id}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2',
          selectedModelId === model.id && 'bg-accent'
        )}
        onClick={() => {
          setSelectedModelId(model.id);
          if (isMobile) {
            setIsDrawerOpen(false);
          } else {
            setIsDropdownOpen(false);
          }
        }}
      >
        <div className="flex items-center gap-3">
          {provider?.icon && <provider.icon className="size-5" />}
          <div className="flex flex-col gap-0">
            <span className="text-sm">{model.name}</span>
          </div>
        </div>
      </div>
    );
  };

  // Get the hovered model data
  const hoveredModelData = models.find((model) => model.id === hoveredModel);

  const filteredModels = filterAndSortModels(
    models,
    favoriteModels || [],
    searchQuery,
    isModelHidden
  );

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        'dark:bg-secondary justify-between max-w-[140px]',
        className
      )}
      disabled={isLoadingModels}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {currentProvider?.icon && (
          <currentProvider.icon className="size-5 flex-shrink-0" />
        )}
        <span className="truncate text-sm">
          {currentModel?.name || 'Select model'}
        </span>
      </div>
      <CaretDownIcon className="size-4 opacity-50 flex-shrink-0" />
    </Button>
  );

  // Handle input change without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchQuery(e.target.value);
  };

  // State for login prompt - must be at top level
  const [loginPromptOpen, setLoginPromptOpen] = React.useState(false);

  // If user is not authenticated, show login prompt when clicked
  if (!isUserAuthenticated) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                'border-border dark:bg-secondary text-accent-foreground h-9 w-auto border bg-transparent max-w-[140px]',
                className
              )}
              type="button"
              onClick={() => setLoginPromptOpen(true)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {currentProvider?.icon && (
                  <currentProvider.icon className="size-5 flex-shrink-0" />
                )}
                <span className="truncate text-sm">{currentModel?.name}</span>
              </div>
              <CaretDownIcon className="size-4 flex-shrink-0" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select a model</TooltipContent>
        </Tooltip>

        {/* Login Prompt Dialog */}
        <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
          <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Model Selection</DialogTitle>
              <DialogDescription>
                Sign in to select and use different AI models.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <LoginPrompt
                title="Login Required"
                description="You need to be logged in to select models. Please sign in to continue."
                action="select models"
                actionText="Sign In"
                className="border-0 shadow-none"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (isMobile) {
    return (
      <>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select Model</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <div className="relative">
                <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search models..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-4 pb-6">
              {isLoadingModels ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Loading models...
                  </p>
                </div>
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => renderModelItem(model))
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    No results found.
                  </p>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div>
      <Tooltip>
        <DropdownMenu
          open={isDropdownOpen}
          onOpenChange={(open) => {
            setIsDropdownOpen(open);
            if (!open) {
              setHoveredModel(null);
              setSearchQuery('');
            } else {
              if (selectedModelId) setHoveredModel(selectedModelId);
            }
          }}
        >
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Switch model ⌘⇧P</TooltipContent>
          <DropdownMenuContent
            className="flex h-[320px] w-[300px] flex-col space-y-0.5 overflow-visible p-0"
            align="start"
            sideOffset={4}
            forceMount
            side="top"
          >
            <div className="bg-background sticky top-0 z-10 rounded-t-md border-b px-0 pt-0 pb-0">
              <div className="relative">
                <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search models..."
                  className="dark:bg-popover rounded-b-none border border-none pl-8 shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-1 pt-0 pb-0">
              {isLoadingModels ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Loading models...
                  </p>
                </div>
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => {
                  const provider = PROVIDERS.find(
                    (provider) => provider.id === model.icon
                  );

                  return (
                    <DropdownMenuItem
                      key={model.id}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2',
                        selectedModelId === model.id && 'bg-accent'
                      )}
                      onSelect={() => {
                        setSelectedModelId(model.id);
                        setIsDropdownOpen(false);
                      }}
                      onFocus={() => {
                        if (isDropdownOpen) {
                          setHoveredModel(model.id);
                        }
                      }}
                      onMouseEnter={() => {
                        if (isDropdownOpen) {
                          setHoveredModel(model.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {provider?.icon && <provider.icon className="size-5" />}
                        <div className="flex flex-col gap-0">
                          <span className="text-sm">{model.name}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-1 text-sm">
                    No results found.
                  </p>
                </div>
              )}
            </div>

            {/* Submenu positioned absolutely */}
            {hoveredModelData && (
              <div className="absolute top-0 left-[calc(100%+8px)]">
                <SubMenu hoveredModelData={hoveredModelData} />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </div>
  );
}
