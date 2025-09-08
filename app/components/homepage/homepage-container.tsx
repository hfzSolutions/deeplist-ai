'use client';

import { LoginPrompt } from '@/app/components/auth/login-prompt';
import { ChatContainer } from '@/app/components/chat/chat-container';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { ExternalAIToolsProvider } from '@/lib/external-ai-tools-store/provider';
import { CategoriesProvider } from '@/lib/categories-store/provider';
import { useHomepage } from '@/lib/homepage-store/provider';
import { useUser } from '@/lib/user-store/provider';
import {
  ArrowLeft,
  Bookmark,
  ChatCircle,
  DotsThreeVertical,
  LinkSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Robot,
  Storefront,
  Trash,
} from '@phosphor-icons/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DialogCreateAgent } from '../layout/sidebar/dialog-create-agent';
import { ExternalAITools } from './external-ai-tools';
import { DialogAgentDetails } from './dialog-agent-details';
import { TerminologyHelper } from '../transition';

export function HomepageContainer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentView,
    setCurrentView,
    cameFromChat,
    setPreviousView,
    previousChatUrl,
    setPreviousChatUrl,
  } = useHomepage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('agents');
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('');
  const [agentDetailsDialogOpen, setAgentDetailsDialogOpen] = useState(false);
  const [selectedAgentForDetails, setSelectedAgentForDetails] =
    useState<Agent | null>(null);

  // Check URL parameters and update view accordingly, but only on homepage
  useEffect(() => {
    // Only apply URL parameter logic when we're on the homepage
    if (pathname === '/') {
      const viewParam = searchParams.get('view');
      const toolParam = searchParams.get('tool');

      if (toolParam) {
        // If there's a tool parameter, switch to external tools tab
        setActiveTab('external');
        setCurrentView('agents');
      } else if (viewParam === 'agents') {
        // Don't reset previous view when navigating via URL parameters
        setCurrentView('agents');
      } else if (!viewParam) {
        // Default to agents view when no parameter is present
        // Don't reset previous view when this is the initial load
        setCurrentView('agents');
      }
    }
  }, [searchParams, pathname, setCurrentView, setActiveTab]);

  const {
    agents,
    isLoading,
    selectedAgent,
    setSelectedAgent,
    pagination,
    loadMoreAgents,
    refreshAgents,
    deleteAgent,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  } = useAgents();
  const { user } = useUser();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter to show only public agents
  const publicAgents = agents.filter((agent) => agent.is_public);

  // Filter agents based on search query (only for client-side filtering when no server search)
  const filteredAgents = searchQuery
    ? publicAgents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : publicAgents;

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
    if (!pagination?.hasNext || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await loadMoreAgents();
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination, loadMoreAgents, isLoadingMore]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentForDetails(agent);
    setAgentDetailsDialogOpen(true);
  };

  const handleStartChatWithAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setPreviousView('agents');
    // Don't clear previousChatUrl - allow returning to previous chat even after selecting new agent
    setCurrentView('chat');
    toast({
      title: 'Agent Selected',
      description: `${agent.name} is now your active agent. Starting chat...`,
    });
  };

  const handleBackToAgents = () => {
    setCurrentView('agents');
  };

  const handleBackToChat = () => {
    if (previousChatUrl) {
      // Navigate to the specific chat URL
      router.push(previousChatUrl);
      // Don't clear previousChatUrl to allow multiple back-and-forth cycles
    } else {
      // Fallback to chat view
      setCurrentView('chat');
    }
    setPreviousView(null);
  };

  const handleStartChatWithoutAgent = () => {
    setSelectedAgent(null);
    setPreviousView('agents');
    setPreviousChatUrl(null); // Clear previous chat URL when starting new chat
    setCurrentView('chat');
    toast({
      title: 'Chat Started',
      description: 'Starting chat without a specific agent.',
    });
  };

  const handleCreateAgent = () => {
    setIsCreateAgentDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsCreateAgentDialogOpen(true);
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (window.confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      try {
        const success = await deleteAgent(agent.id);
        if (success) {
          toast({
            title: 'Success',
            description: `Agent "${agent.name}" deleted successfully`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to delete agent',
          });
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete agent',
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setIsCreateAgentDialogOpen(false);
    setEditingAgent(null);
  };

  const handleLoginPrompt = (action: string) => {
    setLoginPromptAction(action);
    setShowLoginPrompt(true);
  };

  const handleSaveToggle = (agent: Agent) => {
    if (!user) {
      handleLoginPrompt('save agents');
      return;
    }

    if (isFavorite(agent.id)) {
      removeFromFavorites(agent.id);
      toast({
        title: 'Removed',
        description: 'Agent removed from saved!',
      });
    } else {
      addToFavorites(agent.id);
      toast({
        title: 'Saved',
        description: 'Agent saved successfully!',
      });
    }
  };

  const handleEditAgentWithAuth = (agent: Agent) => {
    if (!user) {
      handleLoginPrompt('edit agents');
      return;
    }
    handleEditAgent(agent);
  };

  const handleDeleteAgentWithAuth = (agent: Agent) => {
    if (!user) {
      handleLoginPrompt('delete agents');
      return;
    }
    handleDeleteAgent(agent);
  };

  if (currentView === 'chat') {
    return <ChatContainer />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with Navigation Tabs */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b px-4 py-6 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-fit"
              >
                <TabsList className="h-10 bg-muted/50 p-1">
                  <TabsTrigger
                    value="agents"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:bg-accent/80 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <Robot size={16} className="transition-colors" />
                    Agents
                  </TabsTrigger>
                  <TabsTrigger
                    value="external"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:bg-accent/80 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <LinkSimple size={16} className="transition-colors" />
                    External Tools
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {cameFromChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToChat}
                className="text-muted-foreground hover:text-foreground flex h-9 items-center gap-2 text-sm"
              >
                <ArrowLeft size={16} />
                Back to Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <TabsContent value="agents" className="mt-0 flex flex-1 flex-col">
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
                    onClick={handleStartChatWithoutAgent}
                    variant="outline"
                    size="sm"
                    className="h-9"
                  >
                    <ChatCircle size={16} />
                    Start Chat
                  </Button>
                  <Button onClick={handleCreateAgent} size="sm" className="h-9">
                    <Plus size={16} />
                    Add Agent
                  </Button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-8 space-y-4">
                <div className="relative max-w-md">
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
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    {pagination
                      ? `Showing ${agents.length} of ${pagination.total} agents`
                      : `${filteredAgents.length} agents`}
                  </div>
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
                                  handleSaveToggle(agent);
                                }}
                              >
                                <Bookmark className="mr-2 h-4 w-4" />
                                {isFavorite(agent.id) ? 'Remove' : 'Save'}
                              </DropdownMenuItem>
                              {user?.id === agent.user_id && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAgentWithAuth(agent);
                                    }}
                                  >
                                    <PencilSimple className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAgentWithAuth(agent);
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
                              <AvatarImage
                                src={agent.avatar_url || undefined}
                              />
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
                              handleStartChatWithAgent(agent);
                            }}
                            title={`Chat with ${agent.name}`}
                          >
                            <ChatCircle
                              size={14}
                              className="text-white mr-0.5"
                            />
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {!isLoading && pagination?.hasNext && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="h-8 px-6 text-xs"
                      >
                        {isLoadingMore ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="bg-muted/30 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Storefront size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="mb-1.5 text-base font-medium">
                    {searchQuery ? 'No agents found' : 'No agents available'}
                  </h3>
                  <p className="text-muted-foreground mb-3 max-w-sm text-xs">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'Check back later for new agents'}
                  </p>
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
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="external" className="mt-0 flex flex-1 flex-col">
          <CategoriesProvider>
            <ExternalAIToolsProvider>
              <ExternalAITools toolId={searchParams.get('tool')} />
            </ExternalAIToolsProvider>
          </CategoriesProvider>
        </TabsContent>
      </Tabs>

      <DialogCreateAgent
        isOpen={isCreateAgentDialogOpen}
        setIsOpen={handleCloseDialog}
        agent={editingAgent}
      />

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
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
        onOpenChange={setAgentDetailsDialogOpen}
        agent={selectedAgentForDetails}
        onStartChat={handleStartChatWithAgent}
      />
    </div>
  );
}
