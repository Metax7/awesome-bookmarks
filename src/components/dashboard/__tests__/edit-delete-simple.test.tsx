/**
 * Simple tests for edit and delete functionality
 * Tests the core functionality without complex interactions
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BookmarkCard } from "../bookmark-card";
import { BookmarkFormDialog } from "../../forms/bookmark-form-dialog";
import { DeleteBookmarkDialog } from "../delete-bookmark-dialog";
import type { BookmarkWithCategory } from "@/lib/types/bookmark";

// Mock the stores
vi.mock("@/lib/stores/bookmark-store", () => ({
  useBookmarkStore: () => ({
    updateBookmark: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

vi.mock("@/lib/stores/category-store", () => ({
  useCategoryStore: () => ({
    categories: [
      { id: "cat1", name: "Work", color: "#3b82f6", createdAt: new Date() },
      { id: "cat2", name: "Personal", color: "#ef4444", createdAt: new Date() },
    ],
    fetchCategories: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

// Mock URL metadata extraction
vi.mock("@/lib/utils/url-parser", () => ({
  extractUrlMetadata: vi.fn().mockResolvedValue({
    title: "Test Page",
    description: "Test description",
    favicon: "https://example.com/favicon.ico",
  }),
  normalizeUrl: vi.fn((url: string) => url),
}));

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBookmark: BookmarkWithCategory = {
  id: "bookmark1",
  title: "Test Bookmark",
  url: "https://example.com",
  description: "Test description",
  categoryId: "cat1",
  category: {
    id: "cat1",
    name: "Work",
    color: "#3b82f6",
    createdAt: new Date(),
  },
  favicon: "https://example.com/favicon.ico",
  tags: ["test", "example"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Edit and Delete Simple Tests", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnCategoryChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("BookmarkCard Rendering", () => {
    it("should render bookmark card with all information", () => {
      render(
        <BookmarkCard
          bookmark={mockBookmark}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      // Check that bookmark information is displayed
      expect(screen.getByText("Test Bookmark")).toBeInTheDocument();
      expect(screen.getByText("example.com")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
      expect(screen.getByText("test")).toBeInTheDocument();
      expect(screen.getByText("example")).toBeInTheDocument();
      expect(screen.getByText("Work")).toBeInTheDocument();
    });

    it("should render context menu button", () => {
      render(
        <BookmarkCard
          bookmark={mockBookmark}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      // Check that the dropdown menu trigger button exists
      const menuButton = screen.getByRole("button", { expanded: false });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute("aria-haspopup", "menu");
    });
  });

  describe("Edit Modal Functionality", () => {
    it("should render edit modal with correct title and pre-filled data", () => {
      render(
        <BookmarkFormDialog
          bookmark={mockBookmark}
          open={true}
          onOpenChange={vi.fn()}
        />
      );

      // Check that the modal is open with correct title
      expect(screen.getByText("Edit Bookmark")).toBeInTheDocument();
      expect(
        screen.getByText("Modify bookmark information.")
      ).toBeInTheDocument();

      // Check that form fields are pre-filled
      expect(screen.getByDisplayValue(mockBookmark.url)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockBookmark.title)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockBookmark.description!)
      ).toBeInTheDocument();

      // Check that tags are displayed
      expect(screen.getByText("test")).toBeInTheDocument();
      expect(screen.getByText("example")).toBeInTheDocument();
    });

    it("should show update button in edit mode", () => {
      render(
        <BookmarkFormDialog
          bookmark={mockBookmark}
          open={true}
          onOpenChange={vi.fn()}
        />
      );

      expect(
        screen.getByRole("button", { name: /update bookmark/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /add bookmark/i })
      ).not.toBeInTheDocument();
    });

    it("should show add button in create mode", () => {
      render(<BookmarkFormDialog open={true} onOpenChange={vi.fn()} />);

      expect(
        screen.getByRole("button", { name: /add bookmark/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /update bookmark/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Delete Confirmation Dialog", () => {
    it("should render delete confirmation dialog with bookmark information", () => {
      render(
        <DeleteBookmarkDialog
          bookmark={mockBookmark}
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText("Delete Bookmark")).toBeInTheDocument();
      expect(screen.getByText(`"${mockBookmark.title}"`)).toBeInTheDocument();

      // Check for the confirmation text (it might be split across elements)
      expect(
        screen.getByText(/Are you sure you want to delete the bookmark/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/This action cannot be undone/)
      ).toBeInTheDocument();
    });

    it("should render cancel and delete buttons", () => {
      render(
        <DeleteBookmarkDialog
          bookmark={mockBookmark}
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete/i })
      ).toBeInTheDocument();
    });

    it("should not render when bookmark is null", () => {
      const { container } = render(
        <DeleteBookmarkDialog
          bookmark={null}
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Component Integration", () => {
    it("should handle all required props correctly", () => {
      // Test that all components can be rendered together without errors
      const { rerender } = render(
        <div>
          <BookmarkCard
            bookmark={mockBookmark}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onCategoryChange={mockOnCategoryChange}
          />
          <BookmarkFormDialog
            bookmark={mockBookmark}
            open={false}
            onOpenChange={vi.fn()}
          />
          <DeleteBookmarkDialog
            bookmark={mockBookmark}
            open={false}
            onOpenChange={vi.fn()}
            onConfirm={vi.fn()}
          />
        </div>
      );

      // Verify the bookmark card is rendered
      expect(screen.getByText("Test Bookmark")).toBeInTheDocument();

      // Test that we can switch to edit mode
      rerender(
        <div>
          <BookmarkCard
            bookmark={mockBookmark}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onCategoryChange={mockOnCategoryChange}
          />
          <BookmarkFormDialog
            bookmark={mockBookmark}
            open={true}
            onOpenChange={vi.fn()}
          />
          <DeleteBookmarkDialog
            bookmark={mockBookmark}
            open={false}
            onOpenChange={vi.fn()}
            onConfirm={vi.fn()}
          />
        </div>
      );

      expect(screen.getByText("Edit Bookmark")).toBeInTheDocument();

      // Test that we can switch to delete mode
      rerender(
        <div>
          <BookmarkCard
            bookmark={mockBookmark}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onCategoryChange={mockOnCategoryChange}
          />
          <BookmarkFormDialog
            bookmark={mockBookmark}
            open={false}
            onOpenChange={vi.fn()}
          />
          <DeleteBookmarkDialog
            bookmark={mockBookmark}
            open={true}
            onOpenChange={vi.fn()}
            onConfirm={vi.fn()}
          />
        </div>
      );

      expect(screen.getByText("Delete Bookmark")).toBeInTheDocument();
    });
  });
});
