import React, { useState } from "react";
import { FileText, Calendar } from "lucide-react";
import { MaintenancePanel } from "./MaintenancePanel";
import { MaintenanceSchedulePanel } from "./MaintenanceSchedulePanel";

export const MaintenanceTabsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"records" | "schedules">("schedules");

  const tabs = [
    {
      id: "schedules",
      label: "Maintenance Schedules",
      icon: Calendar,
      description: "Set up recurring maintenance based on odometer intervals",
    },
    {
      id: "records",
      label: "Maintenance Records",
      icon: FileText,
      description: "View and manage completed maintenance records",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="text-gray-400 text-sm">
        {tabs.find(tab => tab.id === activeTab)?.description}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "schedules" && <MaintenanceSchedulePanel />}
        {activeTab === "records" && <MaintenancePanel />}
      </div>
    </div>
  );
};