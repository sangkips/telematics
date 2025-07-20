import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Bell, 
  Shield, 
  Car, 
  Plus,
  Activity,
  Database,
  Globe,
  Wrench
} from 'lucide-react';
import { VehicleManagement } from './VehicleManagement';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';
import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { MaintenancePanel } from './MaintenancePanel';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'users' | 'maintenance' | 'system' | 'notifications' | 'security'>('vehicles');

  const adminStats = {
    totalUsers: 124,
    apiCallsToday: 45231,
    activeSessions: 67,
    systemHealth: 99.9
  };

  const tabs = [
    { id: 'vehicles', label: 'Vehicle Management', icon: Car },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-7xl h-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400">System management and configuration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-400">
                <Activity className="w-4 h-4 mr-1" />
                <span className="text-sm">System Online</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{adminStats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">API Calls Today</p>
                  <p className="text-2xl font-bold text-white">{adminStats.apiCallsToday.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Sessions</p>
                  <p className="text-2xl font-bold text-white">{adminStats.activeSessions}</p>
                </div>
                <Globe className="w-8 h-8 text-orange-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">System Health</p>
                  <p className="text-2xl font-bold text-white">{adminStats.systemHealth}%</p>
                </div>
                <Database className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-gray-800 border-b border-gray-700 px-6">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'maintenance' && <MaintenancePanel />}
          {activeTab === 'system' && <SystemSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};