'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Sparkle } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MigrationGuideModal } from './migration-guide-modal';

interface AnnouncementBannerProps {
  className?: string;
}

export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showMigrationGuide, setShowMigrationGuide] = useState(false);
  const pathname = usePathname();

  // Check if user has already dismissed this banner
  useEffect(() => {
    const dismissed = localStorage.getItem(
      'deeplist-ai-transition-banner-dismissed'
    );
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  // Only show banner on store page
  const isOnStorePage = pathname === '/store';

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('deeplist-ai-transition-banner-dismissed', 'true');
  };

  const handleLearnMore = () => {
    setShowMigrationGuide(true);
  };

  if (!isVisible || isDismissed || !isOnStorePage) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'relative bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50 z-40',
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3 lg:px-8">
          <div className="flex items-start justify-between gap-2 sm:items-center">
            <div className="flex items-start space-x-2 sm:items-center sm:space-x-3">
              <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                <Sparkle className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-900 sm:text-sm">
                  🎉 Welcome to the new DeepList AI!
                </p>
                <p className="text-xs text-blue-700 sm:text-sm">
                  We&apos;ve made your AI experience even better! 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLearnMore}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
              >
                <span className="hidden sm:inline">Learn More</span>
                <span className="sm:hidden">More</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 h-7 w-7 p-0 sm:h-8 sm:w-8"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
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
