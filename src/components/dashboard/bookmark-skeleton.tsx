"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BookmarkSkeletonProps {
  className?: string;
}

export function BookmarkSkeleton({ className }: BookmarkSkeletonProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Favicon skeleton */}
            <Skeleton className="w-8 h-8 rounded-sm flex-shrink-0" />
            
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <Skeleton className="h-4 w-3/4" />
              {/* Domain skeleton */}
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          
          {/* Actions skeleton */}
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Tags skeleton */}
        <div className="flex space-x-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

interface BookmarkGridSkeletonProps {
  count?: number;
  className?: string;
}

export function BookmarkGridSkeleton({ count = 8, className }: BookmarkGridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <BookmarkSkeleton key={index} />
      ))}
    </div>
  );
}