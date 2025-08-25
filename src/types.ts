export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  driver: string;
  fuelLevel: number;
  maxFuelCapacity: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  speed: number;
  status: "active" | "idle" | "maintenance" | "offline";
  lastUpdate: Date;
  odometer: number;
  fuelConsumption: number; // L/100km
  alerts: Alert[];
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  maintenanceRecords: MaintenanceRecord[];
  nextServiceDue?: Date;
  nextServiceOdometer?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  vehicleId?: string;
  type: "fuel_theft" | "maintenance" | "speeding" | "unauthorized" | "low_fuel";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "operator" | "viewer";
  status: "active" | "inactive" | "suspended";
  password?: string; // Only for creation/update requests
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "operator" | "viewer";
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: "production" | "development" | "test";
  status: "active" | "inactive" | "revoked";
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
}

export interface SystemSettings {
  companyName: string;
  apiEndpoint: string;
  dataRetentionPeriod: number; // days
  timezone: string;
  language: string;
  currency: string;
}

export interface NotificationSettings {
  maxSpeed: number;
  lowFuelThreshold: number;
  fuelTheftThreshold: number;
  maintenanceReminder: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook: boolean;
  };
  webhookUrl?: string;
  emailRecipients: string[];
}

export interface SecuritySettings {
  sessionTimeout: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  maxFailedLogins: number;
  twoFactorAuth: boolean;
  ipWhitelist: string[];
}

export interface FuelData {
  timestamp: Date;
  level: number;
  vehicleId: string;
}

export interface LocationHistory {
  vehicleId: string;
  locations: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
  }>;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  scheduleId?: string; // Link to the maintenance schedule
  types: ("oil_change" | "tire_rotation" | "brake_service" | "engine_service" | "transmission" | "inspection" | "repair" | "battery_replacement" | "other")[]; // Array of service types
  description: string;
  cost: number;
  currency: string;
  serviceCenter: string; // service center name (changed from performedBy)
  performedAt: Date;
  odometer: number;
  partsReplaced?: string[];
  notes?: string;
  attachments?: string[]; // file URLs
  status: "completed" | "pending" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  types: ("oil_change" | "tire_rotation" | "brake_service" | "engine_service" | "transmission" | "inspection" | "repair" | "battery_replacement" | "other")[]; // Array of service types
  description: string;
  intervalKm: number; // service every X km (required for scheduling)
  intervalDays?: number; // optional: service every X days as backup
  lastServiceOdometer: number; // odometer reading at last service
  lastServiceDate: Date; // date of last service
  nextServiceOdometer: number; // calculated: lastServiceOdometer + intervalKm
  nextServiceDate?: Date; // estimated based on vehicle usage
  serviceCenterName: string; // preferred service center
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  types: ("oil_change" | "tire_rotation" | "brake_service" | "engine_service" | "transmission" | "inspection" | "repair" | "battery_replacement" | "other")[]; // Array of service types
  dueDate?: Date;
  dueOdometer?: number;
  currentOdometer: number;
  daysUntilDue?: number;
  odometerUntilDue?: number;
  priority: "low" | "medium" | "high" | "critical";
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: "vehicles" | "users" | "system" | "reports" | "alerts" | "maintenance";
}

export const PERMISSIONS = {
  // Vehicle permissions
  VIEW_VEHICLES: "view_vehicles",
  CREATE_VEHICLES: "create_vehicles",
  UPDATE_VEHICLES: "update_vehicles",
  DELETE_VEHICLES: "delete_vehicles",

  // User permissions
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  UPDATE_USERS: "update_users",
  DELETE_USERS: "delete_users",

  // System permissions
  VIEW_SYSTEM_SETTINGS: "view_system_settings",
  UPDATE_SYSTEM_SETTINGS: "update_system_settings",
  VIEW_SECURITY_SETTINGS: "view_security_settings",
  UPDATE_SECURITY_SETTINGS: "update_security_settings",

  // Alert permissions
  VIEW_ALERTS: "view_alerts",
  RESOLVE_ALERTS: "resolve_alerts",

  // Report permissions
  VIEW_REPORTS: "view_reports",
  EXPORT_REPORTS: "export_reports",

  // Maintenance permissions
  VIEW_MAINTENANCE: "view_maintenance",
  CREATE_MAINTENANCE: "create_maintenance",
  UPDATE_MAINTENANCE: "update_maintenance",
  DELETE_MAINTENANCE: "delete_maintenance",
  SCHEDULE_MAINTENANCE: "schedule_maintenance",

  // API permissions
  MANAGE_API_KEYS: "manage_api_keys",

  // All permissions (admin only)
  ALL: "all",
} as const;

export const ROLE_PERMISSIONS = {
  admin: [PERMISSIONS.ALL],
  manager: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.CREATE_VEHICLES,
    PERMISSIONS.UPDATE_VEHICLES,
    PERMISSIONS.DELETE_VEHICLES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.RESOLVE_ALERTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SYSTEM_SETTINGS,
    PERMISSIONS.UPDATE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_API_KEYS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.CREATE_MAINTENANCE,
    PERMISSIONS.UPDATE_MAINTENANCE,
    PERMISSIONS.DELETE_MAINTENANCE,
    PERMISSIONS.SCHEDULE_MAINTENANCE,
  ],
  operator: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.UPDATE_VEHICLES,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.RESOLVE_ALERTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.CREATE_MAINTENANCE,
    PERMISSIONS.UPDATE_MAINTENANCE,
  ],
  viewer: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_ALERTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_MAINTENANCE,
  ],
};

// Re-export WebSocket types for convenience
export type {
  WebSocketMessage,
  WebSocketMessageType,
  WebSocketOperation,
  VehicleUpdatePayload,
  ConnectionState,
  WebSocketConfig,
  WebSocketEventCallback,
  ConnectionStateCallback,
  WebSocketSubscription,
  VehicleWithWebSocketData,
  VehicleUpdateConflict,
  WebSocketError
} from './types/websocket';
