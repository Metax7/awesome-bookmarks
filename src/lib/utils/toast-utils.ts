import { toast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastManager {
  static success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  static error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || 6000,
      action: options?.action,
    });
  }

  static warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      action: options?.action,
    });
  }

  static info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  static loading(message: string) {
    return toast.loading(message);
  }

  static dismiss(toastId?: string | number) {
    return toast.dismiss(toastId);
  }

  // Enhanced error handling with retry functionality
  static errorWithRetry(
    message: string, 
    retryFn: () => void | Promise<void>,
    retryLabel: string = 'Retry'
  ) {
    return toast.error(message, {
      duration: 8000,
      action: {
        label: retryLabel,
        onClick: async () => {
          try {
            await retryFn();
          } catch (error) {
            console.error('Retry failed:', error);
            ToastManager.error('Retry attempt failed');
          }
        },
      },
    });
  }

  // Network error with specific handling
  static networkError(retryFn?: () => void | Promise<void>) {
    const message = 'Network error. Please check your internet connection.';
    
    if (retryFn) {
      return ToastManager.errorWithRetry(message, retryFn, 'Retry');
    }
    
    return ToastManager.error(message);
  }

  // Validation error
  static validationError(message: string = 'Please check that the form is filled out correctly') {
    return ToastManager.error(message, { duration: 5000 });
  }

  // Server error
  static serverError(retryFn?: () => void | Promise<void>) {
    const message = 'Server error. Please try again later.';
    
    if (retryFn) {
      return ToastManager.errorWithRetry(message, retryFn, 'Retry');
    }
    
    return ToastManager.error(message);
  }

  // Promise-based toast for async operations
  static async promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): Promise<T> {
    toast.promise(promise, {
      loading,
      success,
      error,
    });
    return promise;
  }
}

// Convenience exports
export const showSuccess = ToastManager.success;
export const showError = ToastManager.error;
export const showWarning = ToastManager.warning;
export const showInfo = ToastManager.info;
export const showLoading = ToastManager.loading;
export const showErrorWithRetry = ToastManager.errorWithRetry;
export const showNetworkError = ToastManager.networkError;
export const showValidationError = ToastManager.validationError;
export const showServerError = ToastManager.serverError;