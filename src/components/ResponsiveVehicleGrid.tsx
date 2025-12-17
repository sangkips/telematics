import React, { useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, XCircle, Filter } from "lucide-react";
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
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { hasAnyPermission } = useAuth();
  const { vehicles: contextVehicles, error, refreshVehicles } = useVehicleUpdate();
  const parentRef = useRef<HTMLDivElement>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const canManageVehicles = hasAnyPermission([
    "create_vehicles",
    "update_vehicles",
    "delete_vehicles",
    "all",
  ]);

  // Use context vehicles if available, otherwise fall back to props
  const allVehicles = Object.keys(contextVehicles).length > 0
    ? Object.values(contextVehicles)
    : propVehicles;

  // Filter vehicles based on search and status
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) => {
      const matchesSearch = searchQuery === "" ||
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allVehicles, searchQuery, statusFilter]);

  // Determine columns based on screen size
  const columns = isMobile ? 1 : isTablet ? 2 : 3;

  // Calculate rows for virtual grid
  const rowCount = Math.ceil(filteredVehicles.length / columns);

  // Card height estimation (adjust based on your card design)
  const cardHeight = isMobile ? 200 : 280;
  const gap = 16;

  // Virtual row renderer
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + gap,
    overscan: 3, // Render 3 extra rows above/below viewport
  });

  // Get vehicles for a specific row
  const getVehiclesForRow = (rowIndex: number): Vehicle[] => {
    const startIndex = rowIndex * columns;
    return filteredVehicles.slice(startIndex, startIndex + columns);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, plate, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600">Failed to load vehicles: {error}</span>
            </div>
            <button
              onClick={refreshVehicles}
              className="text-red-600 hover:text-red-700 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Fleet Overview ({filteredVehicles.length} of {allVehicles.length} vehicles)
        </h2>

        {isMobile && (
          <div className="text-sm text-gray-500">Tap cards for details</div>
        )}
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={parentRef}
        className="overflow-auto rounded-lg"
        style={{ height: isMobile ? "calc(100vh - 350px)" : "calc(100vh - 320px)" }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const vehicles = getVehiclesForRow(virtualRow.index);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className={`grid gap-4 ${isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3 xl:grid-cols-4"
                    }`}
                  style={{ paddingBottom: `${gap}px` }}
                >
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`
                        ${isMobile ? "touch-manipulation" : ""}
                        transition-transform duration-200
                        ${isMobile ? "active:scale-95" : "hover:scale-[1.02]"}
                      `}
                    >
                      <VehicleCard
                        vehicle={vehicle}
                        onClick={() => onVehicleSelect?.(vehicle)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          {allVehicles.length === 0 ? (
            <>
              <div className="text-gray-500 text-lg mb-2">No vehicles found</div>
              <div className="text-gray-400 text-sm">
                {canManageVehicles
                  ? "Add your first vehicle to get started"
                  : "Contact your administrator to add vehicles"}
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-500 text-lg mb-2">No matching vehicles</div>
              <div className="text-gray-400 text-sm">
                Try adjusting your search or filter criteria
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

