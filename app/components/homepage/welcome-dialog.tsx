'use client';

import { Zap, ArrowRightLeft, Users, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const benefits = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Discover AI Tools',
    description: 'Find the best AI tools for your specific tasks',
    color: 'text-blue-600',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Explore Community',
    description: 'Discover tools shared by the community and get inspired',
    color: 'text-green-600',
  },
];

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChatting?: () => void;
}

export function WelcomeDialog({
  open,
  onOpenChange,
  onStartChatting,
}: WelcomeDialogProps) {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const { theme } = useTheme();

  // Auto-cycle through benefits
  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [open]);

  const handleStartChatting = () => {
    onStartChatting?.();
    onOpenChange(false);
    // Navigate to auth page in signup mode
    window.location.href = '/auth?mode=signup';
  };

  const isDark = theme === 'dark';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left pb-3">
          <div className="mb-2">
            <p className="text-sm text-muted-foreground mb-0.5">
              Welcome to DeepList AI
            </p>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Your AI Tools Discovery Platform ✨
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Discover AI tools and explore what the community has shared:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Benefit Highlight */}
          <div className="text-center py-4">
            <div className="mb-6">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDark
                    ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50'
                }`}
              >
                <div className={benefits[currentBenefit].color}>
                  {benefits[currentBenefit].icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefits[currentBenefit].title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {benefits[currentBenefit].description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2">
              {benefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBenefit(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentBenefit
                      ? 'bg-blue-600 w-6'
                      : isDark
                        ? 'bg-gray-600 hover:bg-gray-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col gap-4 pt-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <Button
            onClick={handleStartChatting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to store page
              window.location.href = '/store';
            }}
            className="w-full"
          >
            Browse Store
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
