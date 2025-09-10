'use client';

import { LoginPrompt } from '@/app/components/auth/login-prompt';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { useUser } from '@/lib/user-store/provider';
import {
  BookmarkSimple,
  ChatCircle,
  DotsThreeVertical,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Robot,
  Storefront,
  Trash,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useInfiniteScrollIsolated } from '@/app/hooks/use-infinite-scroll-isolated';
import { DialogCreateAgent } from '../layout/sidebar/dialog-create-agent';
import { DialogAgentDetails } from '../homepage/dialog-agent-details';
import { TerminologyHelper, AnnouncementBanner } from '../transition';

interface AgentsSectionProps {
  onCreateAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
  onStartChatWithAgent: (agent: Agent) => void;
  onStartChatWithoutAgent: () => void;
  onSaveToggle: (agent: Agent) => void;
  onEditAgentWithAuth: (agent: Agent) => void;
  onDeleteAgentWithAuth: (agent: Agent) => void;
  onLoginPrompt: (action: string) => void;
  isCreateAgentDialogOpen: boolean;
  editingAgent: Agent | null;
  onCloseDialog: () => void;
  showLoginPrompt: boolean;
  loginPromptAction: string;
  agentDetailsDialogOpen: boolean;
  selectedAgentForDetails: Agent | null;
  onAgentDetailsDialogChange: (open: boolean) => void;
  onStartChatWithAgentFromDetails: (agent: Agent) => void;
  onSelectAgent: (agent: Agent) => void;
}

export function AgentsSection({
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onStartChatWithAgent,
  onStartChatWithoutAgent,
  onSaveToggle,
  onEditAgentWithAuth,
  onDeleteAgentWithAuth,
  onLoginPrompt,
  isCreateAgentDialogOpen,
  editingAgent,
  onCloseDialog,
  showLoginPrompt,
  loginPromptAction,
  agentDetailsDialogOpen,
  selectedAgentForDetails,
  onAgentDetailsDialogChange,
  onStartChatWithAgentFromDetails,
  onSelectAgent,
}: AgentsSectionProps) {
  const {
    agents,
    isLoading,
    isLoadingMore,
    pagination,
    loadMoreAgents,
    refreshAgents,
    isFavorite,
    showMyAgentsOnly,
    setShowMyAgentsOnly,
    showSavedAgentsOnly,
    setShowSavedAgentsOnly,
    favoriteAgents,
  } = useAgents();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter to show only public agents
  const publicAgents = agents.filter((agent) => agent.is_public);

  // Filter agents based on user's own agents toggle
  const userAgents =
    showMyAgentsOnly && user
      ? publicAgents.filter((agent) => agent.user_id === user.id)
      : publicAgents;

  // Filter agents based on saved agents toggle
  const savedAgents =
    showSavedAgentsOnly && user
      ? showMyAgentsOnly
        ? publicAgents.filter(
            (agent) => agent.user_id === user.id && isFavorite(agent.id)
          )
        : publicAgents.filter((agent) => isFavorite(agent.id))
      : userAgents;

  // Filter agents based on search query (only for client-side filtering when no server search)
  const filteredAgents = searchQuery
    ? savedAgents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : savedAgents;

  // Debug logging
  console.log('Agents debug:', {
    totalAgents: agents.length,
    publicAgents: publicAgents.length,
    userAgents: userAgents.length,
    savedAgents: savedAgents.length,
    filteredAgents: filteredAgents.length,
    showMyAgentsOnly,
    showSavedAgentsOnly,
    pagination: pagination?.hasNext,
  });

  // Handle search with debouncing
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        await refreshAgents({ page: 1, limit: 20, search: query.trim() });
      } else {
        await refreshAgents({ page: 1, limit: 20 });
      }
    },
    [refreshAgents]
  );

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    console.log('handleLoadMore called:', {
      hasNext: pagination?.hasNext,
      isLoading,
      isLoadingMore,
      currentPage: pagination?.page,
      totalPages: pagination?.totalPages,
    });

    if (!pagination?.hasNext || isLoading || isLoadingMore) return;

    await loadMoreAgents();
  }, [pagination, loadMoreAgents, isLoading, isLoadingMore]);

  // Handle toggle changes
  const handleMyAgentsToggle = (checked: boolean) => {
    setShowMyAgentsOnly(checked);
    if (checked && showSavedAgentsOnly) {
      // If both are on, keep saved agents on but filter to only saved agents that are also user's agents
      setShowSavedAgentsOnly(true);
    }
  };

  const handleSavedAgentsToggle = (checked: boolean) => {
    setShowSavedAgentsOnly(checked);
    if (checked && showMyAgentsOnly) {
      // If both are on, keep my agents on but filter to only saved agents that are also user's agents
      setShowMyAgentsOnly(true);
    }
  };

  // Infinite scroll hook - completely isolated
  const infiniteScrollRef = useInfiniteScrollIsolated({
    hasNextPage: !!pagination?.hasNext,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
    enabled: true, // Always enabled for this component
  });

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent(agent);
  };

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {/* Section Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Agents Store
                </h2>
                <TerminologyHelper />
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Discover and interact with AI agents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onStartChatWithoutAgent}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <ChatCircle size={16} />
                Start Chat
              </Button>
              <Button onClick={onCreateAgent} size="sm" className="h-9">
                <Plus size={16} />
                Add Agent
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10 pl-10 h-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
                    onClick={() => handleSearch('')}
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* Filter Toggles */}
              {user && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="my-agents-filter"
                      checked={showMyAgentsOnly}
                      onCheckedChange={handleMyAgentsToggle}
                    />
                    <Label
                      htmlFor="my-agents-filter"
                      className="text-sm text-muted-foreground"
                    >
                      My agents
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="saved-agents-filter"
                      checked={showSavedAgentsOnly}
                      onCheckedChange={handleSavedAgentsToggle}
                    />
                    <Label
                      htmlFor="saved-agents-filter"
                      className="text-sm text-muted-foreground"
                    >
                      Saved agents
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <div className="text-muted-foreground text-sm">
              {showSavedAgentsOnly && showMyAgentsOnly && user
                ? `${filteredAgents.length} of your saved agents`
                : showSavedAgentsOnly && user
                  ? `${filteredAgents.length} saved agents`
                  : showMyAgentsOnly && user
                    ? `${filteredAgents.length} of your agents`
                    : pagination
                      ? `${agents.length} of ${pagination.total} agents`
                      : `${filteredAgents.length} agents`}
            </div>
          </div>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="hover:border-primary/50 hover:bg-accent/30 group relative cursor-pointer rounded-xl border p-4 transition-all hover:shadow-lg"
                    onClick={() => handleSelectAgent(agent)}
                  >
                    {/* Menu */}
                    <div className="absolute top-1.5 right-1.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <DotsThreeVertical size={12} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveToggle(agent);
                            }}
                          >
                            <BookmarkSimple className="mr-2 h-4 w-4" />
                            {isFavorite(agent.id) ? 'Remove' : 'Save'}
                          </DropdownMenuItem>
                          {user?.id === agent.user_id && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditAgentWithAuth(agent);
                                }}
                              >
                                <PencilSimple className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteAgentWithAuth(agent);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={agent.avatar_url || undefined} />
                          <AvatarFallback className="text-lg font-medium">
                            {agent.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Typing indicator */}
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs flex items-center gap-1 shadow-lg">
                            <div className="flex gap-0.5">
                              <div
                                className="w-1 h-1 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              ></div>
                              <div
                                className="w-1 h-1 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              ></div>
                              <div
                                className="w-1 h-1 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <h3 className="truncate text-sm leading-tight font-medium">
                          {agent.name}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                          {agent.description || 'No description available'}
                        </p>
                        {agent.category && (
                          <div className="flex gap-1 mt-2">
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground border-muted-foreground/20 bg-transparent"
                            >
                              {agent.category.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Button */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 px-3 text-xs font-medium shadow-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartChatWithAgent(agent);
                        }}
                        title={`Chat with ${agent.name}`}
                      >
                        <ChatCircle size={14} className="text-white mr-0.5" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {pagination?.hasNext && (
                <div
                  ref={infiniteScrollRef}
                  className="mt-6 flex justify-center"
                >
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Loading more agents...
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="bg-muted/30 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Storefront size={24} className="text-muted-foreground" />
              </div>
              <h3 className="mb-1.5 text-base font-medium">
                {searchQuery
                  ? 'No agents found'
                  : showMyAgentsOnly && user
                    ? 'No agents created by you'
                    : 'No agents available'}
              </h3>
              <p className="text-muted-foreground mb-3 max-w-sm text-xs">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : showMyAgentsOnly && user
                    ? 'Create your first agent to get started'
                    : 'Check back later for new agents'}
              </p>
              {(searchQuery || (showMyAgentsOnly && user)) && (
                <div className="flex gap-2">
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch('')}
                      className="h-7 px-3 text-xs"
                    >
                      Clear search
                    </Button>
                  )}
                  {showMyAgentsOnly && user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMyAgentsOnly(false)}
                      className="h-7 px-3 text-xs"
                    >
                      Show all agents
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <DialogCreateAgent
        isOpen={isCreateAgentDialogOpen}
        setIsOpen={onCloseDialog}
        agent={editingAgent}
      />

      <Dialog
        open={showLoginPrompt}
        onOpenChange={(open) => !open && onLoginPrompt('')}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <LoginPrompt
            action={loginPromptAction}
            variant="inline"
            className="border-0 p-0"
          />
        </DialogContent>
      </Dialog>

      <DialogAgentDetails
        open={agentDetailsDialogOpen}
        onOpenChange={onAgentDetailsDialogChange}
        agent={selectedAgentForDetails}
        onStartChat={onStartChatWithAgentFromDetails}
      />
    </>
  );
}
