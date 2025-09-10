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
import { ExternalAITool } from '@/lib/external-ai-tools-store/types';
import { useUser } from '@/lib/user-store/provider';
import {
  Calendar,
  LinkSimple,
  Robot,
  Share,
  Star,
  Tag,
  User,
  VideoCamera,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { DialogBadge } from './dialog-badge';
import { DialogShare } from '../common/dialog-share';

interface DialogExternalAIToolDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: ExternalAITool | null;
}

export function DialogExternalAIToolDetails({
  open,
  onOpenChange,
  tool,
}: DialogExternalAIToolDetailsProps) {
  const isMobile = useBreakpoint(768);
  const { user } = useUser();
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!tool) return null;

  const handleVisitWebsite = () => {
    window.open(tool.website, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // For other video URLs, try to use them directly
    return url;
  };

  const isEmbeddableVideo = (url: string) => {
    return /(?:youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.ogg)/.test(url);
  };

  const DESCRIPTION_LIMIT = 200; // Character limit for truncated description
  const shouldTruncateDescription =
    tool.description && tool.description.length > DESCRIPTION_LIMIT;
  const displayDescription =
    isDescriptionExpanded || !shouldTruncateDescription
      ? tool.description
      : tool.description.substring(0, DESCRIPTION_LIMIT) + '...';

  const HeaderContent = () => (
    <>
      <DialogTitle className="flex items-center gap-2">
        <Robot className="h-5 w-5" />
        External AI Tool Details
      </DialogTitle>
      <DialogDescription>View external AI tool information</DialogDescription>
    </>
  );

  const BodyContent = () => (
    <>
      {/* Tool Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={tool.logo || undefined} alt={tool.name} />
          <AvatarFallback className="text-xl font-medium">
            {tool.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-xl font-semibold leading-tight">{tool.name}</h2>
            <div className="flex gap-2">
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
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground border-muted-foreground/20 bg-transparent"
                >
                  Featured
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-base text-muted-foreground">
              {displayDescription}
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

      {/* Tool Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Category
          </h3>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            <span className="text-sm">
              {tool.category?.name || 'No category'}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Pricing
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {tool.pricing === 'free'
                ? 'Free'
                : tool.pricing === 'paid'
                  ? 'Paid'
                  : tool.pricing === 'freemium'
                    ? 'Freemium'
                    : 'Not specified'}
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
            <span className="text-sm">{formatDate(tool.created_at)}</span>
          </div>
        </div>

        {/* Featured Status */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Status
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {tool.featured ? 'Featured Tool' : 'Standard Tool'}
            </span>
          </div>
        </div>
      </div>

      {/* Website Section */}
      <div className="space-y-3 mb-6">
        <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Website
        </h3>
        <div className="flex items-center gap-2">
          <LinkSimple size={16} className="text-muted-foreground" />
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary break-all hover:underline"
          >
            {tool.website}
          </a>
        </div>
      </div>

      {/* Video Section */}
      {tool.video_url && (
        <div className="space-y-3 mb-6">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Video
          </h3>
          {isEmbeddableVideo(tool.video_url) ? (
            <div className="space-y-2">
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <iframe
                  src={getEmbedUrl(tool.video_url)}
                  title="Video preview"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <VideoCamera size={14} className="text-muted-foreground" />
                <a
                  href={tool.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <VideoCamera size={16} className="text-muted-foreground" />
              <a
                href={tool.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary break-all hover:underline"
              >
                {tool.video_url}
              </a>
            </div>
          )}
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
      {user?.id === tool.user_id && (
        <Button
          variant="outline"
          onClick={() => setBadgeDialogOpen(true)}
          className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}
        >
          <Star size={16} />
          Get Badge
        </Button>
      )}
      <Button
        onClick={handleVisitWebsite}
        className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}
      >
        <LinkSimple size={16} />
        Visit
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="flex max-h-[90vh] flex-col overflow-hidden">
            <DrawerHeader className="border-b px-6 py-4">
              <HeaderContent />
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <BodyContent />
            </div>
            <DrawerFooter className="border-t px-6 py-4">
              <FooterContent />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <DialogBadge
          open={badgeDialogOpen}
          onOpenChange={(open) => {
            setBadgeDialogOpen(open);
          }}
          tool={tool}
        />

        <DialogShare
          open={shareDialogOpen}
          onOpenChange={(open) => {
            setShareDialogOpen(open);
          }}
          title={tool.name}
          description={tool.description}
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://deeplist.ai'}/tools/${tool.id}`}
          shareType="tool"
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

      <DialogBadge
        open={badgeDialogOpen}
        onOpenChange={(open) => {
          setBadgeDialogOpen(open);
        }}
        tool={tool}
      />

      <DialogShare
        open={shareDialogOpen}
        onOpenChange={(open) => {
          setShareDialogOpen(open);
        }}
        title={tool.name}
        description={tool.description}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://deeplist.ai'}/tools/${tool.id}`}
        shareType="tool"
      />
    </>
  );
}
