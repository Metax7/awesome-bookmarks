"use client";

import { useState } from "react";
import { Home, Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { CategoryWithBookmarkCount } from "@/lib/types/bookmark";

interface MobileLayoutProps {
  children: React.ReactNode;
  categories: CategoryWithBookmarkCount[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId?: string) => void;
  onAddCategory: () => void;
  onAddBookmark: () => void;
  onSearchFocus?: () => void;
}

export function MobileLayout({
  children,
  categories,
  selectedCategoryId,
  onCategorySelect,
  onAddCategory,
  onAddBookmark,
  onSearchFocus,
}: MobileLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const totalBookmarks = categories.reduce(
    (sum, cat) => sum + cat.bookmarkCount,
    0
  );

  const currentCategory = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)
    : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader>
                  <SheetTitle>Categories</SheetTitle>
                  <SheetDescription className="sr-only"></SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-auto">
                    <div className="p-4 space-y-4">
                      {/* All bookmarks */}
                      <button
                        onClick={() => {
                          onCategorySelect();
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          !selectedCategoryId
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                            <span className="text-sm">📁</span>
                          </div>
                          <span className="font-medium">All Bookmarks</span>
                        </div>
                        <Badge variant="secondary">{totalBookmarks}</Badge>
                      </button>

                      {/* Categories */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground px-3">
                          Categories
                        </h3>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              onCategorySelect(category.id);
                              setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                              selectedCategoryId === category.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {category.icon ? (
                                <span className="text-lg">{category.icon}</span>
                              ) : (
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              <span className="font-medium truncate">
                                {category.name}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {category.bookmarkCount}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add category button */}
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        onAddCategory();
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Plus />
                      Add Category
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-none">
                {currentCategory ? currentCategory.name : "All Bookmarks"}
              </h1>
              <span className="text-xs text-muted-foreground">
                {currentCategory
                  ? `${currentCategory.bookmarkCount} bookmarks`
                  : `${totalBookmarks} bookmarks`}
              </span>
            </div>
          </div>

          <Button onClick={onAddBookmark} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 pb-20">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-around h-16 px-4">
          <Button
            variant={!selectedCategoryId ? "default" : "ghost"}
            size="sm"
            className="flex flex-col gap-1 h-12 px-3"
            onClick={() => onCategorySelect()}
          >
            <Home className="h-4 w-4" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-12 px-3"
            onClick={onSearchFocus}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-12 px-3"
            onClick={onAddBookmark}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add</span>
          </Button>

          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col gap-1 h-12 px-3 relative"
              >
                <Menu className="h-4 w-4" />
                <span className="text-xs">Menu</span>
                {categories.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {categories.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}
