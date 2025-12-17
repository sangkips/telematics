import React, { useState } from "react";
import {
    MapPin,
    AlertTriangle,
    Wrench,
    ChevronLeft,
    ChevronRight,
    Truck,
    LayoutDashboard,
    User,
    LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";

interface SidebarProps {
    activeTab: "overview" | "map" | "alerts" | "maintenance";
    onTabChange: (tab: "overview" | "map" | "alerts" | "maintenance") => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    alertsCount?: number;
}

interface NavItem {
    id: "overview" | "map" | "alerts" | "maintenance";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permission: string;
}

const navItems: NavItem[] = [
    {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
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
];

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    isCollapsed,
    onToggleCollapse,
    alertsCount = 0,
}) => {
    const { user, logout, hasPermission } = useAuth();
    const { isMobile } = useResponsive();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Filter nav items based on permissions
    const visibleNavItems = navItems.filter(
        (item) => hasPermission(item.permission) || hasPermission("all")
    );

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Mobile sidebar is handled separately (slide-out menu in Header)
    if (isMobile) {
        return null;
    }

    return (
        <aside
            className={`
        bg-gray-900 h-screen sticky top-0 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        title="Go to Homepage"
                    >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                            <Truck className="w-5 h-5 text-gray-900" />
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-bold text-white whitespace-nowrap">
                                    Nura Fleet
                                </h1>
                                <p className="text-xs text-gray-400 whitespace-nowrap">
                                    Fleet Management
                                </p>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const showBadge = item.id === "alerts" && alertsCount > 0;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200 group relative
                ${isActive
                                    ? "bg-white text-gray-900"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }
                ${isCollapsed ? "justify-center" : ""}
              `}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-gray-900" : ""}`} />

                            {!isCollapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}

                            {/* Alert Badge */}
                            {showBadge && (
                                <span
                                    className={`
                    ${isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"}
                    bg-red-500 text-white text-xs font-medium rounded-full
                    min-w-[20px] h-5 flex items-center justify-center px-1.5
                  `}
                                >
                                    {alertsCount > 99 ? "99+" : alertsCount}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div
                                    className={`
                    absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm
                    rounded-md whitespace-nowrap opacity-0 invisible
                    group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-50 pointer-events-none
                  `}
                                >
                                    {item.label}
                                    {showBadge && (
                                        <span className="ml-2 text-red-300">({alertsCount})</span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse Toggle Button */}
            <div className="px-3 py-2">
                <button
                    onClick={onToggleCollapse}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg
            text-gray-400 hover:bg-gray-800 hover:text-white transition-colors
            ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </button>
            </div>

            {/* User Profile Section */}
            <div className="border-t border-gray-700 p-3">
                {isCollapsed ? (
                    // Collapsed state - just show avatar with dropdown
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-800 transition-colors group"
                            title={`${user?.firstName} ${user?.lastName}`}
                        >
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-900" />
                            </div>
                        </button>

                        {/* Dropdown menu for collapsed state */}
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                                <div className="px-3 py-2 border-b border-gray-600">
                                    <div className="text-white font-medium text-sm">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                >
                                    {isLoggingOut ? (
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Expanded state - show full user profile
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm truncate">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                            {isLoggingOut ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LogOut className="w-5 h-5 text-red-400" />
                            )}
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

