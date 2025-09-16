"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkGridSkeleton } from "./bookmark-skeleton";
import { cn } from "@/lib/utils";
import { useThrottledCallback, getOptimalChunkSize } from "@/lib/utils/performance";
import type { BookmarkWithCategory } from "@/lib/types/bookmark";

interface VirtualGridProps {
  bookmarks: BookmarkWithCategory[];
  onEditBookmark: (bookmark: BookmarkWithCategory) => void;
  onDeleteBookmark: (id: string) => void;
  onCategoryChange?: (bookmarkId: string, categoryId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
  isLoading?: boolean;
  searchQuery?: string;
  showSearchExcerpt?: boolean;
}

const VirtualGridComponent = function VirtualGrid({
  bookmarks,
  onEditBookmark,
  onDeleteBookmark,
  onCategoryChange,
  itemHeight = 280, // Approximate height of a bookmark card
  containerHeight = 600,
  className,
  isLoading = false,
  searchQuery,
  showSearchExcerpt = false,
}: VirtualGridProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate grid columns based on container width
  const columns = useMemo(() => {
    if (containerWidth < 640) return 1; // sm
    if (containerWidth < 768) return 2; // md
    if (containerWidth < 1024) return 2; // lg
    if (containerWidth < 1280) return 3; // xl
    if (containerWidth < 1536) return 4; // 2xl
    return 5; // 2xl+
  }, [containerWidth]);

  // Calculate visible items with performance optimizations
  const { visibleItems, totalHeight } = useMemo(() => {
    const itemsPerRow = columns;
    const totalRows = Math.ceil(bookmarks.length / itemsPerRow);
    const totalHeight = totalRows * itemHeight;

    const startRow = Math.floor(scrollTop / itemHeight);
    const visibleRowCount = Math.ceil(containerHeight / itemHeight);
    
    // Add buffer rows for smoother scrolling
    const bufferRows = Math.min(2, Math.ceil(visibleRowCount * 0.2));
    const bufferedStartRow = Math.max(0, startRow - bufferRows);
    const bufferedEndRow = Math.min(totalRows - 1, startRow + visibleRowCount + bufferRows);

    const visibleItems = [];
    const chunkSize = getOptimalChunkSize();
    
    // Process items in chunks for better performance
    for (let row = bufferedStartRow; row <= bufferedEndRow; row += chunkSize) {
      const endChunkRow = Math.min(bufferedEndRow, row + chunkSize - 1);
      
      for (let chunkRow = row; chunkRow <= endChunkRow; chunkRow++) {
        for (let col = 0; col < itemsPerRow; col++) {
          const index = chunkRow * itemsPerRow + col;
          if (index < bookmarks.length) {
            visibleItems.push({
              bookmark: bookmarks[index],
              index,
              top: chunkRow * itemHeight,
              left: (col * 100) / itemsPerRow,
              width: 100 / itemsPerRow,
            });
          }
        }
      }
    }

    return { visibleItems, totalHeight };
  }, [bookmarks, columns, scrollTop, itemHeight, containerHeight]);

  // Memoized handlers for better performance
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // Throttled scroll handler for better performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  const throttledHandleScroll = useThrottledCallback(handleScroll, 16); // ~60fps

  // Handle container resize with ResizeObserver for better performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use ResizeObserver if available, fallback to window resize
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver((entries) => {
        const [entry] = entries;
        if (entry) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(container);
      
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback for older browsers or test environments
      handleResize();
      if (typeof window !== 'undefined') {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }
    }
  }, [handleResize]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    const scrollTimeout = scrollTimeoutRef.current;
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  if (isLoading) {
    return <BookmarkGridSkeleton count={12} className={className} />;
  }

  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={throttledHandleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ bookmark, index, top, left, width }) => (
          <div
            key={`${bookmark.id}-${index}`}
            className="absolute p-2"
            style={{
              top,
              left: `${left}%`,
              width: `${width}%`,
              height: itemHeight,
            }}
          >
            <BookmarkCard
              bookmark={bookmark}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
              onCategoryChange={onCategoryChange}
              className="h-full"
              searchQuery={searchQuery}
              showSearchExcerpt={showSearchExcerpt}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoized component with custom comparison for optimal performance
export const VirtualGrid = memo(VirtualGridComponent, (prevProps, nextProps) => {
  // Compare bookmarks array length and content
  if (prevProps.bookmarks.length !== nextProps.bookmarks.length) return false;
  
  // For performance, only do deep comparison if arrays are small
  if (prevProps.bookmarks.length < 100) {
    for (let i = 0; i < prevProps.bookmarks.length; i++) {
      const prev = prevProps.bookmarks[i];
      const next = nextProps.bookmarks[i];
      if (prev.id !== next.id || prev.updatedAt?.getTime() !== next.updatedAt?.getTime()) {
        return false;
      }
    }
  } else {
    // For large arrays, just compare references (assuming parent memoizes properly)
    if (prevProps.bookmarks !== nextProps.bookmarks) return false;
  }
  
  // Compare other props
  if (prevProps.itemHeight !== nextProps.itemHeight) return false;
  if (prevProps.containerHeight !== nextProps.containerHeight) return false;
  if (prevProps.className !== nextProps.className) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.searchQuery !== nextProps.searchQuery) return false;
  if (prevProps.showSearchExcerpt !== nextProps.showSearchExcerpt) return false;
  
  return true;
});