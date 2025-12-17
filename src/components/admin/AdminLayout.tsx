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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
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
import { AlertDashboard } from "../AlertDashboard";
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
    "vehicles" | "users" | "maintenance" | "alerts" | "system" | "notifications" | "security" | "reports"
  >("vehicles");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      id: "alerts",
      label: "Alert Management",
      icon: AlertTriangle,
      permission: "view_alerts",
      description: "Monitor and manage system alerts and notifications",
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Mobile/Desktop Header */}
      <div className={`bg-gray-900 border-b border-gray-700 sticky top-0 z-40 ${isMobile ? 'p-4' : 'p-6'}`}>
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

              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-white" />
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
                {/* <div className="flex items-center space-x-4">
                  <Settings className="w-8 h-8 text-blue-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Administration Panel
                    </h1>
                    <p className="text-gray-400">
                      System management and configuration
                    </p>
                  </div>
                </div> */}
              </div>

              <div className="flex items-center space-x-4">
                {/* <div className="flex items-center text-green-400">
                  <Activity className="w-4 h-4 mr-1" />
                  <span className="text-sm">System Online</span>
                </div> */}
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
        {/* <div className={`grid gap-4 mt-6 ${isMobile
          ? 'grid-cols-2'
          : isTablet
            ? 'grid-cols-2 md:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-4'
          }`}>
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Total Users
                </p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {adminStats.totalUsers}
                </p>
              </div>
              <Users className={`text-blue-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  API Calls
                </p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {isMobile ? '45K' : adminStats.apiCallsToday.toLocaleString()}
                </p>
              </div>
              <Activity className={`text-green-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Sessions
                </p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {adminStats.activeSessions}
                </p>
              </div>
              <Globe className={`text-orange-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Health
                </p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {adminStats.systemHealth}%
                </p>
              </div>
              <Database className={`text-purple-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
          </div>
        </div> */}
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
          className={`fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${activeTab === tab.id
                    ? "bg-white text-gray-900"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
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
          <nav className={`bg-gray-900 border-r border-gray-700 min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-80'}`}>
            <div className="p-4 flex-1">
              {!sidebarCollapsed && (
                <h3 className="text-lg font-semibold text-white mb-4">
                  Administration
                </h3>
              )}
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group relative ${activeTab === tab.id
                      ? "bg-white text-gray-900"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? tab.label : undefined}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div>
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {tab.description}
                        </div>
                      </div>
                    )}
                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                        {tab.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapse Toggle Button */}
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Collapse</span>
                  </>
                )}
              </button>
            </div>
          </nav>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Mobile Tab Header */}
          {isMobile && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {getActiveTabInfo()?.label}
              </h2>
              <p className="text-gray-600 text-sm">
                {getActiveTabInfo()?.description}
              </p>
            </div>
          )}

          {/* Desktop Tab Header */}
          {!isMobile && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {getActiveTabInfo()?.label}
              </h2>
              <p className="text-gray-600">{getActiveTabInfo()?.description}</p>
            </div>
          )}

          <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'min-h-[400px]' : 'min-h-[600px]'
            }`}>
            {activeTab === "vehicles" && <VehicleManagement />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "maintenance" && (
              <div className={isMobile ? 'p-4' : 'p-6'}>
                <MaintenanceTabsPanel />
              </div>
            )}
            {activeTab === "alerts" && (
              <div className={isMobile ? 'p-4' : 'p-6'}>
                <AlertDashboard />
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
