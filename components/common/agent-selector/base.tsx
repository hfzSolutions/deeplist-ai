'use client';

import { DialogCreateAgent } from '@/app/components/layout/sidebar/dialog-create-agent';
import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { useKeyShortcut } from '@/app/hooks/use-key-shortcut';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAgents } from '@/lib/agent-store/provider';
import { useCategories } from '@/lib/categories-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  CaretDownIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  RobotIcon,
  Storefront,
  TrashIcon,
  UserIcon,
} from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SubMenu } from './sub-menu';

type AgentSelectorProps = {
  selectedAgentId?: string;
  setSelectedAgentId: (agentId: string | null) => void;
  className?: string;
  isUserAuthenticated?: boolean;
};

export function AgentSelector({
  selectedAgentId,
  setSelectedAgentId,
  className,
  isUserAuthenticated = true,
}: AgentSelectorProps) {
  const router = useRouter();
  const {
    agents,
    isLoading: isLoadingAgents,
    selectedAgent,
    historyAgents,
    addToHistory,
    clearHistory,
    publicAgentCount,
  } = useAgents();
  const { categories } = useCategories();
  const isMobile = useBreakpoint(768);

  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Ref for input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get the hovered agent data
  const hoveredAgentData = agents.find((agent) => agent.id === hoveredAgent);

  useKeyShortcut(
    (e) => (e.key === 'a' || e.key === 'A') && e.metaKey && e.shiftKey,
    () => {
      if (isMobile) {
        setIsDrawerOpen((prev) => !prev);
      } else {
        setIsDropdownOpen((prev) => !prev);
      }
    }
  );

  // Combine history agents with other agents, prioritizing history
  const allAgents = [
    ...historyAgents,
    ...agents.filter((agent) => !historyAgents.some((h) => h.id === agent.id)),
  ];

  // Filter agents based on search query and category
  const filteredAgents = allAgents.filter((agent) => {
    const matchesSearch =
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryId && selectedCategoryId !== 'all'
        ? agent.category_id === selectedCategoryId
        : true;
    return matchesSearch && matchesCategory;
  });

  // Separate history agents for display
  const filteredHistoryAgents = historyAgents.filter((agent) => {
    const matchesSearch =
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryId && selectedCategoryId !== 'all'
        ? agent.category_id === selectedCategoryId
        : true;
    return matchesSearch && matchesCategory;
  });

  // Other agents (not in history)
  const filteredOtherAgents = filteredAgents.filter(
    (agent) => !historyAgents.some((h) => h.id === agent.id)
  );

  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgentId(agent.id);

    // Add to history if user is authenticated
    if (isUserAuthenticated) {
      try {
        await addToHistory(agent.id);
      } catch (error) {
        console.error('Failed to add agent to history:', error);
      }
    }

    if (isMobile) {
      setIsDrawerOpen(false);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const renderAgentItem = (agent: Agent, isFromHistory = false) => {
    return (
      <div
        key={agent.id}
        className={cn(
          'hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between px-3 py-2',
          selectedAgentId === agent.id && 'bg-accent'
        )}
        onClick={() => handleAgentSelect(agent)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-5">
              <AvatarImage src={agent.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {agent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isFromHistory && (
              <ClockIcon className="absolute -top-1 -right-1 size-3 text-blue-500" />
            )}
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-sm font-medium">{agent.name}</span>
            {agent.description && (
              <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                {agent.description}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Default option to clear agent selection
  const renderDefaultOption = () => {
    return (
      <div
        key="default"
        className={cn(
          'hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between px-3 py-2',
          !selectedAgentId && 'bg-accent'
        )}
        onClick={() => {
          setSelectedAgentId(null);
          if (isMobile) {
            setIsDrawerOpen(false);
          } else {
            setIsDropdownOpen(false);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <RobotIcon className="size-5" />
          <div className="flex flex-col gap-0">
            <span className="text-sm font-medium">Default Agent</span>
            <span className="text-muted-foreground text-xs">
              Use your default system prompt
            </span>
          </div>
        </div>
      </div>
    );
  };

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        'dark:bg-secondary justify-between max-w-[140px]',
        className
      )}
      disabled={isLoadingAgents}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {selectedAgent ? (
          <>
            <Avatar className="size-5 flex-shrink-0">
              <AvatarImage src={selectedAgent.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {selectedAgent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{selectedAgent.name}</span>
          </>
        ) : (
          <>
            <RobotIcon className="size-5 flex-shrink-0" />
            <span className="truncate text-sm">Default</span>
          </>
        )}
      </div>
      <CaretDownIcon className="size-4 opacity-50 flex-shrink-0" />
    </Button>
  );

  // Handle input change without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchQuery(e.target.value);
  };

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select Agent</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-2">
            {/* Search Bar - Hidden for now */}
            {/* <div className="relative">
              <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search agents..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div> */}
            {/* Category Filter - Hidden for now */}
            {/* <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon && (
                        <span className="text-sm">{category.icon}</span>
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            {/* Visit Store Button - Standardized UI */}
            <div
              className="hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between px-3 py-2"
              onClick={() => {
                router.push('/store');
                setIsDrawerOpen(false);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Storefront className="size-5" />
                  <div className="flex flex-col gap-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Browse Store</span>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                        {publicAgentCount}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Browse and discover more agents
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="flex h-full flex-col space-y-0 overflow-y-auto px-4 pb-6">
            {isLoadingAgents ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="text-muted-foreground mb-2 text-sm">
                  Loading agents...
                </p>
              </div>
            ) : (
              <>
                {renderDefaultOption()}

                {/* History Agents Section */}
                {filteredHistoryAgents.length > 0 && (
                  <>
                    <div className="mt-2 flex items-center justify-between border-t px-3 py-2 pt-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="text-muted-foreground size-4" />
                        <span className="text-muted-foreground text-sm font-medium">
                          Recent
                        </span>
                      </div>
                      {isUserAuthenticated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-6 px-2 text-xs hover:text-red-500"
                          onClick={async () => {
                            try {
                              await clearHistory();
                            } catch (error) {
                              console.error('Failed to clear history:', error);
                            }
                          }}
                        >
                          <TrashIcon className="mr-1 size-3" />
                          Clear
                        </Button>
                      )}
                    </div>
                    {filteredHistoryAgents.map((agent) =>
                      renderAgentItem(agent, true)
                    )}
                  </>
                )}
                {/* Other Agents */}
                {filteredOtherAgents.length > 0 && (
                  <>
                    {filteredHistoryAgents.length > 0 && (
                      <div className="mx-3 my-2 border-t" />
                    )}
                    {filteredOtherAgents.map((agent) =>
                      renderAgentItem(agent, false)
                    )}
                  </>
                )}
                {/* No agents found */}
                {filteredAgents.length === 0 && searchQuery && (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <p className="text-muted-foreground mb-2 text-sm">
                      No agents found.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
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
              setHoveredAgent(null);
              setSearchQuery('');
              setSelectedCategoryId('');
            } else {
              if (selectedAgent) setHoveredAgent(selectedAgent.id);
            }
          }}
        >
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Switch agent ⌘⇧A</TooltipContent>
          <DropdownMenuContent
            className="flex h-[320px] w-[300px] flex-col space-y-0.5 overflow-visible p-0"
            align="start"
            sideOffset={4}
            forceMount
            side="top"
          >
            <div className="bg-background sticky top-0 z-10 rounded-t-md border-b px-0 pt-0 pb-0">
              <div className="space-y-2 p-2">
                {/* Search Bar - Hidden for now */}
                {/* <div className="relative">
                  <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search agents..."
                    className="dark:bg-popover border border-none pl-8 shadow-none focus-visible:ring-0"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div> */}
                {/* Category Filter - Hidden for now */}
                {/* <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-xs">{category.icon}</span>
                          )}
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

                {/* Visit Store Button - Standardized UI */}
                <DropdownMenuItem
                  className="flex w-full items-center justify-between px-3 py-2"
                  onSelect={() => {
                    router.push('/store');
                    setIsDropdownOpen(false);
                  }}
                  onFocus={() => {
                    if (isDropdownOpen) {
                      setHoveredAgent('store');
                    }
                  }}
                  onMouseEnter={() => {
                    if (isDropdownOpen) {
                      setHoveredAgent('store');
                    }
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Storefront className="size-5" />
                      <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Browse Store
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            {publicAgentCount}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          Browse and discover more agents
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </DropdownMenuItem>
              </div>
            </div>
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-1 pt-0 pb-0">
              {isLoadingAgents ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Loading agents...
                  </p>
                </div>
              ) : (
                <>
                  <DropdownMenuItem
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2',
                      !selectedAgent && 'bg-accent'
                    )}
                    onSelect={() => {
                      setSelectedAgentId(null);
                      setIsDropdownOpen(false);
                    }}
                    onFocus={() => {
                      if (isDropdownOpen) {
                        setHoveredAgent('default');
                      }
                    }}
                    onMouseEnter={() => {
                      if (isDropdownOpen) {
                        setHoveredAgent('default');
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <RobotIcon className="size-5" />
                      <div className="flex flex-col gap-0">
                        <span className="text-sm font-medium">
                          Default Agent
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Use your default system prompt
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  {/* History Agents Section */}
                  {filteredHistoryAgents.length > 0 && (
                    <>
                      <div className="mt-1 flex items-center justify-between border-t px-3 py-1">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="text-muted-foreground size-3" />
                          <span className="text-muted-foreground text-xs font-medium">
                            Recent
                          </span>
                        </div>
                        {isUserAuthenticated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground h-5 px-1 text-xs hover:text-red-500"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await clearHistory();
                              } catch (error) {
                                console.error(
                                  'Failed to clear history:',
                                  error
                                );
                              }
                            }}
                          >
                            <TrashIcon className="size-3" />
                          </Button>
                        )}
                      </div>
                      {filteredHistoryAgents.map((agent) => (
                        <DropdownMenuItem
                          key={agent.id}
                          className={cn(
                            'flex w-full items-center justify-between px-3 py-2',
                            selectedAgent?.id === agent.id && 'bg-accent'
                          )}
                          onSelect={() => handleAgentSelect(agent)}
                          onFocus={() => {
                            if (isDropdownOpen) {
                              setHoveredAgent(agent.id);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isDropdownOpen) {
                              setHoveredAgent(agent.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="size-5">
                                <AvatarImage
                                  src={agent.avatar_url || undefined}
                                />
                                <AvatarFallback className="text-xs">
                                  {agent.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <ClockIcon className="absolute -top-1 -right-1 size-3 text-blue-500" />
                            </div>
                            <div className="flex flex-col gap-0">
                              <span className="text-sm font-medium">
                                {agent.name}
                              </span>
                              {agent.description && (
                                <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                                  {agent.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  {/* Other Agents */}
                  {filteredOtherAgents.length > 0 && (
                    <>
                      {filteredHistoryAgents.length > 0 && (
                        <div className="border-border mx-1 my-1 border-t" />
                      )}
                      {filteredOtherAgents.map((agent) => (
                        <DropdownMenuItem
                          key={agent.id}
                          className={cn(
                            'flex w-full items-center justify-between px-3 py-2',
                            selectedAgent?.id === agent.id && 'bg-accent'
                          )}
                          onSelect={() => handleAgentSelect(agent)}
                          onFocus={() => {
                            if (isDropdownOpen) {
                              setHoveredAgent(agent.id);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isDropdownOpen) {
                              setHoveredAgent(agent.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="size-5">
                              <AvatarImage
                                src={agent.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-xs">
                                {agent.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0">
                              <span className="text-sm font-medium">
                                {agent.name}
                              </span>
                              {agent.description && (
                                <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                                  {agent.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  {/* No agents found */}
                  {filteredAgents.length === 0 && searchQuery && (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <p className="text-muted-foreground mb-1 text-sm">
                        No agents found.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Submenu positioned absolutely */}
            {hoveredAgentData && (
              <div className="absolute top-0 left-[calc(100%+8px)]">
                <SubMenu hoveredAgentData={hoveredAgentData} />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>

      {/* Create Agent Dialog */}
      <DialogCreateAgent
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
      />
    </div>
  );
}
