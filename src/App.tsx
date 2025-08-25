import React, { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { LoginForm } from "./components/auth/LoginForm";
import { VehicleUpdateFormTest } from "./components/VehicleUpdateFormTest";
import { VehicleDetailsTest } from "./components/VehicleDetailsTest";
// import { ConnectionMonitorTest } from "./components/ConnectionMonitorTest";
// import { ConnectionStatus } from "./components/ConnectionStatus";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ResponsiveProvider } from "./contexts/ResponsiveContext";
import { AlertSystemProvider } from "./contexts/AlertSystemContext";
import { VehicleUpdateProvider, useVehicleUpdate } from "./contexts/VehicleUpdateContext";
import { Vehicle } from "./types";
import { apiService } from "./services/api";

const AuthenticatedApp: React.FC = () => {
  const { vehicles: vehicleMap, loading, error } = useVehicleUpdate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'vehicle-update-test' | 'vehicle-details-test' | 'connection-monitor-test'>('dashboard');
  
  // Convert vehicle map to array for compatibility
  const vehicles = Object.values(vehicleMap);

  const handleVehicleUpdate = async (updatedVehicle: Vehicle) => {
    try {
      await apiService.updateVehicle(updatedVehicle.id, updatedVehicle);
      // The real-time hook will automatically fetch the updated data
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to connect to backend API</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Simple Navigation */}
      {/* <div className="bg-gray-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <h1 className="text-xl font-bold">Fleet Management System</h1>
          <nav className="flex space-x-4 ml-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1 rounded ${
                currentView === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('vehicle-update-test')}
              className={`px-3 py-1 rounded ${
                currentView === 'vehicle-update-test' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Vehicle Update Test
            </button>
            <button
              onClick={() => setCurrentView('vehicle-details-test')}
              className={`px-3 py-1 rounded ${
                currentView === 'vehicle-details-test' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Vehicle Details Test
            </button>
            <button
              onClick={() => setCurrentView('connection-monitor-test')}
              className={`px-3 py-1 rounded ${
                currentView === 'connection-monitor-test' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Connection Monitor Test
            </button>
          </nav>
        </div>
      </div> */}

      {/* Content */}
      <div className="min-h-screen bg-gray-100">
        {currentView === 'dashboard' && (
          <Dashboard
            vehicles={vehicles}
            onVehicleUpdate={handleVehicleUpdate}
          />
        )}
        {currentView === 'vehicle-update-test' && (
          <VehicleUpdateFormTest />
        )}
        {currentView === 'vehicle-details-test' && (
          <VehicleDetailsTest />
        )}
        {/* {currentView === 'connection-monitor-test' && (
          <ConnectionMonitorTest />
        )} */}
      </div>
    </>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading, error: authError } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        {authError && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {authError}
          </div>
        )}
      </>
    );
  }

  return <AuthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <ResponsiveProvider>
        <AlertSystemProvider>
          <VehicleUpdateProvider>
            <AppContent />
          </VehicleUpdateProvider>
        </AlertSystemProvider>
      </ResponsiveProvider>
    </AuthProvider>
  );
}

export default App;
