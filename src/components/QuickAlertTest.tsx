import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';

export const QuickAlertTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');

  const testConnection = async () => {
    setStatus('loading');
    setError('');
    
    try {
      // Get the API URL
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const fullUrl = `${baseUrl}/alerts`;
      setApiUrl(fullUrl);
      
      console.log('Testing connection to:', fullUrl);
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Handle different response formats
      const alertsArray = Array.isArray(data) ? data : (data.alerts || data.data || []);
      
      setAlerts(alertsArray);
      setStatus('success');
      
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Alert System Quick Test</h1>
          <p className="text-gray-400">Testing connection to your backend API</p>
        </div>

        {/* API URL */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
          <div className="text-sm">
            <span className="text-gray-400">Testing URL: </span>
            <code className="bg-gray-700 px-2 py-1 rounded">{apiUrl}</code>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Connection Status</h2>
            <button
              onClick={testConnection}
              disabled={status === 'loading'}
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white px-3 py-2 rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>

          {status === 'loading' && (
            <div className="flex items-center space-x-2 text-blue-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Testing connection...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-red-400">
                <X className="w-5 h-5" />
                <span>Connection Failed</span>
              </div>
              <div className="bg-red-900 border border-red-700 rounded p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-2">Common solutions:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Make sure your Go backend server is running</li>
                  <li>• Check if the port in .env matches your backend port</li>
                  <li>• Verify CORS is enabled on your backend</li>
                  <li>• Try accessing {apiUrl} directly in your browser</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Connection Successful!</span>
              </div>
              <div className="bg-green-900 border border-green-700 rounded p-3">
                <p className="text-green-300 text-sm">
                  Found {alerts.length} alert{alerts.length !== 1 ? 's' : ''} in your backend
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Preview */}
        {status === 'success' && alerts.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Your Alerts Preview</h2>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {alert.title || alert.message || `Alert ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        {alert.type && `Type: ${alert.type}`}
                        {alert.severity && ` • Severity: ${alert.severity}`}
                        {alert.status && ` • Status: ${alert.status}`}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      alert.severity === 'critical' ? 'bg-red-900 text-red-300' :
                      alert.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                      alert.severity === 'medium' ? 'bg-amber-900 text-amber-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {alert.severity || 'unknown'}
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-center text-gray-400 text-sm">
                  ... and {alerts.length - 3} more alerts
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {status === 'success' && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2 text-blue-300">🎉 Great! Your backend is working</h2>
            <p className="text-blue-100 text-sm">
              Your alerts should now appear in the main Alert Dashboard. 
              If they're still not showing, try refreshing the page or clicking the Debug button in the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};