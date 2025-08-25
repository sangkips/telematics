import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { Vehicle } from "../types";
import { apiService } from "../services/api";
import { websocketService } from "../services/websocketService";
import { WebSocketMessage, ConnectionState } from "../types/websocket";
import { useAuth } from "./AuthContext";
import { auditService, OptimisticLockData } from "../services/auditService";

export interface UpdateOperation {
  id: string;
  vehicleId: string;
  updates: Partial<Vehicle>;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  optimistic: boolean;
}

interface VehicleUpdateContextType {
  // Vehicle data state
  vehicles: Record<string, Vehicle>;

  // Connection state
  connectionState: ConnectionState;

  // Update operations state
  pendingUpdates: Record<string, UpdateOperation>;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Methods
  updateVehicle: (id: string, updates: Partial<Vehicle>, optimistic?: boolean) => Promise<Vehicle>;
  getVehicle: (id: string) => Vehicle | undefined;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  refreshVehicles: () => Promise<void>;
  clearError: () => void;
  retryFailedUpdate: (operationId: string) => Promise<void>;
}

const VehicleUpdateContext = createContext<VehicleUpdateContextType | undefined>(undefined);

export const useVehicleUpdate = () => {
  const context = useContext(VehicleUpdateContext);
  if (context === undefined) {
    throw new Error("useVehicleUpdate must be used within a VehicleUpdateProvider");
  }
  return context;
};

interface VehicleUpdateProviderProps {
  children: ReactNode;
}

export const VehicleUpdateProvider: React.FC<VehicleUpdateProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // State management
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0,
    fallbackMode: false,
  });
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, UpdateOperation>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const isSubscribed = useRef(false);
  const updateTimeouts = useRef<Record<string, number>>({});

  // Load initial vehicles data
  const refreshVehicles = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const vehicleList = await apiService.getVehicles();
      const vehicleMap = vehicleList.reduce((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {} as Record<string, Vehicle>);

      setVehicles(vehicleMap);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // WebSocket message handler
  const handleWebSocketUpdate = useCallback((message: WebSocketMessage) => {
    try {
      if (message.type === 'vehicle_update' && message.payload.vehicleId && message.payload.data) {
        const { vehicleId, data, timestamp, userId } = message.payload;

        setVehicles(prev => {
          const currentVehicle = prev[vehicleId];
          if (!currentVehicle) {
            // Vehicle doesn't exist locally, might be a new vehicle
            return prev;
          }

          // Check if this is our own update (avoid duplicate processing)
          if (userId === user?.id) {
            // This is our own update, mark any pending operation as successful
            setPendingUpdates(prevPending => {
              const updatedPending = { ...prevPending };
              Object.keys(updatedPending).forEach(opId => {
                const op = updatedPending[opId];
                if (op.vehicleId === vehicleId && op.status === 'pending') {
                  updatedPending[opId] = { ...op, status: 'success' };

                  // Clear the operation after a short delay
                  setTimeout(() => {
                    setPendingUpdates(current => {
                      const { [opId]: _, ...rest } = current;
                      return rest;
                    });
                  }, 2000);
                }
              });
              return updatedPending;
            });
          }

          // Apply the update
          const updatedVehicle = {
            ...currentVehicle,
            ...data,
            updatedAt: new Date(timestamp),
          };

          return {
            ...prev,
            [vehicleId]: updatedVehicle,
          };
        });
      } else if (message.type === 'vehicle_create' && message.payload.data) {
        // Handle new vehicle creation
        const newVehicle = message.payload.data as Vehicle;
        setVehicles(prev => ({
          ...prev,
          [newVehicle.id]: newVehicle,
        }));
      } else if (message.type === 'vehicle_delete' && message.payload.vehicleId) {
        // Handle vehicle deletion
        const vehicleId = message.payload.vehicleId;
        setVehicles(prev => {
          const { [vehicleId]: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Error processing WebSocket update:', error);
      setError('Failed to process real-time update');
    }
  }, [user?.id]);

  // Connection state handler
  const handleConnectionChange = useCallback((state: ConnectionState) => {
    setConnectionState(state);

    // If connection is restored, refresh vehicles to ensure consistency
    if (state.status === 'connected' && state.fallbackMode === false) {
      refreshVehicles();
    }
  }, [refreshVehicles]);

  // Subscribe to WebSocket updates
  const subscribeToUpdates = useCallback(() => {
    if (!isAuthenticated || isSubscribed.current) return;

    websocketService.subscribe(handleWebSocketUpdate);
    websocketService.onConnectionChange(handleConnectionChange);
    websocketService.connect();

    isSubscribed.current = true;
  }, [isAuthenticated, handleWebSocketUpdate, handleConnectionChange]);

  // Unsubscribe from WebSocket updates
  const unsubscribeFromUpdates = useCallback(() => {
    if (!isSubscribed.current) return;

    websocketService.unsubscribe(handleWebSocketUpdate);
    websocketService.offConnectionChange(handleConnectionChange);
    websocketService.disconnect();

    isSubscribed.current = false;
  }, [handleWebSocketUpdate, handleConnectionChange]);

  // Update vehicle with optimistic updates, audit logging, and optimistic locking
  const updateVehicle = useCallback(async (
    id: string,
    updates: Partial<Vehicle>,
    optimistic: boolean = true
  ): Promise<Vehicle> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    const operationId = `${id}-${Date.now()}`;
    const timestamp = new Date().toISOString();
    let lockData: OptimisticLockData | null = null;

    // Get current vehicle data for audit logging and optimistic locking
    const currentVehicle = vehicles[id];
    if (!currentVehicle) {
      throw new Error(`Vehicle ${id} not found`);
    }

    // Create update operation record
    const operation: UpdateOperation = {
      id: operationId,
      vehicleId: id,
      updates,
      timestamp,
      status: 'pending',
      optimistic,
    };

    setPendingUpdates(prev => ({
      ...prev,
      [operationId]: operation,
    }));

    try {
      // Step 1: Acquire optimistic lock for concurrent update prevention
      try {
        lockData = await auditService.acquireOptimisticLock('vehicle', id, user.id);
        console.log(`Acquired optimistic lock for vehicle ${id}, version: ${lockData.version}`);
      } catch (lockError) {
        console.error('Failed to acquire optimistic lock:', lockError);
        // Continue without lock for now, but log the issue
        // In production, you might want to fail the update here
      }

      // Step 2: Apply optimistic update immediately if enabled
      if (optimistic) {
        setVehicles(prev => {
          const currentVehicle = prev[id];
          if (!currentVehicle) {
            console.warn(`Vehicle ${id} not found for optimistic update`);
            return prev;
          }

          return {
            ...prev,
            [id]: {
              ...currentVehicle,
              ...updates,
              updatedAt: new Date(timestamp),
            },
          };
        });
      }

      // Step 3: Validate optimistic lock before making API call
      if (lockData) {
        try {
          await auditService.validateOptimisticLock('vehicle', id, lockData.version);
        } catch (lockValidationError) {
          // Lock validation failed - concurrent update detected
          throw new Error('Concurrent update detected. Please refresh and try again.');
        }
      }

      // Step 4: Make API call to update vehicle
      const updatedVehicle = await apiService.updateVehicle(id, updates);

      // Step 5: Create audit log for the update (especially for sensitive fields)
      try {
        await auditService.logUpdate(
          user.id,
          'vehicle',
          id,
          currentVehicle as unknown as Record<string, unknown>,
          updates
        );
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
        // Don't fail the update for audit logging issues, but log the error
      }

      // Step 6: Update operation status to success
      setPendingUpdates(prev => ({
        ...prev,
        [operationId]: { ...operation, status: 'success' },
      }));

      // Step 7: Update local state with server response (in case of differences)
      setVehicles(prev => ({
        ...prev,
        [id]: updatedVehicle,
      }));

      // Step 8: Clear successful operation after delay
      setTimeout(() => {
        setPendingUpdates(current => {
          const { [operationId]: _, ...rest } = current;
          return rest;
        });
      }, 2000);

      return updatedVehicle;

    } catch (error) {
      console.error('Vehicle update failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Update failed';

      // Update operation status to error
      setPendingUpdates(prev => ({
        ...prev,
        [operationId]: { ...operation, status: 'error', error: errorMessage },
      }));

      // Revert optimistic update if it was applied
      if (optimistic) {
        setVehicles(prev => {
          const currentVehicle = prev[id];
          if (!currentVehicle) return prev;

          // Revert the optimistic changes
          // This is a simplified revert - in a real app you'd want to store the original values
          // For now, we'll refresh from server

          return prev; // Will be refreshed by the error handling below
        });

        // Refresh vehicle data from server to get accurate state
        try {
          const serverVehicle = await apiService.getVehicle(id);
          setVehicles(prev => ({
            ...prev,
            [id]: serverVehicle,
          }));
        } catch (refreshError) {
          console.error('Failed to refresh vehicle after failed update:', refreshError);
        }
      }

      throw error;
    } finally {
      // Step 9: Always release optimistic lock
      if (lockData) {
        try {
          await auditService.releaseOptimisticLock('vehicle', id, user.id);
          console.log(`Released optimistic lock for vehicle ${id}`);
        } catch (lockReleaseError) {
          console.error('Failed to release optimistic lock:', lockReleaseError);
          // Don't throw error for lock release failures
        }
      }
    }
  }, [isAuthenticated, user, vehicles]);

  // Retry failed update
  const retryFailedUpdate = useCallback(async (operationId: string): Promise<void> => {
    const operation = pendingUpdates[operationId];
    if (!operation || operation.status !== 'error') {
      throw new Error('Operation not found or not in error state');
    }

    // Remove the failed operation and retry
    setPendingUpdates(prev => {
      const { [operationId]: _, ...rest } = prev;
      return rest;
    });

    await updateVehicle(operation.vehicleId, operation.updates, operation.optimistic);
  }, [pendingUpdates, updateVehicle]);

  // Get vehicle by ID
  const getVehicle = useCallback((id: string): Vehicle | undefined => {
    return vehicles[id];
  }, [vehicles]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on authentication change
  useEffect(() => {
    if (isAuthenticated) {
      refreshVehicles();
      subscribeToUpdates();

      // Sync any pending audit logs from previous sessions
      auditService.syncPendingAuditLogs().catch(error => {
        console.error('Failed to sync pending audit logs:', error);
      });
    } else {
      unsubscribeFromUpdates();
      setVehicles({});
      setPendingUpdates({});
      setError(null);
    }

    return () => {
      unsubscribeFromUpdates();
    };
  }, [isAuthenticated, refreshVehicles, subscribeToUpdates, unsubscribeFromUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      Object.values(updateTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      updateTimeouts.current = {};

      unsubscribeFromUpdates();
    };
  }, [unsubscribeFromUpdates]);

  const value: VehicleUpdateContextType = {
    vehicles,
    connectionState,
    pendingUpdates,
    loading,
    error,
    updateVehicle,
    getVehicle,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    refreshVehicles,
    clearError,
    retryFailedUpdate,
  };

  return (
    <VehicleUpdateContext.Provider value={value}>
      {children}
    </VehicleUpdateContext.Provider>
  );
};