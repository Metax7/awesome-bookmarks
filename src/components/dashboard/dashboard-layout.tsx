"use client";

import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SearchBar } from "./search-bar";
import { CategorySection } from "./category-section";
import { EmptyState } from "./empty-state";
import { BookmarkErrorBoundary } from "@/components/error";
import { useSearchStore } from "@/lib/stores/search-store";
import type {
  BookmarkWithCategory,
  CategoryWithBookmarkCount,
  SearchFilters,
} from "@/lib/types/bookmark";

interface DashboardLayoutProps {
  bookmarks: BookmarkWithCategory[];
  categories: CategoryWithBookmarkCount[];
  onAddBookmark: () => void;
  onEditBookmark: (bookmark: BookmarkWithCategory) => void;
  onDeleteBookmark: (id: string) => void;
  onAddCategory: () => void;
  onCategoryChange?: (bookmarkId: string, categoryId: string) => void;
  isLoading?: boolean;
}

const DashboardLayoutComponent = function DashboardLayout({
  bookmarks,
  categories,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onAddCategory,
  onCategoryChange,
  isLoading = false,
}: DashboardLayoutProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const {
    availableTags,
    fetchAvailableTags,
    performFullTextSearch,
    enableUrlSync,
    initializeFromUrl,
  } = useSearchStore();

  // Initialize search from URL and enable URL sync
  useEffect(() => {
    initializeFromUrl();
    enableUrlSync();
    fetchAvailableTags();
  }, [initializeFromUrl, enableUrlSync, fetchAvailableTags]);

  // Filter and search bookmarks using enhanced search functionality
  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Apply category filter from sidebar first
    if (selectedCategoryId) {
      filtered = filtered.filter(
        (bookmark) => bookmark.categoryId === selectedCategoryId
      );
    }

    // Use enhanced search functionality from store
    const combinedFilters = {
      ...searchFilters,
      // Override categoryId if sidebar selection is active
      categoryId: selectedCategoryId || searchFilters.categoryId,
    };

    // Only apply search if there are actual search criteria
    if (
      combinedFilters.query ||
      combinedFilters.categoryId ||
      combinedFilters.tags?.length ||
      combinedFilters.sortBy
    ) {
      filtered = performFullTextSearch(filtered, combinedFilters);
    } else if (!selectedCategoryId) {
      // Default sort when no search criteria
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [bookmarks, selectedCategoryId, searchFilters, performFullTextSearch]);

  // Group bookmarks by category for display
  const bookmarksByCategory = useMemo(() => {
    const grouped = new Map<string, BookmarkWithCategory[]>();

    filteredBookmarks.forEach((bookmark) => {
      const categoryId = bookmark.categoryId;
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(bookmark);
    });

    return grouped;
  }, [filteredBookmarks]);

  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      setSearchFilters(filters);
      // Clear sidebar category selection if search has category filter
      if (filters.categoryId && selectedCategoryId) {
        setSelectedCategoryId(undefined);
      }
    },
    [selectedCategoryId]
  );

  const handleCategorySelect = useCallback(
    (categoryId?: string) => {
      setSelectedCategoryId(categoryId);
      // Clear search category filter when selecting from sidebar
      if (categoryId && searchFilters.categoryId) {
        setSearchFilters((prev) => ({ ...prev, categoryId: undefined }));
      }
    },
    [searchFilters.categoryId]
  );

  const availableCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    createdAt: cat.createdAt,
  }));

  return (
    <MainLayout
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onCategorySelect={handleCategorySelect}
      onAddCategory={onAddCategory}
      onAddBookmark={onAddBookmark}
    >
      <BookmarkErrorBoundary onRetry={() => window.location.reload()}>
        <div className="space-y-6">
          {/* Advanced search bar */}
          <SearchBar
            onSearch={handleSearch}
            categories={availableCategories}
            availableTags={availableTags}
            initialFilters={searchFilters}
            showTagFilter={true}
            showAdvancedFilters={true}
          />

          {/* Results summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredBookmarks.length === bookmarks.length
                ? `Total bookmarks: ${bookmarks.length}`
                : `Found: ${filteredBookmarks.length} of ${bookmarks.length}`}
            </div>
          </div>

          {/* Bookmarks display */}
          {isLoading ? (
            <div className="space-y-8">
              {/* Show multiple loading sections to simulate real layout */}
              {[1, 2, 3].map((index) => (
                <CategorySection
                  key={index}
                  category={{
                    id: `loading-${index}`,
                    name: `Loading category ${index}...`,
                    color: "#666",
                    createdAt: new Date(),
                  }}
                  bookmarks={[]}
                  onEditBookmark={onEditBookmark}
                  onDeleteBookmark={onDeleteBookmark}
                  onCategoryChange={onCategoryChange}
                  isLoading={true}
                  showHeader={true}
                  itemsPerPage={8}
                />
              ))}
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <EmptyState
              type={bookmarks.length === 0 ? "no-bookmarks" : "no-results"}
              onAction={
                bookmarks.length === 0
                  ? onAddBookmark
                  : () => setSearchFilters({})
              }
              showSecondaryAction={bookmarks.length > 0}
              secondaryActionLabel="Add Bookmark"
              onSecondaryAction={onAddBookmark}
            />
          ) : selectedCategoryId || searchFilters.categoryId ? (
            // Show single category
            (() => {
              const categoryId =
                selectedCategoryId || searchFilters.categoryId!;
              const category = categories.find((cat) => cat.id === categoryId);
              const categoryBookmarks =
                bookmarksByCategory.get(categoryId) || [];

              return category ? (
                <CategorySection
                  category={category}
                  bookmarks={categoryBookmarks}
                  onEditBookmark={onEditBookmark}
                  onDeleteBookmark={onDeleteBookmark}
                  onCategoryChange={onCategoryChange}
                  showHeader={false}
                  enablePagination={categoryBookmarks.length <= 100}
                  enableVirtualScrolling={categoryBookmarks.length > 100}
                  itemsPerPage={16}
                  virtualScrollHeight={600}
                  searchQuery={searchFilters.query}
                  showSearchExcerpt={!!searchFilters.query}
                />
              ) : null;
            })()
          ) : (
            // Show all categories
            <div className="space-y-8">
              {Array.from(bookmarksByCategory.entries()).map(
                ([categoryId, categoryBookmarks]) => {
                  const category = categories.find(
                    (cat) => cat.id === categoryId
                  );
                  return category ? (
                    <CategorySection
                      key={categoryId}
                      category={category}
                      bookmarks={categoryBookmarks}
                      onEditBookmark={onEditBookmark}
                      onDeleteBookmark={onDeleteBookmark}
                      onCategoryChange={onCategoryChange}
                      enablePagination={
                        categoryBookmarks.length > 8 &&
                        categoryBookmarks.length <= 50
                      }
                      enableVirtualScrolling={categoryBookmarks.length > 50}
                      itemsPerPage={8}
                      virtualScrollHeight={400}
                      searchQuery={searchFilters.query}
                      showSearchExcerpt={!!searchFilters.query}
                    />
                  ) : null;
                }
              )}
            </div>
          )}
        </div>
      </BookmarkErrorBoundary>
    </MainLayout>
  );
};

// Memoized component with custom comparison
export const DashboardLayout = memo(
  DashboardLayoutComponent,
  (prevProps, nextProps) => {
    // Compare bookmarks array
    if (prevProps.bookmarks.length !== nextProps.bookmarks.length) return false;
    if (prevProps.bookmarks !== nextProps.bookmarks) return false;

    // Compare categories array
    if (prevProps.categories.length !== nextProps.categories.length)
      return false;
    if (prevProps.categories !== nextProps.categories) return false;

    // Compare loading state
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    // Functions are assumed to be stable (memoized by parent)
    return true;
  }
);
