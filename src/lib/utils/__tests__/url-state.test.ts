import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  filtersToSearchParams, 
  searchParamsToFilters, 
  updateUrlWithFilters,
  getFiltersFromUrl,
  clearUrlFilters
} from '../url-state';
import type { SearchFilters } from '@/lib/types/bookmark';

// Mock window object
const mockWindow = {
  location: {
    href: 'http://localhost:3000/',
    pathname: '/',
    search: ''
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn()
  }
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('URL State Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindow.location.href = 'http://localhost:3000/';
    mockWindow.location.pathname = '/';
    mockWindow.location.search = '';
  });

  describe('filtersToSearchParams', () => {
    it('should convert filters to search params', () => {
      const filters: SearchFilters = {
        query: 'test search',
        categoryId: 'cat-1',
        tags: ['tag1', 'tag2'],
        sortBy: 'title',
        sortOrder: 'asc'
      };

      const params = filtersToSearchParams(filters);
      
      expect(params.get('q')).toBe('test search');
      expect(params.get('category')).toBe('cat-1');
      expect(params.get('tags')).toBe('tag1,tag2');
      expect(params.get('sort')).toBe('title');
      expect(params.get('order')).toBe('asc');
    });

    it('should handle empty filters', () => {
      const filters: SearchFilters = {};
      const params = filtersToSearchParams(filters);
      
      expect(params.toString()).toBe('');
    });

    it('should omit default sort order', () => {
      const filters: SearchFilters = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const params = filtersToSearchParams(filters);
      
      expect(params.get('sort')).toBe('createdAt');
      expect(params.get('order')).toBeNull(); // Default order is omitted
    });

    it('should trim query whitespace', () => {
      const filters: SearchFilters = {
        query: '  test search  '
      };

      const params = filtersToSearchParams(filters);
      
      expect(params.get('q')).toBe('test search');
    });
  });

  describe('searchParamsToFilters', () => {
    it('should convert search params to filters', () => {
      const params = new URLSearchParams('q=test&category=cat-1&tags=tag1,tag2&sort=title&order=asc');
      const filters = searchParamsToFilters(params);
      
      expect(filters).toEqual({
        query: 'test',
        categoryId: 'cat-1',
        tags: ['tag1', 'tag2'],
        sortBy: 'title',
        sortOrder: 'asc'
      });
    });

    it('should handle string input', () => {
      const filters = searchParamsToFilters('?q=test&category=cat-1');
      
      expect(filters).toEqual({
        query: 'test',
        categoryId: 'cat-1'
      });
    });

    it('should handle empty params', () => {
      const filters = searchParamsToFilters(new URLSearchParams());
      
      expect(filters).toEqual({});
    });

    it('should validate sort parameters', () => {
      const params = new URLSearchParams('sort=invalid&order=invalid');
      const filters = searchParamsToFilters(params);
      
      expect(filters.sortBy).toBeUndefined();
      expect(filters.sortOrder).toBeUndefined();
    });

    it('should filter empty tags', () => {
      const params = new URLSearchParams('tags=tag1,,tag2,');
      const filters = searchParamsToFilters(params);
      
      expect(filters.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('updateUrlWithFilters', () => {
    it('should update URL with filters', () => {
      const filters: SearchFilters = {
        query: 'test',
        categoryId: 'cat-1'
      };

      updateUrlWithFilters(filters);
      
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/?q=test&category=cat-1'
      );
    });

    it('should replace URL when specified', () => {
      const filters: SearchFilters = {
        query: 'test'
      };

      updateUrlWithFilters(filters, true);
      
      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        '/?q=test'
      );
    });

    it('should clear URL when no filters', () => {
      const filters: SearchFilters = {};

      updateUrlWithFilters(filters);
      
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/'
      );
    });
  });

  describe('getFiltersFromUrl', () => {
    it('should get filters from current URL', () => {
      mockWindow.location.search = '?q=test&category=cat-1';
      
      const filters = getFiltersFromUrl();
      
      expect(filters).toEqual({
        query: 'test',
        categoryId: 'cat-1'
      });
    });

    it('should return empty object for no search params', () => {
      mockWindow.location.search = '';
      
      const filters = getFiltersFromUrl();
      
      expect(filters).toEqual({});
    });
  });

  describe('clearUrlFilters', () => {
    it('should clear URL filters', () => {
      mockWindow.location.href = 'http://localhost:3000/?q=test&category=cat-1';
      mockWindow.location.pathname = '/';
      
      clearUrlFilters();
      
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/'
      );
    });

    it('should replace URL when specified', () => {
      clearUrlFilters(true);
      
      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        '/'
      );
    });
  });
});