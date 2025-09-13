'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { WelcomeDialog } from './welcome-dialog';
import { useTheme } from 'next-themes';

interface BenefitsBannerProps {
  onStartChatting?: () => void;
  className?: string;
}

export function BenefitsBanner({
  onStartChatting,
  className = '',
}: BenefitsBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Check if user has dismissed the banner
  useState(() => {
    const hasDismissed = localStorage.getItem('deeplist-banner-dismissed');
    if (hasDismissed === 'true') {
      setIsVisible(false);
    }
  });

  const handleDismiss = () => {
    localStorage.setItem('deeplist-banner-dismissed', 'true');
    setIsVisible(false);
  };

  const handleStartChatting = () => {
    onStartChatting?.();
    setShowDialog(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`${
          isDark 
            ? 'bg-gradient-to-r from-blue-900 to-purple-900' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        } text-white ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <div>
                <span className="font-medium">Welcome to DeepList AI!</span>
                <span className={`ml-2 ${
                  isDark ? 'text-blue-200' : 'text-blue-100'
                }`}>
                  Access 10+ AI models, switch instantly, discover curated
                  tools - completely free.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDialog(true)}
                className="text-white hover:bg-white/20"
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <WelcomeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStartChatting={handleStartChatting}
      />
    </>
  );
}
