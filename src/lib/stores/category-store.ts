import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Category, 
  CategoryCreateInput, 
  CategoryUpdateInput,
  CategoryWithBookmarkCount 
} from '@/lib/types/bookmark';

interface CategoryState {
  // State
  categories: Category[];
  categoriesWithCounts: CategoryWithBookmarkCount[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<Category | null>;
  fetchCategoriesWithCounts: () => Promise<void>;
  createCategory: (category: CategoryCreateInput) => Promise<string>;
  updateCategory: (id: string, updates: CategoryUpdateInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  seedDefaultCategories: () => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      categoriesWithCounts: [],
      isLoading: false,
      error: null,

      // Actions
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/categories');
          if (!response.ok) {
            throw new Error('Failed to fetch categories');
          }
          const categories = await response.json();
          set({ categories, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            isLoading: false 
          });
        }
      },

      fetchCategoryById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/categories/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch category');
          }
          const category = await response.json();
          set({ isLoading: false });
          return category;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch category',
            isLoading: false 
          });
          return null;
        }
      },

      fetchCategoriesWithCounts: async () => {
        set({ isLoading: true, error: null });
        try {
          // Fetch categories and bookmarks to calculate counts
          const [categoriesResponse, bookmarksResponse] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/bookmarks')
          ]);
          
          if (!categoriesResponse.ok || !bookmarksResponse.ok) {
            throw new Error('Failed to fetch categories or bookmarks');
          }
          
          const categories = await categoriesResponse.json();
          const bookmarks = await bookmarksResponse.json();
          
          const categoriesWithCounts = categories.map((cat: Category) => ({
            ...cat,
            updatedAt: cat.createdAt, // Add missing updatedAt field
            bookmarkCount: bookmarks.filter((bookmark: { categoryId: string }) => bookmark.categoryId === cat.id).length,
          }));
          
          set({ categoriesWithCounts, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch categories with counts',
            isLoading: false 
          });
        }
      },

      createCategory: async (category: CategoryCreateInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(category),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create category');
          }
          
          const newCategory = await response.json();
          // Refresh categories list
          await get().fetchCategories();
          set({ isLoading: false });
          return newCategory.id;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create category',
            isLoading: false 
          });
          throw error;
        }
      },

      updateCategory: async (id: string, updates: CategoryUpdateInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update category');
          }
          
          const updatedCategory = await response.json();
          // Update the category in the current state
          const { categories } = get();
          const updatedCategories = categories.map(category => 
            category.id === id ? updatedCategory : category
          );
          set({ categories: updatedCategories, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteCategory: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete category');
          }
          
          // Remove the category from the current state
          const { categories } = get();
          const updatedCategories = categories.filter(category => category.id !== id);
          set({ categories: updatedCategories, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete category',
            isLoading: false 
          });
          throw error;
        }
      },

      seedDefaultCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          // Create default categories
          const defaultCategories = [
            { name: 'Разработка', color: '#3b82f6' },
            { name: 'Дизайн', color: '#ef4444' },
            { name: 'Новости', color: '#10b981' },
          ];
          
          for (const category of defaultCategories) {
            await get().createCategory(category);
          }
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to seed default categories',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'category-store',
    }
  )
);