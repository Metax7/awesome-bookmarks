/**
 * Performance optimization utilities
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useRef } from 'react';

/**
 * Throttle function to limit the rate of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function to delay function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Hook for throttled callbacks
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const throttledFn = useRef<(...args: Parameters<T>) => void | null>(null);

  if (!throttledFn.current) {
    throttledFn.current = throttle(callback, delay);
  }

  return useCallback((...args: Parameters<T>) => {
    throttledFn.current!(...args);
  }, []);
}

/**
 * Hook for debounced callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const debouncedFn = useRef<(...args: Parameters<T>) => void | null>(null);

  if (!debouncedFn.current) {
    debouncedFn.current = debounce(callback, delay);
  }

  return useCallback((...args: Parameters<T>) => {
    debouncedFn.current!(...args);
  }, []);
}

/**
 * Check if an object is shallowly equal to another
 */
export function shallowEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Compare arrays for shallow equality
 */
export function arrayShallowEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export function batchUpdates(callback: () => void): void {
  requestAnimationFrame(callback);
}

/**
 * Check if the current device is likely to have performance constraints
 */
export function isLowEndDevice(): boolean {
  // Check for various indicators of low-end devices
  if (typeof navigator === 'undefined') return false;

  // Check memory (if available)
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (memory && memory < 4) return true;

  // Check connection (if available)
  const connection = (navigator as unknown as { connection?: { effectiveType: string } }).connection;
  if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
    return true;
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }

  return false;
}

/**
 * Get optimal chunk size for virtual scrolling based on device capabilities
 */
export function getOptimalChunkSize(): number {
  if (isLowEndDevice()) {
    return 10; // Smaller chunks for low-end devices
  }
  return 20; // Larger chunks for better devices
}

/**
 * Preload images for better UX
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  const promises = srcs.map(src => preloadImage(src).catch(() => {})); // Ignore errors
  await Promise.all(promises);
}