import React from "react";
import { Activity, MapPin, AlertTriangle, Wrench } from "lucide-react";
import { useResponsive } from "../../hooks/useResponsive";
import { useAuth } from "../../contexts/AuthContext";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  badgeCount?: number;
}

interface BottomTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  alertsCount?: number;
}

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  activeTab,
  onTabChange,
  alertsCount = 0,
}) => {
  const { isMobile } = useResponsive();
  const { hasPermission } = useAuth();

  // Don't render on desktop
  if (!isMobile) return null;

  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
      permission: "view_vehicles",
    },
    {
      id: "map",
      label: "Map",
      icon: MapPin,
      permission: "view_vehicles",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: AlertTriangle,
      permission: "view_alerts",
      badgeCount: alertsCount,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      permission: "view_maintenance",
    },
  ];

  const visibleTabs = tabs.filter(
    (tab) => hasPermission(tab.permission) || hasPermission("all")
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-30 safe-area-pb">
      <div className="flex">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors ${isActive
                  ? "text-blue-400 bg-gray-700"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-750"
                }`}
              style={{ minHeight: "60px" }} // Ensure 44px+ touch target
            >
              <div className="relative">
                <IconComponent className="w-6 h-6 mb-1" />
                {tab.badgeCount && tab.badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};