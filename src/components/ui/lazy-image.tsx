"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

const LazyImageComponent = function LazyImage({
  src,
  alt,
  className,
  fallbackIcon = <Globe className="w-4 h-4 text-muted-foreground" />,
  onError,
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for test environments or older browsers
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Don't render img element until it's in view
  const shouldLoadImage = isInView && src && !hasError;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center bg-muted overflow-hidden",
        className
      )}
    >
      {shouldLoadImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : null}
      
      {/* Show fallback icon when image is not loaded or has error */}
      {(!shouldLoadImage || !isLoaded || hasError) && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          isLoaded && !hasError ? "opacity-0" : "opacity-100"
        )}>
          {fallbackIcon}
        </div>
      )}
    </div>
  );
};

// Memoize with custom comparison for performance
export const LazyImage = memo(LazyImageComponent, (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.className === nextProps.className
  );
});