import { describe, it, expect } from 'vitest';
import { 
  bookmarkSchema, 
  categorySchema, 
  searchSchema, 
  paginationSchema 
} from '../validation';

describe('Validation Schemas', () => {
  describe('bookmarkSchema', () => {
    it('should validate correct bookmark data', () => {
      const validData = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'A test website',
        categoryId: 'cat-123',
        tags: ['test', 'example']
      };

      const result = bookmarkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidData = {
        url: 'not-a-url',
        categoryId: 'cat-123'
      };

      const result = bookmarkSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing categoryId', () => {
      const invalidData = {
        url: 'https://example.com'
      };

      const result = bookmarkSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('categorySchema', () => {
    it('should validate correct category data', () => {
      const validData = {
        name: 'Work',
        color: '#3B82F6',
        icon: 'briefcase'
      };

      const result = categorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid color format', () => {
      const invalidData = {
        name: 'Work',
        color: 'blue'
      };

      const result = categorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchSchema', () => {
    it('should validate search parameters', () => {
      const validData = {
        query: 'test',
        categoryId: 'cat-123',
        tags: ['work'],
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty search parameters', () => {
      const result = searchSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('paginationSchema', () => {
    it('should validate pagination parameters', () => {
      const validData = {
        page: 1,
        limit: 20
      };

      const result = paginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject invalid page number', () => {
      const invalidData = {
        page: 0,
        limit: 20
      };

      const result = paginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});