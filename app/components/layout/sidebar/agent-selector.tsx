'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/lib/agent-store/provider';
import { useCategories } from '@/lib/categories-store/provider';
import { cn } from '@/lib/utils';
import {
  CaretDown,
  Heart,
  HeartStraight,
  Plus,
  Robot,
  User,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { DialogCreateAgent } from './dialog-create-agent';

export function AgentSelector() {
  const {
    agents,
    isLoading,
    selectedAgent,
    setSelectedAgent,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
  } = useAgents();
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="px-2 py-2">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  const handleAgentSelect = (agent: typeof selectedAgent) => {
    setSelectedAgent(agent);
    setIsOpen(false);
  };

  // Filter agents by category
  const filteredAgents =
    selectedCategoryId && selectedCategoryId !== 'all'
      ? agents.filter((agent) => agent.category_id === selectedCategoryId)
      : agents;

  return (
    <div className="px-2 py-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 w-full justify-between px-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              {selectedAgent ? (
                <>
                  {selectedAgent.avatar_url ? (
                    <Avatar className="h-5 w-5">
                      <img
                        src={selectedAgent.avatar_url}
                        alt={selectedAgent.name}
                        className="h-full w-full object-cover"
                      />
                    </Avatar>
                  ) : (
                    <Robot size={16} className="text-muted-foreground" />
                  )}
                  <span className="truncate text-sm font-medium">
                    {selectedAgent.name}
                  </span>
                </>
              ) : (
                <>
                  <User size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground truncate text-sm font-medium">
                    No agent selected
                  </span>
                </>
              )}
            </div>
            <CaretDown
              size={14}
              className={cn(
                'text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width]"
          align="start"
        >
          <DropdownMenuLabel>Select Agent</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Category Filter */}
          <div className="px-2 py-1">
            <Select
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
            </Select>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleAgentSelect(null)}
            className={cn(
              'flex cursor-pointer items-center gap-2',
              !selectedAgent && 'bg-accent'
            )}
          >
            <User size={16} className="text-muted-foreground" />
            <span>No agent (Default)</span>
          </DropdownMenuItem>
          {filteredAgents.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {filteredAgents.map((agent) => {
                const isFav = isFavorite(agent.id);

                const handleToggleFavorite = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (isFav) {
                    await removeFromFavorites(agent.id);
                  } else {
                    await addToFavorites(agent.id);
                  }
                };

                return (
                  <DropdownMenuItem
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2',
                      selectedAgent?.id === agent.id && 'bg-accent'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {agent.avatar_url ? (
                        <Avatar className="h-4 w-4">
                          <img
                            src={agent.avatar_url}
                            alt={agent.name}
                            className="h-full w-full object-cover"
                          />
                        </Avatar>
                      ) : (
                        <Robot size={16} className="text-muted-foreground" />
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {agent.name}
                        </span>
                        {agent.description && (
                          <span className="text-muted-foreground truncate text-xs">
                            {agent.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {agent.is_public && (
                        <span className="text-xs text-blue-500">Public</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-accent h-6 w-6 p-0"
                        onClick={handleToggleFavorite}
                      >
                        {isFav ? (
                          <Heart size={12} className="text-red-500" />
                        ) : (
                          <HeartStraight
                            size={12}
                            className="text-muted-foreground hover:text-red-500"
                          />
                        )}
                      </Button>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsCreateDialogOpen(true);
              setIsOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            <span>Create New Agent</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogCreateAgent
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
      />
    </div>
  );
}
