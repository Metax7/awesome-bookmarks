"use client";

import { useState } from "react";
import { Folder, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CategoryFormDialog } from "@/components/forms";
import { useCategoryStore } from "@/lib/stores/category-store";
import { toast } from "sonner";
import type { CategoryWithBookmarkCount, Category } from "@/lib/types/bookmark";

interface AppSidebarProps {
  categories: CategoryWithBookmarkCount[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId?: string) => void;
  onAddCategory: () => void;
}

export function AppSidebar({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onAddCategory,
}: AppSidebarProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const { deleteCategory } = useCategoryStore();

  const totalBookmarks = categories.reduce(
    (sum, cat) => sum + cat.bookmarkCount,
    0
  );

  // Suppress unused parameter warning for onAddCategory
  // This is kept for interface compatibility but handled internally
  void onAddCategory;

  const handleEditCategory = (category: CategoryWithBookmarkCount) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: category.createdAt,
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (category: CategoryWithBookmarkCount) => {
    if (category.bookmarkCount > 0) {
      toast.error(
        "Cannot delete category with bookmarks. Please move or delete all bookmarks first."
      );
      return;
    }

    setDeletingCategory({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: category.createdAt,
    });
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast.success("Category deleted");
      setDeletingCategory(null);

      // If the deleted category was selected, clear selection
      if (selectedCategoryId === deletingCategory.id) {
        onCategorySelect();
      }
    } catch {
      toast.error("Error deleting category");
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleCategoryFormSuccess = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  return (
    <>
      <Sidebar variant="inset">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* All bookmarks */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onCategorySelect()}
                    isActive={!selectedCategoryId}
                  >
                    <Folder className="h-4 w-4" />
                    <span>All Bookmarks</span>
                    <Badge variant="secondary" className="ml-auto">
                      {totalBookmarks}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Categories */}
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <div className="flex items-center w-full group">
                      <SidebarMenuButton
                        onClick={() => onCategorySelect(category.id)}
                        isActive={selectedCategoryId === category.id}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {category.icon ? (
                            <span className="text-sm">{category.icon}</span>
                          ) : (
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <span className="truncate">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {category.bookmarkCount}
                        </Badge>
                      </SidebarMenuButton>

                      {/* Category actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category)}
                            className="text-destructive"
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAddCategory}
              >
                <Plus />
                Add Category
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        category={editingCategory || undefined}
        onSuccess={handleCategoryFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category{" "}
              <strong className="text-black dark:text-white">
                &quot;
                {deletingCategory?.name}&quot;
              </strong>
              ? This action cannot be undone.
              {(() => {
                if (!deletingCategory) return null;
                const categoryWithCount = categories.find(
                  (c) => c.id === deletingCategory.id
                );
                return categoryWithCount &&
                  categoryWithCount.bookmarkCount > 0 ? (
                  <span className="block mt-2 text-destructive font-medium">
                    This category contains bookmarks. Please move or delete them
                    first.
                  </span>
                ) : null;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              variant="destructive"
              disabled={(() => {
                if (!deletingCategory) return false;
                const categoryWithCount = categories.find(
                  (c) => c.id === deletingCategory.id
                );
                return categoryWithCount
                  ? categoryWithCount.bookmarkCount > 0
                  : false;
              })()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
