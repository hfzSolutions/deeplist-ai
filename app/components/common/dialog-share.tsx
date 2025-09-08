'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Copy, Share } from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DialogShareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  shareUrl: string;
  shareType: 'tool' | 'agent';
}

export function DialogShare({
  open,
  onOpenChange,
  title,
  description,
  shareUrl,
  shareType,
}: DialogShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share {shareType === 'tool' ? 'Tool' : 'Agent'}
          </DialogTitle>
          <DialogDescription>
            Share this {shareType} with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share URL */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">
              Share Link
            </label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Actions */}
          <div className="space-y-3">
            <Button onClick={handleShare} className="w-full">
              <Share className="h-4 w-4 mr-2" />
              {typeof navigator.share === 'function' ? 'Share' : 'Copy Link'}
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
