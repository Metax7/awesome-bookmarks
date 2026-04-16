import { z } from "zod";

// Bookmark validation schema
export const bookmarkSchema = z.object({
  url: z.url("Enter a valid URL").min(1, "URL is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  categoryId: z.string().min(1, "Select a category"),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags")
    .optional(),
  favicon: z.string().optional().nullable(),
});

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Name must not exceed 50 characters"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format (use #RRGGBB)"),
  icon: z.string().min(1).nullable().optional(),
});

// Update schemas for partial updates
export const bookmarkUpdateSchema = bookmarkSchema.partial();
export const categoryUpdateSchema = categorySchema.partial();

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "url"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Export types inferred from schemas
export type SearchParams = z.infer<typeof searchSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
