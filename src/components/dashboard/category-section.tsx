"use client";

import { BookmarkCard } from "./bookmark-card";
import { BookmarkGridSkeleton } from "./bookmark-skeleton";
import { Pagination } from "./pagination";
import { VirtualGrid } from "./virtual-grid";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/use-mobile";
import type { BookmarkWithCategory, Category } from "@/lib/types/bookmark";

interface CategorySectionProps {
  category: Category;
  bookmarks: BookmarkWithCategory[];
  onEditBookmark: (bookmark: BookmarkWithCategory) => void;
  onDeleteBookmark: (id: string) => void;
  onCategoryChange?: (bookmarkId: string, categoryId: string) => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  showHeader?: boolean;
  isLoading?: boolean;
  itemsPerPage?: number;
  enablePagination?: boolean;
  enableVirtualScrolling?: boolean;
  virtualScrollHeight?: number;
  searchQuery?: string;
  showSearchExcerpt?: boolean;
}

const CategorySectionComponent = function CategorySection({
  category,
  bookmarks,
  onEditBookmark,
  onDeleteBookmark,
  onCategoryChange,
  isCollapsible = true,
  defaultExpanded = true,
  showHeader = true,
  isLoading = false,
  itemsPerPage = 12,
  enablePagination = true,
  enableVirtualScrolling = false,
  virtualScrollHeight = 600,
  searchQuery,
  showSearchExcerpt = false,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [currentPage, setCurrentPage] = useState(1);
  const screenSize = useScreenSize();

  // Memoized handlers
  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Pagination logic
  const { paginatedBookmarks, totalPages } = useMemo(() => {
    if (!enablePagination) {
      return { paginatedBookmarks: bookmarks, totalPages: 1 };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBookmarks = bookmarks.slice(startIndex, endIndex);
    const totalPages = Math.ceil(bookmarks.length / itemsPerPage);

    return { paginatedBookmarks, totalPages };
  }, [bookmarks, currentPage, itemsPerPage, enablePagination]);

  // Reset to first page when bookmarks change
  useEffect(() => {
    setCurrentPage(1);
  }, [bookmarks.length]);

  if (!isLoading && bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isCollapsible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleToggleExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {bookmarks.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden space-y-4",
          isExpanded ? "opacity-100" : "opacity-0 h-0"
        )}
      >
        {isLoading ? (
          <BookmarkGridSkeleton count={itemsPerPage} />
        ) : enableVirtualScrolling ? (
          <VirtualGrid
            bookmarks={bookmarks}
            onEditBookmark={onEditBookmark}
            onDeleteBookmark={onDeleteBookmark}
            onCategoryChange={onCategoryChange}
            containerHeight={virtualScrollHeight}
            searchQuery={searchQuery}
            showSearchExcerpt={showSearchExcerpt}
          />
        ) : (
          <div className={cn(
            "grid gap-4",
            screenSize === 'mobile' 
              ? "grid-cols-1" 
              : screenSize === 'tablet'
              ? "grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          )}>
            {paginatedBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEditBookmark}
                onDelete={onDeleteBookmark}
                onCategoryChange={onCategoryChange}
                searchQuery={searchQuery}
                showSearchExcerpt={showSearchExcerpt}
              />
            ))}
          </div>
        )}

        {/* Pagination - only show if not using virtual scrolling */}
        {enablePagination &&
          !enableVirtualScrolling &&
          !isLoading &&
          totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={bookmarks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
      </div>
    </div>
  );
};

// Memoized component with custom comparison
export const CategorySection = memo(
  CategorySectionComponent,
  (prevProps, nextProps) => {
    // Compare category
    if (prevProps.category.id !== nextProps.category.id) return false;
    if (prevProps.category.name !== nextProps.category.name) return false;
    if (prevProps.category.color !== nextProps.category.color) return false;

    // Compare bookmarks array
    if (prevProps.bookmarks.length !== nextProps.bookmarks.length) return false;
    if (prevProps.bookmarks !== nextProps.bookmarks) {
      // Deep comparison for small arrays, reference comparison for large ones
      if (prevProps.bookmarks.length < 50) {
        for (let i = 0; i < prevProps.bookmarks.length; i++) {
          const prev = prevProps.bookmarks[i];
          const next = nextProps.bookmarks[i];
          // Compare updatedAt safely
          const prevUpdatedAt = prev.updatedAt;
          const nextUpdatedAt = next.updatedAt;
          let updatedAtChanged = false;
          
          if (prevUpdatedAt && nextUpdatedAt) {
            const prevTime = prevUpdatedAt instanceof Date ? prevUpdatedAt.getTime() : new Date(prevUpdatedAt).getTime();
            const nextTime = nextUpdatedAt instanceof Date ? nextUpdatedAt.getTime() : new Date(nextUpdatedAt).getTime();
            updatedAtChanged = prevTime !== nextTime;
          } else {
            updatedAtChanged = prevUpdatedAt !== nextUpdatedAt;
          }
          
          if (prev.id !== next.id || updatedAtChanged) {
            return false;
          }
        }
      } else {
        return false; // Different reference for large arrays
      }
    }

    // Compare other props
    if (prevProps.isCollapsible !== nextProps.isCollapsible) return false;
    if (prevProps.defaultExpanded !== nextProps.defaultExpanded) return false;
    if (prevProps.showHeader !== nextProps.showHeader) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.itemsPerPage !== nextProps.itemsPerPage) return false;
    if (prevProps.enablePagination !== nextProps.enablePagination) return false;
    if (prevProps.enableVirtualScrolling !== nextProps.enableVirtualScrolling)
      return false;
    if (prevProps.virtualScrollHeight !== nextProps.virtualScrollHeight)
      return false;
    if (prevProps.searchQuery !== nextProps.searchQuery) return false;
    if (prevProps.showSearchExcerpt !== nextProps.showSearchExcerpt)
      return false;

    return true;
  }
);
