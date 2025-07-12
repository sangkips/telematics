import { Vehicle, Alert, User, AuthUser, LoginCredentials } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error("Authentication failed");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; token: string }> {
    const response = await this.request<{ user: AuthUser; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    this.token = response.token;
    localStorage.setItem("auth_token", response.token);

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.token = null;
      localStorage.removeItem("auth_token");
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await this.request<{ token: string }>("/auth/refresh", {
      method: "POST",
    });

    this.token = response.token;
    localStorage.setItem("auth_token", response.token);

    return response;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>("/vehicles");
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}`);
  }

  async createVehicle(
    vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
  ): Promise<Vehicle> {
    return this.request<Vehicle>("/vehicles", {
      method: "POST",
      body: JSON.stringify(vehicle),
    });
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(vehicle),
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    return this.request<void>(`/vehicles/${id}`, {
      method: "DELETE",
    });
  }

  // Real-time vehicle updates
  async getVehicleUpdates(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>("/vehicles/updates");
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>("/alerts");
  }

  async resolveAlert(alertId: string): Promise<void> {
    return this.request<void>(`/alerts/${alertId}/resolve`, {
      method: "PATCH",
    });
  }

  async dismissAlert(alertId: string): Promise<void> {
    return this.request<void>(`/alerts/${alertId}/dismiss`, {
      method: "DELETE",
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async createUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // Reports
  async getFleetReport(dateRange: string): Promise<any> {
    return this.request<any>(`/reports/fleet?range=${dateRange}`);
  }

  async getFuelReport(dateRange: string): Promise<any> {
    return this.request<any>(`/reports/fuel?range=${dateRange}`);
  }

  async exportReport(type: string, format: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/reports/export?type=${type}&format=${format}`,
      {
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  }

  // Settings
  async getSystemSettings(): Promise<any> {
    return this.request<any>("/settings/system");
  }

  async updateSystemSettings(settings: any): Promise<any> {
    return this.request<any>("/settings/system", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  async getNotificationSettings(): Promise<any> {
    return this.request<any>("/settings/notifications");
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    return this.request<any>("/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // API Keys
  async getApiKeys(): Promise<any[]> {
    return this.request<any[]>("/api-keys");
  }

  async createApiKey(keyData: any): Promise<any> {
    return this.request<any>("/api-keys", {
      method: "POST",
      body: JSON.stringify(keyData),
    });
  }

  async revokeApiKey(keyId: string): Promise<void> {
    return this.request<void>(`/api-keys/${keyId}/revoke`, {
      method: "PATCH",
    });
  }

  async deleteApiKey(keyId: string): Promise<void> {
    return this.request<void>(`/api-keys/${keyId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
