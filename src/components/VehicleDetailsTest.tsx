import React from 'react';
import { VehicleDetails } from './VehicleDetails';
import { Vehicle } from '../types';

// Test vehicle data
const testVehicle: Vehicle = {
  id: 'test-vehicle-1',
  name: 'Test Fleet Vehicle',
  plateNumber: 'TEST-123',
  driver: 'John Smith',
  fuelLevel: 75,
  maxFuelCapacity: 60,
  location: {
    lat: 40.7128,
    lng: -74.0060,
    address: '123 Main Street, New York, NY 10001',
  },
  speed: 45,
  status: 'active',
  lastUpdate: new Date(),
  odometer: 50000,
  fuelConsumption: 8.5,
  alerts: [
    {
      id: 'alert-1',
      vehicleId: 'test-vehicle-1',
      type: 'maintenance',
      message: 'Scheduled maintenance due in 500km',
      severity: 'medium',
      timestamp: new Date(),
      resolved: false,
    }
  ],
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  vin: '1HGBH41JXMN109186',
  maintenanceRecords: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const VehicleDetailsTest: React.FC = () => {
  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    console.log('Vehicle updated:', updatedVehicle);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Vehicle Details Component Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <VehicleDetails 
            vehicle={testVehicle} 
            onVehicleUpdate={handleVehicleUpdate}
          />
        </div>
        
        <div className="mt-6 text-sm text-gray-400">
          <p>This is a test page for the VehicleDetails component.</p>
          <p>Features to test:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Real-time updates display</li>
            <li>Edit mode functionality</li>
            <li>Form validation</li>
            <li>Connection status indicator</li>
            <li>Location update with map integration</li>
            <li>Update confirmation and rollback capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};