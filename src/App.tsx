import React, { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { LoginForm } from "./components/auth/LoginForm";
// import { ConnectionStatus } from "./components/ConnectionStatus";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Vehicle } from "./types";
import { useRealTimeVehicles } from "./hooks/useApi";
import { apiService } from "./services/api";

const AppContent: React.FC = () => {
  const { isAuthenticated, loading, error: authError } = useAuth();
  const {
    vehicles,
    loading: vehiclesLoading,
    error,
  } = useRealTimeVehicles(5000, isAuthenticated);

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
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {/* <ConnectionStatus /> */}
        <LoginForm />
        {authError && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {authError}
          </div>
        )}
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        {/* <ConnectionStatus /> */}
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
      {/* <ConnectionStatus /> */}
      <Dashboard
        vehicles={vehicles || []}
        onVehicleUpdate={handleVehicleUpdate}
      />
    </>
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
