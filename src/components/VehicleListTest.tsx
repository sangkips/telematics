import React, { useState } from 'react';
import { Vehicle } from '../types';
import { useVehicleUpdate } from '../contexts/VehicleUpdateContext';
import { ResponsiveVehicleGrid } from './ResponsiveVehicleGrid';

export const VehicleListTest: React.FC = () => {
  const { vehicles, updateVehicle, connectionState } = useVehicleUpdate();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleTestUpdate = async () => {
    const vehicleList = Object.values(vehicles);
    if (vehicleList.length > 0) {
      const testVehicle = vehicleList[0];
      const newStatus = testVehicle.status === 'active' ? 'idle' : 'active';
      
      try {
        await updateVehicle(testVehicle.id, { status: newStatus });
        console.log(`Updated vehicle ${testVehicle.name} status to ${newStatus}`);
      } catch (error) {
        console.error('Failed to update vehicle:', error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Real-time Vehicle List Test</h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-sm text-gray-300">
            Connection: <span className={`font-semibold ${
              connectionState.status === 'connected' ? 'text-green-400' : 
              connectionState.status === 'connecting' ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {connectionState.status}
            </span>
          </div>
          
          {connectionState.fallbackMode && (
            <div className="text-sm text-orange-400">
              (Polling Mode)
            </div>
          )}
          
          <button
            onClick={handleTestUpdate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Test Update
          </button>
        </div>
      </div>

      <ResponsiveVehicleGrid
        vehicles={Object.values(vehicles)}
        onVehicleSelect={setSelectedVehicle}
      />

      {selectedVehicle && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Selected Vehicle</h3>
          <pre className="text-gray-300 text-sm bg-gray-700 p-3 rounded overflow-auto">
            {JSON.stringify(selectedVehicle, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};