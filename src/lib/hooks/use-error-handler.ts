'use client';

import { useCallback, useState } from 'react';
import { ToastManager } from '@/lib/utils/toast-utils';
import { RetryManager } from '@/lib/utils/retry-utils';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((
    error: Error, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      retryable = false,
      // maxRetries = 3, // Unused for now
      onError,
    } = options;

    setError(error);
    
    // Call custom error handler
    onError?.(error);

    // Show toast notification
    if (showToast) {
      if (retryable) {
        ToastManager.errorWithRetry(
          error.message || 'Произошла ошибка',
          () => {
            // This will be overridden by the retry function
          }
        );
      } else {
        ToastManager.error(error.message || 'Произошла ошибка');
      }
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error);
    }
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      setError(null);
      
      if (options.retryable) {
        setIsRetrying(true);
        const result = await RetryManager.withRetry(operation, {
          maxAttempts: options.maxRetries || 3,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} for operation:`, error.message);
          },
        });
        setIsRetrying(false);
        return result;
      } else {
        return await operation();
      }
    } catch (error) {
      setIsRetrying(false);
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    executeWithErrorHandling,
    clearError,
  };
}

// Specific error handlers for different types of operations
export function useBookmarkErrorHandler() {
  const { handleError, executeWithErrorHandling, ...rest } = useErrorHandler();

  const handleBookmarkError = useCallback((error: Error, operation?: string) => {
    let message = 'Ошибка при работе с закладкой';
    
    switch (operation) {
      case 'create':
        message = 'Не удалось создать закладку';
        break;
      case 'update':
        message = 'Не удалось обновить закладку';
        break;
      case 'delete':
        message = 'Не удалось удалить закладку';
        break;
      case 'fetch':
        message = 'Не удалось загрузить закладки';
        break;
    }

    handleError(new Error(message), {
      showToast: true,
      retryable: operation === 'fetch',
    });
  }, [handleError]);

  const executeBookmarkOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationType: string
  ): Promise<T | null> => {
    return executeWithErrorHandling(operation, {
      showToast: true,
      retryable: operationType === 'fetch',
      onError: (error) => handleBookmarkError(error, operationType),
    });
  }, [executeWithErrorHandling, handleBookmarkError]);

  return {
    ...rest,
    handleBookmarkError,
    executeBookmarkOperation,
  };
}

export function useNetworkErrorHandler() {
  const { handleError, executeWithErrorHandling, ...rest } = useErrorHandler();

  const handleNetworkError = useCallback((error: Error) => {
    if (!navigator.onLine) {
      ToastManager.networkError();
    } else {
      handleError(error, {
        showToast: true,
        retryable: true,
      });
    }
  }, [handleError]);

  const executeNetworkOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithErrorHandling(operation, {
      showToast: true,
      retryable: true,
      onError: handleNetworkError,
    });
  }, [executeWithErrorHandling, handleNetworkError]);

  return {
    ...rest,
    handleNetworkError,
    executeNetworkOperation,
  };
}