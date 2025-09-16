"use client";

import { useEffect, useState } from "react";
import { isLowEndDevice } from "@/lib/utils/performance";

interface PerformanceMonitorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  enableMonitoring?: boolean;
}

interface PerformanceMetrics {
  isLowEnd: boolean;
  memoryUsage?: number;
  renderTime: number;
}

export function PerformanceMonitor({
  children,
  fallback,
  enableMonitoring = process.env.NODE_ENV === 'development'
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isLowEnd: false,
    renderTime: 0
  });

  useEffect(() => {
    if (!enableMonitoring) return;

    const startTime = performance.now();
    
    // Check device capabilities
    const isLowEnd = isLowEndDevice();
    
    // Get memory usage if available
    const memoryUsage = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
    
    // Measure render time
    const measureRenderTime = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics({
        isLowEnd,
        memoryUsage,
        renderTime
      });

      // Log performance warnings in development
      if (process.env.NODE_ENV === 'development') {
        if (renderTime > 100) {
          console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
        
        if (isLowEnd) {
          console.info('Low-end device detected, using performance optimizations');
        }
      }
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRenderTime);
  }, [enableMonitoring]);

  // Return fallback for low-end devices if provided
  if (metrics.isLowEnd && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook to access performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isLowEnd: isLowEndDevice(),
    renderTime: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      const memoryUsage = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));
    };

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return metrics;
}