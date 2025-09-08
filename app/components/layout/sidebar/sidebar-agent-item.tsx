'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { useUser } from '@/lib/user-store/provider';
import { cn } from '@/lib/utils';
import {
  Bookmark,
  DotsThreeVertical,
  Eye,
  EyeSlash,
  PencilSimple,
  Robot,
  Trash,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { DialogEditAgent } from './dialog-edit-agent';

type SidebarAgentItemProps = {
  agent: Agent;
  showFavoriteAction?: boolean;
};

export function SidebarAgentItem({
  agent,
  showFavoriteAction = false,
}: SidebarAgentItemProps) {
  const {
    selectedAgent,
    setSelectedAgent,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
  } = useAgents();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isSelected = selectedAgent?.id === agent.id;
  const isFav = isFavorite(agent.id);
  const isOwnAgent = user?.id === agent.user_id;

  const handleSelectAgent = () => {
    if (isSelected) {
      setSelectedAgent(null);
    } else {
      setSelectedAgent(agent);
    }
  };

  const handleEditAgent = () => {
    setIsEditDialogOpen(true);
    setIsMenuOpen(false);
  };

  const handleDeleteAgent = async () => {
    // TODO: Implement delete agent functionality
    toast({
      title: 'Feature Coming Soon',
      description: 'Agent deletion will be available in a future update.',
    });
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFav) {
        const success = await removeFromFavorites(agent.id);
        if (success) {
          toast({
            title: 'Removed',
            description: `${agent.name} has been removed from saved.`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to remove from saved. Please try again.',
          });
        }
      } else {
        const success = await addToFavorites(agent.id);
        if (success) {
          toast({
            title: 'Saved',
            description: `${agent.name} has been saved successfully.`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to save. Please try again.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div className="group relative flex items-center">
      <button
        onClick={handleSelectAgent}
        className={cn(
          'hover:bg-accent/80 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
          isSelected && 'bg-accent text-accent-foreground'
        )}
      >
        {agent.avatar_url ? (
          <Avatar className="h-5 w-5">
            <img
              src={agent.avatar_url}
              alt={agent.name}
              className="h-full w-full object-cover"
            />
          </Avatar>
        ) : (
          <Robot size={16} className="text-muted-foreground" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{agent.name}</span>
          {agent.description && (
            <span className="text-muted-foreground truncate text-xs">
              {agent.description}
            </span>
          )}
        </div>
        {/* {agent.is_public && (
          <span className="text-xs text-blue-500">Public</span>
        )} */}
      </button>

      <div className="absolute right-1 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent h-6 w-6 p-0"
            >
              <DotsThreeVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleSelectAgent}>
              {isSelected ? (
                <>
                  <EyeSlash size={16} className="mr-2" />
                  Deselect Agent
                </>
              ) : (
                <>
                  <Eye size={16} className="mr-2" />
                  Select Agent
                </>
              )}
            </DropdownMenuItem>
            {showFavoriteAction && (
              <DropdownMenuItem onClick={handleToggleFavorite}>
                {isFav ? (
                  <>
                    <Bookmark size={16} className="mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <Bookmark size={16} className="mr-2" />
                    Save
                  </>
                )}
              </DropdownMenuItem>
            )}
            {isOwnAgent && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEditAgent}>
                  <PencilSimple size={16} className="mr-2" />
                  Edit Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteAgent}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash size={16} className="mr-2" />
                  Delete Agent
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DialogEditAgent
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        agent={agent}
      />
    </div>
  );
}
