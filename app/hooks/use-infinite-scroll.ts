import { useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement>(null);
  const observerRef2 = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isLoading) {
        onLoadMore();
      }
    },
    [hasNextPage, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    // Clean up existing observer
    if (observerRef2.current) {
      observerRef2.current.disconnect();
    }

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerRef2.current = observer;
    observer.observe(element);

    return () => {
      if (observerRef2.current) {
        observerRef2.current.disconnect();
        observerRef2.current = null;
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  return observerRef;
}
