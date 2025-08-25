import { Vehicle } from '../types';

/**
 * WebSocket message types for real-time communication
 */
export type WebSocketMessageType = 
  | 'vehicle_update' 
  | 'vehicle_create' 
  | 'vehicle_delete' 
  | 'connection_status'
  | 'ping'
  | 'pong';

/**
 * WebSocket operation types
 */
export type WebSocketOperation = 'create' | 'update' | 'delete';

/**
 * WebSocket message format for real-time communication
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: {
    vehicleId?: string;
    data?: Partial<Vehicle>;
    timestamp: string;
    userId?: string;
    operation?: WebSocketOperation;
  };
  metadata?: {
    source: string;
    version: string;
    clientId?: string;
  };
}

/**
 * Vehicle update payload for WebSocket operations
 */
export interface VehicleUpdatePayload {
  id: string;
  updates: Partial<Vehicle>;
  timestamp: string;
  userId: string;
  optimisticUpdate?: boolean;
  conflictResolution?: 'merge' | 'overwrite' | 'reject';
  version?: number; // For optimistic locking
}

/**
 * WebSocket connection state tracking
 */
export interface ConnectionState {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnected?: Date;
  reconnectAttempts: number;
  fallbackMode: boolean;
  latency?: number;
  error?: string;
  clientId?: string;
}

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  fallbackPollingInterval: number;
  heartbeatInterval: number;
  authToken?: string;
}

/**
 * WebSocket event callback types
 */
export type WebSocketEventCallback = (message: WebSocketMessage) => void;
export type ConnectionStateCallback = (state: ConnectionState) => void;

/**
 * WebSocket subscription interface
 */
export interface WebSocketSubscription {
  id: string;
  callback: WebSocketEventCallback;
  messageTypes?: WebSocketMessageType[];
  vehicleIds?: string[];
}

/**
 * Extended vehicle interface with WebSocket-specific fields
 */
export interface VehicleWithWebSocketData extends Vehicle {
  // WebSocket-specific metadata
  lastWebSocketUpdate?: Date;
  optimisticUpdates?: Partial<Vehicle>[];
  conflictState?: {
    hasConflict: boolean;
    conflictingFields: string[];
    serverVersion: number;
    clientVersion: number;
  };
  updateSource?: 'websocket' | 'rest' | 'optimistic';
}

/**
 * Vehicle update conflict information
 */
export interface VehicleUpdateConflict {
  vehicleId: string;
  conflictingFields: string[];
  serverData: Partial<Vehicle>;
  clientData: Partial<Vehicle>;
  timestamp: Date;
  resolution?: 'merge' | 'overwrite' | 'reject';
}

/**
 * WebSocket error types
 */
export interface WebSocketError {
  code: string;
  message: string;
  timestamp: Date;
  recoverable: boolean;
  details?: Record<string, any>;
}