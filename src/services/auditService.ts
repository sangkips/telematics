import { apiService } from './api';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  resourceType: 'vehicle' | 'user' | 'alert' | 'maintenance';
  resourceId: string;
  changes: Record<string, { oldValue: unknown; newValue: unknown }>;
  sensitiveFields: string[];
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface OptimisticLockData {
  resourceId: string;
  version: number;
  lastModified: string;
  lockedBy?: string;
  lockExpiry?: string;
}

class AuditService {
  private sensitiveVehicleFields = ['vin', 'plateNumber', 'make', 'model', 'year'];
  private sensitiveUserFields = ['email', 'role', 'permissions', 'password'];

  /**
   * Logs an audit entry for sensitive field updates
   */
  async logUpdate(
    userId: string,
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ): Promise<void> {
    try {
      const changes: Record<string, { oldValue: unknown; newValue: unknown }> = {};
      const sensitiveFields: string[] = [];

      // Identify changes and sensitive fields
      const sensitiveFieldList = this.getSensitiveFields(resourceType);
      
      Object.keys(newData).forEach(field => {
        const oldValue = oldData[field];
        const newValue = newData[field];
        
        // Only log if value actually changed
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[field] = { oldValue, newValue };
          
          // Mark as sensitive if applicable
          if (sensitiveFieldList.includes(field)) {
            sensitiveFields.push(field);
          }
        }
      });

      // Only create audit log if there are actual changes
      if (Object.keys(changes).length === 0) {
        return;
      }

      const auditEntry: AuditLogEntry = {
        userId,
        action: 'update',
        resourceType,
        resourceId,
        changes,
        sensitiveFields,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
      };

      // Send audit log to backend
      await this.sendAuditLog(auditEntry);

      // Log sensitive field updates to console for immediate visibility
      if (sensitiveFields.length > 0) {
        console.warn(`Sensitive fields updated for ${resourceType} ${resourceId}:`, sensitiveFields);
      }

    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main update flow
    }
  }

  /**
   * Validates optimistic lock before update
   */
  async validateOptimisticLock(
    resourceType: string,
    resourceId: string,
    expectedVersion: number
  ): Promise<OptimisticLockData> {
    try {
      const response = await apiService.request<OptimisticLockData>(
        `/locks/${resourceType}/${resourceId}/validate`,
        {
          method: 'POST',
          body: JSON.stringify({ expectedVersion }),
        }
      );

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('conflict')) {
        throw new Error('Concurrent update detected. Please refresh and try again.');
      }
      throw error;
    }
  }

  /**
   * Acquires optimistic lock for resource
   */
  async acquireOptimisticLock(
    resourceType: string,
    resourceId: string,
    userId: string
  ): Promise<OptimisticLockData> {
    try {
      const response = await apiService.request<OptimisticLockData>(
        `/locks/${resourceType}/${resourceId}/acquire`,
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to acquire optimistic lock:', error);
      throw error;
    }
  }

  /**
   * Releases optimistic lock for resource
   */
  async releaseOptimisticLock(
    resourceType: string,
    resourceId: string,
    userId: string
  ): Promise<void> {
    try {
      await apiService.request<void>(
        `/locks/${resourceType}/${resourceId}/release`,
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );
    } catch (error) {
      console.error('Failed to release optimistic lock:', error);
      // Don't throw error as this is cleanup
    }
  }

  /**
   * Gets sensitive fields for a resource type
   */
  private getSensitiveFields(resourceType: AuditLogEntry['resourceType']): string[] {
    switch (resourceType) {
      case 'vehicle':
        return this.sensitiveVehicleFields;
      case 'user':
        return this.sensitiveUserFields;
      default:
        return [];
    }
  }

  /**
   * Sends audit log to backend
   */
  private async sendAuditLog(auditEntry: AuditLogEntry): Promise<void> {
    try {
      await apiService.request<void>('/audit/logs', {
        method: 'POST',
        body: JSON.stringify(auditEntry),
      });
    } catch (error) {
      console.error('Failed to send audit log to backend:', error);
      
      // Fallback: store in local storage for later sync
      this.storeAuditLogLocally(auditEntry);
    }
  }

  /**
   * Stores audit log locally as fallback
   */
  private storeAuditLogLocally(auditEntry: AuditLogEntry): void {
    try {
      const localAuditLogs = JSON.parse(localStorage.getItem('pending_audit_logs') || '[]');
      localAuditLogs.push(auditEntry);
      
      // Keep only last 100 entries to avoid storage bloat
      if (localAuditLogs.length > 100) {
        localAuditLogs.splice(0, localAuditLogs.length - 100);
      }
      
      localStorage.setItem('pending_audit_logs', JSON.stringify(localAuditLogs));
    } catch (error) {
      console.error('Failed to store audit log locally:', error);
    }
  }

  /**
   * Syncs pending local audit logs to backend
   */
  async syncPendingAuditLogs(): Promise<void> {
    try {
      const pendingLogs = JSON.parse(localStorage.getItem('pending_audit_logs') || '[]');
      
      if (pendingLogs.length === 0) return;

      await apiService.request<void>('/audit/logs/batch', {
        method: 'POST',
        body: JSON.stringify({ logs: pendingLogs }),
      });

      // Clear local storage after successful sync
      localStorage.removeItem('pending_audit_logs');
      
      console.log(`Synced ${pendingLogs.length} pending audit logs`);
    } catch (error) {
      console.error('Failed to sync pending audit logs:', error);
    }
  }

  /**
   * Gets client IP address (best effort)
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // This would typically be handled by the backend
      // For now, return undefined as IP should be logged server-side
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Gets current session ID
   */
  private getSessionId(): string | undefined {
    try {
      // Extract session ID from token or generate one
      const token = localStorage.getItem('auth_token');
      if (token) {
        // In a real implementation, you might decode the JWT to get session ID
        // For now, use a hash of the token as session identifier
        return btoa(token).slice(0, 16);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}

export const auditService = new AuditService();
export default auditService;