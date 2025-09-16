"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-bookmarks" | "no-results" | "no-category-bookmarks";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showSecondaryAction?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showSecondaryAction = false,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case "no-bookmarks":
        return {
          icon: BookOpen,
          title: title || "No bookmarks",
          description:
            description ||
            "Add your first bookmark to start organizing your collection",
          actionLabel: actionLabel || "Add bookmark",
          actionIcon: Plus,
        };
      case "no-results":
        return {
          icon: Search,
          title: title || "No bookmarks found",
          description:
            description ||
            "Try changing your search parameters or clearing filters",
          actionLabel: actionLabel || "Clear search",
          actionIcon: Filter,
        };
      case "no-category-bookmarks":
        return {
          icon: BookOpen,
          title: title || "No bookmarks in this category yet",
          description:
            description ||
            "Add bookmarks to this category or choose another one",
          actionLabel: actionLabel || "Add bookmark",
          actionIcon: Plus,
        };
      default:
        return {
          icon: BookOpen,
          title: title || "Empty",
          description: description || "Nothing here yet",
          actionLabel: actionLabel || "Action",
          actionIcon: Plus,
        };
    }
  };

  const {
    icon: Icon,
    title: defaultTitle,
    description: defaultDescription,
    actionLabel: defaultActionLabel,
    actionIcon: ActionIcon,
  } = getDefaultContent();

  return (
    <Card className={cn("border-dashed border-2", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center py-16 px-6">
        <div className="rounded-full bg-muted p-6 mb-6 animate-pulse">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="text-xl font-semibold mb-3">{title || defaultTitle}</h3>

        <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
          {description || defaultDescription}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {onAction && (
            <Button onClick={onAction} className="min-w-[160px]" size="lg">
              <ActionIcon />
              {actionLabel || defaultActionLabel}
            </Button>
          )}

          {showSecondaryAction && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="min-w-[160px]"
              size="lg"
            >
              {secondaryActionLabel || "Cancel"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
