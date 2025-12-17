import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Fuel,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Vehicle } from "../../types";
import { useResponsive } from "../../hooks/useResponsive";
import { useResponsiveContext } from "../../contexts/ResponsiveContext";
import { useVehicleUpdate } from "../../contexts/VehicleUpdateContext";

interface ReportsPanelProps {
  vehicles: Vehicle[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ vehicles: propVehicles }) => {
  const { vehicles: contextVehicles, connectionState } = useVehicleUpdate();
  
  // Use context vehicles if available, otherwise fall back to props
  const vehicles = Object.keys(contextVehicles).length > 0 
    ? Object.values(contextVehicles) 
    : propVehicles;
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const [dateRange, setDateRange] = useState("7d");
  const [reportType, setReportType] = useState("overview");

  const generateReportData = () => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "active").length;
    const totalFuel = vehicles.reduce((sum, v) => sum + v.fuelLevel, 0);
    const avgFuelLevel = totalFuel / totalVehicles;
    const totalDistance = vehicles.reduce((sum, v) => sum + v.odometer, 0);
    const totalAlerts = vehicles.reduce((sum, v) => sum + v.alerts.length, 0);
    const criticalAlerts = vehicles.reduce(
      (sum, v) =>
        sum +
        v.alerts.filter((a) => a.severity === "critical" && !a.resolved).length,
      0
    );

    return {
      totalVehicles,
      activeVehicles,
      avgFuelLevel: Math.round(avgFuelLevel),
      totalDistance,
      totalAlerts,
      criticalAlerts,
      fuelEfficiency:
        vehicles.reduce((sum, v) => sum + v.fuelConsumption, 0) / totalVehicles,
    };
  };

  const reportData = generateReportData();

  const exportReport = (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting report as ${format}`);
    // In a real app, this would generate and download the report
    alert(`Report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Fleet Reports</h2>
        {/* <div className="flex items-center space-x-1">
          {connectionState.status === 'connected' && !connectionState.fallbackMode ? (
            <div className="flex items-center space-x-1 text-green-400" title="Real-time connected">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">Live Data</span>
            </div>
          ) : connectionState.status === 'connecting' ? (
            <div className="flex items-center space-x-1 text-yellow-400" title="Connecting...">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-xs">Connecting</span>
            </div>
          ) : connectionState.fallbackMode ? (
            <div className="flex items-center space-x-1 text-orange-400" title="Polling mode">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs">Polling</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-400" title="Disconnected">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs">Offline</span>
            </div>
          )}
        </div> */}
      </div>

      {/* Report Controls */}
      <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
        <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-4'}`}>
          <div className={`flex items-center space-x-2 ${isMobile ? 'w-full' : ''}`}>
            {!isMobile && <Calendar className="w-4 h-4 text-gray-400" />}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`bg-white border border-gray-300 rounded-lg text-gray-900 px-3 py-2 focus:outline-none focus:border-brand-secondary-400 ${
                isMobile ? 'w-full min-h-[44px]' : ''
              }`}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

          <div className={`flex items-center space-x-2 ${isMobile ? 'w-full' : ''}`}>
            {!isMobile && <Filter className="w-4 h-4 text-gray-400" />}
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`bg-white border border-gray-300 rounded-lg text-gray-900 px-3 py-2 focus:outline-none focus:border-brand-secondary-400 ${
                isMobile ? 'w-full min-h-[44px]' : ''
              }`}
            >
              <option value="overview">Fleet Overview</option>
              <option value="fuel">Fuel Analysis</option>
              <option value="maintenance">Maintenance Reports</option>
              <option value="alerts">Alert Summary</option>
              <option value="performance">Performance Metrics</option>
            </select>
          </div>
        </div>

        <div className={`${isMobile ? 'grid grid-cols-3 gap-2' : 'flex items-center space-x-2'}`}>
          <button
            onClick={() => exportReport("pdf")}
            className={`flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors ${
              isMobile ? 'justify-center min-h-[44px]' : ''
            }`}
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReport("excel")}
            className={`flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors ${
              isMobile ? 'justify-center min-h-[44px]' : ''
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportReport("csv")}
            className={`flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors ${
              isMobile ? 'justify-center min-h-[44px]' : ''
            }`}
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Fleet Utilization</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(
                  (reportData.activeVehicles / reportData.totalVehicles) * 100
                )}
                %
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {reportData.activeVehicles} of {reportData.totalVehicles} vehicles
            active
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Fuel Level</p>
              <p className="text-2xl font-bold text-white">
                {reportData.avgFuelLevel}%
              </p>
            </div>
            <Fuel className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {reportData.fuelEfficiency.toFixed(1)} L/100km average
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Distance</p>
              <p className="text-2xl font-bold text-white">
                {(reportData.totalDistance / 1000).toFixed(1)}k km
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-400" />
          </div>
          <div className="mt-2 text-sm text-gray-600">Across all vehicles</div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical Alerts</p>
              <p className="text-2xl font-bold text-white">
                {reportData.criticalAlerts}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {reportData.totalAlerts} total alerts
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      {isMobile ? (
        /* Mobile: Expandable Card Layout */
        <div className="space-y-4">
          {/* Vehicle Performance Card */}
          <div className="bg-gray-100 rounded-lg border border-gray-600 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('vehicle-performance')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Performance</h3>
                </div>
                {expandedCards.includes('vehicle-performance') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('vehicle-performance') && (
              <div className="px-4 pb-4 border-t border-gray-600">
                <div className="space-y-3 mt-4">
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-white font-medium text-sm">{vehicle.name}</div>
                          <div className="text-gray-400 text-xs">{vehicle.plateNumber}</div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === "active"
                              ? "text-green-400 bg-green-900"
                              : vehicle.status === "idle"
                              ? "text-amber-400 bg-amber-900"
                              : vehicle.status === "maintenance"
                              ? "text-blue-400 bg-blue-900"
                              : "text-red-400 bg-red-900"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Fuel Level</p>
                          <p className="text-sm text-gray-900">{vehicle.fuelLevel}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Distance</p>
                          <p className="text-sm text-gray-900">{(vehicle.odometer / 1000).toFixed(1)}k km</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alert Summary Card */}
          <div className="bg-gray-100 rounded-lg border border-gray-600 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('alert-summary')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Alert Summary</h3>
                </div>
                {expandedCards.includes('alert-summary') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('alert-summary') && (
              <div className="px-4 pb-4 border-t border-gray-600">
                <div className="space-y-3 mt-4">
                  {vehicles
                    .flatMap((v) => v.alerts)
                    .slice(0, 5)
                    .map((alert) => (
                      <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              alert.severity === "critical"
                                ? "bg-red-500"
                                : alert.severity === "high"
                                ? "bg-orange-500"
                                : alert.severity === "medium"
                                ? "bg-amber-500"
                                : "bg-gray-900"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm">{alert.message}</div>
                                <div className="text-gray-400 text-xs mt-1">
                                  {alert.timestamp.toLocaleDateString()} • {alert.type.replace("_", " ")}
                                </div>
                              </div>
                              <div
                                className={`text-xs px-2 py-1 rounded ml-2 flex-shrink-0 ${
                                  alert.resolved
                                    ? "text-green-400 bg-green-900"
                                    : "text-red-400 bg-red-900"
                                }`}
                              >
                                {alert.resolved ? "Resolved" : "Active"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Performance Table */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Vehicle Performance
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left text-gray-400 text-sm py-2">Vehicle</th>
                    <th className="text-left text-gray-400 text-sm py-2">Status</th>
                    <th className="text-left text-gray-400 text-sm py-2">Fuel</th>
                    <th className="text-left text-gray-400 text-sm py-2">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-600">
                      <td className="py-3">
                        <div className="text-white font-medium">{vehicle.name}</div>
                        <div className="text-gray-400 text-sm">{vehicle.plateNumber}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === "active"
                              ? "text-green-400 bg-green-900"
                              : vehicle.status === "idle"
                              ? "text-amber-400 bg-amber-900"
                              : vehicle.status === "maintenance"
                              ? "text-blue-400 bg-blue-900"
                              : "text-red-400 bg-red-900"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3 text-white">{vehicle.fuelLevel}%</td>
                      <td className="py-3 text-white">{(vehicle.odometer / 1000).toFixed(1)}k km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alert Summary */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Alert Summary
            </h3>

            <div className="space-y-4">
              {vehicles
                .flatMap((v) => v.alerts)
                .slice(0, 5)
                .map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === "critical"
                          ? "bg-red-500"
                          : alert.severity === "high"
                          ? "bg-orange-500"
                          : alert.severity === "medium"
                          ? "bg-amber-500"
                          : "bg-gray-900"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <div className="text-white text-sm">{alert.message}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {alert.timestamp.toLocaleDateString()} • {alert.type.replace("_", " ")}
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        alert.resolved
                          ? "text-green-400 bg-green-900"
                          : "text-red-400 bg-red-900"
                      }`}
                    >
                      {alert.resolved ? "Resolved" : "Active"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Fuel Consumption Chart Placeholder */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Fuel className="w-5 h-5 mr-2 text-green-400" />
          Fuel Consumption Trends
        </h3>

        <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600">
              Chart visualization would be displayed here
            </p>
            <p className="text-gray-500 text-sm">
              Integration with charting library needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
