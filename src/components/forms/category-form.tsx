"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Palette, Hash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/lib/stores/category-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/lib/types/bookmark";

// Validation schema for category form
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, hyphens and underscores"
    ),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Please select a valid color"),
  icon: z.string().optional(),
});

type FormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Predefined color palette
const colorPalette = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
  "#14b8a6", // teal
  "#a855f7", // purple
];

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { createCategory, updateCategory, isLoading } = useCategoryStore();
  const isMobile = useIsMobile();

  const form = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      color: category?.color || colorPalette[0],
      icon: category?.icon || "",
    },
  });

  const { watch, setValue } = form;
  const watchedColor = watch("color");

  const onSubmit = async (data: FormData) => {
    try {
      const categoryData = {
        name: data.name.trim(),
        color: data.color,
        icon: data.icon?.trim() || null,
      };

      if (category) {
        await updateCategory(category.id, categoryData);
        toast.success("Category updated");
      } else {
        await createCategory(categoryData);
        toast.success("Category created");
      }

      onSuccess?.();
    } catch {
      toast.error(
        category ? "Error updating category" : "Error creating category"
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={isMobile ? "space-y-8" : "space-y-6"}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="For example: Development, Design, News"
                    className={`pl-10 ${isMobile ? "h-12 text-base" : ""}`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Unique name for the category (up to 50 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Color *</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-border"
                      style={{ backgroundColor: watchedColor }}
                    />
                    <Input
                      type="color"
                      className={`p-1 border rounded cursor-pointer ${
                        isMobile ? "w-20 h-12" : "w-16 h-10"
                      }`}
                      {...field}
                    />
                  </div>

                  {/* Color palette */}
                  <div
                    className={`grid gap-2 ${
                      isMobile ? "grid-cols-4" : "grid-cols-6"
                    }`}
                  >
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`rounded-full border-2 transition-all hover:scale-110 ${
                          isMobile ? "w-12 h-12" : "w-8 h-8"
                        } ${
                          watchedColor === color
                            ? "border-foreground ring-2 ring-ring"
                            : "border-border hover:border-foreground"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setValue("color", color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Choose a color from the palette or use the color picker.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="📚 or folder or any emoji"
                  className={isMobile ? "h-12 text-base" : ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Emoji or icon name for visual representation of the category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={`flex gap-3 pt-4 ${
            isMobile ? "flex-col-reverse" : "justify-end"
          }`}
        >
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={isMobile ? "h-12 text-base" : ""}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={isMobile ? "h-12 text-base" : ""}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update" : "Create"} Category
          </Button>
        </div>
      </form>
    </Form>
  );
}
