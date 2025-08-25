export type AlertType = 'fuel_theft' | 'maintenance' | 'speeding' | 'unauthorized' | 'low_fuel';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  vehicleId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  timestamp: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  dismissedAt?: Date;
  dismissedBy?: string;
  metadata?: Record<string, any>;
}

export interface AlertStatistics {
  total: number;
  active: number;
  resolved: number;
  dismissed: number;
  byType: Record<AlertType, number>;
  bySeverity: Record<AlertSeverity, number>;
  byVehicle: Record<string, number>;
}

export interface CreateAlertRequest {
  vehicleId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface UpdateAlertRequest {
  title?: string;
  message?: string;
  severity?: AlertSeverity;
  metadata?: Record<string, any>;
}

export interface AlertFilters {
  vehicleId?: string;
  type?: AlertType;
  severity?: AlertSeverity;
  status?: AlertStatus;
  startDate?: Date;
  endDate?: Date;
}