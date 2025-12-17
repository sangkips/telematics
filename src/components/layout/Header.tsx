import React, { useState } from "react";
import { Truck, Bell, User, LogOut, Settings, Shield, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import { useResponsiveContext } from "../../contexts/ResponsiveContext";

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
  onOpenAdminPanel,
}) => {
  const { user, logout, hasPermission, hasAnyPermission } = useAuth();
  const { isMobile } = useResponsive();
  const { menuOpen, setMenuOpen } = useResponsiveContext();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-600 bg-red-50 border border-red-200";
      case "manager":
        return "text-blue-600 bg-blue-50 border border-blue-200";
      case "operator":
        return "text-green-600 bg-green-50 border border-green-200";
      case "viewer":
        return "text-gray-600 bg-gray-50 border border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-700 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Mobile Layout */}
          {isMobile ? (
            <>
              {/* Left side - Hamburger menu */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex items-center hover:opacity-80 transition-opacity"
                title="Go to Homepage"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-gray-900" />
                </div>
                <span className="ml-2 text-lg font-bold text-white">Nura</span>
              </button>

              {/* Right side - Notifications */}
              <button
                onClick={onToggleNotifications}
                className={`relative p-2 rounded-lg transition-colors ${notifications
                  ? "bg-white text-gray-900"
                  : "bg-gray-800 text-gray-300"
                  }`}
              >
                <Bell className="w-5 h-5" />
                {criticalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {criticalAlertsCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                title="Go to Homepage"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Nura Fleet System</h1>
                  <p className="text-gray-400">
                    Real-time vehicle monitoring & fuel tracking
                  </p>
                </div>
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={onToggleNotifications}
                  className={`relative p-2 rounded-lg transition-colors ${notifications
                    ? "bg-white text-gray-900"
                    : "bg-gray-800 text-gray-300"
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
                {(user?.role === "admin" || user?.role === "manager") &&
                  onOpenAdminPanel && (
                    <button
                      onClick={onOpenAdminPanel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-white font-medium text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                  )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {menuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Slide-out Drawer */}
          <div
            className={`fixed top-0 left-0 h-full w-80 bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nura Fleet</h2>
                    <p className="text-gray-400 text-sm">Fleet Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          user?.role || ""
                        )}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {/* Admin Panel Button - Only for Admin/Manager */}
                {(hasPermission("all") ||
                  hasAnyPermission([
                    "view_system_settings",
                    "create_users",
                    "create_vehicles",
                    "manage_api_keys",
                  ])) &&
                  onOpenAdminPanel && (
                    <button
                      onClick={() => {
                        onOpenAdminPanel();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                    >
                      <Settings className="w-5 h-5 text-gray-300" />
                      <span className="text-white">Admin Panel</span>
                    </button>
                  )}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LogOut className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

