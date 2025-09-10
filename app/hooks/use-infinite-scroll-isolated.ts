import { useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScrollIsolated({
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px',
  enabled = true,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement>(null);
  const observerInstanceRef = useRef<IntersectionObserver | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      const now = Date.now();

      if (target.isIntersecting && hasNextPage && !isLoading && enabled) {
        // Debounce: only allow calls every 500ms
        if (now - lastCallTimeRef.current > 500) {
          lastCallTimeRef.current = now;
          onLoadMore();
        }
      }
    },
    [hasNextPage, isLoading, onLoadMore, enabled]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element || !enabled) {
      // Clean up existing observer if disabled
      if (observerInstanceRef.current) {
        observerInstanceRef.current.disconnect();
        observerInstanceRef.current = null;
      }
      return;
    }

    // Clean up existing observer
    if (observerInstanceRef.current) {
      observerInstanceRef.current.disconnect();
    }

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerInstanceRef.current = observer;
    observer.observe(element);

    return () => {
      if (observerInstanceRef.current) {
        observerInstanceRef.current.disconnect();
        observerInstanceRef.current = null;
      }
    };
  }, [handleObserver, threshold, rootMargin, enabled]);

  return observerRef;
}
