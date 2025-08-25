import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, AlertStatistics, AlertFilters, CreateAlertRequest, AlertType, AlertSeverity } from '../types/alerts';
import { alertService } from '../services/alertService';

interface AlertSystemContextType {
  // State
  alerts: Alert[];
  statistics: AlertStatistics | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAlerts: (filters?: AlertFilters) => Promise<void>;
  createAlert: (alertData: CreateAlertRequest) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  resolveAlertsByVehicle: (vehicleId: string) => Promise<{ resolved: number }>;
  resolveAlertsByType: (type: AlertType) => Promise<{ resolved: number }>;
  fetchStatistics: () => Promise<void>;
  clearError: () => void;

  // Real-time updates
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
}

const AlertSystemContext = createContext<AlertSystemContextType | undefined>(undefined);

export const useAlertSystem = () => {
  const context = useContext(AlertSystemContext);
  if (!context) {
    throw new Error('useAlertSystem must be used within an AlertSystemProvider');
  }
  return context;
};

interface AlertSystemProviderProps {
  children: ReactNode;
}

export const AlertSystemProvider: React.FC<AlertSystemProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts with optional filters
  const fetchAlerts = async (filters?: AlertFilters) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAlerts = await alertService.getAlerts(filters);
      setAlerts(fetchedAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  // Create new alert
  const createAlert = async (alertData: CreateAlertRequest) => {
    setError(null);
    try {
      const newAlert = await alertService.createAlert(alertData);
      setAlerts(prev => [newAlert, ...prev]);
      // Refresh statistics
      fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
      throw err;
    }
  };

  // Resolve alert
  const resolveAlert = async (id: string) => {
    setError(null);
    try {
      const resolvedAlert = await alertService.resolveAlert(id);
      setAlerts(prev => prev.map(alert =>
        alert.id === id ? resolvedAlert : alert
      ));
      // Refresh statistics
      fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
      throw err;
    }
  };

  // Dismiss alert
  const dismissAlert = async (id: string) => {
    setError(null);
    try {
      await alertService.dismissAlert(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      // Refresh statistics
      fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss alert');
      throw err;
    }
  };

  // Resolve alerts by vehicle
  const resolveAlertsByVehicle = async (vehicleId: string) => {
    setError(null);
    try {
      const result = await alertService.resolveAlertsByVehicle(vehicleId);
      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.vehicleId === vehicleId && alert.status === 'active'
          ? { ...alert, status: 'resolved' as const, resolvedAt: new Date() }
          : alert
      ));
      // Refresh statistics
      fetchStatistics();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve vehicle alerts');
      throw err;
    }
  };

  // Resolve alerts by type
  const resolveAlertsByType = async (type: AlertType) => {
    setError(null);
    try {
      const result = await alertService.resolveAlertsByType(type);
      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.type === type && alert.status === 'active'
          ? { ...alert, status: 'resolved' as const, resolvedAt: new Date() }
          : alert
      ));
      // Refresh statistics
      fetchStatistics();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alerts by type');
      throw err;
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await alertService.getAlertStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch alert statistics:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Real-time update functions
  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);
    fetchStatistics();
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, ...updates } : alert
    ));
    fetchStatistics();
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    fetchStatistics();
  };

  // Initial load
  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, []);

  return (
    <AlertSystemContext.Provider value={{
      alerts,
      statistics,
      loading,
      error,
      fetchAlerts,
      createAlert,
      resolveAlert,
      dismissAlert,
      resolveAlertsByVehicle,
      resolveAlertsByType,
      fetchStatistics,
      clearError,
      addAlert,
      updateAlert,
      removeAlert,
    }}>
      {children}
    </AlertSystemContext.Provider>
  );
};