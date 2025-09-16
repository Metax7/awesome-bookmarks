export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryId: string;
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  createdAt: Date;
}

export interface BookmarkFormData {
  url: string;
  title?: string;
  description?: string;
  categoryId: string;
  tags?: string[];
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon?: string | null;
}

// Extended types for UI components
export interface BookmarkWithCategory {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  };
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'url';
  sortOrder?: 'asc' | 'desc';
}

export interface BookmarkSearchResult {
  bookmarks: BookmarkWithCategory[];
  totalCount: number;
  hasMore: boolean;
}

export interface CategoryWithBookmarkCount {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookmarkCount: number;
}

// Input types for database operations
export interface BookmarkCreateInput {
  title: string;
  url: string;
  description?: string;
  categoryId: string;
  favicon?: string;
  tags?: string[];
}

export interface BookmarkUpdateInput {
  title?: string;
  url?: string;
  description?: string;
  categoryId?: string;
  favicon?: string;
  tags?: string[];
}

export interface CategoryCreateInput {
  name: string;
  color: string;
  icon?: string | null;
}

export interface CategoryUpdateInput {
  name?: string;
  color?: string;
  icon?: string | null;
}

// Pagination types
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}