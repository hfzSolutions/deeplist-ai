'use client';

import { ValuePropositionCompact } from './value-proposition';
import { BenefitsTrigger } from './benefits-trigger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface SidebarBenefitsProps {
  onStartChatting?: () => void;
  className?: string;
}

export function SidebarBenefits({
  onStartChatting,
  className = '',
}: SidebarBenefitsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card
      className={`${
        isDark 
          ? 'bg-gradient-to-br from-blue-950/20 to-purple-950/20 border-blue-800/50' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
      } ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          Why DeepList AI?
          <BenefitsTrigger onStartChatting={onStartChatting} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ValuePropositionCompact />
      </CardContent>
    </Card>
  );
}
