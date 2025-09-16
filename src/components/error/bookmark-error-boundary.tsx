'use client';

import React from 'react';
import { ErrorBoundary } from './error-boundary';
import { BookmarkX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BookmarkErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export function BookmarkErrorBoundary({ children, onRetry }: BookmarkErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log bookmark-specific errors
    console.error('Bookmark component error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  const fallbackUI = (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <BookmarkX className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-lg">Bookmark Loading Error</CardTitle>
        <CardDescription>
          Failed to load bookmarks. Please check your internet connection and try again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onRetry} 
          className="w-full"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Bookmarks
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary
      fallback={fallbackUI}
      onError={handleError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}