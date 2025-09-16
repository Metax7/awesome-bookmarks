"use client";

// import { useRef } from "react"; // Unused for now
import { Header } from "./header";
import { AppSidebar } from "./sidebar";
import { MobileLayout } from "./mobile-layout";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useScreenSize } from "@/hooks/use-mobile";
import type { CategoryWithBookmarkCount } from "@/lib/types/bookmark";

interface MainLayoutProps {
  children: React.ReactNode;
  categories: CategoryWithBookmarkCount[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId?: string) => void;
  onAddCategory: () => void;
  onAddBookmark: () => void;
}

export function MainLayout({
  children,
  categories,
  selectedCategoryId,
  onCategorySelect,
  onAddCategory,
  onAddBookmark
}: MainLayoutProps) {
  const screenSize = useScreenSize();
  // const searchInputRef = useRef<HTMLInputElement>(null); // Unused for now

  const handleSearchFocus = () => {
    // Focus on search input when search button is pressed on mobile
    const searchInput = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Mobile layout for screens < 768px
  if (screenSize === 'mobile') {
    return (
      <MobileLayout
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={onCategorySelect}
        onAddCategory={onAddCategory}
        onAddBookmark={onAddBookmark}
        onSearchFocus={handleSearchFocus}
      >
        {children}
      </MobileLayout>
    );
  }

  // Desktop/Tablet layout with responsive sidebar
  return (
    <SidebarProvider>
      <AppSidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={onCategorySelect}
        onAddCategory={onAddCategory}
      />
      <SidebarInset>
        <Header onAddBookmark={onAddBookmark} />
        <main className="flex-1">
          <div className={`container mx-auto ${
            screenSize === 'tablet' ? 'p-4' : 'p-6'
          }`}>
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}