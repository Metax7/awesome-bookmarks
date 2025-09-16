import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
}

// interface SwipeEventData {
//   event: TouchEvent | MouseEvent;
//   absX: number;
//   absY: number;
//   deltaX: number;
//   deltaY: number;
//   velocity: number;
// }

export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent | MouseEvent) => {
    const touch = 'touches' in event ? event.touches[0] : event;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEndRef.current = null;
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (preventDefaultTouchmoveEvent) {
      event.preventDefault();
    }
  }, [preventDefaultTouchmoveEvent]);

  const handleTouchEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!touchStartRef.current) return;

    const touch = 'changedTouches' in event ? event.changedTouches[0] : event;
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    // const time = touchEndRef.current.time - touchStartRef.current.time;
    // const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / time;

    // SwipeEventData for potential future use
    // const swipeData: SwipeEventData = {
    //   event,
    //   absX,
    //   absY,
    //   deltaX,
    //   deltaY,
    //   velocity,
    // };

    // Determine swipe direction
    if (absX > absY) {
      // Horizontal swipe
      if (absX > threshold) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (absY > threshold) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [handlers, threshold]);

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    ...(trackMouse && {
      onMouseDown: handleTouchStart,
      onMouseMove: handleTouchMove,
      onMouseUp: handleTouchEnd,
    }),
  };

  return swipeHandlers;
}