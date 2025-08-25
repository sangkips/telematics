import { useState, useCallback, useRef, useEffect } from 'react';
import { NetworkError } from '../components/NetworkErrorHandler';

export interface ErrorState {
  networkError: NetworkError | null;
  validationErrors: Record<string, string>;
  formError: string | null;
  isRetrying: boolean;
  retryCount: number;
}

export interface UseErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  onError?: (error: Error) => void;
  onRetry?: () => void;
  onMaxRetriesReached?: () => void;
}

export interface UseErrorHandlingReturn {
  // Error state
  errorState: ErrorState;
  
  // Error setters
  setNetworkError: (error: NetworkError | null) => void;
  setValidationError: (field: string, message: string) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  setFormError: (error: string | null) => void;
  
  // Error clearers
  clearNetworkError: () => void;
  clearValidationError: (field: string) => void;
  clearValidationErrors: () => void;
  clearFormError: () => void;
  clearAllErrors: () => void;
  
  // Retry functionality
  retry: () => Promise<void>;
  canRetry: boolean;
  
  // Utility functions
  hasErrors: boolean;
  hasValidationErrors: boolean;
  getErrorSummary: () => string[];
  
  // Error handling helpers
  handleApiError: (error: unknown) => void;
  handleValidationResponse: (response: { errors?: Record<string, string[]> }) => void;
  wrapAsyncOperation: <T>(operation: () => Promise<T>) => Promise<T>;
}

export const useErrorHandling = (
  options: UseErrorHandlingOptions = {}
): UseErrorHandlingReturn => {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    autoRetry = false,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    networkError: null,
    validationErrors: {},
    formError: null,
    isRetrying: false,
    retryCount: 0,
  });

  const retryOperation = useRef<(() => Promise<void>) | null>(null);
  const retryTimer = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    };
  }, []);

  // Network error handling
  const setNetworkError = useCallback((error: NetworkError | null) => {
    setErrorState(prev => ({
      ...prev,
      networkError: error,
      formError: null, // Clear form error when network error is set
    }));
  }, []);

  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, [setNetworkError]);

  // Validation error handling
  const setValidationError = useCallback((field: string, message: string) => {
    setErrorState(prev => ({
      ...prev,
      validationErrors: {
        ...prev.validationErrors,
        [field]: message,
      },
    }));
  }, []);

  const setValidationErrors = useCallback((errors: Record<string, string>) => {
    setErrorState(prev => ({
      ...prev,
      validationErrors: errors,
    }));
  }, []);

  const clearValidationError = useCallback((field: string) => {
    setErrorState(prev => {
      const newErrors = { ...prev.validationErrors };
      delete newErrors[field];
      return {
        ...prev,
        validationErrors: newErrors,
      };
    });
  }, []);

  const clearValidationErrors = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      validationErrors: {},
    }));
  }, []);

  // Form error handling
  const setFormError = useCallback((error: string | null) => {
    setErrorState(prev => ({
      ...prev,
      formError: error,
      networkError: null, // Clear network error when form error is set
    }));
  }, []);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, [setFormError]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrorState({
      networkError: null,
      validationErrors: {},
      formError: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  // Retry functionality
  const retry = useCallback(async () => {
    if (!retryOperation.current || errorState.isRetrying) return;

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
    }));

    try {
      onRetry?.();
      await retryOperation.current();
      
      // Success - reset retry count and clear errors
      setErrorState(prev => ({
        ...prev,
        retryCount: 0,
        isRetrying: false,
        networkError: null,
        formError: null,
      }));
    } catch (error) {
      const newRetryCount = errorState.retryCount + 1;
      
      setErrorState(prev => ({
        ...prev,
        retryCount: newRetryCount,
        isRetrying: false,
      }));

      if (newRetryCount >= maxRetries) {
        onMaxRetriesReached?.();
      } else if (autoRetry) {
        // Schedule auto-retry
        retryTimer.current = setTimeout(() => {
          retry();
        }, retryDelay);
      }

      // Re-throw to allow caller to handle
      throw error;
    }
  }, [errorState.isRetrying, errorState.retryCount, maxRetries, autoRetry, retryDelay, onRetry, onMaxRetriesReached]);

  const canRetry = errorState.retryCount < maxRetries && !errorState.isRetrying;

  // Utility functions
  const hasErrors = !!(
    errorState.networkError ||
    errorState.formError ||
    Object.keys(errorState.validationErrors).length > 0
  );

  const hasValidationErrors = Object.keys(errorState.validationErrors).length > 0;

  const getErrorSummary = useCallback((): string[] => {
    const summary: string[] = [];
    
    if (errorState.networkError) {
      summary.push(errorState.networkError.message);
    }
    
    if (errorState.formError) {
      summary.push(errorState.formError);
    }
    
    Object.values(errorState.validationErrors).forEach(error => {
      summary.push(error);
    });
    
    return summary;
  }, [errorState]);

  // Error handling helpers
  const handleApiError = useCallback((error: unknown) => {
    onError?.(error instanceof Error ? error : new Error(String(error)));

    if (error instanceof Error) {
      // Check if it's a network error
      if (
        error.message.includes('fetch') ||
        error.message.includes('Network') ||
        error.message.includes('timeout') ||
        error.name === 'NetworkError'
      ) {
        const networkError: NetworkError = {
          message: error.message,
          timestamp: new Date(),
          retryable: true,
        };

        // Try to extract status code from error
        if ('status' in error && typeof error.status === 'number') {
          networkError.status = error.status;
          networkError.retryable = error.status >= 500 || error.status === 0;
        }

        setNetworkError(networkError);
      } else {
        // Treat as form error
        setFormError(error.message);
      }
    } else {
      setFormError('An unexpected error occurred');
    }
  }, [onError, setNetworkError, setFormError]);

  const handleValidationResponse = useCallback((response: { errors?: Record<string, string[]> }) => {
    if (response.errors) {
      const validationErrors: Record<string, string> = {};
      
      Object.entries(response.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          validationErrors[field] = messages[0]; // Take first error message
        }
      });
      
      setValidationErrors(validationErrors);
    }
  }, [setValidationErrors]);

  const wrapAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    // Store the operation for retry functionality
    retryOperation.current = async () => {
      await operation();
    };

    try {
      clearAllErrors();
      const result = await operation();
      return result;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [clearAllErrors, handleApiError]);

  return {
    // Error state
    errorState,
    
    // Error setters
    setNetworkError,
    setValidationError,
    setValidationErrors,
    setFormError,
    
    // Error clearers
    clearNetworkError,
    clearValidationError,
    clearValidationErrors,
    clearFormError,
    clearAllErrors,
    
    // Retry functionality
    retry,
    canRetry,
    
    // Utility functions
    hasErrors,
    hasValidationErrors,
    getErrorSummary,
    
    // Error handling helpers
    handleApiError,
    handleValidationResponse,
    wrapAsyncOperation,
  };
};