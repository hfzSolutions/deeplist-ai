'use client';

import { ExternalAITools } from './external-ai-tools';
import { useSearchParams } from 'next/navigation';

export function HomepageContainer() {
  const searchParams = useSearchParams();
  const toolId = searchParams.get('tool');

  return (
    <div className="flex h-full flex-col">
      <ExternalAITools toolId={toolId} isActive={true} />
    </div>
  );
}
