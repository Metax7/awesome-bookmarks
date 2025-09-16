import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookmarkStore } from '../bookmark-store';
import { useCategoryStore } from '../category-store';
import { useSearchStore } from '../search-store';

// Mock the database operations
vi.mock('@/lib/db/operations', () => ({
  bookmarkOperations: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    getByCategory: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue('test-id'),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue({ bookmarks: [], totalCount: 0, hasMore: false }),
    getRecentBookmarks: vi.fn().mockResolvedValue([]),
    getAllTags: vi.fn().mockResolvedValue([]),
    getByTags: vi.fn().mockResolvedValue([]),
  },
  categoryOperations: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    getCategoriesWithCounts: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue('test-category-id'),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    seedDefaultCategories: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Zustand Stores', () => {
  beforeEach(() => {
    // Reset stores before each test
    useBookmarkStore.setState({
      bookmarks: [],
      isLoading: false,
      error: null,
      searchResults: null,
      recentBookmarks: [],
    });
    
    useCategoryStore.setState({
      categories: [],
      categoriesWithCounts: [],
      isLoading: false,
      error: null,
    });
    
    useSearchStore.setState({
      query: '',
      filters: { sortBy: 'createdAt', sortOrder: 'desc' },
      searchResults: null,
      isSearching: false,
      error: null,
      searchHistory: [],
      availableTags: [],
    });
  });

  describe('BookmarkStore', () => {
    it('should initialize with correct default state', () => {
      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.searchResults).toBe(null);
      expect(state.recentBookmarks).toEqual([]);
    });

    it('should clear error', () => {
      useBookmarkStore.setState({ error: 'Test error' });
      useBookmarkStore.getState().clearError();
      expect(useBookmarkStore.getState().error).toBe(null);
    });

    it('should clear search results', () => {
      useBookmarkStore.setState({ 
        searchResults: { bookmarks: [], totalCount: 0, hasMore: false } 
      });
      useBookmarkStore.getState().clearSearchResults();
      expect(useBookmarkStore.getState().searchResults).toBe(null);
    });
  });

  describe('CategoryStore', () => {
    it('should initialize with correct default state', () => {
      const state = useCategoryStore.getState();
      expect(state.categories).toEqual([]);
      expect(state.categoriesWithCounts).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should clear error', () => {
      useCategoryStore.setState({ error: 'Test error' });
      useCategoryStore.getState().clearError();
      expect(useCategoryStore.getState().error).toBe(null);
    });
  });

  describe('SearchStore', () => {
    it('should initialize with correct default state', () => {
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.filters).toEqual({ sortBy: 'createdAt', sortOrder: 'desc' });
      expect(state.searchResults).toBe(null);
      expect(state.isSearching).toBe(false);
      expect(state.error).toBe(null);
      expect(state.searchHistory).toEqual([]);
      expect(state.availableTags).toEqual([]);
    });

    it('should set query', () => {
      useSearchStore.getState().setQuery('test query');
      expect(useSearchStore.getState().query).toBe('test query');
    });

    it('should set filters', () => {
      useSearchStore.getState().setFilters({ categoryId: 'test-category' });
      const state = useSearchStore.getState();
      expect(state.filters.categoryId).toBe('test-category');
      expect(state.filters.sortBy).toBe('createdAt'); // Should preserve existing filters
    });

    it('should clear search', () => {
      useSearchStore.setState({
        query: 'test',
        searchResults: { bookmarks: [], totalCount: 0, hasMore: false },
        filters: { query: 'test', categoryId: 'test' },
      });
      
      useSearchStore.getState().clearSearch();
      const state = useSearchStore.getState();
      
      expect(state.query).toBe('');
      expect(state.searchResults).toBe(null);
      expect(state.filters).toEqual({ sortBy: 'createdAt', sortOrder: 'desc' });
    });

    it('should add to search history', () => {
      useSearchStore.getState().addToSearchHistory('test query');
      expect(useSearchStore.getState().searchHistory).toContain('test query');
    });

    it('should not add duplicate queries to search history', () => {
      const { addToSearchHistory } = useSearchStore.getState();
      addToSearchHistory('test query');
      addToSearchHistory('test query');
      expect(useSearchStore.getState().searchHistory).toEqual(['test query']);
    });

    it('should clear search history', () => {
      useSearchStore.setState({ searchHistory: ['query1', 'query2'] });
      useSearchStore.getState().clearSearchHistory();
      expect(useSearchStore.getState().searchHistory).toEqual([]);
    });

    it('should clear error', () => {
      useSearchStore.setState({ error: 'Test error' });
      useSearchStore.getState().clearError();
      expect(useSearchStore.getState().error).toBe(null);
    });
  });
});