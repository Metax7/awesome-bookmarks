/**
 * Utility functions for managing search state in URL parameters
 */

import { SearchFilters } from '@/lib/types/bookmark';

/**
 * Converts search filters to URL search parameters
 * @param filters - The search filters to encode
 * @returns URLSearchParams object
 */
export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.query?.trim()) {
    params.set('q', filters.query.trim());
  }
  
  if (filters.categoryId) {
    params.set('category', filters.categoryId);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  
  if (filters.sortBy) {
    params.set('sort', filters.sortBy);
  }
  
  if (filters.sortOrder && filters.sortOrder !== 'desc') {
    params.set('order', filters.sortOrder);
  }
  
  return params;
}

/**
 * Converts URL search parameters to search filters
 * @param searchParams - URLSearchParams or string to parse
 * @returns SearchFilters object
 */
export function searchParamsToFilters(searchParams: URLSearchParams | string): SearchFilters {
  const params = typeof searchParams === 'string' 
    ? new URLSearchParams(searchParams)
    : searchParams;
  
  const filters: SearchFilters = {};
  
  const query = params.get('q');
  if (query?.trim()) {
    filters.query = query.trim();
  }
  
  const categoryId = params.get('category');
  if (categoryId) {
    filters.categoryId = categoryId;
  }
  
  const tags = params.get('tags');
  if (tags) {
    filters.tags = tags.split(',').filter(tag => tag.trim()).map(tag => tag.trim());
  }
  
  const sortBy = params.get('sort');
  if (sortBy && ['createdAt', 'updatedAt', 'title', 'url'].includes(sortBy)) {
    filters.sortBy = sortBy as SearchFilters['sortBy'];
  }
  
  const sortOrder = params.get('order');
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder as SearchFilters['sortOrder'];
  }
  
  return filters;
}

/**
 * Updates the browser URL with search filters
 * @param filters - The search filters to encode in URL
 * @param replace - Whether to replace the current history entry
 */
export function updateUrlWithFilters(filters: SearchFilters, replace: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  const params = filtersToSearchParams(filters);
  const url = new URL(window.location.href);
  
  // Clear existing search params
  url.search = '';
  
  // Add new params
  params.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  
  const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
  
  if (replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }
}

/**
 * Gets search filters from current URL
 * @returns SearchFilters object from current URL
 */
export function getFiltersFromUrl(): SearchFilters {
  if (typeof window === 'undefined') return {};
  
  return searchParamsToFilters(window.location.search);
}

/**
 * Clears search parameters from URL
 * @param replace - Whether to replace the current history entry
 */
export function clearUrlFilters(replace: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  const newUrl = url.pathname;
  
  if (replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }
}

/**
 * Debounced URL update function
 * @param filters - The search filters to encode in URL
 * @param delay - Delay in milliseconds
 * @returns Cleanup function
 */
export function debouncedUrlUpdate(filters: SearchFilters, delay: number = 500): () => void {
  const timeoutId = setTimeout(() => {
    updateUrlWithFilters(filters, true);
  }, delay);
  
  return () => clearTimeout(timeoutId);
}