import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatRelativeTime,
  extractDomain,
  getFaviconUrl,
  isValidUrl,
  normalizeTags,
  parseTagsFromString,
  highlightSearchTerm,
  sanitizeBookmarkData,
  sanitizeCategoryData,
  validateImportData,
} from "../data-helpers";

describe("Data Helpers", () => {
  describe("Date formatting", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = formatDate(date);
      expect(formatted).toContain("2024");
    });

    it("should format relative time for recent dates", () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      const result = formatRelativeTime(thirtySecondsAgo);
      expect(result).toBe("just now");
    });
  });

  describe("URL utilities", () => {
    it("should extract domain correctly", () => {
      expect(extractDomain("https://www.example.com/path")).toBe("example.com");
      expect(extractDomain("https://subdomain.example.com")).toBe(
        "subdomain.example.com"
      );
    });

    it("should generate favicon URL", () => {
      const faviconUrl = getFaviconUrl("https://example.com");
      expect(faviconUrl).toContain("google.com/s2/favicons");
      expect(faviconUrl).toContain("example.com");
    });

    it("should validate URLs correctly", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false);
    });
  });

  describe("Tag utilities", () => {
    it("should normalize tags", () => {
      const tags = ["  Work  ", "PERSONAL", "work", "personal"];
      const normalized = normalizeTags(tags);
      expect(normalized).toEqual(["personal", "work"]);
    });

    it("should parse tags from string", () => {
      const tagsString = "work, personal,  development   test";
      const parsed = parseTagsFromString(tagsString);
      expect(parsed).toEqual(["work", "personal", "development", "test"]);
    });
  });

  describe("Search utilities", () => {
    it("should highlight search terms", () => {
      const text = "This is a test string";
      const highlighted = highlightSearchTerm(text, "test");
      expect(highlighted).toContain("<mark>test</mark>");
    });

    it("should handle empty search term", () => {
      const text = "This is a test string";
      const highlighted = highlightSearchTerm(text, "");
      expect(highlighted).toBe(text);
    });
  });

  describe("Data sanitization", () => {
    it("should sanitize bookmark data", () => {
      const bookmark = {
        title: "  Test Title  ",
        description: "  Test Description  ",
        url: "  https://example.com  ",
        tags: ["  work  ", "PERSONAL", "work"],
      };

      const sanitized = sanitizeBookmarkData(bookmark);
      expect(sanitized.title).toBe("Test Title");
      expect(sanitized.description).toBe("Test Description");
      expect(sanitized.url).toBe("https://example.com");
      expect(sanitized.tags).toEqual(["personal", "work"]);
    });

    it("should sanitize category data", () => {
      const category = {
        name: "  Work Category  ",
        color: "#3b82f6",
        icon: "  briefcase  ",
      };

      const sanitized = sanitizeCategoryData(category);
      expect(sanitized.name).toBe("Work Category");
      expect(sanitized.color).toBe("#3B82F6");
      expect(sanitized.icon).toBe("briefcase");
    });
  });

  describe("Import validation", () => {
    it("should validate correct import data", () => {
      const validData = {
        bookmarks: [
          {
            id: "1",
            title: "Test",
            url: "https://example.com",
            categoryId: "cat1",
          },
        ],
        categories: [
          {
            id: "cat1",
            name: "Test Category",
          },
        ],
      };

      const result = validateImportData(validData);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid import data", () => {
      const invalidData = {
        bookmarks: [
          {
            id: "1",
            // missing required fields
          },
        ],
        categories: [],
      };

      const result = validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
