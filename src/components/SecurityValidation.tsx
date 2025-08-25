import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../types';

interface SecurityValidationProps {
  children: ReactNode;
  requiredPermission: string;
  fallbackComponent?: ReactNode;
  showError?: boolean;
}

interface PermissionDeniedProps {
  permission: string;
  className?: string;
}

/**
 * Component that displays when user lacks required permissions
 */
export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  permission,
  className = ''
}) => {
  return (
    <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Access Denied
          </h3>
          <div className="mt-2 text-sm text-red-700">
            You do not have the required permission: <code className="bg-red-100 px-1 py-0.5 rounded text-xs">{permission}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Security validation wrapper component that checks permissions before rendering children
 */
export const SecurityValidation: React.FC<SecurityValidationProps> = ({
  children,
  requiredPermission,
  fallbackComponent,
  showError = true,
}) => {
  const { hasPermission, isAuthenticated, loading } = useAuth();

  // Show loading state while authentication is being verified
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Verifying permissions...</span>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Authentication Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              Please log in to access this feature.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required permission
  if (!hasPermission(requiredPermission)) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (showError) {
      return <PermissionDenied permission={requiredPermission} />;
    }

    return null;
  }

  // User has permission, render children
  return <>{children}</>;
};

/**
 * Hook for checking permissions in components
 */
export const usePermissionCheck = (requiredPermission: string) => {
  const { hasPermission, isAuthenticated, loading } = useAuth();

  return {
    hasPermission: hasPermission(requiredPermission),
    isAuthenticated,
    loading,
    canAccess: isAuthenticated && hasPermission(requiredPermission),
  };
};

/**
 * Higher-order component for wrapping components with permission checks
 */
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: string,
  fallbackComponent?: ReactNode
) => {
  const WithPermissionComponent: React.FC<P> = (props) => {
    return (
      <SecurityValidation
        requiredPermission={requiredPermission}
        fallbackComponent={fallbackComponent}
      >
        <WrappedComponent {...props} />
      </SecurityValidation>
    );
  };

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPermissionComponent;
};

/**
 * Component for displaying sensitive field update confirmations
 */
interface SensitiveFieldConfirmationProps {
  isOpen: boolean;
  fieldName: string;
  oldValue: string;
  newValue: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SensitiveFieldConfirmation: React.FC<SensitiveFieldConfirmationProps> = ({
  isOpen,
  fieldName,
  oldValue,
  newValue,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Sensitive Field Update
              </h3>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              You are about to update a sensitive field. This action will be logged for security purposes.
            </p>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">Field: {fieldName}</div>
                <div className="mb-1">
                  <span className="text-gray-600">Current value:</span>
                  <span className="ml-2 font-mono text-sm bg-gray-200 px-1 py-0.5 rounded">{oldValue || '(empty)'}</span>
                </div>
                <div>
                  <span className="text-gray-600">New value:</span>
                  <span className="ml-2 font-mono text-sm bg-yellow-100 px-1 py-0.5 rounded">{newValue || '(empty)'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export permission constants for easy access
export { PERMISSIONS };