import { renderHook } from '@testing-library/react';
import { useInfiniteScroll } from '../use-infinite-scroll';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a ref', () => {
    const mockOnLoadMore = jest.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isLoading: false,
        onLoadMore: mockOnLoadMore,
      })
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should set up intersection observer with correct options', () => {
    const mockOnLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isLoading: false,
        onLoadMore: mockOnLoadMore,
        threshold: 0.5,
        rootMargin: '50px',
      })
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '50px',
      }
    );
  });

  it('should call onLoadMore when element intersects and conditions are met', () => {
    const mockOnLoadMore = jest.fn();
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      };
    });

    renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isLoading: false,
        onLoadMore: mockOnLoadMore,
      })
    );

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
    } as IntersectionObserverEntry;

    observerCallback!([mockEntry]);

    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it('should not call onLoadMore when hasNextPage is false', () => {
    const mockOnLoadMore = jest.fn();
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      };
    });

    renderHook(() =>
      useInfiniteScroll({
        hasNextPage: false,
        isLoading: false,
        onLoadMore: mockOnLoadMore,
      })
    );

    const mockEntry = {
      isIntersecting: true,
    } as IntersectionObserverEntry;

    observerCallback!([mockEntry]);

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  it('should not call onLoadMore when isLoading is true', () => {
    const mockOnLoadMore = jest.fn();
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      };
    });

    renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isLoading: true,
        onLoadMore: mockOnLoadMore,
      })
    );

    const mockEntry = {
      isIntersecting: true,
    } as IntersectionObserverEntry;

    observerCallback!([mockEntry]);

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });
});
