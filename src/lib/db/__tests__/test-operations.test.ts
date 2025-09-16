import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../prisma";
import { bookmarkOperations, categoryOperations } from "../operations";

describe("Database Operations", () => {
  let testCategoryId: string;

  beforeAll(async () => {
    // Connect to database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.bookmark.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.bookmark.deleteMany();
    await prisma.category.deleteMany();

    // Create a test category
    testCategoryId = await categoryOperations.create({
      name: "Test Category",
      color: "#3B82F6",
      icon: "test",
    });
  });

  describe("Category Operations", () => {
    it("should create a category", async () => {
      const categoryId = await categoryOperations.create({
        name: "Work",
        color: "#10B981",
        icon: "briefcase",
      });

      expect(categoryId).toBeDefined();
      expect(typeof categoryId).toBe("string");

      const category = await categoryOperations.getById(categoryId);
      expect(category).toBeDefined();
      expect(category?.name).toBe("Work");
      expect(category?.color).toBe("#10B981");
    });

    it("should get all categories", async () => {
      await categoryOperations.create({
        name: "Personal",
        color: "#EF4444",
        icon: "user",
      });

      const categories = await categoryOperations.getAll();
      expect(categories.length).toBeGreaterThanOrEqual(2); // Including the test category
    });

    it("should update a category", async () => {
      await categoryOperations.update(testCategoryId, {
        name: "Updated Category",
        color: "#F59E0B",
      });

      const category = await categoryOperations.getById(testCategoryId);
      expect(category?.name).toBe("Updated Category");
      expect(category?.color).toBe("#F59E0B");
    });

    it("should get categories with bookmark counts", async () => {
      // Create a bookmark in the test category
      await bookmarkOperations.create({
        title: "Test Bookmark",
        url: "https://example.com",
        categoryId: testCategoryId,
      });

      const categoriesWithCounts =
        await categoryOperations.getCategoriesWithCounts();
      const testCategory = categoriesWithCounts.find(
        (c) => c.id === testCategoryId
      );

      expect(testCategory).toBeDefined();
      expect(testCategory?.bookmarkCount).toBe(1);
    });
  });

  describe("Bookmark Operations", () => {
    it("should create a bookmark", async () => {
      const bookmarkId = await bookmarkOperations.create({
        title: "Example Site",
        url: "https://example.com",
        description: "A test website",
        categoryId: testCategoryId,
        tags: ["test", "example"],
      });

      expect(bookmarkId).toBeDefined();
      expect(typeof bookmarkId).toBe("string");

      const bookmark = await bookmarkOperations.getById(bookmarkId);
      expect(bookmark).toBeDefined();
      expect(bookmark?.title).toBe("Example Site");
      expect(bookmark?.url).toBe("https://example.com");
      expect(bookmark?.tags).toEqual(["test", "example"]);
    });

    it("should get all bookmarks", async () => {
      await bookmarkOperations.create({
        title: "Site 1",
        url: "https://site1.com",
        categoryId: testCategoryId,
      });

      await bookmarkOperations.create({
        title: "Site 2",
        url: "https://site2.com",
        categoryId: testCategoryId,
      });

      const bookmarks = await bookmarkOperations.getAll();
      expect(bookmarks.length).toBe(2);
    });

    it("should update a bookmark", async () => {
      const bookmarkId = await bookmarkOperations.create({
        title: "Original Title",
        url: "https://example.com",
        categoryId: testCategoryId,
      });

      await bookmarkOperations.update(bookmarkId, {
        title: "Updated Title",
        description: "Updated description",
      });

      const bookmark = await bookmarkOperations.getById(bookmarkId);
      expect(bookmark?.title).toBe("Updated Title");
      expect(bookmark?.description).toBe("Updated description");
    });

    it("should delete a bookmark", async () => {
      const bookmarkId = await bookmarkOperations.create({
        title: "To Delete",
        url: "https://example.com",
        categoryId: testCategoryId,
      });

      await bookmarkOperations.delete(bookmarkId);

      const bookmark = await bookmarkOperations.getById(bookmarkId);
      expect(bookmark).toBeNull();
    });

    it("should search bookmarks", async () => {
      await bookmarkOperations.create({
        title: "JavaScript Tutorial",
        url: "https://js-tutorial.com",
        description: "Learn JavaScript programming",
        categoryId: testCategoryId,
        tags: ["javascript", "programming"],
      });

      await bookmarkOperations.create({
        title: "Python Guide",
        url: "https://python-guide.com",
        description: "Python programming guide",
        categoryId: testCategoryId,
        tags: ["python", "programming"],
      });

      const searchResult = await bookmarkOperations.search({
        query: "JavaScript",
      });

      expect(searchResult.bookmarks.length).toBe(1);
      expect(searchResult.bookmarks[0].title).toBe("JavaScript Tutorial");
    });

    it("should get bookmarks by category", async () => {
      // Create another category
      const category2Id = await categoryOperations.create({
        name: "Category 2",
        color: "#EF4444",
      });

      await bookmarkOperations.create({
        title: "Bookmark 1",
        url: "https://example1.com",
        categoryId: testCategoryId,
      });

      await bookmarkOperations.create({
        title: "Bookmark 2",
        url: "https://example2.com",
        categoryId: category2Id,
      });

      const bookmarksInCategory1 = await bookmarkOperations.getByCategory(
        testCategoryId
      );
      const bookmarksInCategory2 = await bookmarkOperations.getByCategory(
        category2Id
      );

      expect(bookmarksInCategory1.length).toBe(1);
      expect(bookmarksInCategory2.length).toBe(1);
      expect(bookmarksInCategory1[0].title).toBe("Bookmark 1");
      expect(bookmarksInCategory2[0].title).toBe("Bookmark 2");
    });

    it("should get all tags", async () => {
      await bookmarkOperations.create({
        title: "Site 1",
        url: "https://site1.com",
        categoryId: testCategoryId,
        tags: ["javascript", "web"],
      });

      await bookmarkOperations.create({
        title: "Site 2",
        url: "https://site2.com",
        categoryId: testCategoryId,
        tags: ["python", "web"],
      });

      const allTags = await bookmarkOperations.getAllTags();
      expect(allTags).toContain("javascript");
      expect(allTags).toContain("python");
      expect(allTags).toContain("web");
      expect(allTags.length).toBe(3);
    });

    it("should get paginated bookmarks", async () => {
      // Create multiple bookmarks
      for (let i = 1; i <= 25; i++) {
        await bookmarkOperations.create({
          title: `Bookmark ${i}`,
          url: `https://example${i}.com`,
          categoryId: testCategoryId,
        });
      }

      const page1 = await bookmarkOperations.getPaginated({
        page: 1,
        limit: 10,
      });
      const page2 = await bookmarkOperations.getPaginated({
        page: 2,
        limit: 10,
      });

      expect(page1.data.length).toBe(10);
      expect(page1.totalCount).toBe(25);
      expect(page1.totalPages).toBe(3);
      expect(page1.hasNextPage).toBe(true);
      expect(page1.hasPreviousPage).toBe(false);

      expect(page2.data.length).toBe(10);
      expect(page2.hasNextPage).toBe(true);
      expect(page2.hasPreviousPage).toBe(true);
    });
  });
});
