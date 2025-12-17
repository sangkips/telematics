import React, { useState, useEffect } from "react";
import { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";
import { VehicleMap } from "./VehicleMap";
import { AlertPanel } from "./AlertPanel";
import { MaintenanceDashboard } from "./MaintenanceDashboard";
import { AdminLayout } from "./admin/AdminLayout";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { BottomTabNavigation } from "./layout/BottomTabNavigation";
import { StatsCarousel } from "./StatsCarousel";
import { ResponsiveVehicleGrid } from "./ResponsiveVehicleGrid";
import { ConnectionMonitor } from "./ConnectionMonitor";
import { useAuth } from "../contexts/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import { useVehicleUpdate } from "../contexts/VehicleUpdateContext";

interface DashboardProps {
  vehicles: Vehicle[];
  onVehicleUpdate?: (vehicle: Vehicle) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vehicles: propVehicles,
  onVehicleUpdate,
}) => {
  const { hasPermission, hasAnyPermission } = useAuth();
  const { isMobile } = useResponsive();
  const {
    vehicles: contextVehicles,
    updateVehicle,
    connectionState,
    refreshVehicles
  } = useVehicleUpdate();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Use context vehicles if available, otherwise fall back to props
  const vehicles = Object.keys(contextVehicles).length > 0
    ? Object.values(contextVehicles)
    : propVehicles;

  // Update selected vehicle when vehicles change (real-time updates)
  useEffect(() => {
    if (selectedVehicle && contextVehicles[selectedVehicle.id]) {
      setSelectedVehicle(contextVehicles[selectedVehicle.id]);
    }
  }, [contextVehicles, selectedVehicle]);

  // Handle vehicle updates using context or fallback to prop
  const handleVehicleUpdate = async (vehicle: Vehicle) => {
    if (updateVehicle) {
      // Use context updateVehicle which expects (id, updates)
      const { id, ...updates } = vehicle;
      try {
        await updateVehicle(id, updates);
      } catch (error) {
        console.error('Failed to update vehicle:', error);
      }
    } else if (onVehicleUpdate) {
      // Fallback to prop function
      onVehicleUpdate(vehicle);
    }
  };
  const [activeTab, setActiveTab] = useState<
    "overview" | "map" | "alerts" | "maintenance"
  >("overview");
  const [notifications, setNotifications] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const handleRefreshAlerts = async () => {
    // Simulate API call to refresh alerts
    console.log("Refreshing alerts...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Alerts refreshed");
  };

  // Removed unused variable canManageVehicles
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar - Desktop Only */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        alertsCount={activeAlerts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          criticalAlertsCount={criticalAlerts.length}
          notifications={notifications}
          onToggleNotifications={() => setNotifications(!notifications)}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
        />

        {/* Connection Status Monitor */}
        <div className="px-4 py-2">
          <ConnectionMonitor
            connectionState={connectionState}
            onManualRefresh={refreshVehicles}
            showNotifications={true}
          />
        </div>

        {/* Main Content */}
        <main className={`${isMobile
          ? 'p-4 pb-20 space-y-4'
          : 'p-6 space-y-6'
          }`}>

          {activeTab === "overview" && (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              {/* Stats Cards - Mobile-First Responsive Design */}
              <section className="space-y-2">
                {isMobile && (
                  <h2 className="text-lg font-semibold text-gray-900 px-1">
                    Fleet Overview
                  </h2>
                )}
                <StatsCarousel stats={fleetStats} />
              </section>

              {/* Vehicle Grid - Mobile-First Single Column Layout */}
              <section className="space-y-2">
                <ResponsiveVehicleGrid
                  vehicles={vehicles}
                  onVehicleSelect={setSelectedVehicle}
                  onVehicleUpdate={handleVehicleUpdate}
                />
              </section>
            </div>
          )}

          {activeTab === "map" && (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <h2 className={`font-semibold ${isMobile ? 'text-lg px-1' : 'text-xl'
                }`}>
                Live Vehicle Tracking
              </h2>
              <VehicleMap
                vehicles={vehicles}
                selectedVehicle={selectedVehicle || undefined}
                onVehicleSelect={setSelectedVehicle}
              />

              {selectedVehicle && (
                <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'p-4' : 'p-6'
                  }`}>
                  <h3 className={`font-semibold mb-4 text-gray-900 ${isMobile ? 'text-base' : 'text-lg'
                    }`}>
                    {selectedVehicle.name} - Details
                  </h3>
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
                    } ${isMobile ? 'gap-4' : 'gap-6'}`}>
                    <div>
                      <VehicleCard vehicle={selectedVehicle} />
                    </div>
                    <div className={isMobile ? '' : 'md:col-span-2'}>
                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'
                        }`}>
                        <div>
                          <p className="text-gray-500 text-sm">
                            Current Location
                          </p>
                          <p className="text-gray-900">
                            {selectedVehicle.location.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Coordinates</p>
                          <p className="text-gray-900">
                            {selectedVehicle.location.lat.toFixed(4)},{" "}
                            {selectedVehicle.location.lng.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Last Update</p>
                          <p className="text-gray-900">
                            {selectedVehicle.lastUpdate.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Driver</p>
                          <p className="text-gray-900">{selectedVehicle.driver}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "alerts" && canViewAlerts && (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <AlertPanel
                alerts={allAlerts}
                onResolveAlert={canManageAlerts ? handleResolveAlert : undefined}
                onDismissAlert={canManageAlerts ? handleDismissAlert : undefined}
                onRefresh={handleRefreshAlerts}
              />
            </div>
          )}

          {activeTab === "maintenance" &&
            (hasPermission("view_maintenance") || hasPermission("all")) && (
              <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                <MaintenanceDashboard vehicles={vehicles} />
              </div>
            )}
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <BottomTabNavigation
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as any)}
          alertsCount={canViewAlerts ? activeAlerts.length : 0}
        />
      </div>
    </div>
  );
};
