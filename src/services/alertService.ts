import { Alert, AlertStatistics, CreateAlertRequest, UpdateAlertRequest, AlertFilters, AlertType, AlertSeverity } from '../types/alerts';

// Standardized API configuration matching main application pattern
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_BASE_URL}/alerts`;

// Enhanced logging utility for debugging
class AlertServiceLogger {
  private static isDevelopment = import.meta.env.DEV;

  static logRequest(method: string, url: string, body?: any) {
    if (this.isDevelopment) {
      console.group(`🔄 Alert API Request: ${method} ${url}`);
      console.log('Timestamp:', new Date().toISOString());
      console.log('URL:', url);
      console.log('Method:', method);
      if (body) {
        console.log('Request Body:', body);
      }
      console.groupEnd();
    }
  }

  static logResponse(method: string, url: string, response: Response, data?: any) {
    if (this.isDevelopment) {
      console.group(`✅ Alert API Response: ${method} ${url}`);
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      if (data) {
        console.log('Response Data:', data);
      }
      console.groupEnd();
    }
  }

  static logError(method: string, url: string, error: any, context?: any) {
    console.group(`❌ Alert API Error: ${method} ${url}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('URL:', url);
    console.error('Method:', method);
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }
}

// Enhanced error class for better error handling
class AlertServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public url?: string,
    public method?: string,
    public responseBody?: string,
    public isNetworkError: boolean = false,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AlertServiceError';
  }

  toUserMessage(): string {
    if (this.status === 404) {
      return 'The requested alerts could not be found. Please check if the alert system is properly configured.';
    }
    if (this.status === 401) {
      return 'Authentication failed. Please log in again to access alerts.';
    }
    if (this.status === 403) {
      return 'You do not have permission to access alerts.';
    }
    if (this.status === 500) {
      return 'Server error occurred while fetching alerts. Please try again later.';
    }
    if (this.status && this.status >= 400) {
      return `Alert service error (${this.status}): ${this.message}`;
    }
    if (this.isNetworkError) {
      return 'Unable to connect to the alert service. Please check your network connection and try again.';
    }
    if (this.message.includes('fetch')) {
      return 'Unable to connect to the alert service. Please check your network connection and try again.';
    }
    return `Alert system error: ${this.message}`;
  }

  toDebugInfo(): any {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      method: this.method,
      responseBody: this.responseBody,
      isNetworkError: this.isNetworkError,
      isRetryable: this.isRetryable,
      timestamp: new Date().toISOString(),
      stack: this.stack
    };
  }
}


class AlertService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // Base delay in milliseconds

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method to determine if an error is retryable
  private isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    
    // Specific HTTP status codes that are retryable
    if (error instanceof AlertServiceError) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      return error.status ? retryableStatuses.includes(error.status) : error.isNetworkError;
    }
    
    return false;
  }

  // Helper method to implement exponential backoff delay
  private async delay(attempt: number): Promise<void> {
    const delayMs = this.retryDelay * Math.pow(2, attempt);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  // Helper method for standardized API calls with enhanced error handling and retry logic
  private async makeRequest<T>(
    url: string,
    method: string = 'GET',
    body?: any,
    context?: any
  ): Promise<T> {
    let lastError: AlertServiceError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          AlertServiceLogger.logRequest(method, url, { ...body, retryAttempt: attempt });
          await this.delay(attempt - 1);
        } else {
          AlertServiceLogger.logRequest(method, url, body);
        }

        const response = await fetch(url, {
          method,
          headers: this.getAuthHeaders(),
          ...(body && { body: JSON.stringify(body) }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const isRetryable = this.isRetryableError({ status: response.status });
          const error = new AlertServiceError(
            `API request failed: ${response.statusText}`,
            response.status,
            response.statusText,
            url,
            method,
            errorText,
            false,
            isRetryable
          );
          
          AlertServiceLogger.logError(method, url, error, { 
            context, 
            responseBody: errorText, 
            attempt: attempt + 1,
            willRetry: isRetryable && attempt < this.maxRetries
          });
          
          if (!isRetryable || attempt >= this.maxRetries) {
            throw error;
          }
          
          lastError = error;
          continue;
        }

        const responseText = await response.text();
        let data: T;
        
        try {
          data = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          const error = new AlertServiceError(
            `Invalid JSON response from API`,
            response.status,
            response.statusText,
            url,
            method,
            responseText,
            false,
            false
          );
          AlertServiceLogger.logError(method, url, error, { parseError, responseText, context, attempt: attempt + 1 });
          throw error;
        }

        AlertServiceLogger.logResponse(method, url, response, data);
        return data;
      } catch (error) {
        if (error instanceof AlertServiceError) {
          if (!error.isRetryable || attempt >= this.maxRetries) {
            throw error;
          }
          lastError = error;
          continue;
        }
        
        // Handle network errors (fetch failures)
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        const serviceError = new AlertServiceError(
          `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          undefined,
          url,
          method,
          undefined,
          isNetworkError,
          isNetworkError
        );
        
        AlertServiceLogger.logError(method, url, serviceError, { 
          originalError: error, 
          context, 
          attempt: attempt + 1,
          willRetry: isNetworkError && attempt < this.maxRetries
        });
        
        if (!isNetworkError || attempt >= this.maxRetries) {
          throw serviceError;
        }
        
        lastError = serviceError;
      }
    }

    // This should never be reached, but just in case
    throw lastError || new AlertServiceError('Maximum retries exceeded', undefined, undefined, url, method);
  }

  // Helper method to transform alert data with proper date handling
  private transformAlert(alert: any): Alert {
    return {
      ...alert,
      timestamp: alert.timestamp ? new Date(alert.timestamp) : new Date(),
      resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
      dismissedAt: alert.dismissedAt ? new Date(alert.dismissedAt) : undefined,
    };
  }

  // Get all alerts with optional filters
  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    const params = new URLSearchParams();

    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

    const data = await this.makeRequest<any>(url, 'GET', undefined, { filters, operation: 'getAlerts' });

    // Handle different response formats and ensure we return an array
    const alerts = Array.isArray(data) ? data : (data?.alerts || data?.data || []);

    return alerts.map((alert: any) => this.transformAlert(alert));
  }

  // Create new alert
  async createAlert(alertData: CreateAlertRequest): Promise<Alert> {
    const data = await this.makeRequest<any>(API_BASE, 'POST', alertData, { alertData });
    return this.transformAlert(data);
  }

  // Get single alert
  async getAlert(id: string): Promise<Alert> {
    const data = await this.makeRequest<any>(`${API_BASE}/${id}`, 'GET', undefined, { alertId: id });
    return this.transformAlert(data);
  }

  // Update alert
  async updateAlert(id: string, updateData: UpdateAlertRequest): Promise<Alert> {
    const data = await this.makeRequest<any>(`${API_BASE}/${id}`, 'PATCH', updateData, { alertId: id, updateData });
    return this.transformAlert(data);
  }

  // Resolve alert
  async resolveAlert(id: string): Promise<Alert> {
    const data = await this.makeRequest<any>(`${API_BASE}/${id}/resolve`, 'PATCH', undefined, { alertId: id });
    return this.transformAlert(data);
  }

  // Dismiss alert
  async dismissAlert(id: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE}/${id}/dismiss`, 'DELETE', undefined, { alertId: id, action: 'dismiss' });
  }

  // Get alerts by vehicle
  async getAlertsByVehicle(vehicleId: string): Promise<Alert[]> {
    const data = await this.makeRequest<any[]>(`${API_BASE}/vehicle/${vehicleId}`, 'GET', undefined, { vehicleId });
    return data.map((alert: any) => this.transformAlert(alert));
  }

  // Get alerts by type
  async getAlertsByType(type: AlertType): Promise<Alert[]> {
    const data = await this.makeRequest<any[]>(`${API_BASE}/type?type=${type}`, 'GET', undefined, { type });
    return data.map((alert: any) => this.transformAlert(alert));
  }

  // Get alerts by severity
  async getAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    const data = await this.makeRequest<any[]>(`${API_BASE}/severity?severity=${severity}`, 'GET', undefined, { severity });
    return data.map((alert: any) => this.transformAlert(alert));
  }

  // Get unresolved alerts
  async getUnresolvedAlerts(): Promise<Alert[]> {
    const data = await this.makeRequest<any[]>(`${API_BASE}/unresolved`, 'GET', undefined, { context: 'unresolved alerts' });
    return data.map((alert: any) => this.transformAlert(alert));
  }

  // Get alert statistics
  async getAlertStatistics(): Promise<AlertStatistics> {
    return await this.makeRequest<AlertStatistics>(`${API_BASE}/statistics`, 'GET', undefined, { context: 'alert statistics' });
  }

  // Resolve alerts by vehicle
  async resolveAlertsByVehicle(vehicleId: string): Promise<{ resolved: number }> {
    return await this.makeRequest<{ resolved: number }>(`${API_BASE}/vehicle/${vehicleId}/resolve`, 'PATCH', undefined, { vehicleId, action: 'resolve all' });
  }

  // Resolve alerts by type
  async resolveAlertsByType(type: AlertType): Promise<{ resolved: number }> {
    return await this.makeRequest<{ resolved: number }>(`${API_BASE}/type/resolve`, 'PATCH', { type }, { type, action: 'resolve by type' });
  }

  // Health check method to test API connectivity and distinguish between no alerts vs connection problems
  async healthCheck(): Promise<{ 
    connected: boolean; 
    apiUrl: string; 
    timestamp: string; 
    responseTime?: number;
    error?: any;
  }> {
    const startTime = Date.now();
    const healthUrl = `${API_BASE_URL}/health`;
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        connected: response.ok,
        apiUrl: API_BASE_URL,
        timestamp: new Date().toISOString(),
        responseTime,
        error: response.ok ? undefined : {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        connected: false,
        apiUrl: API_BASE_URL,
        timestamp: new Date().toISOString(),
        responseTime,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: error instanceof TypeError ? 'NetworkError' : 'UnknownError'
        }
      };
    }
  }

  // Test API endpoints for debugging purposes
  async testApiEndpoints(): Promise<{
    baseUrl: string;
    endpoints: Array<{
      name: string;
      url: string;
      method: string;
      status: 'success' | 'error';
      responseTime?: number;
      error?: any;
      sampleData?: any;
    }>;
  }> {
    const endpoints = [
      { name: 'Health Check', url: `${API_BASE_URL}/health`, method: 'GET' },
      { name: 'Get Alerts', url: API_BASE, method: 'GET' },
      { name: 'Get Statistics', url: `${API_BASE}/statistics`, method: 'GET' },
      { name: 'Get Unresolved', url: `${API_BASE}/unresolved`, method: 'GET' }
    ];

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: this.getAuthHeaders(),
          });
          
          const responseTime = Date.now() - startTime;
          let sampleData;
          
          try {
            const text = await response.text();
            sampleData = text ? JSON.parse(text) : null;
          } catch {
            sampleData = 'Invalid JSON response';
          }

          return {
            ...endpoint,
            status: response.ok ? 'success' as const : 'error' as const,
            responseTime,
            error: response.ok ? undefined : {
              status: response.status,
              statusText: response.statusText
            },
            sampleData: response.ok ? sampleData : undefined
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            ...endpoint,
            status: 'error' as const,
            responseTime,
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              type: error instanceof TypeError ? 'NetworkError' : 'UnknownError'
            }
          };
        }
      })
    );

    return {
      baseUrl: API_BASE_URL,
      endpoints: results.map((result, index) => 
        result.status === 'fulfilled' ? result.value : {
          ...endpoints[index],
          status: 'error' as const,
          error: { message: 'Promise rejected', details: result.reason }
        }
      )
    };
  }

  // Enhanced method to get alerts with connection status information
  async getAlertsWithStatus(filters?: AlertFilters): Promise<{
    alerts: Alert[];
    status: {
      connected: boolean;
      hasData: boolean;
      isEmpty: boolean;
      error?: AlertServiceError;
    };
  }> {
    try {
      const alerts = await this.getAlerts(filters);
      return {
        alerts,
        status: {
          connected: true,
          hasData: alerts.length > 0,
          isEmpty: alerts.length === 0
        }
      };
    } catch (error) {
      if (error instanceof AlertServiceError) {
        return {
          alerts: [],
          status: {
            connected: !error.isNetworkError && error.status !== undefined,
            hasData: false,
            isEmpty: false, // We can't determine if it's empty due to error
            error
          }
        };
      }
      
      // Fallback for unexpected errors
      const serviceError = new AlertServiceError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
        true
      );
      
      return {
        alerts: [],
        status: {
          connected: false,
          hasData: false,
          isEmpty: false,
          error: serviceError
        }
      };
    }
  }

  // Get comprehensive debugging information
  async getDebugInfo(): Promise<{
    configuration: {
      apiBaseUrl: string;
      alertsEndpoint: string;
      environment: string;
      hasAuthToken: boolean;
    };
    connectivity: Awaited<ReturnType<typeof this.healthCheck>>;
    endpoints: Awaited<ReturnType<typeof this.testApiEndpoints>>;
    timestamp: string;
  }> {
    const [connectivity, endpoints] = await Promise.all([
      this.healthCheck(),
      this.testApiEndpoints()
    ]);

    return {
      configuration: {
        apiBaseUrl: API_BASE_URL,
        alertsEndpoint: API_BASE,
        environment: import.meta.env.MODE || 'unknown',
        hasAuthToken: !!localStorage.getItem('auth_token')
      },
      connectivity,
      endpoints,
      timestamp: new Date().toISOString()
    };
  }
}

export const alertService = new AlertService();