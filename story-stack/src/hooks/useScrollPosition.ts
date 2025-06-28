import { useState, useEffect, useCallback } from 'react';

interface UseScrollPositionOptions {
  threshold?: number;
  throttleMs?: number;
}

interface ScrollPosition {
  x: number;
  y: number;
  isScrollingDown: boolean;
  hasScrolledPastThreshold: boolean;
}

// Hook to lock scroll and ensure modal is visible in viewport
export function useModalScrollLock() {
  useEffect(() => {
    // Store the current scroll position
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Store original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Scroll to top to ensure modal is visible
    window.scrollTo(0, 0);

    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Compensate for scrollbar width to prevent layout shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Store scroll position in a data attribute for reference
    document.body.setAttribute('data-scroll-y', scrollY.toString());
    document.body.setAttribute('data-scroll-x', scrollX.toString());

    // Cleanup function to restore scroll position
    return () => {

      // Restore original styles
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.documentElement.style.overflow = originalHtmlOverflow;

      // Remove data attributes
      document.body.removeAttribute('data-scroll-y');
      document.body.removeAttribute('data-scroll-x');

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);
    };
  }, []);
}

export function useScrollPosition(options: UseScrollPositionOptions = {}): ScrollPosition {
  const { threshold = 200, throttleMs = 16 } = options;
  
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    isScrollingDown: false,
    hasScrolledPastThreshold: false,
  });

  const updateScrollPosition = useCallback(() => {
    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    
    setScrollPosition(prev => ({
      x: currentScrollX,
      y: currentScrollY,
      isScrollingDown: currentScrollY > prev.y,
      hasScrolledPastThreshold: currentScrollY > threshold,
    }));
  }, [threshold]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(updateScrollPosition, throttleMs);
    };

    // Set initial position
    updateScrollPosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [updateScrollPosition, throttleMs]);

  return scrollPosition;
}

// Hook specifically for detecting when user has scrolled past a specific element
export function useScrollPastElement(elementId: string, offset: number = 0) {
  const [hasScrolledPast, setHasScrolledPast] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const checkScrollPosition = () => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const elementRect = element.getBoundingClientRect();
      const elementBottom = elementRect.bottom + window.scrollY;
      const currentScrollY = window.scrollY + window.innerHeight;
      
      setHasScrolledPast(currentScrollY > elementBottom + offset);
    };

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(checkScrollPosition, 16);
    };

    // Check initial position
    checkScrollPosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollPosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollPosition);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [elementId, offset]);

  return hasScrolledPast;
}
