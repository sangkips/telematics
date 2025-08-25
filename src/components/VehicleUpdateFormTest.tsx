import React, { useState } from 'react';
import { VehicleUpdateForm } from './VehicleUpdateForm';
import { Vehicle } from '../types';

// Mock vehicle data for testing technical specifications
const mockVehicle: Vehicle = {
  id: 'test-vehicle-1',
  name: 'Test Fleet Vehicle',
  plateNumber: 'TEST-123',
  driver: 'John Doe',
  fuelLevel: 45.5,
  maxFuelCapacity: 60,
  location: {
    lat: 40.7128,
    lng: -74.0060,
    address: '123 Test Street, New York, NY',
  },
  speed: 0,
  status: 'active',
  lastUpdate: new Date(),
  odometer: 75000,
  fuelConsumption: 8.5,
  alerts: [],
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  vin: '1HGBH41JXMN109186',
  maintenanceRecords: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const VehicleUpdateFormTest: React.FC = () => {
  const [vehicle, setVehicle] = useState<Vehicle>(mockVehicle);
  const [showForm, setShowForm] = useState(true);
  const [updateResults, setUpdateResults] = useState<string[]>([]);

  const handleSuccess = (updatedVehicle: Vehicle) => {
    setVehicle(updatedVehicle);
    const timestamp = new Date().toLocaleTimeString();
    setUpdateResults(prev => [
      ...prev,
      `${timestamp}: Vehicle updated successfully - Fuel Capacity: ${updatedVehicle.maxFuelCapacity}L, Odometer: ${updatedVehicle.odometer}km, Consumption: ${updatedVehicle.fuelConsumption}L/100km`
    ]);
  };

  const handleCancel = () => {
    setShowForm(false);
    const timestamp = new Date().toLocaleTimeString();
    setUpdateResults(prev => [
      ...prev,
      `${timestamp}: Update cancelled by user`
    ]);
  };

  const resetTest = () => {
    setVehicle(mockVehicle);
    setShowForm(true);
    setUpdateResults([]);
  };

  const createTestScenario = (scenario: 'low_fuel_capacity' | 'high_consumption' | 'normal') => {
    let testVehicle = { ...mockVehicle };
    
    switch (scenario) {
      case 'low_fuel_capacity':
        testVehicle = {
          ...testVehicle,
          fuelLevel: 55, // High fuel level to test capacity constraint
          maxFuelCapacity: 60,
        };
        break;
      case 'high_consumption':
        testVehicle = {
          ...testVehicle,
          fuelConsumption: 12, // Normal consumption to test warning threshold
        };
        break;
      case 'normal':
      default:
        // Use default mock vehicle
        break;
    }
    
    setVehicle(testVehicle);
    setShowForm(true);
    setUpdateResults([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Vehicle Update Form - Technical Specifications Test
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Scenarios</h2>
          <p className="text-sm text-blue-800 mb-3">
            This test component demonstrates the technical specifications update functionality with validation and warning dialogs.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => createTestScenario('normal')}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              Normal Scenario
            </button>
            <button
              onClick={() => createTestScenario('low_fuel_capacity')}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
            >
              High Fuel Level (Test Capacity Warning)
            </button>
            <button
              onClick={() => createTestScenario('high_consumption')}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
            >
              Normal Consumption (Test Warning Thresholds)
            </button>
            <button
              onClick={resetTest}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              Reset Test
            </button>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">Current Vehicle Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Fuel Level:</span> {vehicle.fuelLevel}L
            </div>
            <div>
              <span className="font-medium">Max Capacity:</span> {vehicle.maxFuelCapacity}L
            </div>
            <div>
              <span className="font-medium">Odometer:</span> {vehicle.odometer} km
            </div>
            <div>
              <span className="font-medium">Consumption:</span> {vehicle.fuelConsumption} L/100km
            </div>
            <div>
              <span className="font-medium">Status:</span> {vehicle.status}
            </div>
            <div>
              <span className="font-medium">Driver:</span> {vehicle.driver}
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="text-md font-semibold text-green-900 mb-2">Test Instructions</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Try reducing fuel capacity below current fuel level (should show validation error)</li>
            <li>• Try reducing fuel capacity by more than 20% (should show warning dialog)</li>
            <li>• Try setting odometer reading below current reading (should show validation error)</li>
            <li>• Try setting fuel consumption above 25 L/100km or below 2 L/100km (should show warning dialog)</li>
            <li>• Test normal updates within acceptable ranges</li>
          </ul>
        </div>
      </div>

      {showForm ? (
        <VehicleUpdateForm
          vehicle={vehicle}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          className="mb-6"
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Form is hidden. Click "Reset Test" to show it again.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Show Form
          </button>
        </div>
      )}

      {updateResults.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">Update Results</h3>
          <div className="space-y-1">
            {updateResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-700 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleUpdateFormTest;