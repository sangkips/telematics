import React, { useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, XCircle } from "lucide-react";
import { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";
import { useResponsive } from "../hooks/useResponsive";
import { useAuth } from "../contexts/AuthContext";
import { useVehicleUpdate } from "../contexts/VehicleUpdateContext";

interface ResponsiveVehicleGridProps {
  vehicles: Vehicle[];
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onVehicleUpdate?: (vehicle: Vehicle) => void;
}

export const ResponsiveVehicleGrid: React.FC<ResponsiveVehicleGridProps> = ({
  vehicles: propVehicles,
  onVehicleSelect,
  // onVehicleUpdate,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { hasAnyPermission } = useAuth();
  const { vehicles: contextVehicles, connectionState, loading, error, refreshVehicles } = useVehicleUpdate();

  const canManageVehicles = hasAnyPermission([
    "create_vehicles",
    "update_vehicles",
    "delete_vehicles",
    "all",
  ]);

  // Use context vehicles if available, otherwise fall back to props
  const vehicles = Object.keys(contextVehicles).length > 0 
    ? Object.values(contextVehicles) 
    : propVehicles;

  // Subscribe to real-time updates on mount
  useEffect(() => {
    // Context will handle subscription automatically
  }, []);

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (isMobile) return "grid-cols-1";
    if (isTablet) return "grid-cols-2";
    return "grid-cols-3 xl:grid-cols-4";
  };

  // Handle vehicle edit
  // const handleEditVehicle = (vehicle: Vehicle) => {
  //   if (hasPermission('update_vehicles') && onVehicleUpdate) {
  //     onVehicleUpdate(vehicle);
  //   }
  // };

  // Handle vehicle delete
  // const handleDeleteVehicle = (vehicle: Vehicle) => {
  //   if (hasPermission('delete_vehicles')) {
  //     // In a real app, this would show a confirmation dialog
  //     console.log('Delete vehicle:', vehicle.id);
  //   }
  // };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">Failed to load vehicles: {error}</span>
            </div>
            <button
              onClick={refreshVehicles}
              className="text-red-300 hover:text-red-200 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-white">
            Fleet Overview ({vehicles.length} vehicles)
          </h2>
          
          {/* Connection Status Indicator */}
          {/* <div className="flex items-center space-x-1">
            {connectionState.status === 'connected' && !connectionState.fallbackMode ? (
              <div className="flex items-center space-x-1 text-green-400" title="Real-time connected">
                <Wifi className="w-4 h-4" />
                {!isMobile && <span className="text-xs">Live</span>}
              </div>
            ) : connectionState.status === 'connecting' ? (
              <div className="flex items-center space-x-1 text-yellow-400" title="Connecting...">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {!isMobile && <span className="text-xs">Connecting</span>}
              </div>
            ) : connectionState.fallbackMode ? (
              <div className="flex items-center space-x-1 text-orange-400" title="Polling mode">
                <RefreshCw className="w-4 h-4" />
                {!isMobile && <span className="text-xs">Polling</span>}
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-400" title="Disconnected">
                <WifiOff className="w-4 h-4" />
                {!isMobile && <span className="text-xs">Offline</span>}
              </div>
            )}
          </div> */}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Manual Refresh Button */}
          {/* {(connectionState.fallbackMode || connectionState.status === 'disconnected') && (
            <button
              onClick={refreshVehicles}
              disabled={loading}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
              title="Refresh vehicles"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              {!isMobile && <span>Refresh</span>}
            </button>
          )} */}
          
          {isMobile && (
            <div className="text-sm text-gray-400">Tap cards for details</div>
          )}
        </div>
      </div>

      {/* Vehicle Grid */}
      <div
        className={`grid ${getGridColumns()} gap-4 ${
          isMobile ? "gap-y-6" : "gap-6"
        }`}
      >
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`
              ${isMobile ? "touch-manipulation" : ""}
              transition-transform duration-200
              ${isMobile ? "active:scale-95" : "hover:scale-105"}
            `}
          >
            <VehicleCard
              vehicle={vehicle}
              onClick={() => onVehicleSelect?.(vehicle)}
              // onEdit={hasPermission('update_vehicles') ? handleEditVehicle : undefined}
              // onDelete={hasPermission('delete_vehicles') ? handleDeleteVehicle : undefined}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No vehicles found</div>
          <div className="text-gray-500 text-sm">
            {canManageVehicles
              ? "Add your first vehicle to get started"
              : "Contact your administrator to add vehicles"}
          </div>
        </div>
      )}

      {/* Mobile-specific loading indicator placeholder */}
      {isMobile && vehicles.length > 0 && (
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm">Pull down to refresh</div>
        </div>
      )}
    </div>
  );
};
