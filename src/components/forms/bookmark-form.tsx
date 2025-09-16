"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Globe, Tag, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { bookmarkSchema } from "@/lib/utils/validation";
import { extractUrlMetadata, normalizeUrl } from "@/lib/utils/url-parser";
import { useBookmarkStore } from "@/lib/stores/bookmark-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bookmark, BookmarkWithCategory } from "@/lib/types/bookmark";

// Form schema with optional title for auto-extraction
const formSchema = bookmarkSchema.extend({
  title: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BookmarkFormProps {
  bookmark?: Bookmark | BookmarkWithCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookmarkForm({
  bookmark,
  onSuccess,
  onCancel,
}: BookmarkFormProps) {
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const { createBookmark, updateBookmark, isLoading } = useBookmarkStore();
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoryStore();
  const isMobile = useIsMobile();

  console.log("BookmarkForm render:", {
    categoriesCount: categories.length,
    categoriesLoading,
    isLoading,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: bookmark?.url || "",
      title: bookmark?.title || "",
      description: bookmark?.description || "",
      categoryId: bookmark?.categoryId || "",
      tags: bookmark?.tags || [],
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedUrl = watch("url");
  const watchedTags = watch("tags") || [];

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      console.log("BookmarkForm: Loading categories...");
      fetchCategories()
        .then(() => {
          console.log("BookmarkForm: Categories loaded successfully");
        })
        .catch((error) => {
          console.error("BookmarkForm: Failed to load categories:", error);
        });
    }
  }, [categories.length, categoriesLoading, fetchCategories]);

  // Auto-extract metadata when URL changes
  useEffect(() => {
    const extractMetadata = async () => {
      if (!watchedUrl || watchedUrl === bookmark?.url) return;

      try {
        const url = normalizeUrl(watchedUrl);
        new URL(url); // Validate URL

        setIsExtractingMetadata(true);
        const metadata = await extractUrlMetadata(url);

        // Only set title if it's empty or this is a new bookmark
        if (metadata.title && (!getValues("title") || !bookmark)) {
          setValue("title", metadata.title);
        }

        // Only set description if it's empty
        if (metadata.description && !getValues("description")) {
          setValue("description", metadata.description);
        }
      } catch {
        // Invalid URL, don't extract metadata
      } finally {
        setIsExtractingMetadata(false);
      }
    };

    const timeoutId = setTimeout(extractMetadata, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [watchedUrl, bookmark?.url, setValue, getValues, bookmark]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (
      trimmedTag &&
      !watchedTags.includes(trimmedTag) &&
      watchedTags.length < 10
    ) {
      setValue("tags", [...watchedTags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const bookmarkData = {
        ...data,
        url: normalizeUrl(data.url),
        title: data.title || "Untitled",
        description: data.description || undefined,
        tags: data.tags || [],
      };

      if (bookmark) {
        await updateBookmark(bookmark.id, bookmarkData);
        toast.success("Bookmark updated");
      } else {
        await createBookmark(bookmarkData);
        toast.success("Bookmark added");
      }

      onSuccess?.();
    } catch {
      toast.error(
        bookmark ? "Error updating bookmark" : "Error adding bookmark"
      );
    }
  };

  // Show loading state if categories are still loading
  if (categoriesLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={isMobile ? "space-y-8" : "space-y-6"}
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com"
                    className={`pl-10 ${isMobile ? "h-12 text-base" : ""}`}
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    {...field}
                  />
                  {isExtractingMetadata && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Enter the URL of the web page. Metadata will be extracted
                automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bookmark title"
                  className={isMobile ? "h-12 text-base" : ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Leave empty for automatic extraction from URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the bookmark"
                  className={`resize-none ${
                    isMobile ? "text-base min-h-[100px]" : ""
                  }`}
                  rows={isMobile ? 4 : 3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={isMobile ? "h-12 text-base" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Add tag"
                        className={`pl-10 ${isMobile ? "h-12 text-base" : ""}`}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || watchedTags.length >= 10}
                    >
                      Add
                    </Button>
                  </div>

                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Maximum 10 tags. Press Enter to add.
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
            disabled={isLoading || isExtractingMetadata}
            className={isMobile ? "h-12 text-base" : ""}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {bookmark ? "Update" : "Add"} bookmark
          </Button>
        </div>
      </form>
    </Form>
  );
}
