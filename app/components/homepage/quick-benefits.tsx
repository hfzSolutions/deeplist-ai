'use client';

import { ValuePropositionCompact } from './value-proposition';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';

interface QuickBenefitsProps {
  onStartChatting?: () => void;
  className?: string;
}

export function QuickBenefits({
  onStartChatting,
  className = '',
}: QuickBenefitsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`${
        isDark
          ? 'bg-gradient-to-br from-blue-950/20 to-purple-950/20'
          : 'bg-gradient-to-br from-blue-50 to-purple-50'
      } rounded-lg p-6 ${className}`}
    >
      <ValuePropositionCompact />

      {onStartChatting && (
        <div
          className={`mt-4 pt-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <Button
            onClick={() => {
              onStartChatting?.();
              window.location.href = '/auth';
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Login to Start
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
