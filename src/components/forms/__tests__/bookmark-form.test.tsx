import { describe, it, expect } from 'vitest';
import { bookmarkSchema } from '@/lib/utils/validation';
import { normalizeUrl, isValidUrl } from '@/lib/utils/url-parser';

describe('BookmarkForm Validation', () => {
  it('validates bookmark schema correctly', () => {
    const validData = {
      url: 'https://example.com',
      title: 'Test Bookmark',
      description: 'Test description',
      categoryId: 'category-1',
      tags: ['tag1', 'tag2'],
    };

    const result = bookmarkSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL', () => {
    const invalidData = {
      url: 'not-a-url',
      categoryId: 'category-1',
    };

    const result = bookmarkSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects missing category', () => {
    const invalidData = {
      url: 'https://example.com',
      categoryId: '',
    };

    const result = bookmarkSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('URL Utilities', () => {
  it('normalizes URLs correctly', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('validates URLs correctly', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});