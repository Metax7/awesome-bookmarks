"use client";

import { lazy, Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/lib/types/bookmark";

// Lazy load the CategoryFormDialog component
const CategoryFormDialog = lazy(() => 
  import("./category-form-dialog").then(module => ({
    default: module.CategoryFormDialog
  }))
);

interface LazyCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSuccess?: () => void;
}

// Loading skeleton for the category form dialog
const CategoryFormDialogSkeleton = () => (
  <DialogContent className="sm:max-w-[425px]">
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
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

export function LazyCategoryFormDialog(props: LazyCategoryFormDialogProps) {
  const { open } = props;

  // Only load the component when the dialog is opened
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      <Suspense fallback={<CategoryFormDialogSkeleton />}>
        <CategoryFormDialog {...props} />
      </Suspense>
    </Dialog>
  );
}