'use client';

import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalImages = ['/opengraph-image.jpg', '/deeplistai-logo.png'];

      criticalImages.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Optimize font loading
    const optimizeFonts = () => {
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          document.documentElement.classList.add('fonts-loaded');
        });
      }
    };

    // Lazy load non-critical images
    const setupLazyLoading = () => {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach((img) => {
          imageObserver.observe(img);
        });
      }
    };

    preloadCriticalResources();
    optimizeFonts();
    setupLazyLoading();

    // Basic performance monitoring
    const reportBasicMetrics = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Report basic performance metrics
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log(
            'Page Load Time:',
            navigation.loadEventEnd - navigation.loadEventStart
          );
          console.log(
            'DOM Content Loaded:',
            navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart
          );
        }
      }
    };

    // Only report in production
    if (process.env.NODE_ENV === 'production') {
      reportBasicMetrics();
    }
  }, []);

  return null;
}

// Image optimization component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize:
          width && height ? `${width}px ${height}px` : undefined,
      }}
    />
  );
}
