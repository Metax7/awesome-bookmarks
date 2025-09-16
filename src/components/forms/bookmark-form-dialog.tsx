"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookmarkForm } from "./bookmark-form";
import { FormErrorBoundary } from "@/components/error";
import { Bookmark, BookmarkWithCategory } from "@/lib/types/bookmark";

interface BookmarkFormDialogProps {
  bookmark?: Bookmark | BookmarkWithCategory;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookmarkFormDialog({ 
  bookmark, 
  trigger, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: BookmarkFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleSuccess = () => {
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onOpenChange?.(false);
  };

  const formContent = (
    <FormErrorBoundary onRetry={() => window.location.reload()}>
      <BookmarkForm
        bookmark={bookmark}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </FormErrorBoundary>
  );

  const title = bookmark ? "Edit Bookmark" : "Add Bookmark";
  const description = bookmark 
    ? "Modify the bookmark information." 
    : "Add a new bookmark to your collection.";

  // Use Sheet for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-6 overflow-y-auto rounded-t-lg"
        >
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}