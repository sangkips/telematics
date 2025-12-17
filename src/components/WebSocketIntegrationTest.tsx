import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useVehicleUpdate } from '../contexts/VehicleUpdateContext';
import { Vehicle } from '../types';

export const WebSocketIntegrationTest: React.FC = () => {
  const { 
    vehicles, 
    connectionState, 
    pendingUpdates, 
    loading, 
    error, 
    updateVehicle, 
    refreshVehicles 
  } = useVehicleUpdate();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runIntegrationTest = async () => {
    setIsRunningTest(true);
    setTestResults([]);
    
    try {
      addTestResult('Starting WebSocket integration test...');
      
      // Test 1: Check connection state
      addTestResult(`Connection status: ${connectionState.status}`);
      addTestResult(`Fallback mode: ${connectionState.fallbackMode ? 'Yes' : 'No'}`);
      
      // Test 2: Check vehicle data loading
      const vehicleCount = Object.keys(vehicles).length;
      addTestResult(`Loaded ${vehicleCount} vehicles from context`);
      
      if (vehicleCount === 0) {
        addTestResult('No vehicles available for testing');
        return;
      }
      
      // Test 3: Test vehicle update
      const testVehicle = Object.values(vehicles)[0];
      addTestResult(`Testing update on vehicle: ${testVehicle.name}`);
      
      const originalStatus = testVehicle.status;
      const newStatus = originalStatus === 'active' ? 'idle' : 'active';
      
      addTestResult(`Changing status from ${originalStatus} to ${newStatus}`);
      
      try {
        await updateVehicle(testVehicle.id, { status: newStatus });
        addTestResult('✅ Vehicle update successful');
        
        // Wait a moment and check if the update was applied
        setTimeout(() => {
          const updatedVehicle = vehicles[testVehicle.id];
          if (updatedVehicle && updatedVehicle.status === newStatus) {
            addTestResult('✅ Vehicle status updated in context');
          } else {
            addTestResult('❌ Vehicle status not updated in context');
          }
        }, 1000);
        
      } catch (updateError) {
        addTestResult(`❌ Vehicle update failed: ${updateError}`);
      }
      
      // Test 4: Check pending updates
      const pendingCount = Object.keys(pendingUpdates).length;
      addTestResult(`Pending updates: ${pendingCount}`);
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const getConnectionIcon = () => {
    if (connectionState.status === 'connected' && !connectionState.fallbackMode) {
      return <Wifi className="w-5 h-5 text-green-400" />;
    } else if (connectionState.status === 'connecting') {
      return <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />;
    } else if (connectionState.fallbackMode) {
      return <RefreshCw className="w-5 h-5 text-orange-400" />;
    } else {
      return <WifiOff className="w-5 h-5 text-red-400" />;
    }
  };

  const getConnectionStatus = () => {
    if (connectionState.status === 'connected' && !connectionState.fallbackMode) {
      return 'Real-time connected';
    } else if (connectionState.status === 'connecting') {
      return 'Connecting...';
    } else if (connectionState.fallbackMode) {
      return 'Polling mode (30s intervals)';
    } else {
      return 'Disconnected';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          WebSocket Integration Test
        </h1>
        
        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-3">Connection Status</h2>
          <div className="flex items-center space-x-3">
            {getConnectionIcon()}
            <span className="text-white">{getConnectionStatus()}</span>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            <p>Reconnect attempts: {connectionState.reconnectAttempts}</p>
            {connectionState.lastConnected && (
              <p>Last connected: {connectionState.lastConnected.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Vehicle Data Status */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-3">Vehicle Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Vehicles loaded:</p>
              <p className="text-white font-semibold">{Object.keys(vehicles).length}</p>
            </div>
            <div>
              <p className="text-gray-400">Pending updates:</p>
              <p className="text-white font-semibold">{Object.keys(pendingUpdates).length}</p>
            </div>
          </div>
          {loading && (
            <div className="mt-2 flex items-center space-x-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          {error && (
            <div className="mt-2 flex items-center space-x-2 text-red-400">
              <XCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={runIntegrationTest}
              disabled={isRunningTest || Object.keys(vehicles).length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isRunningTest ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Run Integration Test</span>
            </button>
            
            <button
              onClick={refreshVehicles}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Vehicles</span>
            </button>
          </div>
          
          {Object.keys(vehicles).length === 0 && (
            <p className="mt-2 text-yellow-400 text-sm">
              No vehicles available. Load some vehicles first to run the test.
            </p>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="p-4 bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-3">Test Results</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result.includes('✅') ? (
                    <span className="text-green-400">{result}</span>
                  ) : result.includes('❌') ? (
                    <span className="text-red-400">{result}</span>
                  ) : result.includes('⚠️') ? (
                    <span className="text-yellow-400">{result}</span>
                  ) : (
                    <span className="text-gray-300">{result}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle List */}
        {Object.keys(vehicles).length > 0 && (
          <div className="p-4 bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-3">Current Vehicles</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.values(vehicles).map((vehicle: Vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                  <div>
                    <span className="text-white font-medium">{vehicle.name}</span>
                    <span className="text-gray-400 ml-2">({vehicle.plateNumber})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      vehicle.status === 'active' ? 'bg-green-900 text-green-400' :
                      vehicle.status === 'idle' ? 'bg-yellow-900 text-yellow-400' :
                      vehicle.status === 'maintenance' ? 'bg-blue-900 text-blue-400' :
                      'bg-red-900 text-red-400'
                    }`}>
                      {vehicle.status}
                    </span>
                    {pendingUpdates[vehicle.id] && (
                      <div className="flex items-center space-x-1">
                        {pendingUpdates[vehicle.id].status === 'pending' ? (
                          <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                        ) : pendingUpdates[vehicle.id].status === 'success' ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};