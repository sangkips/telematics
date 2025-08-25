import React, { useState, useEffect } from 'react';
import { ConnectionState } from '../types/websocket';
import { websocketService } from '../services/websocketService';

interface WebSocketDebuggerProps {
  connectionState: ConnectionState;
  isVisible: boolean;
  onClose: () => void;
}

interface DebugLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

export const WebSocketDebugger: React.FC<WebSocketDebuggerProps> = ({
  connectionState,
  isVisible,
  onClose,
}) => {
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Add debug log entry
  const addDebugLog = (level: 'info' | 'warn' | 'error', message: string, details?: any) => {
    const log: DebugLog = {
      timestamp: new Date(),
      level,
      message,
      details,
    };
    
    setDebugLogs(prev => [...prev.slice(-49), log]); // Keep last 50 logs
  };

  // Monitor connection state changes
  useEffect(() => {
    if (!isVisible) return;

    addDebugLog('info', `Connection state changed: ${connectionState.status}`, connectionState);
  }, [connectionState, isVisible]);

  // Test connection function
  const testConnection = async () => {
    addDebugLog('info', 'Testing WebSocket connection...');
    
    try {
      // Test basic connectivity
      const token = localStorage.getItem('auth_token');
      if (!token) {
        addDebugLog('error', 'No authentication token found');
        return;
      }
      
      addDebugLog('info', 'Authentication token found');
      
      // Test API connectivity first
      try {
        const response = await fetch('/api/v1/health');
        if (response.ok) {
          addDebugLog('info', 'API server is reachable');
        } else {
          addDebugLog('warn', `API server returned status: ${response.status}`);
        }
      } catch (error) {
        addDebugLog('error', 'API server is not reachable', error);
      }
      
      // Test WebSocket connection
      websocketService.connect();
      addDebugLog('info', 'WebSocket connection attempt initiated');
      
    } catch (error) {
      addDebugLog('error', 'Connection test failed', error);
    }
  };

  // Force reconnection
  const forceReconnect = () => {
    addDebugLog('info', 'Forcing WebSocket reconnection...');
    websocketService.disconnect();
    setTimeout(() => {
      websocketService.connect();
    }, 1000);
  };

  // Clear logs
  const clearLogs = () => {
    setDebugLogs([]);
    addDebugLog('info', 'Debug logs cleared');
  };

  // Get environment info
  const getEnvironmentInfo = () => {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      protocol: window.location.protocol,
      webSocketSupport: 'WebSocket' in window,
      connectionState: connectionState,
      timestamp: new Date().toISOString(),
    };
  };

  // Export debug info
  const exportDebugInfo = () => {
    const debugInfo = {
      environment: getEnvironmentInfo(),
      logs: debugLogs,
      connectionHistory: connectionState,
    };
    
    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addDebugLog('info', 'Debug info exported');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">WebSocket Connection Debugger</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                connectionState.status === 'connected' ? 'bg-green-100 text-green-800' :
                connectionState.status === 'connecting' ? 'bg-blue-100 text-blue-800' :
                connectionState.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {connectionState.status}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Mode:</span>
              <span className="ml-2">
                {connectionState.fallbackMode ? 'Polling' : 'Real-time'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Attempts:</span>
              <span className="ml-2">{connectionState.reconnectAttempts}</span>
            </div>
            
            <div>
              <span className="font-medium">Last Connected:</span>
              <span className="ml-2 text-xs">
                {connectionState.lastConnected 
                  ? connectionState.lastConnected.toLocaleTimeString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testConnection}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Test Connection
            </button>
            
            <button
              onClick={forceReconnect}
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm hover:bg-orange-200 transition-colors"
            >
              Force Reconnect
            </button>
            
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Clear Logs
            </button>
            
            <button
              onClick={exportDebugInfo}
              className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
            >
              Export Debug Info
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'} Details
            </button>
          </div>
        </div>
        
        {/* Environment Info (when expanded) */}
        {isExpanded && (
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-medium mb-2">Environment Information</h3>
            <div className="text-xs font-mono bg-white p-3 rounded border overflow-auto max-h-32">
              <pre>{JSON.stringify(getEnvironmentInfo(), null, 2)}</pre>
            </div>
          </div>
        )}
        
        {/* Debug Logs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium">Debug Logs ({debugLogs.length}/50)</h3>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No debug logs yet. Try testing the connection.</p>
            ) : (
              <div className="space-y-2">
                {debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm border-l-4 ${
                      log.level === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                      log.level === 'warn' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                      'bg-blue-50 border-blue-400 text-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{log.message}</div>
                        {log.details && (
                          <div className="mt-1 text-xs font-mono bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-20">
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                      <span className="text-xs opacity-75 ml-2 whitespace-nowrap">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};