import React from 'react';

export interface ErrorDisplayProps {
  error: string | Error | null;
  type?: 'field' | 'form' | 'network' | 'validation' | 'conflict' | 'permission';
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  type = 'form',
  className = '',
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  showIcon = true,
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  const getErrorStyles = () => {
    switch (type) {
      case 'field':
        return 'text-red-600 text-sm';
      case 'network':
        return 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg';
      case 'validation':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md';
      case 'conflict':
        return 'bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg';
      case 'permission':
        return 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg';
      default:
        return 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;

    switch (type) {
      case 'field':
        return (
          <svg className="h-4 w-4 text-red-500 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'network':
        return (
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'conflict':
        return (
          <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'permission':
        return (
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (type === 'field') {
    return (
      <p className={`${getErrorStyles()} ${className}`}>
        {getIcon()}
        {errorMessage}
      </p>
    );
  }

  return (
    <div className={`${getErrorStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">
            {type === 'network' && 'Network Error'}
            {type === 'validation' && 'Validation Error'}
            {type === 'conflict' && 'Update Conflict'}
            {type === 'permission' && 'Permission Denied'}
            {type === 'form' && 'Error'}
          </div>
          <div className="mt-1 text-sm">
            {errorMessage}
          </div>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none focus:underline"
                >
                  {retryLabel}
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none focus:underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;