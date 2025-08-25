import React from 'react';

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorSummaryProps {
  errors: ValidationError[];
  touched?: Record<string, boolean>;
  showOnlyTouched?: boolean;
  className?: string;
  onFieldFocus?: (field: string) => void;
  title?: string;
  collapsible?: boolean;
  maxVisible?: number;
}

export const ValidationErrorSummary: React.FC<ValidationErrorSummaryProps> = ({
  errors,
  touched = {},
  showOnlyTouched = false,
  className = '',
  onFieldFocus,
  title = 'Please fix the following errors:',
  collapsible = false,
  maxVisible = 5,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  // Filter errors based on touched state if required
  const visibleErrors = showOnlyTouched 
    ? errors.filter(error => touched[error.field])
    : errors;

  if (visibleErrors.length === 0) return null;

  const displayedErrors = showAll 
    ? visibleErrors 
    : visibleErrors.slice(0, maxVisible);

  const hasMoreErrors = visibleErrors.length > maxVisible && !showAll;

  const handleFieldClick = (field: string) => {
    onFieldFocus?.(field);
    
    // Try to focus the field element
    const fieldElement = document.querySelector(`[name="${field}"], #${field}`);
    if (fieldElement && 'focus' in fieldElement) {
      (fieldElement as HTMLElement).focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getFieldDisplayName = (field: string): string => {
    // Convert camelCase and snake_case to readable format
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\./g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-800">
              {title} ({visibleErrors.length} error{visibleErrors.length !== 1 ? 's' : ''})
            </h3>
            
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-red-600 hover:text-red-800 focus:outline-none"
              >
                <svg 
                  className={`h-4 w-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {!isCollapsed && (
            <>
              <div className="mt-2">
                <ul className="space-y-1">
                  {displayedErrors.map((error, index) => (
                    <li key={`${error.field}-${index}`} className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => handleFieldClick(error.field)}
                          className="text-sm text-red-700 hover:text-red-900 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded text-left"
                        >
                          <span className="font-medium">
                            {getFieldDisplayName(error.field)}:
                          </span>{' '}
                          {error.message}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {hasMoreErrors && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="text-sm font-medium text-red-600 hover:text-red-800 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    Show {visibleErrors.length - maxVisible} more error{visibleErrors.length - maxVisible !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
              
              {showAll && visibleErrors.length > maxVisible && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="text-sm font-medium text-red-600 hover:text-red-800 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    Show fewer errors
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorSummary;