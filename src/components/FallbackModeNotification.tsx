import React, { useState } from 'react';
import { ConnectionState } from '../types/websocket';

interface FallbackModeNotificationProps {
  connectionState: ConnectionState;
  onManualRefresh?: () => void;
  onRetryConnection?: () => void;
  onDismiss?: () => void;
}

export const FallbackModeNotification: React.FC<FallbackModeNotificationProps> = ({
  connectionState,
  onManualRefresh,
  onRetryConnection,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show notification when in fallback mode or error state
  if (!connectionState.fallbackMode && connectionState.status !== 'error') {
    return null;
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // const getNotificationContent = () => {
  //   if (connectionState.fallbackMode) {
  //     return {
  //       icon: '🔄',
  //       title: 'Polling Mode Active',
  //       message: 'Real-time updates are unavailable. Data refreshes every 30 seconds.',
  //       bgColor: 'bg-yellow-50',
  //       borderColor: 'border-yellow-200',
  //       textColor: 'text-yellow-800',
  //       buttonColor: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  //     };
  //   } else if (connectionState.status === 'error') {
  //     return {
  //       icon: '⚠️',
  //       title: 'Connection Error',
  //       message: 'Unable to establish real-time connection. Some features may be limited.',
  //       bgColor: 'bg-red-50',
  //       borderColor: 'border-red-200',
  //       textColor: 'text-red-800',
  //       buttonColor: 'bg-red-100 hover:bg-red-200 text-red-800',
  //     };
  //   }
    
  //   return null;
  // };

  // const content = getNotificationContent();
  // if (!content) return null;

  // return (
  //   <div className={`${content.bgColor} ${content.borderColor} border rounded-lg p-4 mb-4`}>
  //     <div className="flex items-start justify-between">
  //       <div className="flex items-start space-x-3">
  //         <span className="text-lg">{content.icon}</span>
  //         <div className="flex-1">
  //           <h3 className={`text-sm font-medium ${content.textColor}`}>
  //             {content.title}
  //           </h3>
  //           <p className={`text-sm mt-1 ${content.textColor} opacity-90`}>
  //             {content.message}
  //           </p>
            
  //           {connectionState.error && (
  //             <p className="text-xs mt-2 text-gray-600 font-mono bg-white bg-opacity-50 p-2 rounded">
  //               Error: {connectionState.error}
  //             </p>
  //           )}
  //         </div>
  //       </div>
        
  //       <button
  //         onClick={handleDismiss}
  //         className={`text-sm ${content.textColor} opacity-60 hover:opacity-100 transition-opacity`}
  //         title="Dismiss notification"
  //       >
  //         ✕
  //       </button>
  //     </div>
      
  //     <div className="flex items-center space-x-2 mt-3">
  //       {connectionState.fallbackMode && onManualRefresh && (
  //         <button
  //           onClick={onManualRefresh}
  //           className={`text-xs px-3 py-1 rounded ${content.buttonColor} transition-colors`}
  //         >
  //           Refresh Now
  //         </button>
  //       )}
        
  //       {(connectionState.status === 'error' || connectionState.fallbackMode) && onRetryConnection && (
  //         <button
  //           onClick={onRetryConnection}
  //           className={`text-xs px-3 py-1 rounded ${content.buttonColor} transition-colors`}
  //         >
  //           Retry Connection
  //         </button>
  //       )}
        
  //       {connectionState.reconnectAttempts > 0 && (
  //         <span className={`text-xs ${content.textColor} opacity-75`}>
  //           Reconnection attempts: {connectionState.reconnectAttempts}
  //         </span>
  //       )}
  //     </div>
  //   </div>
  // );
};