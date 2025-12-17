import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';

export const AlertAPITest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    const results: any = {};

    // Test different API URLs
    const apiUrls = [
      '/api/alerts',
      `${import.meta.env.VITE_API_URL}/api/alerts`,
    ];

    for (const url of apiUrls) {
      try {
        console.log(`Testing: ${url}`);
        const response = await fetch(url);
        const text = await response.text();
        
        results[url] = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          body: text,
          error: null
        };

        // Try to parse as JSON
        try {
          results[url].json = JSON.parse(text);
        } catch (e) {
          results[url].json = null;
        }

      } catch (error: any) {
        results[url] = {
          status: null,
          statusText: null,
          ok: false,
          headers: {},
          body: null,
          error: error.message,
          json: null
        };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Alert API Connection Test</h1>
          <button
            onClick={testAPI}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Test APIs</span>
          </button>
        </div>

        <div className="bg-amber-900 border border-amber-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-amber-300">Instructions</h2>
          <ol className="space-y-1 text-sm text-amber-100">
            <li>1. Make sure your backend server is running</li>
            <li>2. Click "Test APIs" to check different endpoint URLs</li>
            <li>3. Look for a successful response (status 200) with your alert data</li>
            <li>4. If all fail, check your backend server URL and CORS settings</li>
          </ol>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            
            {Object.entries(testResults).map(([url, result]: [string, any]) => (
              <div key={url} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">{url}</h3>
                  <div className="flex items-center space-x-2">
                    {result.ok ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-sm ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {result.status ? `${result.status} ${result.statusText}` : 'Connection Failed'}
                    </span>
                  </div>
                </div>

                {result.error && (
                  <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded">
                    <p className="text-red-300 text-sm">Error: {result.error}</p>
                  </div>
                )}

                {result.ok && result.json && (
                  <div className="mb-3 p-3 bg-green-900 border border-green-700 rounded">
                    <p className="text-green-300 text-sm mb-2">
                      ✅ Success! Found {Array.isArray(result.json) ? result.json.length : 'data'}
                    </p>
                    {Array.isArray(result.json) && result.json.length > 0 && (
                      <div className="text-xs text-green-200">
                        Sample alert: {result.json[0].title || result.json[0].message || 'No title/message'}
                      </div>
                    )}
                  </div>
                )}

                <details className="mt-3">
                  <summary className="cursor-pointer text-gray-400 hover:text-white">
                    View Details
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-gray-400">Headers:</span>
                      <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto mt-1">
                        {JSON.stringify(result.headers, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-400">Response Body:</span>
                      <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto mt-1 max-h-40">
                        {result.body || 'No response body'}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-300">Common Issues & Solutions</h2>
          <div className="space-y-2 text-sm text-blue-100">
            <div>
              <strong>CORS Error:</strong> Add CORS headers to your backend or use a proxy
            </div>
            <div>
              <strong>404 Not Found:</strong> Check if your backend server is running on the correct port
            </div>
            <div>
              <strong>Connection Refused:</strong> Backend server might not be running
            </div>
            <div>
              <strong>Wrong URL:</strong> Update REACT_APP_API_URL in your .env file
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-400">NODE_ENV:</span> {import.meta.env.MODE || 'development'}
            </div>
            <div>
              <span className="text-gray-400">VITE_API_URL:</span> {import.meta.env.VITE_API_URL || 'Not set'}
            </div>
            <div>
              <span className="text-gray-400">Current URL:</span> {window.location.origin}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};