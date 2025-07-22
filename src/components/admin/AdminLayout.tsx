import React, { useState } from "react";
import {
  Users,
  Settings,
  Bell,
  Shield,
  Car,
  Activity,
  Database,
  Globe,
  ArrowLeft,
  BarChart3,
  Wrench,
  Menu,
  X,
} from "lucide-react";
import { VehicleManagement } from "./VehicleManagement";
import { UserManagement } from "./UserManagement";
import { SystemSettings } from "./SystemSettings";
import { NotificationSettings } from "./NotificationSettings";
import { SecuritySettings } from "./SecuritySettings";
import { ReportsPanel } from "./ReportsPanel";
import { MaintenancePanel } from "./MaintenancePanel";
import { MaintenanceSchedulePanel } from "./MaintenanceSchedulePanel";
import { MaintenanceTabsPanel } from "./MaintenanceTabsPanel";
import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import { Vehicle } from "../../types";

interface AdminLayoutProps {
  vehicles: Vehicle[];
  onClose: () => void;
  onVehicleUpdate?: (vehicle: Vehicle) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  vehicles,
  onClose,
}) => {
  const { user, hasPermission } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState<
    "vehicles" | "users" | "maintenance" | "system" | "notifications" | "security" | "reports"
  >("vehicles");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminStats = {
    totalUsers: 124,
    apiCallsToday: 45231,
    activeSessions: 67,
    systemHealth: 99.9,
  };

  const tabs = [
    {
      id: "vehicles",
      label: "Vehicle Management",
      icon: Car,
      permission: "view_vehicles",
      description: "Manage fleet vehicles and configurations",
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      permission: "view_users",
      description: "Manage system users and permissions",
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      permission: "view_maintenance",
      description: "Track vehicle maintenance records and schedules",
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      permission: "view_reports",
      description: "View fleet analytics and reports",
    },
    {
      id: "system",
      label: "System Settings",
      icon: Settings,
      permission: "view_system_settings",
      description: "Configure system parameters",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      permission: "view_system_settings",
      description: "Configure alert thresholds and channels",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      permission: "manage_api_keys",
      description: "Manage API keys and security policies",
    },
  ].filter((tab) => hasPermission(tab.permission) || hasPermission("all"));

  const getActiveTabInfo = () => {
    return tabs.find((tab) => tab.id === activeTab);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile/Desktop Header */}
      <div className={`bg-gray-800 border-b border-gray-700 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          {/* Mobile Layout */}
          {isMobile ? (
            <>
              {/* Left side - Back button and hamburger */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Menu className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Center - Title */}
              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-400" />
                <h1 className="text-lg font-bold text-white">Admin</h1>
              </div>

              {/* Right side - System status */}
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
            </>
          ) : (
            <>
              {/* Desktop Layout - Original */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <div className="flex items-center space-x-4">
                  <Settings className="w-8 h-8 text-blue-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Administration Panel
                    </h1>
                    <p className="text-gray-400">
                      System management and configuration
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center text-green-400">
                  <Activity className="w-4 h-4 mr-1" />
                  <span className="text-sm">System Online</span>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-gray-400 text-xs">{user?.role} access</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className={`grid gap-4 mt-6 ${
          isMobile 
            ? 'grid-cols-2' 
            : isTablet 
              ? 'grid-cols-2 md:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-4'
        }`}>
          <div className={`bg-gray-700 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Total Users
                </p>
                <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {adminStats.totalUsers}
                </p>
              </div>
              <Users className={`text-blue-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>

          <div className={`bg-gray-700 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  API Calls
                </p>
                <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {isMobile ? '45K' : adminStats.apiCallsToday.toLocaleString()}
                </p>
              </div>
              <Activity className={`text-green-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>

          <div className={`bg-gray-700 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Sessions
                </p>
                <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {adminStats.activeSessions}
                </p>
              </div>
              <Globe className={`text-orange-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>

          <div className={`bg-gray-700 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Health
                </p>
                <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {adminStats.systemHealth}%
                </p>
              </div>
              <Database className={`text-purple-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Navigation */}
      {isMobile && (
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Administration</h3>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{tab.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className={isMobile ? 'block' : 'flex'}>
        {/* Desktop Sidebar Navigation */}
        {!isMobile && (
          <nav className="w-80 bg-gray-800 border-r border-gray-700 min-h-screen">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Administration
              </h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-start space-x-3 p-4 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Mobile Tab Header */}
          {isMobile && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">
                {getActiveTabInfo()?.label}
              </h2>
              <p className="text-gray-400 text-sm">
                {getActiveTabInfo()?.description}
              </p>
            </div>
          )}

          {/* Desktop Tab Header */}
          {!isMobile && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getActiveTabInfo()?.label}
              </h2>
              <p className="text-gray-400">{getActiveTabInfo()?.description}</p>
            </div>
          )}

          {/* Content Container */}
          <div className={`bg-gray-800 rounded-lg border border-gray-700 ${
            isMobile ? 'min-h-[400px]' : 'min-h-[600px]'
          }`}>
            {activeTab === "vehicles" && <VehicleManagement />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "maintenance" && (
              <div className={isMobile ? 'p-4' : 'p-6'}>
                <MaintenanceTabsPanel />
              </div>
            )}
            {activeTab === "reports" && <ReportsPanel vehicles={vehicles} />}
            {activeTab === "system" && <SystemSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "security" && <SecuritySettings />}
          </div>
        </main>
      </div>
    </div>
  );
};
