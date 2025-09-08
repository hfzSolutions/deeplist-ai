'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from '@phosphor-icons/react';

interface TerminologyHelperProps {
  className?: string;
}

export function TerminologyHelper({ className }: TerminologyHelperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 text-gray-400 hover:text-gray-600 ${className}`}
          >
            <Info className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium text-sm">AI you chat with</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
