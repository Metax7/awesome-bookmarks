"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Filter, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Category, SearchFilters } from "@/lib/types/bookmark";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  categories: Category[];
  availableTags?: string[];
  initialFilters?: SearchFilters;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  showTagFilter?: boolean;
  showAdvancedFilters?: boolean;
}

export function SearchBar({
  onSearch,
  categories,
  availableTags = [],
  initialFilters = {},
  placeholder = "Search bookmarks...",
  debounceMs = 300,
  className,
  showTagFilter = true,
  showAdvancedFilters = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialFilters.query || "");
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const isMobile = useIsMobile();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search when debounced query or filters change
  useEffect(() => {
    const newFilters = {
      ...filters,
      query: debouncedQuery || undefined,
    };
    onSearch(newFilters);
  }, [debouncedQuery, filters, onSearch]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFilters((prev) => {
      const currentTags = prev.tags || [];
      const isSelected = currentTags.includes(tag);

      return {
        ...prev,
        tags: isSelected
          ? currentTags.filter((t) => t !== tag)
          : [...currentTags, tag],
      };
    });
  }, []);

  const handleSortChange = useCallback(
    (
      sortBy: SearchFilters["sortBy"],
      sortOrder: SearchFilters["sortOrder"]
    ) => {
      setFilters((prev) => ({
        ...prev,
        sortBy,
        sortOrder,
      }));
    },
    []
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setFilters({});
  }, []);

  const hasActiveFilters =
    filters.categoryId || filters.sortBy || filters.tags?.length || query;
  const selectedCategory = categories.find(
    (cat) => cat.id === filters.categoryId
  );
  const selectedTags = filters.tags || [];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10 pr-20", isMobile && "h-12 text-base")}
          inputMode="search"
          autoCapitalize="none"
          autoCorrect="off"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  hasActiveFilters && "text-primary",
                  isMobile ? "h-10 w-10" : "h-7 w-7"
                )}
              >
                <Filter className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Categories */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Categories
              </DropdownMenuLabel>
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={filters.categoryId === category.id}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              {/* Tags */}
              {showTagFilter && availableTags.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Tags
                  </DropdownMenuLabel>
                  {availableTags.slice(0, 10).map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    >
                      <div className="flex items-center space-x-2">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span>{tag}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                  {availableTags.length > 10 && (
                    <DropdownMenuItem className="text-xs text-muted-foreground">
                      +{availableTags.length - 10} more tags...
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Sorting */}
              {showAdvancedFilters && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Sort
                  </DropdownMenuLabel>
                </>
              )}
              <DropdownMenuItem
                onClick={() => handleSortChange("createdAt", "desc")}
              >
                By date added (newest)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("createdAt", "asc")}
              >
                By date added (oldest)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("title", "asc")}
              >
                By title (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("title", "desc")}
              >
                By title (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("url", "asc")}>
                By URL (A-Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear search */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {query && (
            <Badge variant="secondary" className="text-xs">
              Search: &quot;{query}&quot;
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: selectedCategory.color }}
              />
              {selectedCategory.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => handleCategoryToggle(selectedCategory.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Hash className="w-3 h-3 mr-1" />
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => handleTagToggle(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.sortBy && (
            <Badge variant="secondary" className="text-xs">
              Sort:{" "}
              {filters.sortBy === "createdAt"
                ? "By date"
                : filters.sortBy === "title"
                ? "By title"
                : filters.sortBy === "updatedAt"
                ? "By modification"
                : "By URL"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => handleSortChange(undefined, undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
