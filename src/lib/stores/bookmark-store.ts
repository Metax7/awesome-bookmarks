import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RetryManager } from '@/lib/utils/retry-utils';
import { 
  BookmarkWithCategory, 
  BookmarkCreateInput, 
  BookmarkUpdateInput,
  SearchFilters,
  BookmarkSearchResult 
} from '@/lib/types/bookmark';

interface BookmarkState {
  // State
  bookmarks: BookmarkWithCategory[];
  isLoading: boolean;
  error: string | null;
  searchResults: BookmarkSearchResult | null;
  recentBookmarks: BookmarkWithCategory[];
  
  // Actions
  fetchBookmarks: () => Promise<void>;
  fetchBookmarkById: (id: string) => Promise<BookmarkWithCategory | null>;
  fetchBookmarksByCategory: (categoryId: string) => Promise<void>;
  createBookmark: (bookmark: BookmarkCreateInput) => Promise<string>;
  updateBookmark: (id: string, updates: BookmarkUpdateInput) => Promise<void>;
  changeBookmarkCategory: (bookmarkId: string, categoryId: string) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  searchBookmarksAction: (filters: SearchFilters) => Promise<void>;
  fetchRecentBookmarks: (limit?: number) => Promise<void>;
  clearError: () => void;
  clearSearchResults: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    (set, get) => ({
      // Initial state
      bookmarks: [],
      isLoading: false,
      error: null,
      searchResults: null,
      recentBookmarks: [],

      // Actions
      fetchBookmarks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await RetryManager.retryFetch('/api/bookmarks', undefined, {
            maxAttempts: 3,
            onRetry: (attempt, error) => {
              console.log(`Retrying fetch bookmarks (attempt ${attempt}):`, error.message);
            }
          });
          const bookmarks = await response.json();
          set({ bookmarks, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
            isLoading: false 
          });
        }
      },

      fetchBookmarkById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/bookmarks/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch bookmark');
          }
          const bookmark = await response.json();
          set({ isLoading: false });
          return bookmark;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch bookmark',
            isLoading: false 
          });
          return null;
        }
      },

      fetchBookmarksByCategory: async (categoryId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/bookmarks?categoryId=${categoryId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch bookmarks by category');
          }
          const bookmarks = await response.json();
          set({ bookmarks, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch bookmarks by category',
            isLoading: false 
          });
        }
      },

      createBookmark: async (bookmark: BookmarkCreateInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await RetryManager.retryFetch('/api/bookmarks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookmark),
          }, {
            maxAttempts: 2,
            shouldRetry: (error) => {
              // Don't retry validation errors (4xx)
              return !error.message.includes('400') && RetryManager.isRetryableError(error);
            }
          });
          
          const newBookmark = await response.json();
          // Refresh bookmarks list
          await get().fetchBookmarks();
          set({ isLoading: false });
          return newBookmark.id;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create bookmark',
            isLoading: false 
          });
          throw error;
        }
      },

      updateBookmark: async (id: string, updates: BookmarkUpdateInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/bookmarks/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update bookmark');
          }
          
          const updatedBookmark = await response.json();
          // Update the bookmark in the current state
          const { bookmarks } = get();
          const updatedBookmarks = bookmarks.map(bookmark => 
            bookmark.id === id ? updatedBookmark : bookmark
          );
          set({ bookmarks: updatedBookmarks, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update bookmark',
            isLoading: false 
          });
          throw error;
        }
      },

      changeBookmarkCategory: async (bookmarkId: string, categoryId: string) => {
        try {
          const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categoryId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to change bookmark category');
          }
          
          // Don't update state here - let the calling component handle optimistic updates
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to change bookmark category',
          });
          throw error;
        }
      },

      deleteBookmark: async (id: string) => {
        try {
          const response = await fetch(`/api/bookmarks/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete bookmark');
          }
          
          // Don't update state here - let the calling component handle optimistic updates
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete bookmark',
          });
          throw error;
        }
      },

      searchBookmarksAction: async (filters: SearchFilters) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters.query) params.append('query', filters.query);
          if (filters.categoryId) params.append('categoryId', filters.categoryId);
          if (filters.tags?.length) params.append('tags', filters.tags.join(','));
          if (filters.sortBy) params.append('sortBy', filters.sortBy);
          if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
          
          const response = await fetch(`/api/bookmarks?${params.toString()}`);
          if (!response.ok) {
            throw new Error('Failed to search bookmarks');
          }
          const searchResults = await response.json();
          set({ searchResults, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search bookmarks',
            isLoading: false 
          });
        }
      },

      fetchRecentBookmarks: async (limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/bookmarks?sortBy=createdAt&sortOrder=desc&limit=${limit}`);
          if (!response.ok) {
            throw new Error('Failed to fetch recent bookmarks');
          }
          const bookmarks = await response.json();
          set({ recentBookmarks: Array.isArray(bookmarks) ? bookmarks : bookmarks.bookmarks || [], isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch recent bookmarks',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
      
      clearSearchResults: () => set({ searchResults: null }),
    }),
    {
      name: 'bookmark-store',
    }
  )
);