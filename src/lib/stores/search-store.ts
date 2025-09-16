import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  BookmarkWithCategory,
  SearchFilters,
  BookmarkSearchResult 
} from '@/lib/types/bookmark';
import { 
  updateUrlWithFilters, 
  getFiltersFromUrl, 
  clearUrlFilters,
  debouncedUrlUpdate 
} from '@/lib/utils/url-state';

interface SearchState {
  // State
  query: string;
  filters: SearchFilters;
  searchResults: BookmarkSearchResult | null;
  isSearching: boolean;
  error: string | null;
  searchHistory: string[];
  availableTags: string[];
  urlSyncEnabled: boolean;
  
  // Actions
  setQuery: (query: string, updateUrl?: boolean) => void;
  setFilters: (filters: Partial<SearchFilters>, updateUrl?: boolean) => void;
  search: (customFilters?: SearchFilters, updateUrl?: boolean) => Promise<void>;
  clearSearch: (updateUrl?: boolean) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  fetchAvailableTags: () => Promise<void>;
  searchByTags: (tags: string[], updateUrl?: boolean) => Promise<void>;
  clearError: () => void;
  initializeFromUrl: () => void;
  enableUrlSync: () => void;
  disableUrlSync: () => void;
  performFullTextSearch: (allBookmarks: BookmarkWithCategory[], filters: SearchFilters) => BookmarkWithCategory[];
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      // Initial state
      query: '',
      filters: {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      searchResults: null,
      isSearching: false,
      error: null,
      searchHistory: [],
      availableTags: [],
      urlSyncEnabled: false,

      // Actions
      setQuery: (query: string, updateUrl: boolean = true) => {
        set({ query });
        
        if (updateUrl && get().urlSyncEnabled) {
          const { filters } = get();
          const newFilters = { ...filters, query: query.trim() || undefined };
          debouncedUrlUpdate(newFilters);
        }
      },

      setFilters: (newFilters: Partial<SearchFilters>, updateUrl: boolean = true) => {
        const { filters } = get();
        const updatedFilters = { ...filters, ...newFilters };
        set({ filters: updatedFilters });
        
        if (updateUrl && get().urlSyncEnabled) {
          const { query } = get();
          const fullFilters = { ...updatedFilters, query: query.trim() || undefined };
          debouncedUrlUpdate(fullFilters);
        }
      },

      search: async (customFilters?: SearchFilters, updateUrl: boolean = true) => {
        const { query, filters } = get();
        const searchFilters = customFilters || { ...filters, query: query.trim() || undefined };
        
        set({ isSearching: true, error: null });
        
        try {
          // Build search params
          const params = new URLSearchParams();
          if (searchFilters.query) params.set('search', searchFilters.query);
          if (searchFilters.categoryId) params.set('categoryId', searchFilters.categoryId);
          if (searchFilters.tags?.length) {
            searchFilters.tags.forEach(tag => params.append('tags', tag));
          }
          if (searchFilters.sortBy) params.set('sortBy', searchFilters.sortBy);
          if (searchFilters.sortOrder) params.set('sortOrder', searchFilters.sortOrder);
          
          const response = await fetch(`/api/bookmarks?${params.toString()}`);
          if (!response.ok) {
            throw new Error('Search failed');
          }
          const bookmarks = await response.json();
          
          const searchResults: BookmarkSearchResult = {
            bookmarks,
            totalCount: bookmarks.length,
            hasMore: false,
          };
          set({ searchResults, isSearching: false });
          
          // Add to search history if there's a query
          if (searchFilters.query && searchFilters.query.trim()) {
            get().addToSearchHistory(searchFilters.query.trim());
          }
          
          // Update URL if enabled
          if (updateUrl && get().urlSyncEnabled) {
            updateUrlWithFilters(searchFilters, true);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Search failed',
            isSearching: false 
          });
        }
      },

      clearSearch: (updateUrl: boolean = true) => {
        set({ 
          query: '',
          searchResults: null,
          filters: {
            sortBy: 'createdAt',
            sortOrder: 'desc',
          }
        });
        
        if (updateUrl && get().urlSyncEnabled) {
          clearUrlFilters(true);
        }
      },

      addToSearchHistory: (query: string) => {
        const { searchHistory } = get();
        const trimmedQuery = query.trim().toLowerCase();
        
        if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
          const updatedHistory = [trimmedQuery, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
          set({ searchHistory: updatedHistory });
        }
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      fetchAvailableTags: async () => {
        set({ isSearching: true, error: null });
        try {
          const response = await fetch('/api/tags');
          if (!response.ok) {
            throw new Error('Failed to fetch tags');
          }
          const availableTags = await response.json();
          set({ availableTags, isSearching: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tags',
            isSearching: false 
          });
        }
      },

      searchByTags: async (tags: string[], updateUrl: boolean = true) => {
        set({ isSearching: true, error: null });
        try {
          const params = new URLSearchParams();
          tags.forEach(tag => params.append('tags', tag));
          
          const response = await fetch(`/api/bookmarks?${params.toString()}`);
          if (!response.ok) {
            throw new Error('Failed to search by tags');
          }
          const bookmarks = await response.json();
          
          const searchResults: BookmarkSearchResult = {
            bookmarks,
            totalCount: bookmarks.length,
            hasMore: false,
          };
          set({ searchResults, isSearching: false });
          
          // Update filters and URL
          const newFilters = { ...get().filters, tags };
          set({ filters: newFilters });
          
          if (updateUrl && get().urlSyncEnabled) {
            const { query } = get();
            updateUrlWithFilters({ ...newFilters, query: query.trim() || undefined }, true);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search by tags',
            isSearching: false 
          });
        }
      },

      clearError: () => set({ error: null }),

      initializeFromUrl: () => {
        if (typeof window === 'undefined') return;
        
        const urlFilters = getFiltersFromUrl();
        if (Object.keys(urlFilters).length > 0) {
          set({ 
            query: urlFilters.query || '',
            filters: {
              sortBy: urlFilters.sortBy || 'createdAt',
              sortOrder: urlFilters.sortOrder || 'desc',
              categoryId: urlFilters.categoryId,
              tags: urlFilters.tags,
            }
          });
        }
      },

      enableUrlSync: () => {
        set({ urlSyncEnabled: true });
      },

      disableUrlSync: () => {
        set({ urlSyncEnabled: false });
      },

      performFullTextSearch: (allBookmarks: BookmarkWithCategory[], filters: SearchFilters) => {
        let filtered = [...allBookmarks];

        // Apply text search across title, description, and URL
        if (filters.query?.trim()) {
          const query = filters.query.toLowerCase();
          filtered = filtered.filter(bookmark => {
            const titleMatch = bookmark.title.toLowerCase().includes(query);
            const descriptionMatch = bookmark.description?.toLowerCase().includes(query) || false;
            const urlMatch = bookmark.url.toLowerCase().includes(query);
            const tagMatch = bookmark.tags.some(tag => tag.toLowerCase().includes(query));
            
            return titleMatch || descriptionMatch || urlMatch || tagMatch;
          });
        }

        // Apply category filter
        if (filters.categoryId) {
          filtered = filtered.filter(bookmark => bookmark.categoryId === filters.categoryId);
        }

        // Apply tag filters
        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter(bookmark => 
            filters.tags!.some(filterTag => 
              bookmark.tags.some(bookmarkTag => 
                bookmarkTag.toLowerCase().includes(filterTag.toLowerCase())
              )
            )
          );
        }

        // Apply sorting
        if (filters.sortBy) {
          filtered.sort((a, b) => {
            const aValue = a[filters.sortBy!];
            const bValue = b[filters.sortBy!];
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;
            
            return filters.sortOrder === 'desc' ? -comparison : comparison;
          });
        } else {
          // Default sort by creation date (newest first)
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return filtered;
      },
    }),
    {
      name: 'search-store',
    }
  )
);