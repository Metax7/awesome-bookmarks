import { prisma } from './prisma';
import { 
  BookmarkCreateInput, 
  BookmarkUpdateInput, 
  CategoryCreateInput, 
  CategoryUpdateInput,
  SearchFilters,
  BookmarkSearchResult,
  BookmarkWithCategory,
  CategoryWithBookmarkCount,
  PaginationOptions,
  PaginatedResult
} from '@/lib/types/bookmark';
import { Bookmark, Category } from '@prisma/client';

// Helper functions for tag serialization
function serializeTags(tags: string[] | undefined): string {
  return JSON.stringify(tags || []);
}

function deserializeTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

// Transform database bookmark to BookmarkWithCategory
function transformBookmark(bookmark: any): BookmarkWithCategory { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    ...bookmark,
    tags: deserializeTags(bookmark.tags),
    description: bookmark.description || null,
  };
}

// Error handling wrapper
const handleDatabaseError = <T>(operation: () => Promise<T>) => {
  return async (): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      console.error('Database operation failed:', error);
      throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
};

// Bookmark operations
export const bookmarkOperations = {
  async getAll(): Promise<BookmarkWithCategory[]> {
    return handleDatabaseError(async () => {
      const bookmarks = await prisma.bookmark.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return bookmarks.map(transformBookmark);
    })();
  },

  async getById(id: string): Promise<BookmarkWithCategory | null> {
    return handleDatabaseError(async () => {
      const bookmark = await prisma.bookmark.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });
      return bookmark ? transformBookmark(bookmark) : null;
    })();
  },

  async getByCategory(categoryId: string): Promise<BookmarkWithCategory[]> {
    return handleDatabaseError(async () => {
      const bookmarks = await prisma.bookmark.findMany({
        where: { categoryId },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return bookmarks.map(transformBookmark);
    })();
  },

  async create(bookmark: BookmarkCreateInput): Promise<string> {
    return handleDatabaseError(async () => {
      const created = await prisma.bookmark.create({
        data: {
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          categoryId: bookmark.categoryId,
          favicon: bookmark.favicon,
          tags: serializeTags(bookmark.tags),
        },
      });
      
      return created.id;
    })();
  },

  async update(id: string, updates: BookmarkUpdateInput): Promise<void> {
    return handleDatabaseError(async () => {
      const existing = await prisma.bookmark.findUnique({
        where: { id },
      });
      
      if (!existing) {
        throw new Error(`Bookmark with id ${id} not found`);
      }

      await prisma.bookmark.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.url !== undefined && { url: updates.url }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.categoryId !== undefined && { categoryId: updates.categoryId }),
          ...(updates.favicon !== undefined && { favicon: updates.favicon }),
          ...(updates.tags !== undefined && { tags: serializeTags(updates.tags) }),
        },
      });
    })();
  },

  async delete(id: string): Promise<void> {
    return handleDatabaseError(async () => {
      const existing = await prisma.bookmark.findUnique({
        where: { id },
      });
      
      if (!existing) {
        throw new Error(`Bookmark with id ${id} not found`);
      }

      await prisma.bookmark.delete({
        where: { id },
      });
    })();
  },

  async search(filters: SearchFilters, pagination?: PaginationOptions): Promise<BookmarkSearchResult> {
    return handleDatabaseError(async () => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.query) {
        const searchTerms = filters.query.trim().split(/\s+/).filter(term => term.length > 0);
        
        // Create OR conditions for each search term across all searchable fields
        where.OR = searchTerms.flatMap(term => [
          {
            title: {
              contains: term,
            },
          },
          {
            description: {
              contains: term,
            },
          },
          {
            url: {
              contains: term,
            },
          },
          {
            tags: {
              contains: term,
            },
          },
        ]);
      }

      if (filters.tags && filters.tags.length > 0) {
        // For SQLite, we'll search for tags in the JSON string
        const tagConditions = filters.tags.map(tag => ({
          tags: {
            contains: `"${tag}"`,
          },
        }));
        
        // Use AND logic for tag filters (bookmark must have all specified tags)
        where.AND = tagConditions;
      }

      // Build order by clause
      const orderBy: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (filters.sortBy) {
        orderBy[filters.sortBy] = filters.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [bookmarks, totalCount] = await Promise.all([
        prisma.bookmark.findMany({
          where,
          include: {
            category: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.bookmark.count({ where }),
      ]);

      return {
        bookmarks: bookmarks.map(transformBookmark),
        totalCount,
        hasMore: skip + limit < totalCount,
      };
    })();
  },

  async getByTags(tags: string[]): Promise<BookmarkWithCategory[]> {
    return handleDatabaseError(async () => {
      const tagConditions = tags.map(tag => ({
        tags: {
          contains: `"${tag}"`,
        },
      }));
      
      const bookmarks = await prisma.bookmark.findMany({
        where: {
          OR: tagConditions,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return bookmarks.map(transformBookmark);
    })();
  },

  async getAllTags(): Promise<string[]> {
    return handleDatabaseError(async () => {
      const bookmarks = await prisma.bookmark.findMany({
        select: {
          tags: true,
        },
      });
      
      const allTags = bookmarks.flatMap(bookmark => deserializeTags(bookmark.tags));
      return [...new Set(allTags)].sort();
    })();
  },

  async getRecentBookmarks(limit: number = 10): Promise<BookmarkWithCategory[]> {
    return handleDatabaseError(async () => {
      const bookmarks = await prisma.bookmark.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      return bookmarks.map(transformBookmark);
    })();
  },

  async getPaginated(pagination: PaginationOptions): Promise<PaginatedResult<BookmarkWithCategory>> {
    return handleDatabaseError(async () => {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const skip = (page - 1) * limit;

      const [bookmarks, totalCount] = await Promise.all([
        prisma.bookmark.findMany({
          include: {
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.bookmark.count(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: bookmarks.map(transformBookmark),
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    })();
  },
};

// Category operations
export const categoryOperations = {
  async getAll(): Promise<Category[]> {
    return handleDatabaseError(async () => {
      return await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    })();
  },

  async getById(id: string): Promise<Category | null> {
    return handleDatabaseError(async () => {
      return await prisma.category.findUnique({
        where: { id },
      });
    })();
  },

  async create(category: CategoryCreateInput): Promise<string> {
    return handleDatabaseError(async () => {
      const created = await prisma.category.create({
        data: {
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
      });
      
      return created.id;
    })();
  },

  async update(id: string, updates: CategoryUpdateInput): Promise<void> {
    return handleDatabaseError(async () => {
      const existing = await prisma.category.findUnique({
        where: { id },
      });
      
      if (!existing) {
        throw new Error(`Category with id ${id} not found`);
      }

      await prisma.category.update({
        where: { id },
        data: {
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.color !== undefined && { color: updates.color }),
          ...(updates.icon !== undefined && { icon: updates.icon }),
        },
      });
    })();
  },

  async delete(id: string): Promise<void> {
    return handleDatabaseError(async () => {
      const existing = await prisma.category.findUnique({
        where: { id },
      });
      
      if (!existing) {
        throw new Error(`Category with id ${id} not found`);
      }

      // Check if category has bookmarks
      const bookmarksInCategory = await prisma.bookmark.count({
        where: { categoryId: id },
      });
      
      if (bookmarksInCategory > 0) {
        throw new Error('Cannot delete category that contains bookmarks');
      }

      await prisma.category.delete({
        where: { id },
      });
    })();
  },

  async getBookmarkCount(categoryId: string): Promise<number> {
    return handleDatabaseError(async () => {
      return await prisma.bookmark.count({
        where: { categoryId },
      });
    })();
  },

  async getCategoriesWithCounts(): Promise<CategoryWithBookmarkCount[]> {
    return handleDatabaseError(async () => {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        bookmarkCount: category._count.bookmarks,
      }));
    })();
  },
};

// Utility operations
export const utilityOperations = {
  async exportData(): Promise<{ bookmarks: Bookmark[]; categories: Category[] }> {
    return handleDatabaseError(async () => {
      const [bookmarks, categories] = await Promise.all([
        prisma.bookmark.findMany(),
        prisma.category.findMany(),
      ]);
      
      return { bookmarks, categories };
    })();
  },

  async importData(data: { bookmarks: Bookmark[]; categories: Category[] }): Promise<void> {
    return handleDatabaseError(async () => {
      await prisma.$transaction(async (tx) => {
        // Clear existing data
        await tx.bookmark.deleteMany();
        await tx.category.deleteMany();
        
        // Import categories first
        await tx.category.createMany({
          data: data.categories,
        });
        
        // Import bookmarks
        await tx.bookmark.createMany({
          data: data.bookmarks,
        });
      });
    })();
  },

  async clearAllData(): Promise<void> {
    return handleDatabaseError(async () => {
      await prisma.$transaction(async (tx) => {
        await tx.bookmark.deleteMany();
        await tx.category.deleteMany();
      });
    })();
  },

  async getDatabaseStats(): Promise<{ bookmarkCount: number; categoryCount: number; totalTags: number }> {
    return handleDatabaseError(async () => {
      const [bookmarkCount, categoryCount, allTags] = await Promise.all([
        prisma.bookmark.count(),
        prisma.category.count(),
        bookmarkOperations.getAllTags(),
      ]);
      
      return {
        bookmarkCount,
        categoryCount,
        totalTags: allTags.length,
      };
    })();
  },

  async seedDefaultCategories(): Promise<void> {
    return handleDatabaseError(async () => {
      const existingCategories = await prisma.category.count();
      
      if (existingCategories === 0) {
        await prisma.category.createMany({
          data: [
            {
              name: 'General',
              color: '#3B82F6',
              icon: 'bookmark',
            },
            {
              name: 'Work',
              color: '#10B981',
              icon: 'briefcase',
            },
            {
              name: 'Learning',
              color: '#F59E0B',
              icon: 'graduation-cap',
            },
            {
              name: 'Entertainment',
              color: '#EF4444',
              icon: 'gamepad-2',
            },
          ],
        });
      }
    })();
  },
};