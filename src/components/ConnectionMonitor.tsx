import React, { useState, useCallback } from 'react';
import { ConnectionState } from '../types/websocket';
// import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { FallbackModeNotification } from './FallbackModeNotification';
import { WebSocketDebugger } from './WebSocketDebugger';
import { websocketService } from '../services/websocketService';

interface ConnectionMonitorProps {
  connectionState: ConnectionState;
  onManualRefresh?: () => void;
  showNotifications?: boolean;
  className?: string;
}

export const ConnectionMonitor: React.FC<ConnectionMonitorProps> = ({
  connectionState,
  onManualRefresh,
  showNotifications = true,
  className = '',
}) => {
  const [showDebugger, setShowDebugger] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Handle manual refresh
  const handleManualRefresh = useCallback(() => {
    if (onManualRefresh) {
      onManualRefresh();
    }
  }, [onManualRefresh]);

  // Handle retry connection
  const handleRetryConnection = useCallback(() => {
    websocketService.disconnect();
    setTimeout(() => {
      websocketService.connect();
    }, 1000);
  }, []);

  // Toggle debug panel
  const handleToggleDebug = useCallback(() => {
    setShowDebugger(prev => !prev);
  }, []);

  // Handle notification dismiss
  const handleNotificationDismiss = useCallback(() => {
    setNotificationDismissed(true);
  }, []);

  return (
    <div className={className}>
      {/* Connection Status Indicator */}
      {/* <ConnectionStatusIndicator
        connectionState={connectionState}
        onManualRefresh={handleManualRefresh}
        onToggleDebug={handleToggleDebug}
      /> */}

      {/* Fallback Mode Notification */}
      {showNotifications && !notificationDismissed && (
        <div className="mt-2">
          <FallbackModeNotification
            connectionState={connectionState}
            onManualRefresh={handleManualRefresh}
            onRetryConnection={handleRetryConnection}
            onDismiss={handleNotificationDismiss}
          />
        </div>
      )}

      {/* WebSocket Debugger Modal */}
      <WebSocketDebugger
        connectionState={connectionState}
        isVisible={showDebugger}
        onClose={() => setShowDebugger(false)}
      />
    </div>
  );
};