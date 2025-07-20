import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      console.error("API call failed:", error);
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load data",
      });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useVehicles() {
  return useApi(() => apiService.getVehicles());
}

export function useUsers() {
  return useApi(() => apiService.getUsers());
}

export function useAlerts() {
  return useApi(() => apiService.getAlerts());
}

export function useMaintenanceRecords() {
  return useApi(() => apiService.getMaintenanceRecords());
}

export function useUpcomingSchedules() {
  return useApi(() => apiService.getUpcomingSchedules());
}

export function useOverdueReminders() {
  return useApi(() => apiService.getOverdueReminders());
}

export function useMaintenanceSchedules() {
  return useApi(() => apiService.getAllMaintenanceSchedules());
}

// Real-time updates hook
export function useRealTimeVehicles(
  interval: number = 5000,
  enabled: boolean = true
) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVehicles([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchVehicles = async () => {
      try {
        setError(null);
        const data = await apiService.getVehicleUpdates();
        setVehicles(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch vehicles";
        setError(errorMessage);
        console.error("Failed to fetch vehicle updates:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchVehicles();

    // Set up interval for real-time updates
    const intervalId = setInterval(fetchVehicles, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);

  return { vehicles, loading, error };
}

// Health check hook
export function useHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      await apiService.healthCheck();
      setIsHealthy(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
      console.error("Health check failed:", error);
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return { isHealthy, lastCheck, checkHealth };
}
