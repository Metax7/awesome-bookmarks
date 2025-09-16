'use client';

import React from 'react';
import { ErrorBoundary } from './error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export function FormErrorBoundary({ children, onRetry }: FormErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log form-specific errors
    console.error('Form component error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  const fallbackUI = (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Form Error</AlertTitle>
      <AlertDescription className="mt-2">
        An error occurred while loading the form. Please try refreshing the page.
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm" 
          className="mt-2 ml-0"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
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