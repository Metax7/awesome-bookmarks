# Zustand State Management

This directory contains Zustand stores for managing application state.

## Stores

### BookmarkStore (`useBookmarkStore`)
Manages bookmark-related state and operations.

**State:**
- `bookmarks`: Array of bookmarks with category information
- `isLoading`: Loading state for bookmark operations
- `error`: Error message if any operation fails
- `searchResults`: Results from bookmark search
- `recentBookmarks`: Recently created bookmarks

**Actions:**
- `fetchBookmarks()`: Fetch all bookmarks
- `fetchBookmarkById(id)`: Fetch a specific bookmark
- `fetchBookmarksByCategory(categoryId)`: Fetch bookmarks by category
- `createBookmark(bookmark)`: Create a new bookmark
- `updateBookmark(id, updates)`: Update an existing bookmark
- `deleteBookmark(id)`: Delete a bookmark
- `searchBookmarksAction(filters)`: Search bookmarks with filters
- `fetchRecentBookmarks(limit)`: Fetch recent bookmarks
- `clearError()`: Clear error state
- `clearSearchResults()`: Clear search results

### CategoryStore (`useCategoryStore`)
Manages category-related state and operations.

**State:**
- `categories`: Array of categories
- `categoriesWithCounts`: Categories with bookmark counts
- `isLoading`: Loading state for category operations
- `error`: Error message if any operation fails

**Actions:**
- `fetchCategories()`: Fetch all categories
- `fetchCategoryById(id)`: Fetch a specific category
- `fetchCategoriesWithCounts()`: Fetch categories with bookmark counts
- `createCategory(category)`: Create a new category
- `updateCategory(id, updates)`: Update an existing category
- `deleteCategory(id)`: Delete a category
- `seedDefaultCategories()`: Create default categories
- `clearError()`: Clear error state

### SearchStore (`useSearchStore`)
Manages search-related state and operations.

**State:**
- `query`: Current search query
- `filters`: Search filters (category, tags, sort options)
- `searchResults`: Search results
- `isSearching`: Loading state for search operations
- `error`: Error message if any operation fails
- `searchHistory`: Array of previous search queries
- `availableTags`: All available tags

**Actions:**
- `setQuery(query)`: Set the search query
- `setFilters(filters)`: Update search filters
- `search(customFilters)`: Perform search with current or custom filters
- `clearSearch()`: Clear search state
- `addToSearchHistory(query)`: Add query to search history
- `clearSearchHistory()`: Clear search history
- `fetchAvailableTags()`: Fetch all available tags
- `searchByTags(tags)`: Search bookmarks by tags
- `clearError()`: Clear error state

## Usage Examples

### Using BookmarkStore in a Component

```tsx
import { useBookmarkStore } from '@/lib/stores';

function BookmarkList() {
  const { 
    bookmarks, 
    isLoading, 
    error, 
    fetchBookmarks, 
    deleteBookmark 
  } = useBookmarkStore();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmark(id);
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {bookmarks.map(bookmark => (
        <div key={bookmark.id}>
          <h3>{bookmark.title}</h3>
          <p>{bookmark.url}</p>
          <button onClick={() => handleDelete(bookmark.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Using CategoryStore in a Component

```tsx
import { useCategoryStore } from '@/lib/stores';

function CategorySelector() {
  const { 
    categories, 
    isLoading, 
    fetchCategories 
  } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <select>
      {categories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
```

### Using SearchStore in a Component

```tsx
import { useSearchStore } from '@/lib/stores';

function SearchComponent() {
  const { 
    query, 
    searchResults, 
    isSearching, 
    setQuery, 
    search, 
    clearSearch 
  } = useSearchStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search();
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bookmarks..."
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button type="button" onClick={clearSearch}>
          Clear
        </button>
      </form>

      {searchResults && (
        <div>
          <p>Found {searchResults.totalCount} bookmarks</p>
          {searchResults.bookmarks.map(bookmark => (
            <div key={bookmark.id}>
              <h3>{bookmark.title}</h3>
              <p>{bookmark.url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Combining Multiple Stores

```tsx
import { useBookmarkStore, useCategoryStore, useSearchStore } from '@/lib/stores';

function BookmarkDashboard() {
  const bookmarkStore = useBookmarkStore();
  const categoryStore = useCategoryStore();
  const searchStore = useSearchStore();

  useEffect(() => {
    // Initialize data
    bookmarkStore.fetchBookmarks();
    categoryStore.fetchCategories();
    searchStore.fetchAvailableTags();
  }, []);

  // Component implementation...
}
```

## Store Persistence

The stores use Zustand's devtools middleware for debugging. To add persistence, you can wrap stores with the `persist` middleware:

```tsx
import { persist } from 'zustand/middleware';

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // store implementation
      }),
      {
        name: 'search-store',
        partialize: (state) => ({ 
          searchHistory: state.searchHistory 
        }), // Only persist search history
      }
    ),
    {
      name: 'search-store',
    }
  )
);
```