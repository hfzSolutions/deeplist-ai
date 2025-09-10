'use client';

import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Agent } from '@/lib/agent-store/types';
import {
  Calendar,
  ChatCircle,
  Robot,
  Share,
  User,
  Tag,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { DialogShare } from '../common/dialog-share';

interface DialogAgentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onStartChat: (agent: Agent) => void;
}

export function DialogAgentDetails({
  open,
  onOpenChange,
  agent,
  onStartChat,
}: DialogAgentDetailsProps) {
  const isMobile = useBreakpoint(768);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!agent) return null;

  const handleStartChat = () => {
    onStartChat(agent);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const DESCRIPTION_LIMIT = 200; // Character limit for truncated description
  const shouldTruncateDescription =
    agent.description && agent.description.length > DESCRIPTION_LIMIT;
  const displayDescription =
    isDescriptionExpanded || !shouldTruncateDescription
      ? agent.description
      : agent.description?.substring(0, DESCRIPTION_LIMIT) + '...';

  const HeaderContent = () => (
    <>
      <DialogTitle className="flex items-center gap-2">
        <Robot className="h-5 w-5" />
        Agent Details
      </DialogTitle>
      <DialogDescription>
        View agent information and start a chat
      </DialogDescription>
    </>
  );

  const BodyContent = () => (
    <>
      {/* Agent Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={agent.avatar_url || undefined} />
          <AvatarFallback className="text-lg">
            {agent.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold leading-tight">{agent.name}</h2>
          <div className="space-y-2">
            <p className="mt-1 text-base text-muted-foreground">
              {displayDescription || 'No description available'}
            </p>
            {shouldTruncateDescription && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-sm text-primary hover:underline font-medium"
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agent Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Category
          </h3>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            <span className="text-sm">
              {agent.category?.name || 'No category'}
            </span>
          </div>
        </div>

        {/* Creator */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Creator
          </h3>
          <div className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            <span className="text-sm">
              {agent.user_id ? 'User Created' : 'System'}
            </span>
          </div>
        </div>

        {/* Created Date */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Created
          </h3>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-sm">
              {agent.created_at ? formatDate(agent.created_at) : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Information */}
      {agent.model && (
        <div className="space-y-3 mb-6">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Model
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">{agent.model}</span>
          </div>
        </div>
      )}

      {/* System Prompt */}
      {agent.system_prompt && (
        <div className="space-y-3 mb-6">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            System Prompt
          </h3>
          <div className="text-foreground text-base leading-relaxed break-words whitespace-pre-wrap bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
            {agent.system_prompt}
          </div>
        </div>
      )}
    </>
  );

  const FooterContent = () => (
    <div className={`flex gap-2 ${isMobile ? '' : 'justify-end'}`}>
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className={isMobile ? 'flex-1' : ''}
      >
        Close
      </Button>
      <Button
        variant="outline"
        onClick={() => setShareDialogOpen(true)}
        className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}
      >
        <Share size={16} />
        Share
      </Button>
      <Button
        onClick={handleStartChat}
        className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}
      >
        <ChatCircle size={16} />
        Start Chat
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="flex max-h-[95vh] flex-col">
            <DrawerHeader className="border-b px-6 py-4">
              <DrawerTitle className="flex items-center gap-2 text-left">
                <Robot className="h-5 w-5" />
                Agent Details
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <BodyContent />
            </div>
            <DrawerFooter className="border-t px-6 py-4">
              <FooterContent />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <DialogShare
          open={shareDialogOpen}
          onOpenChange={(open) => {
            setShareDialogOpen(open);
          }}
          title={agent.name}
          description={agent.description || ''}
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://deeplist.ai'}/agents/${agent.id}`}
          shareType="agent"
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
          <DialogHeader className="border-b px-6 py-4">
            <HeaderContent />
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <BodyContent />
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <FooterContent />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogShare
        open={shareDialogOpen}
        onOpenChange={(open) => {
          setShareDialogOpen(open);
        }}
        title={agent.name}
        description={agent.description || ''}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://deeplist.ai'}/agents/${agent.id}`}
        shareType="agent"
      />
    </>
  );
}
