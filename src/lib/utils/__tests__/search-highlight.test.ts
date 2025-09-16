import { describe, it, expect } from 'vitest';
import { 
  highlightMatches, 
  containsQuery, 
  highlightMultipleQueries,
  createSearchExcerpt 
} from '../search-highlight';

describe('Search Highlight Utilities', () => {
  describe('highlightMatches', () => {
    it('should highlight single match', () => {
      const result = highlightMatches('Hello world', 'world');
      expect(result).toEqual([
        { text: 'Hello ', isMatch: false },
        { text: 'world', isMatch: true }
      ]);
    });

    it('should highlight multiple matches', () => {
      const result = highlightMatches('Hello world, world!', 'world');
      expect(result).toEqual([
        { text: 'Hello ', isMatch: false },
        { text: 'world', isMatch: true },
        { text: ', ', isMatch: false },
        { text: 'world', isMatch: true },
        { text: '!', isMatch: false }
      ]);
    });

    it('should handle case insensitive search', () => {
      const result = highlightMatches('Hello World', 'world', false);
      expect(result).toEqual([
        { text: 'Hello ', isMatch: false },
        { text: 'World', isMatch: true }
      ]);
    });

    it('should handle empty query', () => {
      const result = highlightMatches('Hello world', '');
      expect(result).toEqual([
        { text: 'Hello world', isMatch: false }
      ]);
    });

    it('should handle no matches', () => {
      const result = highlightMatches('Hello world', 'xyz');
      expect(result).toEqual([
        { text: 'Hello world', isMatch: false }
      ]);
    });
  });

  describe('containsQuery', () => {
    it('should return true for matching text', () => {
      expect(containsQuery('Hello world', 'world')).toBe(true);
    });

    it('should return false for non-matching text', () => {
      expect(containsQuery('Hello world', 'xyz')).toBe(false);
    });

    it('should handle case insensitive search', () => {
      expect(containsQuery('Hello World', 'world', false)).toBe(true);
    });

    it('should handle case sensitive search', () => {
      expect(containsQuery('Hello World', 'world', true)).toBe(false);
    });
  });

  describe('highlightMultipleQueries', () => {
    it('should highlight multiple different queries', () => {
      const result = highlightMultipleQueries('Hello world test', ['world', 'test']);
      expect(result).toEqual([
        { text: 'Hello ', isMatch: false },
        { text: 'world', isMatch: true, queryIndex: 0 },
        { text: ' ', isMatch: false },
        { text: 'test', isMatch: true, queryIndex: 1 }
      ]);
    });

    it('should handle empty queries array', () => {
      const result = highlightMultipleQueries('Hello world', []);
      expect(result).toEqual([
        { text: 'Hello world', isMatch: false }
      ]);
    });
  });

  describe('createSearchExcerpt', () => {
    it('should create excerpt around match', () => {
      const longText = 'This is a very long text that contains the word JavaScript in the middle of it and continues for a while after that.';
      const result = createSearchExcerpt(longText, 'JavaScript', 50);
      
      expect(result.some(segment => segment.isMatch && segment.text === 'JavaScript')).toBe(true);
      expect(result.map(segment => segment.text).join('').length).toBeLessThanOrEqual(60); // Some buffer for ellipsis
    });

    it('should return truncated text when no match', () => {
      const longText = 'This is a very long text that does not contain the search term and continues for a while.';
      const result = createSearchExcerpt(longText, 'xyz', 50);
      
      expect(result).toEqual([
        { text: longText.slice(0, 50), isMatch: false }
      ]);
    });

    it('should handle short text', () => {
      const shortText = 'Short text with JavaScript';
      const result = createSearchExcerpt(shortText, 'JavaScript', 100);
      
      expect(result).toEqual([
        { text: 'Short text with ', isMatch: false },
        { text: 'JavaScript', isMatch: true }
      ]);
    });
  });
});