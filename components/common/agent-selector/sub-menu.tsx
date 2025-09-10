import { Agent } from '@/lib/agent-store/types';
import { useAgents } from '@/lib/agent-store/provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowSquareOutIcon,
  BookmarkSimple,
  CalendarIcon,
} from '@phosphor-icons/react';

type SubMenuProps = {
  hoveredAgentData: Agent;
};

export function SubMenu({ hoveredAgentData }: SubMenuProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useAgents();
  const isFav = isFavorite(hoveredAgentData.id);

  const handleToggleFavorite = async () => {
    if (isFav) {
      await removeFromFavorites(hoveredAgentData.id);
    } else {
      await addToFavorites(hoveredAgentData.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-popover border-border w-[280px] rounded-md border p-3 shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-5">
              <AvatarImage src={hoveredAgentData.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {hoveredAgentData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium">{hoveredAgentData.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent"
            onClick={handleToggleFavorite}
          >
            <BookmarkSimple
              size={14}
              className={
                isFav
                  ? 'text-blue-500'
                  : 'text-muted-foreground hover:text-blue-500'
              }
            />
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">
          {hoveredAgentData.description || 'No description available'}
        </p>

        <div className="mt-4 space-y-3">
          {hoveredAgentData.system_prompt && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">System Prompt</h4>
              <p className="text-muted-foreground text-xs leading-relaxed max-h-20 overflow-y-auto">
                {hoveredAgentData.system_prompt}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Created</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <CalendarIcon className="size-3" />
                {formatDate(hoveredAgentData.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Updated</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <CalendarIcon className="size-3" />
                {formatDate(hoveredAgentData.updated_at)}
              </span>
            </div>

            {hoveredAgentData.model && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Model</span>
                <span className="text-muted-foreground text-xs">
                  {hoveredAgentData.model}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
