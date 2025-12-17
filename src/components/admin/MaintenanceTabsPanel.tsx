import React, { useState } from "react";
import { FileText, Calendar } from "lucide-react";
import { MaintenancePanel } from "./MaintenancePanel";
import { MaintenanceSchedulePanel } from "./MaintenanceSchedulePanel";
import { useResponsive } from "../../hooks/useResponsive";

export const MaintenanceTabsPanel: React.FC = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<"records" | "schedules">("schedules");

  const tabs = [
    {
      id: "schedules",
      label: isMobile ? "Schedules" : "Maintenance Schedules",
      icon: Calendar,
      description: "Set up recurring maintenance based on odometer intervals",
    },
    {
      id: "records",
      label: isMobile ? "Records" : "Maintenance Records",
      icon: FileText,
      description: "View and manage completed maintenance records",
    },
  ];

  return (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      {/* Tab Navigation - Mobile vs Desktop */}
      {isMobile ? (
        /* Mobile: Segmented Control Style */
        <div className="bg-gray-100 rounded-lg p-1">
          <div className="grid grid-cols-2 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "border-brand-secondary-400 text-brand-secondary-400"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Tab Description - Hidden on mobile to save space */}
      {!isMobile && (
        <div className="text-gray-600 text-sm">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </div>
      )}

      {/* Tab Content */}
      <div className={isMobile ? 'min-h-[300px]' : 'min-h-[500px]'}>
        {activeTab === "schedules" && <MaintenanceSchedulePanel />}
        {activeTab === "records" && <MaintenancePanel />}
      </div>
    </div>
  );
};