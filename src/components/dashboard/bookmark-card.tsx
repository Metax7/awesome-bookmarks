"use client";

import { useState, memo, useRef, useCallback } from "react";
import {
  ExternalLink,
  Edit,
  Trash2,
  MoreVertical,
  Globe,
  FolderOpen,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/lib/stores/category-store";
import {
  HighlightedText,
  SearchExcerpt,
} from "@/components/ui/highlighted-text";
import { LazyImage } from "@/components/ui/lazy-image";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BookmarkWithCategory } from "@/lib/types/bookmark";

interface BookmarkCardProps {
  bookmark: BookmarkWithCategory;
  onEdit: (bookmark: BookmarkWithCategory) => void;
  onDelete: (id: string) => void;
  onCategoryChange?: (bookmarkId: string, categoryId: string) => void;
  className?: string;
  searchQuery?: string;
  showSearchExcerpt?: boolean;
}

const BookmarkCardComponent = function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onCategoryChange,
  className,
  searchQuery,
  showSearchExcerpt = false,
}: BookmarkCardProps) {
  const [, setImageError] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const { categories } = useCategoryStore();
  const isMobile = useIsMobile();

  // Touch/swipe handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const swipeThreshold = 80; // Minimum distance for swipe action

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const handleVisit = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const handleCategoryChange = (categoryId: string) => {
    if (onCategoryChange && categoryId !== bookmark.categoryId) {
      onCategoryChange(bookmark.id, categoryId);
    }
  };

  // Get available categories for moving (exclude current category)
  const availableCategories = categories.filter(
    (cat) => cat.id !== bookmark.categoryId
  );

  // Touch event handlers for swipe gestures
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isDragging.current = false;
      setIsSwipeActive(true);
    },
    [isMobile]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !isSwipeActive) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Only handle horizontal swipes
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        setIsSwipeActive(false);
        return;
      }

      // Prevent vertical scrolling during horizontal swipe
      if (Math.abs(deltaX) > 10) {
        e.preventDefault();
        isDragging.current = true;
      }

      // Apply resistance for over-swipe
      let offset = deltaX;
      if (Math.abs(deltaX) > swipeThreshold) {
        const excess = Math.abs(deltaX) - swipeThreshold;
        offset =
          deltaX > 0
            ? swipeThreshold + excess * 0.3
            : -swipeThreshold - excess * 0.3;
      }

      setSwipeOffset(offset);
    },
    [isMobile, isSwipeActive, swipeThreshold]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isSwipeActive) return;

    setIsSwipeActive(false);

    // Trigger actions based on swipe distance
    if (Math.abs(swipeOffset) > swipeThreshold) {
      if (swipeOffset > 0) {
        // Right swipe - edit
        onEdit(bookmark);
      } else {
        // Left swipe - delete
        onDelete(bookmark.id);
      }
    }

    // Reset position
    setSwipeOffset(0);
    isDragging.current = false;
  }, [
    isMobile,
    isSwipeActive,
    swipeOffset,
    swipeThreshold,
    onEdit,
    onDelete,
    bookmark,
  ]);

  // Mouse event handlers for desktop drag (optional)
  const handleMouseDown = useCallback(() => {
    if (isMobile) return;
    // Could implement mouse drag for desktop if needed
  }, [isMobile]);

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action indicators (mobile only) */}
      {isMobile && (
        <>
          {/* Left action (delete) */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-20 bg-destructive flex items-center justify-center transition-opacity",
              swipeOffset < -20 ? "opacity-100" : "opacity-0"
            )}
          >
            <Trash2 className="h-5 w-5 text-white" />
          </div>

          {/* Right action (edit) */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-20 bg-primary flex items-center justify-center transition-opacity",
              swipeOffset > 20 ? "opacity-100" : "opacity-0"
            )}
          >
            <Edit className="h-5 w-5 text-primary-foreground" />
          </div>
        </>
      )}

      <Card
        ref={cardRef}
        className={cn(
          "group transition-all duration-200",
          isMobile ? "touch-pan-y" : "hover:shadow-md",
          className
        )}
        style={{
          transform: isMobile ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwipeActive ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <CardHeader className={cn("pb-3", isMobile && "py-4")}>
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Favicon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-sm relative">
              <LazyImage
                src={bookmark.favicon as string}
                alt=""
                className="w-full h-full rounded-sm"
                fallbackIcon={
                  <Globe className="w-4 h-4 text-muted-foreground" />
                }
                onError={() => setImageError(true)}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="font-medium text-sm leading-tight mb-1 overflow-hidden cursor-pointer hover:text-primary transition-colors"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
                onClick={handleVisit}
              >
                <HighlightedText
                  text={bookmark.title}
                  query={searchQuery}
                  highlightClassName="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded"
                />
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                <HighlightedText
                  text={getDomain(bookmark.url)}
                  query={searchQuery}
                  highlightClassName="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded"
                />
              </p>
            </div>
          </div>

          {/* Actions dropdown */}
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "transition-opacity",
                    isMobile
                      ? "h-10 w-10 opacity-100" // Always visible on mobile with larger touch target
                      : "h-8 w-8 opacity-0 group-hover:opacity-100 sm:opacity-100"
                  )}
                >
                  <MoreVertical className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleVisit}>
                  <ExternalLink />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(bookmark)}>
                  <Edit />
                  Edit
                </DropdownMenuItem>

                {/* Move to category submenu */}
                {onCategoryChange && availableCategories.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Move to
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {availableCategories.map((category) => (
                          <DropdownMenuItem
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                          >
                            <div className="flex items-center gap-2">
                              {category.icon ? (
                                <span className="text-sm">{category.icon}</span>
                              ) : (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              <span>{category.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(bookmark.id)}
                  className="text-destructive"
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className={cn("pt-0", isMobile && "px-4 pb-4")}>
          {/* Description */}
          {bookmark.description && (
            <div
              className="text-sm text-muted-foreground mb-3 overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {showSearchExcerpt && searchQuery ? (
                <SearchExcerpt
                  text={bookmark.description}
                  query={searchQuery}
                  maxLength={120}
                  highlightClassName="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded"
                />
              ) : (
                <HighlightedText
                  text={bookmark.description}
                  query={searchQuery}
                  maxLength={120}
                  highlightClassName="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded"
                />
              )}
            </div>
          )}

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <HighlightedText
                    text={tag}
                    query={searchQuery}
                    highlightClassName="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded"
                  />
                </Badge>
              ))}
              {bookmark.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{bookmark.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: bookmark.category.color }}
              />
              <span>{bookmark.category.name}</span>
            </div>
            <span>{formatDate(bookmark.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Optimized memo with custom comparison
export const BookmarkCard = memo(
  BookmarkCardComponent,
  (prevProps, nextProps) => {
    // Compare bookmark properties that affect rendering
    if (prevProps.bookmark.id !== nextProps.bookmark.id) return false;
    if (prevProps.bookmark.title !== nextProps.bookmark.title) return false;
    if (prevProps.bookmark.url !== nextProps.bookmark.url) return false;
    if (prevProps.bookmark.description !== nextProps.bookmark.description)
      return false;
    if (prevProps.bookmark.favicon !== nextProps.bookmark.favicon) return false;
    if (prevProps.bookmark.categoryId !== nextProps.bookmark.categoryId)
      return false;
    // Compare updatedAt safely
    const prevUpdatedAt = prevProps.bookmark.updatedAt;
    const nextUpdatedAt = nextProps.bookmark.updatedAt;
    if (prevUpdatedAt && nextUpdatedAt) {
      const prevTime =
        prevUpdatedAt instanceof Date
          ? prevUpdatedAt.getTime()
          : new Date(prevUpdatedAt).getTime();
      const nextTime =
        nextUpdatedAt instanceof Date
          ? nextUpdatedAt.getTime()
          : new Date(nextUpdatedAt).getTime();
      if (prevTime !== nextTime) return false;
    } else if (prevUpdatedAt !== nextUpdatedAt) {
      return false;
    }

    // Compare tags array
    if (prevProps.bookmark.tags?.length !== nextProps.bookmark.tags?.length)
      return false;
    if (
      prevProps.bookmark.tags?.some(
        (tag, i) => tag !== nextProps.bookmark.tags?.[i]
      )
    )
      return false;

    // Compare other props
    if (prevProps.className !== nextProps.className) return false;
    if (prevProps.searchQuery !== nextProps.searchQuery) return false;
    if (prevProps.showSearchExcerpt !== nextProps.showSearchExcerpt)
      return false;

    // Functions are assumed to be stable (memoized by parent)
    return true;
  }
);
