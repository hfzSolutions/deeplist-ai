'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BookmarkSimple,
  MagnifyingGlass,
  Sparkle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface MigrationGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MigrationGuideModal({
  open,
  onOpenChange,
}: MigrationGuideModalProps) {
  const features = [
    {
      icon: <BookmarkSimple className="h-4 w-4" />,
      title: 'Never Lose a Chat',
      description: 'All your conversations are saved',
    },
    {
      icon: <Sparkle className="h-4 w-4" />,
      title: 'Try Different AI',
      description: 'Switch between AI agents anytime',
    },
    {
      icon: <MagnifyingGlass className="h-4 w-4" />,
      title: 'Everything Organized',
      description: 'All AI tools in one place',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-primary" />
            What&apos;s New?
          </DialogTitle>
          <DialogDescription>
            Here&apos;s what&apos;s new and exciting! ✨
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted"
              >
                <div className="flex-shrink-0 text-primary">{feature.icon}</div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-foreground">
                    {feature.title}
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end flex-shrink-0 pt-4 border-t border-border">
          <Button onClick={() => onOpenChange(false)}>
            Got it, let&apos;s go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
