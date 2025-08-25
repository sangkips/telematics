import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { WebSocketService } from '../websocketService';
import { WebSocketMessage, ConnectionState } from '../../types/websocket';

// Mock WebSocket
class MockWebSocket {
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public readyState: number = WebSocket.CONNECTING;

  constructor(public url: string) {}

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  }

  send(data: string) {
    // Mock send implementation
  }

  simulateOpen() {
    this.readyState = WebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock global WebSocket
(global as any).WebSocket = MockWebSocket;

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    service = new WebSocketService();
    
    // Mock WebSocket constructor to capture instance
    const OriginalWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = vi.fn().mockImplementation((url: string) => {
      mockWs = new OriginalWebSocket(url);
      return mockWs;
    });
  });

  afterEach(() => {
    service.disconnect();
    vi.clearAllTimers();
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection to /ws/secure endpoint', () => {
      service.connect();
      
      expect((global as any).WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('/ws/secure?token=mock-token')
      );
    });

    it('should handle successful connection', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.connect();
      mockWs.simulateOpen();
      
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'connected',
          reconnectAttempts: 0,
        })
      );
    });

    it('should handle connection errors', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.connect();
      mockWs.simulateError();
      
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        })
      );
    });

    it('should not connect without authentication token', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.connect();
      
      expect((global as any).WebSocket).not.toHaveBeenCalled();
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        })
      );
    });
  });

  describe('Message Handling', () => {
    it('should process incoming WebSocket messages', () => {
      const messageCallback = vi.fn();
      service.subscribe(messageCallback);
      
      service.connect();
      mockWs.simulateOpen();
      
      const testMessage: WebSocketMessage = {
        type: 'vehicle_update',
        payload: {
          vehicleId: 'test-vehicle',
          timestamp: new Date().toISOString(),
          operation: 'update',
        },
      };
      
      mockWs.simulateMessage(testMessage);
      
      expect(messageCallback).toHaveBeenCalledWith(testMessage);
    });

    it('should handle multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      service.subscribe(callback1);
      service.subscribe(callback2);
      
      service.connect();
      mockWs.simulateOpen();
      
      const testMessage: WebSocketMessage = {
        type: 'vehicle_update',
        payload: {
          timestamp: new Date().toISOString(),
          operation: 'update',
        },
      };
      
      mockWs.simulateMessage(testMessage);
      
      expect(callback1).toHaveBeenCalledWith(testMessage);
      expect(callback2).toHaveBeenCalledWith(testMessage);
    });

    it('should unsubscribe callbacks', () => {
      const messageCallback = vi.fn();
      service.subscribe(messageCallback);
      service.unsubscribe(messageCallback);
      
      service.connect();
      mockWs.simulateOpen();
      
      const testMessage: WebSocketMessage = {
        type: 'vehicle_update',
        payload: {
          timestamp: new Date().toISOString(),
          operation: 'update',
        },
      };
      
      mockWs.simulateMessage(testMessage);
      
      expect(messageCallback).not.toHaveBeenCalled();
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should attempt reconnection after connection loss', () => {
      service.connect();
      mockWs.simulateOpen();
      
      // Simulate connection loss
      mockWs.close();
      
      // Fast-forward past initial reconnect delay (5 seconds)
      vi.advanceTimersByTime(5000);
      
      // Should attempt to reconnect
      expect((global as any).WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for reconnection attempts', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.connect();
      mockWs.simulateOpen();
      
      // First reconnection attempt
      mockWs.close();
      vi.advanceTimersByTime(5000); // 5 seconds
      expect((global as any).WebSocket).toHaveBeenCalledTimes(2);
      
      // Second reconnection attempt
      mockWs.close();
      vi.advanceTimersByTime(10000); // 10 seconds (2^1 * 5000)
      expect((global as any).WebSocket).toHaveBeenCalledTimes(3);
      
      // Third reconnection attempt
      mockWs.close();
      vi.advanceTimersByTime(20000); // 20 seconds (2^2 * 5000)
      expect((global as any).WebSocket).toHaveBeenCalledTimes(4);
    });

    it('should enable fallback mode after max reconnection attempts', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.connect();
      mockWs.simulateOpen();
      
      // Simulate 3 failed reconnection attempts
      for (let i = 0; i < 3; i++) {
        mockWs.close();
        vi.advanceTimersByTime(Math.pow(2, i) * 5000);
      }
      
      // Should enable fallback mode
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackMode: true,
        })
      );
    });
  });

  describe('Fallback Mode', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should enable fallback to polling', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.enableFallback();
      
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackMode: true,
        })
      );
    });

    it('should disable fallback mode', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.enableFallback();
      service.disableFallback();
      
      expect(connectionCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          fallbackMode: false,
        })
      );
    });
  });

  describe('Connection State', () => {
    it('should return current connection state', () => {
      const state = service.getConnectionState();
      
      expect(state).toEqual({
        status: 'disconnected',
        reconnectAttempts: 0,
        fallbackMode: false,
      });
    });

    it('should update connection state on status changes', () => {
      const connectionCallback = vi.fn();
      service.onConnectionChange(connectionCallback);
      
      service.connect();
      mockWs.simulateOpen();
      
      const state = service.getConnectionState();
      expect(state.status).toBe('connected');
      expect(state.lastConnected).toBeInstanceOf(Date);
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on disconnect', () => {
      service.connect();
      mockWs.simulateOpen();
      
      service.disconnect();
      
      const state = service.getConnectionState();
      expect(state.status).toBe('disconnected');
      expect(state.fallbackMode).toBe(false);
    });
  });
});