// import React, { useState } from 'react';
// import { ConnectionState } from '../types/websocket';
// import { ConnectionMonitor } from './ConnectionMonitor';

// export const ConnectionMonitorTest: React.FC = () => {
//   const [connectionState, setConnectionState] = useState<ConnectionState>({
//     status: 'connected',
//     reconnectAttempts: 0,
//     fallbackMode: false,
//     lastConnected: new Date(),
//   });

//   const testStates: Array<{ name: string; state: Partial<ConnectionState> }> = [
//     {
//       name: 'Connected (Real-time)',
//       state: {
//         status: 'connected',
//         fallbackMode: false,
//         lastConnected: new Date(),
//         reconnectAttempts: 0,
//       },
//     },
//     {
//       name: 'Connected (Polling Mode)',
//       state: {
//         status: 'connected',
//         fallbackMode: true,
//         lastConnected: new Date(Date.now() - 60000), // 1 minute ago
//         reconnectAttempts: 0,
//       },
//     },
//     {
//       name: 'Connecting',
//       state: {
//         status: 'connecting',
//         fallbackMode: false,
//         reconnectAttempts: 1,
//       },
//     },
//     {
//       name: 'Disconnected',
//       state: {
//         status: 'disconnected',
//         fallbackMode: false,
//         reconnectAttempts: 0,
//       },
//     },
//     {
//       name: 'Error State',
//       state: {
//         status: 'error',
//         fallbackMode: false,
//         reconnectAttempts: 3,
//         error: 'WebSocket connection failed: Network error',
//       },
//     },
//     {
//       name: 'Error with Fallback',
//       state: {
//         status: 'error',
//         fallbackMode: true,
//         reconnectAttempts: 3,
//         error: 'Max reconnection attempts reached',
//       },
//     },
//   ];

//   const handleManualRefresh = () => {
//     console.log('Manual refresh triggered');
//     alert('Manual refresh triggered - check console');
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <h1 className="text-2xl font-bold">Connection Monitor Test</h1>
        
//         {/* Test Controls */}
//         <div className="bg-gray-800 rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-4">Test Different Connection States</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//             {testStates.map((test) => (
//               <button
//                 key={test.name}
//                 onClick={() => setConnectionState(prev => ({ ...prev, ...test.state }))}
//                 className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
//               >
//                 {test.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Current State Display */}
//         <div className="bg-gray-800 rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-4">Current Connection State</h2>
//           <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto">
//             {JSON.stringify(connectionState, null, 2)}
//           </pre>
//         </div>

//         {/* Connection Monitor Component */}
//         <div className="bg-gray-800 rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-4">Connection Monitor Component</h2>
//           <ConnectionMonitor
//             connectionState={connectionState}
//             onManualRefresh={handleManualRefresh}
//             showNotifications={true}
//           />
//         </div>

//         {/* Instructions */}
//         <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
//           <h2 className="text-lg font-semibold mb-2">Test Instructions</h2>
//           <ul className="text-sm space-y-1 list-disc list-inside">
//             <li>Click the buttons above to test different connection states</li>
//             <li>Try the "Refresh" button when in polling mode</li>
//             <li>Click "Debug" to open the WebSocket debugger</li>
//             <li>Test dismissing notifications when they appear</li>
//             <li>Try the "Retry Connection" button in error states</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };