'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { WelcomeDialog } from './welcome-dialog';

interface BenefitsTriggerProps {
  onStartChatting?: () => void;
  className?: string;
}

export function BenefitsTrigger({
  onStartChatting,
  className = '',
}: BenefitsTriggerProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className={`text-gray-600 hover:text-gray-900 ${className}`}
      >
        <Info className="h-4 w-4 mr-2" />
        Why DeepList AI?
      </Button>

      <WelcomeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStartChatting={onStartChatting}
      />
    </>
  );
}
