import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';
import { alertService } from '../services/alertService';

export const AlertDebugger: React.FC = () => {
  interface DebugInfo {
    apiUrl: string;
    alerts: any[] | null;
    error: string | null;
    loading: boolean;
    rawResponse: any | null;
    networkError: any | null;
  }

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    apiUrl: '',
    alerts: null,
    error: null,
    loading: false,
    rawResponse: null,
    networkError: null
  });

  const testApiConnection = async () => {
    setDebugInfo(prev => ({ ...prev, loading: true, error: null, networkError: null }));

    try {
      // Get the API URL being used
      const apiUrl = import.meta.env.VITE_API_URL ?
        `${import.meta.env.VITE_API_URL}/alerts` :
        '/api/alerts';

      console.log('Testing API connection to:', apiUrl);

      // Test direct fetch first
      const response = await fetch(apiUrl);
      const responseText = await response.text();

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Raw response:', responseText);

      let parsedData = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Test using the service
      const alerts = await alertService.getAlerts();

      setDebugInfo({
        apiUrl,
        alerts,
        error: null,
        loading: false,
        rawResponse: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
          parsed: parsedData
        },
        networkError: null
      });

    } catch (error: any) {
      console.error('API Test Error:', error);

      setDebugInfo(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        networkError: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }));
    }
  };

  const testSpecificEndpoints = async () => {
    const endpoints = [
      '/api/alerts',
      '/api/alerts/statistics',
      '/api/alerts/unresolved'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        const data = await response.text();
        console.log(`${endpoint} - Status: ${response.status}, Data:`, data);
      } catch (error) {
        console.error(`${endpoint} - Error:`, error);
      }
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Alert System Debugger</h1>
          <div className="space-x-2">
            <button
              onClick={testApiConnection}
              disabled={debugInfo.loading}
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${debugInfo.loading ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
            <button
              onClick={testSpecificEndpoints}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test All Endpoints
            </button>
          </div>
        </div>

        {/* API URL Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">API URL: </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                {debugInfo.apiUrl || 'Loading...'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Environment: </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                {import.meta.env.MODE || 'development'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">VITE_API_URL: </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                {import.meta.env.VITE_API_URL || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          {debugInfo.loading ? (
            <div className="flex items-center space-x-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Testing connection...</span>
            </div>
          ) : debugInfo.error ? (
            <div className="flex items-center space-x-2 text-red-400">
              <X className="w-4 h-4" />
              <span>Connection failed: {debugInfo.error}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Connection successful</span>
            </div>
          )}
        </div>

        {/* Raw Response */}
        {debugInfo.rawResponse && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Raw API Response</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Status: </span>
                <span className={`font-semibold ${debugInfo.rawResponse.status === 200 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {debugInfo.rawResponse.status} {debugInfo.rawResponse.statusText}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Headers: </span>
                <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(debugInfo.rawResponse.headers, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-gray-400">Response Body: </span>
                <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto max-h-40">
                  {debugInfo.rawResponse.body}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Parsed Alerts */}
        {debugInfo.alerts && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">
              Parsed Alerts ({debugInfo.alerts.length})
            </h2>
            {debugInfo.alerts.length === 0 ? (
              <div className="text-gray-400">No alerts found in the response</div>
            ) : (
              <div className="space-y-2">
                {debugInfo.alerts.slice(0, 5).map((alert: any, index: number) => (
                  <div key={index} className="bg-gray-700 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.title || 'No title'}</div>
                        <div className="text-sm text-gray-400">
                          Type: {alert.type} | Severity: {alert.severity} | Status: {alert.status}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'No timestamp'}
                      </div>
                    </div>
                  </div>
                ))}
                {debugInfo.alerts.length > 5 && (
                  <div className="text-gray-400 text-sm">
                    ... and {debugInfo.alerts.length - 5} more alerts
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Network Error Details */}
        {debugInfo.networkError && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2 text-red-300">Network Error Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-red-300">Error Type: </span>
                <span>{debugInfo.networkError.name}</span>
              </div>
              <div>
                <span className="text-red-300">Message: </span>
                <span>{debugInfo.networkError.message}</span>
              </div>
              {debugInfo.networkError.stack && (
                <div>
                  <span className="text-red-300">Stack Trace: </span>
                  <pre className="bg-red-800 p-2 rounded text-xs overflow-x-auto mt-1">
                    {debugInfo.networkError.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        <div className="bg-amber-900 border border-amber-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-amber-300">Troubleshooting Tips</h2>
          <ul className="space-y-2 text-sm text-amber-100">
            <li>• Check if your backend server is running</li>
            <li>• Verify the API URL in your environment variables</li>
            <li>• Check browser network tab for CORS errors</li>
            <li>• Ensure the alerts endpoint returns the expected JSON format</li>
            <li>• Check if authentication is required for the API</li>
            <li>• Verify the backend is accessible from your frontend URL</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('Current debug info:', debugInfo);
                alert('Debug info logged to console');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              Log Debug Info to Console
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                alert('Debug info copied to clipboard');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm ml-2"
            >
              Copy Debug Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
