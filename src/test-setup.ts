import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX
global.React = React;

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Mock implementation - immediately trigger callback
    setTimeout(() => {
      if (this.callback) {
        this.callback([{
          isIntersecting: true,
          target,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now()
        } as IntersectionObserverEntry], this);
      }
    }, 0);
  }

  unobserve(): void {
    // Mock implementation
  }

  disconnect(): void {
    // Mock implementation
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  private callback: IntersectionObserverCallback;
};

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Mock implementation - immediately trigger callback
    setTimeout(() => {
      this.callback([{
        target,
        contentRect: target.getBoundingClientRect(),
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: []
      } as ResizeObserverEntry], this);
    }, 0);
  }

  unobserve(): void {
    // Mock implementation
  }

  disconnect(): void {
    // Mock implementation
  }

  private callback: ResizeObserverCallback;
};