'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Sparkle } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { MigrationGuideModal } from './migration-guide-modal';

interface AnnouncementBannerProps {
  className?: string;
}

export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showMigrationGuide, setShowMigrationGuide] = useState(false);

  // Check if user has already dismissed this banner
  useEffect(() => {
    const dismissed = localStorage.getItem(
      'deeplist-ai-transition-banner-dismissed'
    );
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('deeplist-ai-transition-banner-dismissed', 'true');
  };

  const handleLearnMore = () => {
    setShowMigrationGuide(true);
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'relative bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50',
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Sparkle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  🎉 Welcome to the new DeepList AI!
                </p>
                <p className="text-sm text-blue-700">
                  We&apos;ve made your AI experience even better! 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLearnMore}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                Learn More
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MigrationGuideModal
        open={showMigrationGuide}
        onOpenChange={setShowMigrationGuide}
      />
    </>
  );
}
