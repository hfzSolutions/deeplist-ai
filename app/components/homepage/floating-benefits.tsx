'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { WelcomeDialog } from './welcome-dialog';

interface FloatingBenefitsProps {
  onStartChatting?: () => void;
  className?: string;
}

export function FloatingBenefits({
  onStartChatting,
  className = '',
}: FloatingBenefitsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide the floating button after user interacts
  const handleStartChatting = () => {
    onStartChatting?.();
    setShowDialog(false);
    setIsVisible(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setShowDialog(true)}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="sm"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      <WelcomeDialog
        open={showDialog}
        onOpenChange={handleCloseDialog}
        onStartChatting={handleStartChatting}
      />
    </>
  );
}
