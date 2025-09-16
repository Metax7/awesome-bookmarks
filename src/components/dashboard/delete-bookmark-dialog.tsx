"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
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
import type { BookmarkWithCategory } from "@/lib/types/bookmark";

interface DeleteBookmarkDialogProps {
  bookmark: BookmarkWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookmarkId: string) => Promise<void>;
}

export function DeleteBookmarkDialog({
  bookmark,
  open,
  onOpenChange,
  onConfirm,
}: DeleteBookmarkDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!bookmark) return;

    setIsDeleting(true);
    try {
      await onConfirm(bookmark.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!bookmark) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Bookmark
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the bookmark{" "}
            <span className="font-medium text-foreground">
              &quot;{bookmark.title}&quot;
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
