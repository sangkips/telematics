import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/auth/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Vehicle, Alert } from './types';
import { mockVehicles, generateRandomFuelData, generateRandomLocation } from './mockData';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          const newFuelLevel = generateRandomFuelData(vehicle.id, vehicle.fuelLevel);
          const newLocation = generateRandomLocation(vehicle.location.lat, vehicle.location.lng);
          
          // Detect fuel theft
          const fuelDrop = vehicle.fuelLevel - newFuelLevel;
          let newAlerts = [...vehicle.alerts];
          
          if (fuelDrop > 10) { // Significant fuel drop
            const theftAlert: Alert = {
              id: `theft-${Date.now()}`,
              type: 'fuel_theft',
              message: `Abnormal fuel drop detected: ${fuelDrop.toFixed(1)}L in short period`,
              severity: 'critical',
              timestamp: new Date(),
              resolved: false
            };
            newAlerts = [theftAlert, ...newAlerts];
          }
          
          // Update vehicle speed (simulate movement)
          const newSpeed = vehicle.status === 'active' ? 
            Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10) : 0;

          return {
            ...vehicle,
            fuelLevel: newFuelLevel,
            location: {
              ...vehicle.location,
              lat: newLocation.lat,
              lng: newLocation.lng
            },
            speed: Math.round(newSpeed),
            lastUpdate: new Date(),
            alerts: newAlerts
          };
        });
      });
      
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => 
      v.id === updatedVehicle.id ? updatedVehicle : v
    ));
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Dashboard 
      vehicles={vehicles} 
      onVehicleUpdate={handleVehicleUpdate}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;