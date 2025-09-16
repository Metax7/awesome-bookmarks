import { prisma } from "../db/prisma";
import {
  BookmarkCreateInput,
  BookmarkUpdateInput,
  CategoryCreateInput,
  CategoryUpdateInput,
  PaginationOptions,
  PaginatedResult,
  BookmarkWithCategory,
  CategoryWithBookmarkCount,
} from "../types/bookmark";

// Bookmark utility functions
export class BookmarkUtils {
  // Create a new bookmark
  static async create(data: BookmarkCreateInput) {
    const bookmark = await prisma.bookmark.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags || []),
      },
      include: {
        category: true,
      },
    });

    return {
      ...bookmark,
      description: bookmark.description || null,
      favicon: bookmark.favicon || null,
      tags: JSON.parse(bookmark.tags || "[]"),
      category: {
        ...bookmark.category,
        icon: bookmark.category.icon || null,
      },
    };
  }

  // Get bookmark by ID with category
  static async getById(id: string): Promise<BookmarkWithCategory | null> {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!bookmark) return null;

    return {
      ...bookmark,
      description: bookmark.description || null,
      favicon: bookmark.favicon || null,
      tags: JSON.parse(bookmark.tags || "[]"),
      category: {
        ...bookmark.category,
        icon: bookmark.category.icon || null,
      },
    };
  }

  // Update bookmark
  static async update(id: string, data: BookmarkUpdateInput) {
    const updateData: any = {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      ...data,
      ...(data.tags !== undefined && { tags: JSON.stringify(data.tags) }),
    };

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return {
      ...bookmark,
      description: bookmark.description || null,
      favicon: bookmark.favicon || null,
      tags: JSON.parse(bookmark.tags || "[]"),
      category: {
        ...bookmark.category,
        icon: bookmark.category.icon || null,
      },
    };
  }

  // Delete bookmark
  static async delete(id: string) {
    return await prisma.bookmark.delete({
      where: { id },
    });
  }

  // Get bookmarks with pagination and filtering
  static async getMany(options: {
    categoryId?: string;
    search?: string;
    tags?: string[];
    pagination?: PaginationOptions;
    sortBy?: "createdAt" | "updatedAt" | "title" | "url";
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResult<BookmarkWithCategory>> {
    const {
      categoryId,
      search,
      tags,
      pagination = { page: 1, limit: 20 },
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { url: { contains: search } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Get total count
    const totalCount = await prisma.bookmark.count({ where });

    // Get bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: bookmarks.map((bookmark) => ({
        ...bookmark,
        description: bookmark.description || null,
        favicon: bookmark.favicon || null,
        tags: JSON.parse(bookmark.tags || "[]"),
        category: {
          ...bookmark.category,
          icon: bookmark.category.icon || null,
        },
      })),
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // Get all unique tags
  static async getAllTags(): Promise<string[]> {
    const bookmarks = await prisma.bookmark.findMany({
      select: { tags: true },
    });

    const allTags = bookmarks.flatMap((bookmark) => bookmark.tags);
    return [...new Set(allTags)].sort();
  }
}

// Category utility functions
export class CategoryUtils {
  // Create a new category
  static async create(data: CategoryCreateInput) {
    return await prisma.category.create({
      data,
    });
  }

  // Get category by ID
  static async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
    });
  }

  // Update category
  static async update(id: string, data: CategoryUpdateInput) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  // Delete category (will cascade delete bookmarks)
  static async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }

  // Get all categories with bookmark counts
  static async getAll(): Promise<CategoryWithBookmarkCount[]> {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon || null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      bookmarkCount: category._count.bookmarks,
    }));
  }

  // Check if category name is unique (excluding current category)
  static async isNameUnique(
    name: string,
    excludeId?: string
  ): Promise<boolean> {
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !existing;
  }
}

// General database utilities
export class DatabaseUtils {
  // Initialize database with default data
  static async initialize() {
    try {
      // Check if we have any categories
      const categoryCount = await prisma.category.count();

      if (categoryCount === 0) {
        // Create default categories
        await prisma.category.createMany({
          data: [
            {
              name: "General",
              color: "#3B82F6",
              icon: "bookmark",
            },
            {
              name: "Work",
              color: "#10B981",
              icon: "briefcase",
            },
            {
              name: "Learning",
              color: "#F59E0B",
              icon: "academic-cap",
            },
          ],
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      return false;
    }
  }

  // Get database statistics
  static async getStats() {
    const [bookmarkCount, categoryCount] = await Promise.all([
      prisma.bookmark.count(),
      prisma.category.count(),
    ]);

    return {
      bookmarks: bookmarkCount,
      categories: categoryCount,
    };
  }

  // Search across all content
  static async globalSearch(query: string, limit = 10) {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { url: { contains: query } },
          { tags: { contains: query } },
        ],
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return bookmarks.map((bookmark) => ({
      ...bookmark,
      description: bookmark.description || null,
      favicon: bookmark.favicon || null,
      tags: JSON.parse(bookmark.tags || "[]"),
      category: {
        ...bookmark.category,
        icon: bookmark.category.icon || null,
      },
    }));
  }
}
