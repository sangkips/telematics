import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";
import { useResponsive } from "../hooks/useResponsive";
import { useAuth } from "../contexts/AuthContext";

interface ResponsiveVehicleGridProps {
  vehicles: Vehicle[];
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onVehicleUpdate?: (vehicle: Vehicle) => void;
}

export const ResponsiveVehicleGrid: React.FC<ResponsiveVehicleGridProps> = ({
  vehicles,
  onVehicleSelect,
  // onVehicleUpdate,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { hasPermission, hasAnyPermission } = useAuth();

  const canManageVehicles = hasAnyPermission([
    "create_vehicles",
    "update_vehicles",
    "delete_vehicles",
    "all",
  ]);

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
      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Fleet Overview ({vehicles.length} vehicles)
        </h2>
        {isMobile && (
          <div className="text-sm text-gray-400">Tap cards for details</div>
        )}
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
