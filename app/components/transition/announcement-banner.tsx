'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Sparkle } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { MigrationGuideModal } from './migration-guide-modal';

interface AnnouncementBannerProps {
  className?: string;
}

export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showMigrationGuide, setShowMigrationGuide] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

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
          'relative border-b z-40',
          resolvedTheme === 'dark'
            ? 'bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border-blue-800/30'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50',
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3 lg:px-8">
          <div className="flex items-start justify-between gap-2 sm:items-center">
            <div className="flex items-start space-x-2 sm:items-center sm:space-x-3">
              <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                <Sparkle
                  className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5',
                    resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs font-medium sm:text-sm',
                    resolvedTheme === 'dark' ? 'text-blue-100' : 'text-blue-900'
                  )}
                >
                  🎉 Welcome to the new DeepList AI!
                </p>
                <p
                  className={cn(
                    'text-xs sm:text-sm',
                    resolvedTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  )}
                >
                  We&apos;ve made your AI experience even better! 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLearnMore}
                className={cn(
                  'h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm',
                  resolvedTheme === 'dark'
                    ? 'text-blue-300 hover:text-blue-100 hover:bg-blue-900/30'
                    : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
                )}
              >
                <span className="hidden sm:inline">Learn More</span>
                <span className="sm:hidden">More</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className={cn(
                  'h-7 w-7 p-0 sm:h-8 sm:w-8',
                  resolvedTheme === 'dark'
                    ? 'text-blue-400 hover:text-blue-200 hover:bg-blue-900/30'
                    : 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
                )}
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
