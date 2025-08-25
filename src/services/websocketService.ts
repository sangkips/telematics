
import {
  WebSocketMessage,
  ConnectionState,
  WebSocketEventCallback,
  ConnectionStateCallback
} from '../types/websocket';

type MessageCallback = WebSocketEventCallback;
type ConnectionCallback = ConnectionStateCallback;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private baseUrl: string;
  private reconnectTimer: number | null = null;
  private pollingTimer: number | null = null;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private connectionState: ConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0,
    fallbackMode: false,
  };
  private maxReconnectAttempts = 3;
  private baseReconnectDelay = 5000; // 5 seconds initial retry as per requirements
  private maxReconnectDelay = 30000; // 30 seconds max
  private pollingInterval = 30000; // 30 seconds polling interval as per requirements
  private isDestroyed = false;

  constructor() {
    // Get WebSocket URL from environment or construct from API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    this.baseUrl = apiUrl.replace(/^http/, 'ws');
  }

  /**
   * Establishes WebSocket connection to /ws/secure endpoint with session validation
   */
  public connect(): void {
    if (this.isDestroyed) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No authentication token available for WebSocket connection');
      this.updateConnectionState({ status: 'error' });
      return;
    }

    // Validate session before connecting
    this.validateSession(token).then(isValid => {
      if (!isValid) {
        console.error('Session validation failed for WebSocket connection');
        this.updateConnectionState({ status: 'error' });
        // Trigger logout to refresh session
        this.handleSessionExpired();
        return;
      }

      this.updateConnectionState({ status: 'connecting' });

      try {
        // Connect to /ws/secure endpoint with authentication token
        const wsUrl = `${this.baseUrl}/ws/secure?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = this.handleOpen.bind(this);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.handleConnectionFailure();
      }
    }).catch(error => {
      console.error('Session validation error:', error);
      this.updateConnectionState({ status: 'error' });
    });
  }

  /**
   * Cleanly closes WebSocket connection
   */
  public disconnect(): void {
    this.isDestroyed = true;
    this.clearTimers();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.updateConnectionState({
      status: 'disconnected',
      fallbackMode: false
    });
  }

  /**
   * Registers callback for real-time updates
   */
  public subscribe(callback: MessageCallback): void {
    this.messageCallbacks.add(callback);
  }

  /**
   * Removes callback registration
   */
  public unsubscribe(callback: MessageCallback): void {
    this.messageCallbacks.delete(callback);
  }

  /**
   * Registers callback for connection state changes
   */
  public onConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.add(callback);
  }

  /**
   * Removes connection state callback
   */
  public offConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.delete(callback);
  }

  /**
   * Gets current connection state
   */
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Switches to polling mode when WebSocket unavailable
   */
  public enableFallback(): void {
    if (this.connectionState.fallbackMode) return;

    console.log('Enabling fallback to polling mode');
    this.updateConnectionState({ fallbackMode: true });
    this.startPolling();
  }

  /**
   * Disables fallback polling mode
   */
  public disableFallback(): void {
    if (!this.connectionState.fallbackMode) return;

    console.log('Disabling fallback polling mode');
    this.stopPolling();
    this.updateConnectionState({ fallbackMode: false });
  }

  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.updateConnectionState({
      status: 'connected',
      lastConnected: new Date(),
      reconnectAttempts: 0,
    });

    // Disable fallback mode if it was enabled
    if (this.connectionState.fallbackMode) {
      this.disableFallback();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Notify all subscribers
      this.messageCallbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.ws = null;

    if (!this.isDestroyed) {
      this.updateConnectionState({ status: 'disconnected' });
      this.attemptReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.updateConnectionState({ status: 'error' });
  }

  private handleConnectionFailure(): void {
    this.updateConnectionState({ status: 'error' });

    if (!this.isDestroyed) {
      this.attemptReconnect();
    }
  }

  /**
   * Automatic reconnection with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.isDestroyed || this.reconnectTimer) return;

    const { reconnectAttempts } = this.connectionState;

    if (reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, enabling fallback mode');
      this.enableFallback();
      return;
    }

    // Exponential backoff: 5s, 10s, 20s, then cap at 30s
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.updateConnectionState({
      reconnectAttempts: reconnectAttempts + 1
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isDestroyed) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Starts polling for vehicle updates when WebSocket is unavailable
   */
  private startPolling(): void {
    if (this.pollingTimer) return;

    console.log(`Starting polling with ${this.pollingInterval}ms interval`);

    const poll = async () => {
      try {
        // Import apiService dynamically to avoid circular dependencies
        const { apiService } = await import('./api');
        const vehicles = await apiService.getVehicleUpdates();

        // Simulate WebSocket message format for polling updates
        // Send individual messages for each vehicle to match WebSocket behavior
        vehicles.forEach(vehicle => {
          const message: WebSocketMessage = {
            type: 'vehicle_update',
            payload: {
              vehicleId: vehicle.id,
              data: vehicle,
              timestamp: new Date().toISOString(),
              operation: 'update'
            },
            metadata: {
              source: 'polling',
              version: '1.0'
            }
          };

          // Notify subscribers
          this.messageCallbacks.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in polling callback:', error);
            }
          });
        });

      } catch (error) {
        console.error('Polling failed:', error);
      }
    };

    // Initial poll
    poll();

    // Set up recurring polling
    this.pollingTimer = setInterval(poll, this.pollingInterval);
  }

  /**
   * Stops polling
   */
  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPolling();
  }

  /**
   * Validates session token before establishing WebSocket connection
   */
  private async validateSession(token: string): Promise<boolean> {
    try {
      // Import apiService dynamically to avoid circular dependencies
      const { apiService } = await import('./api');

      // Make a lightweight API call to validate the session
      await apiService.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Handles session expiry by triggering logout
   */
  private async handleSessionExpired(): Promise<void> {
    try {
      // Import AuthContext dynamically to trigger logout
      // In a real implementation, you might use an event system or callback
      console.warn('WebSocket session expired, user needs to re-authenticate');

      // Clear local storage
      localStorage.removeItem('auth_token');

      // Redirect to login or trigger app-wide logout
      // This would typically be handled by the auth context
      window.dispatchEvent(new CustomEvent('session-expired'));

    } catch (error) {
      console.error('Error handling session expiry:', error);
    }
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };

    // Notify connection state subscribers
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(this.getConnectionState());
      } catch (error) {
        console.error('Error in connection state callback:', error);
      }
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;