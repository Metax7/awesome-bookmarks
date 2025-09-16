import { Bookmark, Category } from '@prisma/client';
import { BookmarkWithCategory } from '@/lib/types/bookmark';

/**
 * Utility functions for data manipulation and formatting
 */

// Date formatting utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min. ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} h. ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} d. ago`;
  } else {
    return formatDate(date);
  }
};

// URL utilities
export const extractDomain = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const getFaviconUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return '';
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Tag utilities
export const normalizeTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
    .sort();
};

export const parseTagsFromString = (tagsString: string): string[] => {
  return tagsString
    .split(/[,\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

export const formatTagsForDisplay = (tags: string[]): string => {
  return tags.join(', ');
};

// Search utilities
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const createSearchIndex = (bookmarks: BookmarkWithCategory[]): Map<string, BookmarkWithCategory[]> => {
  const index = new Map<string, BookmarkWithCategory[]>();
  
  bookmarks.forEach(bookmark => {
    const words = [
      ...bookmark.title.toLowerCase().split(/\s+/),
      ...(bookmark.description?.toLowerCase().split(/\s+/) || []),
      ...bookmark.url.toLowerCase().split(/[\/\-\._]/),
      ...(bookmark.tags.map(tag => tag.toLowerCase()) || [])
    ];
    
    words.forEach(word => {
      if (word.length > 2) { // Only index words longer than 2 characters
        if (!index.has(word)) {
          index.set(word, []);
        }
        const bookmarkList = index.get(word)!;
        if (!bookmarkList.find(b => b.id === bookmark.id)) {
          bookmarkList.push(bookmark);
        }
      }
    });
  });
  
  return index;
};

// Category utilities
export const getCategoryColor = (category: Category): string => {
  return category.color || '#3B82F6';
};

export const getCategoryIcon = (category: Category): string => {
  return category.icon || 'bookmark';
};

export const sortCategoriesByName = (categories: Category[]): Category[] => {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
};

// Bookmark utilities
export const sortBookmarksByDate = (bookmarks: BookmarkWithCategory[], ascending: boolean = false): BookmarkWithCategory[] => {
  return [...bookmarks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortBookmarksByTitle = (bookmarks: BookmarkWithCategory[]): BookmarkWithCategory[] => {
  return [...bookmarks].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
};

export const groupBookmarksByCategory = (bookmarks: BookmarkWithCategory[], categories: Category[]): Map<Category, BookmarkWithCategory[]> => {
  const grouped = new Map<Category, BookmarkWithCategory[]>();
  
  categories.forEach(category => {
    const categoryBookmarks = bookmarks.filter(bookmark => bookmark.categoryId === category.id);
    if (categoryBookmarks.length > 0) {
      grouped.set(category, categoryBookmarks);
    }
  });
  
  return grouped;
};

// Data validation utilities
export const sanitizeBookmarkData = (bookmark: Partial<Bookmark>) => {
  return {
    ...bookmark,
    title: bookmark.title?.trim(),
    description: bookmark.description?.trim() || null,
    url: bookmark.url?.trim(),
    tags: bookmark.tags ? (Array.isArray(bookmark.tags) ? normalizeTags(bookmark.tags) : bookmark.tags) : undefined,
  };
};

export const sanitizeCategoryData = (category: Partial<Category>): Partial<Category> => {
  return {
    ...category,
    name: category.name?.trim(),
    color: category.color?.toUpperCase(),
    icon: category.icon?.trim() || null,
  };
};

// Export/Import utilities
export const generateExportFilename = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return `bookmarks-export-${dateStr}.json`;
};

export const validateImportData = (data: any): { valid: boolean; error?: string } => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' };
  }
  
  if (!Array.isArray(data.bookmarks) || !Array.isArray(data.categories)) {
    return { valid: false, error: 'Missing required fields bookmarks or categories' };
  }
  
  // Basic validation of bookmark structure
  for (const bookmark of data.bookmarks) {
    if (!bookmark.id || !bookmark.title || !bookmark.url || !bookmark.categoryId) {
      return { valid: false, error: 'Invalid bookmark structure' };
    }
  }
  
  // Basic validation of category structure
  for (const category of data.categories) {
    if (!category.id || !category.name) {
      return { valid: false, error: 'Invalid category structure' };
    }
  }
  
  return { valid: true };
};