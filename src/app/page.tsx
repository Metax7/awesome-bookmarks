"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard";
import { BookmarkFormDialog } from "@/components/forms";
import { DeleteBookmarkDialog } from "@/components/dashboard/delete-bookmark-dialog";
import { NetworkErrorFallback } from "@/components/error";
import { useBookmarkStore } from "@/lib/stores/bookmark-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import { useSearchStore } from "@/lib/stores/search-store";
import { useBookmarkErrorHandler } from "@/lib/hooks/use-error-handler";
import { ToastManager } from "@/lib/utils/toast-utils";
import type {
  BookmarkWithCategory,
  CategoryWithBookmarkCount,
} from "@/lib/types/bookmark";

export default function Home() {
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<
    BookmarkWithCategory | undefined
  >();
  const [deletingBookmark, setDeletingBookmark] = useState<
    BookmarkWithCategory | null
  >(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    bookmarks,
    fetchBookmarks,
    deleteBookmark,
    changeBookmarkCategory,
    isLoading: bookmarksLoading,
  } = useBookmarkStore();

  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoryStore();

  const { fetchAvailableTags } = useSearchStore();
  const { executeBookmarkOperation, error: bookmarkError } = useBookmarkErrorHandler();

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First, try to seed categories if none exist
        await fetch("/api/categories/seed", { method: "POST" });

        // Then fetch categories, bookmarks, and available tags
        await Promise.all([
          fetchCategories(), 
          fetchBookmarks(),
          fetchAvailableTags()
        ]);

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize data:", error);
        setIsInitialized(true); // Still set to true to show the UI
      }
    };

    initializeData();
  }, [fetchCategories, fetchBookmarks, fetchAvailableTags]);

  const handleAddBookmark = () => {
    setIsAddBookmarkOpen(true);
  };

  const handleEditBookmark = (bookmark: BookmarkWithCategory) => {
    setEditingBookmark(bookmark);
  };

  const handleDeleteBookmark = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      setDeletingBookmark(bookmark);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    // Optimistic update - remove bookmark from UI immediately
    const optimisticBookmarks = bookmarks.filter(b => b.id !== id);
    useBookmarkStore.setState({ bookmarks: optimisticBookmarks });
    
    const result = await executeBookmarkOperation(async () => {
      await deleteBookmark(id);
      await fetchCategories();
    }, 'delete');
    
    if (result) {
      ToastManager.success("Закладка удалена");
    } else {
      // Revert optimistic update on error
      await fetchBookmarks();
    }
  };

  const handleAddCategory = () => {
    // Category management is now handled directly in the sidebar
    // This function is kept for compatibility but not used
  };

  const handleCategoryChange = async (bookmarkId: string, categoryId: string) => {
    const targetCategory = categories.find(c => c.id === categoryId);
    
    if (targetCategory) {
      // Optimistic update - update bookmark category in UI immediately
      const optimisticBookmarks = bookmarks.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { 
              ...bookmark, 
              categoryId, 
              category: {
                ...targetCategory,
                icon: targetCategory.icon || null
              }
            }
          : bookmark
      );
      
      useBookmarkStore.setState({ bookmarks: optimisticBookmarks });
      
      const result = await executeBookmarkOperation(async () => {
        await changeBookmarkCategory(bookmarkId, categoryId);
        await fetchCategories();
      }, 'update');
      
      if (result) {
        ToastManager.success("Закладка перемещена");
      } else {
        // Revert optimistic update on error
        await fetchBookmarks();
      }
    }
  };

  // Convert categories to CategoryWithBookmarkCount format
  const categoriesWithCounts: CategoryWithBookmarkCount[] = categories.map(
    (category) => ({
      ...category,
      updatedAt: category.createdAt, // Add missing updatedAt field
      bookmarkCount: bookmarks.filter(
        (bookmark) => bookmark.categoryId === category.id
      ).length,
    })
  );

  // Show network error fallback if there's a network-related error
  if (bookmarkError && !navigator.onLine) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <NetworkErrorFallback 
          onRetry={() => window.location.reload()}
          showOfflineIndicator={true}
        />
      </div>
    );
  }

  if (!isInitialized || categoriesLoading || bookmarksLoading) {
    return (
      <DashboardLayout
        bookmarks={[]}
        categories={[]}
        onAddBookmark={handleAddBookmark}
        onEditBookmark={handleEditBookmark}
        onDeleteBookmark={handleDeleteBookmark}
        onAddCategory={handleAddCategory}
        onCategoryChange={handleCategoryChange}
        isLoading={true}
      />
    );
  }

  return (
    <>
      <DashboardLayout
        bookmarks={bookmarks}
        categories={categoriesWithCounts}
        onAddBookmark={handleAddBookmark}
        onEditBookmark={handleEditBookmark}
        onDeleteBookmark={handleDeleteBookmark}
        onAddCategory={handleAddCategory}
        onCategoryChange={handleCategoryChange}
        isLoading={!isInitialized || categoriesLoading || bookmarksLoading}
      />

      {/* Add Bookmark Dialog */}
      <BookmarkFormDialog
        open={isAddBookmarkOpen}
        onOpenChange={setIsAddBookmarkOpen}
      />

      {/* Edit Bookmark Dialog */}
      <BookmarkFormDialog
        bookmark={editingBookmark}
        open={!!editingBookmark}
        onOpenChange={(open) => !open && setEditingBookmark(undefined)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteBookmarkDialog
        bookmark={deletingBookmark}
        open={!!deletingBookmark}
        onOpenChange={(open) => !open && setDeletingBookmark(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
