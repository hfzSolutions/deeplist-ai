'use client';

import { useSearchParams } from 'next/navigation';
import { ExternalToolsSection } from './external-tools-section';

export function StoreContainer() {
  const searchParams = useSearchParams();

  return (
    <div className="flex h-full flex-col">

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <ExternalToolsSection toolId={searchParams.get('tool')} />
      </div>
    </div>
  );
}
