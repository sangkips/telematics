import React from 'react';
import { Car, Bell, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  criticalAlertsCount: number;
  notifications: boolean;
  onToggleNotifications: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  criticalAlertsCount,
  notifications,
  onToggleNotifications,
  onOpenAdminPanel
}) => {
  const { user, logout, hasPermission } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-900';
      case 'manager': return 'text-blue-400 bg-blue-900';
      case 'operator': return 'text-green-400 bg-green-900';
      case 'viewer': return 'text-gray-400 bg-gray-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Car className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Fleet Telematic System</h1>
            <p className="text-gray-400">Real-time vehicle monitoring & fuel tracking</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleNotifications}
            className={`relative p-2 rounded-lg transition-colors ${
              notifications ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            <Bell className="w-5 h-5" />
            {criticalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {criticalAlertsCount}
              </span>
            )}
          </button>

          {/* Admin Panel Button - Only for Admin/Manager */}
          {(hasPermission('all') || hasPermission('view_system_settings')) && onOpenAdminPanel && (
            <button 
              onClick={onOpenAdminPanel}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          )}

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-white text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};