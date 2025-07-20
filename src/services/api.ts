import { Vehicle, Alert, User, AuthUser, LoginCredentials, MaintenanceRecord, MaintenanceSchedule } from "../types";

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      // Handle the backend response format { success: true, data: ... }
      return data.success ? data.data : data;
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
    const token = this.token; // Store current token
    try {
      // Only make logout request if we have a token
      if (token) {
        await this.request("/auth/logout", { method: "POST" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Don't throw error for logout failures
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

  async getCurrentUser(): Promise<AuthUser> {
    return this.request<AuthUser>("/auth/profile");
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
      method: "PATCH",
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

  async getVehiclesByStatus(status: string): Promise<Vehicle[]> {
    return this.request<Vehicle[]>(`/vehicles?status=${status}`);
  }
  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>("/alerts");
  }

  async getUnresolvedAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>("/alerts/unresolved");
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
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PATCH",
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

  // Maintenance Records
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return this.request<MaintenanceRecord[]>("/maintenance/records");
  }

  async getMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>(`/maintenance/records/${id}`);
  }

  async createMaintenanceRecord(
    record: Omit<MaintenanceRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>("/maintenance/records", {
      method: "POST",
      body: JSON.stringify(record),
    });
  }

  async updateMaintenanceRecord(
    id: string,
    record: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>(`/maintenance/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(record),
    });
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    return this.request<void>(`/maintenance/records/${id}`, {
      method: "DELETE",
    });
  }

  // Maintenance Schedules
  async getAllMaintenanceSchedules(): Promise<MaintenanceSchedule[]> {
    return this.request<MaintenanceSchedule[]>("/maintenance/schedules");
  }

  async getMaintenanceSchedule(id: string): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>(`/maintenance/schedules/${id}`);
  }

  async createMaintenanceSchedule(
    schedule: Omit<MaintenanceSchedule, "id" | "createdAt" | "updatedAt">
  ): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>("/maintenance/schedules", {
      method: "POST",
      body: JSON.stringify(schedule),
    });
  }

  async updateMaintenanceSchedule(
    id: string,
    schedule: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>(`/maintenance/schedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(schedule),
    });
  }

  async deleteMaintenanceSchedule(id: string): Promise<void> {
    return this.request<void>(`/maintenance/schedules/${id}`, {
      method: "DELETE",
    });
  }

  async getSchedulesByVehicle(vehicleId: string): Promise<MaintenanceSchedule[]> {
    return this.request<MaintenanceSchedule[]>(`/maintenance/schedules/vehicle/${vehicleId}`);
  }

  async getUpcomingSchedules(): Promise<MaintenanceSchedule[]> {
    return this.request<MaintenanceSchedule[]>("/maintenance/schedules/upcoming");
  }

  // Service Reminders
  async getServiceReminders(vehicleId: string): Promise<any[]> {
    return this.request<any[]>(`/maintenance/reminders/vehicle/${vehicleId}`);
  }

  async getOverdueReminders(): Promise<any[]> {
    return this.request<any[]>("/maintenance/reminders/overdue");
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>("/health");
  }
}

export const apiService = new ApiService();
export default apiService;
