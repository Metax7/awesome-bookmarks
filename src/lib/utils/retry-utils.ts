export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: "linear" | "exponential";
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = "exponential",
      onRetry,
      shouldRetry = (error) => this.isRetryableError(error),
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry if it's the last attempt or error is not retryable
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          throw lastError;
        }

        // Call retry callback if provided
        onRetry?.(attempt, lastError);

        // Calculate delay based on backoff strategy
        const currentDelay =
          backoff === "exponential"
            ? delay * Math.pow(2, attempt - 1)
            : delay * attempt;

        // Wait before retrying
        await this.sleep(currentDelay);
      }
    }

    throw lastError!;
  }

  static isRetryableError(error: Error): boolean {
    // Network errors
    if (
      error.name === "NetworkError" ||
      error.message.includes("NetworkError") ||
      error.message.includes("fetch")
    ) {
      return true;
    }

    // Timeout errors
    if (error.message.includes("timeout")) {
      return true;
    }

    // Server errors (5xx)
    if (
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503") ||
      error.message.includes("504")
    ) {
      return true;
    }

    // Rate limiting
    if (error.message.includes("429")) {
      return true;
    }

    return false;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Specific retry functions for common operations
  static async retryFetch(
    url: string,
    options?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<Response> {
    return this.withRetry(async () => {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    }, retryOptions);
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    retryOptions?: RetryOptions
  ): Promise<T> {
    return this.withRetry(operation, {
      ...retryOptions,
      onRetry: (attempt, error) => {
        console.warn(
          `${operationName} failed (attempt ${attempt}):`,
          error.message
        );
        retryOptions?.onRetry?.(attempt, error);
      },
    });
  }
}

// Hook for using retry functionality in React components
export function useRetry() {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const retry = React.useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: RetryOptions
    ): Promise<T> => {
      setIsRetrying(true);
      setRetryCount(0);

      try {
        const result = await RetryManager.withRetry(operation, {
          ...options,
          onRetry: (attempt, error) => {
            setRetryCount(attempt);
            options?.onRetry?.(attempt, error);
          },
        });

        return result;
      } finally {
        setIsRetrying(false);
        setRetryCount(0);
      }
    },
    []
  );

  return {
    retry,
    isRetrying,
    retryCount,
  };
}

// React import for the hook
import React from "react";
