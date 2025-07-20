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
  const [activeTab, setActiveTab] = useState<
    "vehicles" | "users" | "maintenance" | "system" | "notifications" | "security" | "reports"
  >("vehicles");

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
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {adminStats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">API Calls Today</p>
                <p className="text-2xl font-bold text-white">
                  {adminStats.apiCallsToday.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {adminStats.activeSessions}
                </p>
              </div>
              <Globe className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">System Health</p>
                <p className="text-2xl font-bold text-white">
                  {adminStats.systemHealth}%
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
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
                  className={`w-full flex items-start space-x-3 p-4 rounded-lg transition-colors text-left ${activeTab === tab.id
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

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {getActiveTabInfo()?.label}
            </h2>
            <p className="text-gray-400">{getActiveTabInfo()?.description}</p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 min-h-[600px]">
            {activeTab === "vehicles" && <VehicleManagement />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "maintenance" && (
              <div className="p-6">
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
