// import React from 'react';
// import { ConnectionState } from '../types/websocket';

// interface ConnectionStatusIndicatorProps {
//   connectionState: ConnectionState;
//   onManualRefresh?: () => void;
//   onToggleDebug?: () => void;
//   className?: string;
// }

// export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
//   connectionState,
//   onManualRefresh,
//   onToggleDebug,
//   className = '',
// }) => {
//   const getStatusColor = () => {
//     switch (connectionState.status) {
//       case 'connected':
//         return connectionState.fallbackMode ? 'text-yellow-600' : 'text-green-600';
//       case 'connecting':
//         return 'text-blue-600';
//       case 'disconnected':
//         return 'text-gray-500';
//       case 'error':
//         return 'text-red-600';
//       default:
//         return 'text-gray-500';
//     }
//   };

//   const getStatusIcon = () => {
//     switch (connectionState.status) {
//       case 'connected':
//         return connectionState.fallbackMode ? '🔄' : '🟢';
//       case 'connecting':
//         return '🔵';
//       case 'disconnected':
//         return '⚫';
//       case 'error':
//         return '🔴';
//       default:
//         return '⚫';
//     }
//   };

//   const getStatusText = () => {
//     if (connectionState.fallbackMode) {
//       return 'Polling Mode';
//     }
    
//     switch (connectionState.status) {
//       case 'connected':
//         return 'Real-time';
//       case 'connecting':
//         return 'Connecting...';
//       case 'disconnected':
//         return 'Offline';
//       case 'error':
//         return 'Connection Error';
//       default:
//         return 'Unknown';
//     }
//   };

//   const getDetailText = () => {
//     if (connectionState.fallbackMode) {
//       return 'Updates every 30 seconds';
//     }
    
//     if (connectionState.status === 'connected' && connectionState.lastConnected) {
//       const timeSince = Math.floor((Date.now() - connectionState.lastConnected.getTime()) / 1000);
//       if (timeSince < 60) {
//         return `Connected ${timeSince}s ago`;
//       } else {
//         const minutes = Math.floor(timeSince / 60);
//         return `Connected ${minutes}m ago`;
//       }
//     }
    
//     if (connectionState.reconnectAttempts > 0) {
//       return `Retry attempt ${connectionState.reconnectAttempts}`;
//     }
    
//     return '';
//   };

//   return (
//     <div className={`flex items-center space-x-2 ${className}`}>
//       <div className="flex items-center space-x-1">
//         <span className="text-sm">{getStatusIcon()}</span>
//         <span className={`text-sm font-medium ${getStatusColor()}`}>
//           {getStatusText()}
//         </span>
//       </div>
      
//       {getDetailText() && (
//         <span className="text-xs text-gray-500">
//           {getDetailText()}
//         </span>
//       )}
      
//       {connectionState.fallbackMode && onManualRefresh && (
//         <button
//           onClick={onManualRefresh}
//           className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
//           title="Refresh data manually"
//         >
//           Refresh
//         </button>
//       )}
      
//       {onToggleDebug && (
//         <button
//           onClick={onToggleDebug}
//           className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
//           title="Show connection debug info"
//         >
//           Debug
//         </button>
//       )}
//     </div>
//   );
// };