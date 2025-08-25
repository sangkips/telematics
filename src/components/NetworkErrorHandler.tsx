import React, { useState, useCallback, useEffect } from 'react';
import { ErrorDisplay } from './ErrorDisplay';

export interface NetworkError {
    message: string;
    code?: string | number;
    status?: number;
    retryable?: boolean;
    timestamp: Date;
}

export interface NetworkErrorHandlerProps {
    error: NetworkError | null;
    onRetry?: () => Promise<void>;
    onDismiss?: () => void;
    maxRetries?: number;
    retryDelay?: number;
    className?: string;
    showAutoRetry?: boolean;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
    error,
    onRetry,
    onDismiss,
    maxRetries = 3,
    retryDelay = 2000,
    className = '',
    showAutoRetry = true,
}) => {
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

    // Reset retry count when error changes
    useEffect(() => {
        if (error) {
            setRetryCount(0);
            setAutoRetryCountdown(null);
        }
    }, [error]);

    const handleRetry = useCallback(async () => {
        if (!onRetry || isRetrying) return;

        setIsRetrying(true);
        setAutoRetryCountdown(null);

        try {
            await onRetry();
            setRetryCount(0); // Reset on successful retry
        } catch (retryError) {
            setRetryCount(prev => prev + 1);
            console.error('Retry failed:', retryError);
        } finally {
            setIsRetrying(false);
        }
    }, [onRetry, isRetrying]);

    // Auto-retry logic for retryable errors
    useEffect(() => {
        if (!error || !error.retryable || !showAutoRetry || retryCount >= maxRetries) {
            return;
        }

        const startAutoRetry = () => {
            let countdown = Math.ceil(retryDelay / 1000);
            setAutoRetryCountdown(countdown);

            const countdownInterval = setInterval(() => {
                countdown -= 1;
                setAutoRetryCountdown(countdown);

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    setAutoRetryCountdown(null);
                    handleRetry();
                }
            }, 1000);

            return () => clearInterval(countdownInterval);
        };

        const timer = setTimeout(startAutoRetry, 1000);
        return () => clearTimeout(timer);
    }, [error, retryCount, maxRetries, retryDelay, showAutoRetry, handleRetry]);

    const handleDismiss = useCallback(() => {
        setAutoRetryCountdown(null);
        setRetryCount(0);
        onDismiss?.();
    }, [onDismiss]);

    const getErrorMessage = useCallback((error: NetworkError): string => {
        // Provide user-friendly messages for common network errors
        if (error.status === 0 || error.message.includes('Network Error')) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }

        if (error.status === 401) {
            return 'Your session has expired. Please log in again to continue.';
        }

        if (error.status === 403) {
            return 'You do not have permission to perform this action.';
        }

        if (error.status === 404) {
            return 'The requested resource was not found. It may have been moved or deleted.';
        }

        if (error.status === 409) {
            return 'This item has been modified by another user. Please refresh and try again.';
        }

        if (error.status === 422) {
            return 'The data you submitted is invalid. Please check your input and try again.';
        }

        if (error.status && error.status >= 500) {
            return 'The server is experiencing issues. Please try again in a few moments.';
        }

        if (error.message.includes('timeout')) {
            return 'The request timed out. Please check your connection and try again.';
        }

        if (error.message.includes('CORS')) {
            return 'There was a problem connecting to the server. Please contact support if this continues.';
        }

        // Fallback to original message if no specific handling
        return error.message || 'An unexpected network error occurred.';
    }, []);

    if (!error) return null;

    const userFriendlyMessage = getErrorMessage(error);
    const canRetry = error.retryable && retryCount < maxRetries && onRetry;
    const showManualRetry = canRetry && !isRetrying;

    return (
        <div className={className}>
            <ErrorDisplay
                error={userFriendlyMessage}
                type="network"
                onRetry={showManualRetry ? handleRetry : undefined}
                onDismiss={handleDismiss}
                retryLabel={
                    isRetrying
                        ? 'Retrying...'
                        : autoRetryCountdown
                            ? `Auto-retry in ${autoRetryCountdown}s`
                            : `Retry (${retryCount}/${maxRetries})`
                }
            />

            {/* Additional error details for debugging */}
            {import.meta.env.DEV && (
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-500">
                        Debug Information
                    </summary>
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify({
                            message: error.message,
                            code: error.code,
                            status: error.status,
                            timestamp: error.timestamp,
                            retryCount,
                            retryable: error.retryable,
                        }, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

export default NetworkErrorHandler;