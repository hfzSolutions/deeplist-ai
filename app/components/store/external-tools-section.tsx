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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useExternalAITools } from '@/lib/external-ai-tools-store/provider';
import { ExternalAITool } from '@/lib/external-ai-tools-store/types';
import { useUser } from '@/lib/user-store/provider';
import { useCategories } from '@/lib/categories-store/provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DotsThreeVertical,
  LinkSimple,
  MagnifyingGlass,
  Pencil,
  Plus,
  Share,
  Trash,
  X,
  Star,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useInfiniteScrollIsolated } from '@/app/hooks/use-infinite-scroll-isolated';
import { DialogExternalAITool } from '../homepage/dialog-external-ai-tool';
import { DialogExternalAIToolDetails } from '../homepage/dialog-external-ai-tool-details';
import { DialogBadge } from '../homepage/dialog-badge';
import { DialogShare } from '../common/dialog-share';

interface ExternalToolsSectionProps {
  toolId?: string | null;
}

export function ExternalToolsSection({ toolId }: ExternalToolsSectionProps) {
  const {
    tools,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    refreshTools,
    loadMoreTools,
    deleteTool,
    searchQuery,
    setSearchQuery,
    showMyToolsOnly,
    setShowMyToolsOnly,
  } = useExternalAITools();
  const { user } = useUser();
  const { categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ExternalAITool | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ExternalAITool | null>(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [badgeTool, setBadgeTool] = useState<ExternalAITool | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareTool, setShareTool] = useState<ExternalAITool | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('');
  const [toolRedirectProcessed, setToolRedirectProcessed] = useState(false);
  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (!pagination?.hasNext || isLoading || isLoadingMore) return;
    await loadMoreTools({
      category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
      search: searchQuery || undefined,
    });
  }, [
    pagination,
    loadMoreTools,
    isLoading,
    isLoadingMore,
    selectedCategoryId,
    searchQuery,
  ]);

  // Infinite scroll hook - completely isolated
  const infiniteScrollRef = useInfiniteScrollIsolated({
    hasNextPage: !!pagination?.hasNext,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
    enabled: true, // Always enabled for this component
  });

  useEffect(() => {
    refreshTools({
      page: 1,
      search: searchQuery,
      category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
    });
  }, [refreshTools, searchQuery, selectedCategoryId]);

  // Reset tool redirect processing when toolId changes
  useEffect(() => {
    setToolRedirectProcessed(false);
  }, [toolId]);

  // Handle automatic tool details dialog opening when toolId is provided
  useEffect(() => {
    const handleToolRedirect = async () => {
      if (!toolId || toolRedirectProcessed) return;

      // First try to find the tool in the current tools list
      let tool = tools.find((t) => t.id === toolId);

      // If not found and tools are loaded, try to fetch it from the public API
      if (!tool && !isLoading) {
        try {
          const response = await fetch(
            `/api/external-ai-tools/public/${toolId}`
          );
          if (response.ok) {
            const data = await response.json();
            tool = data.tool;
          } else if (response.status === 404) {
            // Tool not found - show error message and clear URL parameter
            toast.error(
              'AI tool not found. The link may be outdated or the tool may have been removed.'
            );
            setToolRedirectProcessed(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('tool');
            window.history.replaceState({}, '', url.toString());
            return;
          } else {
            // Other API errors
            toast.error(
              'Failed to load AI tool details. Please try again later.'
            );
            setToolRedirectProcessed(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('tool');
            window.history.replaceState({}, '', url.toString());
            return;
          }
        } catch (error) {
          console.error('Error fetching tool:', error);
          toast.error(
            'Failed to load AI tool details. Please check your connection and try again.'
          );
          setToolRedirectProcessed(true);
          const url = new URL(window.location.href);
          url.searchParams.delete('tool');
          window.history.replaceState({}, '', url.toString());
          return;
        }
      }

      if (tool) {
        setSelectedTool(tool);
        setDetailsDialogOpen(true);
        setToolRedirectProcessed(true);
        // Clear the URL parameter after opening the dialog
        const url = new URL(window.location.href);
        url.searchParams.delete('tool');
        window.history.replaceState({}, '', url.toString());
      } else if (!isLoading) {
        // Tool not found in local list and no API call was made
        toast.error(
          'AI tool not found. The link may be outdated or the tool may have been removed.'
        );
        setToolRedirectProcessed(true);
        const url = new URL(window.location.href);
        url.searchParams.delete('tool');
        window.history.replaceState({}, '', url.toString());
      }
    };

    handleToolRedirect();
  }, [toolId, toolRedirectProcessed]);

  const handleLoginPrompt = (action: string) => {
    setLoginPromptAction(action);
    setShowLoginPrompt(true);
  };

  const handleEdit = (tool: ExternalAITool) => {
    setEditingTool(tool);
    setDialogOpen(true);
  };

  const handleEditWithAuth = (tool: ExternalAITool) => {
    if (!user) {
      handleLoginPrompt('edit external AI tools');
      return;
    }
    handleEdit(tool);
  };

  const handleDelete = async (tool: ExternalAITool) => {
    if (confirm(`Are you sure you want to delete "${tool.name}"?`)) {
      const success = await deleteTool(tool.id);
      if (success) {
        toast.success('External AI tool deleted successfully');
      } else {
        toast.error('Failed to delete external AI tool');
      }
    }
  };

  const handleDeleteWithAuth = async (tool: ExternalAITool) => {
    if (!user) {
      handleLoginPrompt('delete external AI tools');
      return;
    }
    handleDelete(tool);
  };

  const handleAddNew = () => {
    setEditingTool(null);
    setDialogOpen(true);
  };

  const handleViewDetails = (tool: ExternalAITool) => {
    setSelectedTool(tool);
    setDetailsDialogOpen(true);
  };

  const handleShowBadge = (tool: ExternalAITool) => {
    setBadgeTool(tool);
    setBadgeDialogOpen(true);
  };

  const handleShare = (tool: ExternalAITool) => {
    setShareTool(tool);
    setShareDialogOpen(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Sort tools to show featured tools first, then non-featured tools
  const sortedTools = tools.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Filter tools based on user's own tools toggle
  const filteredTools =
    showMyToolsOnly && user
      ? sortedTools.filter((tool) => tool.user_id === user.id)
      : sortedTools;

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {/* Section Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                External Tools Store
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Discover and integrate external AI tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleAddNew} size="sm" className="h-9">
                <Plus size={16} />
                Add Tool
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative w-full sm:max-w-md sm:flex-1">
                <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search external AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-10 h-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {/* Category dropdown */}
              <div className="w-48">
                <Select
                  value={selectedCategoryId}
                  onValueChange={async (value) => {
                    setSelectedCategoryId(value);
                    await refreshTools({
                      page: 1,
                      search: searchQuery,
                      category: value !== 'all' ? value : undefined,
                    });
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Toggle at far right */}
              {user && (
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    id="my-tools-filter"
                    checked={showMyToolsOnly}
                    onCheckedChange={setShowMyToolsOnly}
                  />
                  <Label
                    htmlFor="my-tools-filter"
                    className="text-sm text-muted-foreground"
                  >
                    My tools
                  </Label>
                </div>
              )}
            </div>

            <div className="text-muted-foreground text-sm">
              {showMyToolsOnly && user
                ? `${filteredTools.length} of your tools`
                : pagination
                  ? `${tools.length} of ${pagination.total} tools`
                  : `${filteredTools.length} tools`}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                onClick={() =>
                  refreshTools({
                    page: 1,
                    search: searchQuery,
                  })
                }
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && tools.length === 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-4">
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
          )}

          {/* All Tools */}
          {!isLoading && filteredTools.length > 0 && (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="hover:border-primary/50 hover:bg-accent/30 group relative cursor-pointer rounded-xl border p-4 transition-all hover:shadow-lg"
                    onClick={() => handleViewDetails(tool)}
                  >
                    {user?.id === tool.user_id && (
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <DotsThreeVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(tool);
                              }}
                            >
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowBadge(tool);
                              }}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Get Badge
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditWithAuth(tool);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWithAuth(tool);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage
                          src={tool.logo || undefined}
                          alt={tool.name}
                        />
                        <AvatarFallback className="text-lg font-medium">
                          {tool.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate leading-tight font-medium">
                            {tool.name}
                          </h3>
                        </div>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                          {tool.description}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {tool.pricing && (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground border-muted-foreground/20 bg-transparent"
                            >
                              {tool.pricing === 'free'
                                ? 'Free'
                                : tool.pricing === 'paid'
                                  ? 'Paid'
                                  : 'Freemium'}
                            </Badge>
                          )}
                          {tool.featured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
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
                      Loading more tools...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTools.length === 0 && !error && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="bg-muted/30 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <LinkSimple size={24} className="text-muted-foreground" />
              </div>
              <h3 className="mb-1.5 text-base font-medium">
                {searchQuery
                  ? 'No tools found'
                  : showMyToolsOnly && user
                    ? 'No tools created by you'
                    : 'No external AI tools available'}
              </h3>
              <p className="text-muted-foreground mb-3 max-w-sm text-xs">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : showMyToolsOnly && user
                    ? 'Create your first external AI tool to get started'
                    : 'Check back later for new tools'}
              </p>
              {(searchQuery || (showMyToolsOnly && user)) && (
                <div className="flex gap-2">
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSearch}
                      className="h-7 px-3 text-xs"
                    >
                      Clear search
                    </Button>
                  )}
                  {showMyToolsOnly && user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMyToolsOnly(false)}
                      className="h-7 px-3 text-xs"
                    >
                      Show all tools
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <DialogExternalAITool
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTool(null);
          }
        }}
        tool={editingTool}
      />

      <DialogExternalAIToolDetails
        open={detailsDialogOpen}
        onOpenChange={(open) => {
          setDetailsDialogOpen(open);
          if (!open) {
            setSelectedTool(null);
          }
        }}
        tool={selectedTool}
      />

      <DialogBadge
        open={badgeDialogOpen}
        onOpenChange={(open) => {
          setBadgeDialogOpen(open);
          if (!open) {
            setBadgeTool(null);
          }
        }}
        tool={badgeTool}
      />

      <DialogShare
        open={shareDialogOpen}
        onOpenChange={(open) => {
          setShareDialogOpen(open);
          if (!open) {
            setShareTool(null);
          }
        }}
        title={shareTool?.name || ''}
        description={shareTool?.description || ''}
        shareUrl={
          shareTool
            ? `${typeof window !== 'undefined' ? window.location.origin : 'https://deeplist.ai'}/tools/${shareTool.id}`
            : ''
        }
        shareType="tool"
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
    </>
  );
}
