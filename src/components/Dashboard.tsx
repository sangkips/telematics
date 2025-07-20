import React, { useState, useEffect } from "react";
import {
  Car,
  Fuel,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  Edit,
  Trash2,
  Wrench,
} from "lucide-react";
import { Vehicle, Alert } from "../types";
import { VehicleCard } from "./VehicleCard";
import { VehicleMap } from "./VehicleMap";
import { AlertPanel } from "./AlertPanel";
import { FuelGauge } from "./FuelGauge";
import { MaintenanceDashboard } from "./MaintenanceDashboard";
import { AdminLayout } from "./admin/AdminLayout";
import { Header } from "./layout/Header";
import { useAuth } from "../contexts/AuthContext";

interface DashboardProps {
  vehicles: Vehicle[];
  onVehicleUpdate?: (vehicle: Vehicle) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vehicles,
  onVehicleUpdate,
}) => {
  const { hasPermission, hasAnyPermission } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "map" | "alerts" | "maintenance">(
    "overview"
  );
  const [notifications, setNotifications] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const allAlerts = vehicles.flatMap((v) => v.alerts);
  const activeAlerts = allAlerts.filter((a) => !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

  const fleetStats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v) => v.status === "active").length,
    idleVehicles: vehicles.filter((v) => v.status === "idle").length,
    maintenanceVehicles: vehicles.filter((v) => v.status === "maintenance")
      .length,
    averageFuelLevel: Math.round(
      vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length
    ),
    totalDistance: vehicles.reduce((sum, v) => sum + v.odometer, 0),
    fuelTheftIncidents: activeAlerts.filter((a) => a.type === "fuel_theft")
      .length,
  };

  const handleResolveAlert = (alertId: string) => {
    if (!hasPermission("resolve_alerts")) {
      alert("You do not have permission to resolve alerts");
      return;
    }
    console.log("Resolving alert:", alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    if (!hasPermission("resolve_alerts")) {
      alert("You do not have permission to dismiss alerts");
      return;
    }
    console.log("Dismissing alert:", alertId);
  };

  const canManageVehicles = hasAnyPermission([
    "create_vehicles",
    "update_vehicles",
    "delete_vehicles",
    "all",
  ]);
  const canViewAlerts = hasPermission("view_alerts") || hasPermission("all");
  const canManageAlerts =
    hasPermission("resolve_alerts") || hasPermission("all");

  // If admin panel is open, show the admin layout instead
  if (
    showAdminPanel &&
    (hasPermission("all") ||
      hasAnyPermission([
        "view_system_settings",
        "create_users",
        "create_vehicles",
        "manage_api_keys",
        "view_users",
      ]))
  ) {
    return (
      <AdminLayout
        vehicles={vehicles}
        onClose={() => setShowAdminPanel(false)}
        onVehicleUpdate={onVehicleUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header
        criticalAlertsCount={criticalAlerts.length}
        notifications={notifications}
        onToggleNotifications={() => setNotifications(!notifications)}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
      />

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4">
        <div className="flex space-x-8">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: Activity,
              permission: "view_vehicles",
            },
            {
              id: "map",
              label: "Live Map",
              icon: MapPin,
              permission: "view_vehicles",
            },
            {
              id: "alerts",
              label: "Alerts",
              icon: AlertTriangle,
              permission: "view_alerts",
            },
            {
              id: "maintenance",
              label: "Maintenance",
              icon: Wrench,
              permission: "view_maintenance",
            },
          ]
            .filter(
              (tab) => hasPermission(tab.permission) || hasPermission("all")
            )
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === "alerts" &&
                  activeAlerts.length > 0 &&
                  canViewAlerts && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeAlerts.length}
                    </span>
                  )}
              </button>
            ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Vehicles</p>
                    <p className="text-2xl font-bold text-white">
                      {fleetStats.totalVehicles}
                    </p>
                  </div>
                  <Car className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  {fleetStats.activeVehicles} active, {fleetStats.idleVehicles}{" "}
                  idle
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Fuel Level</p>
                    <p className="text-2xl font-bold text-white">
                      {fleetStats.averageFuelLevel}%
                    </p>
                  </div>
                  <Fuel className="w-8 h-8 text-green-400" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Fleet average fuel efficiency
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Distance</p>
                    <p className="text-2xl font-bold text-white">
                      {(fleetStats.totalDistance / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Kilometers driven this month
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Theft Incidents</p>
                    <p className="text-2xl font-bold text-white">
                      {fleetStats.fuelTheftIncidents}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Detected fuel theft cases
                </div>
              </div>
            </div>

            {/* Vehicle Grid */}
            <div>
              {/* <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Vehicle Fleet</h2>
                {hasPermission("create_vehicles") && (
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Vehiclesss</span>
                  </button>
                )}
              </div> */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="relative group">
                    <VehicleCard
                      vehicle={vehicle}
                      onClick={() => setSelectedVehicle(vehicle)}
                    />
                    {canManageVehicles && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          {hasPermission("update_vehicles") && (
                            <button className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white">
                              <Edit className="w-3 h-3" />
                            </button>
                          )}
                          {hasPermission("delete_vehicles") && (
                            <button className="p-1 bg-red-600 hover:bg-red-700 rounded text-white">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fuel Monitoring */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Fuel Monitoring</h2>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {vehicles.map((vehicle) => (
                    <FuelGauge
                      key={vehicle.id}
                      level={vehicle.fuelLevel}
                      capacity={vehicle.maxFuelCapacity}
                      vehicleName={vehicle.name}
                      size="medium"
                      showAlert={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Live Vehicle Tracking</h2>
            <VehicleMap
              vehicles={vehicles}
              selectedVehicle={selectedVehicle || undefined}
              onVehicleSelect={setSelectedVehicle}
            />

            {selectedVehicle && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedVehicle.name} - Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <VehicleCard vehicle={selectedVehicle} />
                  </div>
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">
                          Current Location
                        </p>
                        <p className="text-white">
                          {selectedVehicle.location.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Coordinates</p>
                        <p className="text-white">
                          {selectedVehicle.location.lat.toFixed(4)},{" "}
                          {selectedVehicle.location.lng.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Last Update</p>
                        <p className="text-white">
                          {selectedVehicle.lastUpdate.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Driver</p>
                        <p className="text-white">{selectedVehicle.driver}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "alerts" && canViewAlerts && (
          <div className="space-y-6">
            <AlertPanel
              alerts={allAlerts}
              onResolveAlert={canManageAlerts ? handleResolveAlert : undefined}
              onDismissAlert={canManageAlerts ? handleDismissAlert : undefined}
            />
          </div>
        )}

        {activeTab === "maintenance" && (hasPermission("view_maintenance") || hasPermission("all")) && (
          <div className="space-y-6">
            <MaintenanceDashboard vehicles={vehicles} />
          </div>
        )}
      </main>
    </div>
  );
};
