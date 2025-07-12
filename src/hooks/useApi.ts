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
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
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

// Real-time updates hook
export function useRealTimeVehicles(interval: number = 5000) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await apiService.getVehicleUpdates();
        setVehicles(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch vehicles"
        );
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchVehicles();

    // Set up interval for real-time updates
    const intervalId = setInterval(fetchVehicles, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { vehicles, loading, error };
}
