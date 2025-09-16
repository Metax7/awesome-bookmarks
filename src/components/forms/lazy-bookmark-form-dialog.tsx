"use client";

import { lazy, Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, BookmarkWithCategory } from "@/lib/types/bookmark";

// Lazy load the BookmarkFormDialog component
const BookmarkFormDialog = lazy(() => 
  import("./bookmark-form-dialog").then(module => ({
    default: module.BookmarkFormDialog
  }))
);

interface LazyBookmarkFormDialogProps {
  bookmark?: Bookmark | BookmarkWithCategory;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Loading skeleton for the form dialog
const FormDialogSkeleton = () => (
  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  </DialogContent>
);

export function LazyBookmarkFormDialog(props: LazyBookmarkFormDialogProps) {
  const { open } = props;

  // Only load the component when the dialog is opened
  if (!open) {
    return <BookmarkFormDialog {...props} />;
  }

  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      <Suspense fallback={<FormDialogSkeleton />}>
        <BookmarkFormDialog {...props} />
      </Suspense>
    </Dialog>
  );
}