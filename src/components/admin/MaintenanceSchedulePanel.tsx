import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MaintenanceSchedule } from "../../types";
import { useVehicles, useMaintenanceSchedules } from "../../hooks/useApi";
import { apiService } from "../../services/api";
import { useResponsive } from "../../hooks/useResponsive";
import { useResponsiveContext } from "../../contexts/ResponsiveContext";
import { useVehicleUpdate } from "../../contexts/VehicleUpdateContext";

export const MaintenanceSchedulePanel: React.FC = () => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const { data: apiVehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { vehicles: contextVehicles } = useVehicleUpdate();
  const { data: schedules, loading: schedulesLoading, error: schedulesError, refetch: refetchSchedules } = useMaintenanceSchedules();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Use context vehicles if available, otherwise fall back to API vehicles
  const vehicles = Object.keys(contextVehicles).length > 0 
    ? Object.values(contextVehicles) 
    : (apiVehicles || []);

  const [newSchedule, setNewSchedule] = useState({
    vehicleId: "",
    types: ["oil_change"] as ("oil_change" | "tire_rotation" | "brake_service" | "engine_service" | "transmission" | "inspection" | "repair" | "battery_replacement" | "other")[],
    description: "",
    intervalKm: 10000,
    intervalDays: 180 as number | undefined,
    lastServiceOdometer: 0,
    lastServiceDate: new Date().toISOString().split('T')[0],
    serviceCenterName: "",
    isActive: true,
  });

  // Calculate next service odometer for display
  const calculateNextService = (schedule: MaintenanceSchedule, currentOdometer: number) => {
    const nextServiceOdometer = schedule.lastServiceOdometer + schedule.intervalKm;
    const kmUntilService = nextServiceOdometer - currentOdometer;
    const isOverdue = kmUntilService < 0;
    const isDueSoon = kmUntilService <= 1000 && kmUntilService > 0; // Due within 1000km

    return {
      nextServiceOdometer,
      kmUntilService,
      isOverdue,
      isDueSoon,
    };
  };

  const filteredSchedules = (schedules || []).filter((schedule) => {
    const vehicle = (vehicles || []).find(v => v.id === schedule.vehicleId);
    const vehicleName = vehicle ? `${vehicle.name} ${vehicle.plateNumber}` : "";

    const matchesSearch =
      schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.serviceCenterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || (schedule.types && Array.isArray(schedule.types) && schedule.types.includes(typeFilter));

    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    const labels = {
      oil_change: "Oil Change",
      tire_rotation: "Tire Rotation",
      brake_service: "Brake Service",
      engine_service: "Engine Service",
      transmission: "Transmission",
      inspection: "Inspection",
      repair: "Repair",
      battery_replacement: "Battery Replacement",
      other: "Other",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypesDisplay = (types: string[] | null | undefined) => {
    if (!types || !Array.isArray(types)) {
      return "No service type specified";
    }
    return types.map(type => getTypeLabel(type)).join(", ");
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = (vehicles || []).find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name} (${vehicle.plateNumber})` : "Unknown Vehicle";
  };

  const getCurrentOdometer = (vehicleId: string) => {
    const vehicle = (vehicles || []).find(v => v.id === vehicleId);
    return vehicle ? vehicle.odometer : 0;
  };

  const handleAddSchedule = async () => {
    try {
      const scheduleData = {
        vehicleId: newSchedule.vehicleId,
        types: newSchedule.types,
        description: newSchedule.description,
        intervalKm: newSchedule.intervalKm,
        intervalDays: newSchedule.intervalDays,
        lastServiceOdometer: newSchedule.lastServiceOdometer,
        lastServiceDate: new Date(newSchedule.lastServiceDate),
        nextServiceOdometer: newSchedule.lastServiceOdometer + newSchedule.intervalKm,
        serviceCenterName: newSchedule.serviceCenterName,
        isActive: newSchedule.isActive,
      };

      await apiService.createMaintenanceSchedule(scheduleData);
      await refetchSchedules(); // Refresh schedules list
      setShowAddModal(false);

      // Reset form
      setNewSchedule({
        vehicleId: "",
        types: ["oil_change"],
        description: "",
        intervalKm: 10000,
        intervalDays: 180,
        lastServiceOdometer: 0,
        lastServiceDate: new Date().toISOString().split('T')[0],
        serviceCenterName: "",
        isActive: true,
      });
    } catch (error) {
      console.error("Failed to add maintenance schedule:", error);
      alert("Failed to add maintenance schedule. Please try again.");
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    try {
      const updateData = {
        vehicleId: editingSchedule.vehicleId,
        types: editingSchedule.types,
        description: editingSchedule.description,
        intervalKm: editingSchedule.intervalKm,
        intervalDays: editingSchedule.intervalDays,
        lastServiceOdometer: editingSchedule.lastServiceOdometer,
        lastServiceDate: editingSchedule.lastServiceDate,
        nextServiceOdometer: editingSchedule.lastServiceOdometer + editingSchedule.intervalKm,
        serviceCenterName: editingSchedule.serviceCenterName,
        isActive: editingSchedule.isActive,
      };

      await apiService.updateMaintenanceSchedule(editingSchedule.id, updateData);
      await refetchSchedules(); // Refresh schedules list
      setEditingSchedule(null);
    } catch (error) {
      console.error("Failed to update maintenance schedule:", error);
      alert("Failed to update maintenance schedule. Please try again.");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm("Are you sure you want to delete this maintenance schedule?")) {
      try {
        await apiService.deleteMaintenanceSchedule(id);
        await refetchSchedules(); // Refresh schedules list
      } catch (error) {
        console.error("Failed to delete maintenance schedule:", error);
        alert("Failed to delete maintenance schedule. Please try again.");
      }
    }
  };

  // Loading and error states
  if (vehiclesLoading || schedulesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (vehiclesError || schedulesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">
          Failed to load data: {vehiclesError || schedulesError}
        </p>
        <button
          onClick={() => {
            refetchSchedules();
            window.location.reload();
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {isMobile ? 'Maintenance Schedules' : 'Maintenance Schedules'}
          </h2>
          {!isMobile && (
            <p className="text-gray-600">
              Set up recurring maintenance schedules based on odometer intervals
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors ${isMobile ? 'w-full justify-center min-h-[44px]' : ''
            }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-4'}`}>
        <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-md'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={isMobile ? "Search schedules..." : "Search maintenance schedules..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-secondary-400 ${isMobile ? 'min-h-[44px]' : ''
              }`}
          />
        </div>

        <div className={`flex items-center space-x-2 ${isMobile ? 'justify-center' : ''}`}>
          {!isMobile && <Filter className="w-4 h-4 text-gray-400" />}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`bg-white border border-gray-300 rounded-lg text-gray-900 px-3 py-2 focus:outline-none focus:border-brand-secondary-400 ${isMobile ? 'w-full min-h-[44px]' : ''
              }`}
          >
            <option value="all">All Types</option>
            <option value="oil_change">Oil Change</option>
            <option value="tire_rotation">Tire Rotation</option>
            <option value="brake_service">Brake Service</option>
            <option value="engine_service">Engine Service</option>
            <option value="transmission">Transmission</option>
            <option value="inspection">Inspection</option>
            <option value="repair">Repair</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Maintenance Schedules - Responsive Layout */}
      {isMobile ? (
        /* Mobile: Card-based Layout */
        <div className="space-y-3">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">No Schedules Found</h3>
              <p className="text-gray-600">No maintenance schedules match your current filters</p>
            </div>
          ) : (
            filteredSchedules.map((schedule) => {
              const currentOdometer = getCurrentOdometer(schedule.vehicleId);
              const serviceInfo = calculateNextService(schedule, currentOdometer);
              const isExpanded = expandedCards.includes(schedule.id);

              return (
                <div
                  key={schedule.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Card Header - Always Visible */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpandedCard(schedule.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Settings className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-white truncate">
                              {getVehicleName(schedule.vehicleId)}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${serviceInfo.isOverdue
                                ? "text-red-700 bg-red-100"
                                : serviceInfo.isDueSoon
                                  ? "text-amber-700 bg-amber-100"
                                  : schedule.isActive
                                    ? "text-green-700 bg-green-100"
                                    : "text-gray-700 bg-gray-200"
                                }`}
                            >
                              {serviceInfo.isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {serviceInfo.isDueSoon && <Clock className="w-3 h-3 mr-1" />}
                              {!serviceInfo.isOverdue && !serviceInfo.isDueSoon && schedule.isActive && <CheckCircle className="w-3 h-3 mr-1" />}
                              {serviceInfo.isOverdue
                                ? "Overdue"
                                : serviceInfo.isDueSoon
                                  ? "Due Soon"
                                  : schedule.isActive
                                    ? "Active"
                                    : "Inactive"
                              }
                            </span>
                          </div>
                          <p className="text-sm text-blue-400 mb-1">
                            {getTypesDisplay(schedule.types)}
                          </p>
                          <p className={`text-sm text-gray-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {schedule.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-600">
                              Every {schedule.intervalKm.toLocaleString()} km
                            </div>
                            <div className={`text-xs ${serviceInfo.isOverdue ? 'text-red-400' :
                              serviceInfo.isDueSoon ? 'text-amber-400' : 'text-gray-400'
                              }`}>
                              {serviceInfo.isOverdue
                                ? `${Math.abs(serviceInfo.kmUntilService).toLocaleString()} km overdue`
                                : `${serviceInfo.kmUntilService.toLocaleString()} km remaining`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSchedule(schedule);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Edit schedule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Current Odometer</p>
                          <p className="text-sm text-gray-900">{currentOdometer.toLocaleString()} km</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Service Center</p>
                          <p className="text-sm text-gray-900">{schedule.serviceCenterName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Last Service</p>
                          <p className="text-sm text-gray-900">{schedule.lastServiceOdometer.toLocaleString()} km</p>
                          <p className="text-xs text-gray-600">{new Date(schedule.lastServiceDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Next Service</p>
                          <p className="text-sm text-gray-900">{serviceInfo.nextServiceOdometer.toLocaleString()} km</p>
                        </div>
                        {schedule.intervalDays && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Backup Interval</p>
                            <p className="text-sm text-gray-900">{schedule.intervalDays} days</p>
                          </div>
                        )}
                        {(serviceInfo.isOverdue || serviceInfo.isDueSoon) && (
                          <div className="col-span-2">
                            <button
                              className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                              title="Perform maintenance"
                            >
                              <Wrench className="w-4 h-4" />
                              <span>Perform Maintenance</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Desktop: Table Layout */
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Interval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Next Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredSchedules.map((schedule) => {
                  const currentOdometer = getCurrentOdometer(schedule.vehicleId);
                  const serviceInfo = calculateNextService(schedule, currentOdometer);

                  return (
                    <tr key={schedule.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Settings className="w-8 h-8 text-blue-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getVehicleName(schedule.vehicleId)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Current: {currentOdometer.toLocaleString()} km
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTypesDisplay(schedule.types)}</div>
                        <div className="text-xs text-gray-400 truncate max-w-32">
                          {schedule.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Every {schedule.intervalKm.toLocaleString()} km
                        </div>
                        {schedule.intervalDays && (
                          <div className="text-xs text-gray-600">
                            or {schedule.intervalDays} days
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {schedule.lastServiceOdometer.toLocaleString()} km
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(schedule.lastServiceDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {serviceInfo.nextServiceOdometer.toLocaleString()} km
                        </div>
                        <div className={`text-xs ${serviceInfo.isOverdue ? 'text-red-400' :
                          serviceInfo.isDueSoon ? 'text-amber-400' : 'text-gray-400'
                          }`}>
                          {serviceInfo.isOverdue
                            ? `${Math.abs(serviceInfo.kmUntilService).toLocaleString()} km overdue`
                            : `${serviceInfo.kmUntilService.toLocaleString()} km remaining`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${serviceInfo.isOverdue
                            ? "text-red-700 bg-red-100"
                            : serviceInfo.isDueSoon
                              ? "text-amber-700 bg-amber-100"
                              : schedule.isActive
                                ? "text-green-700 bg-green-100"
                                : "text-gray-700 bg-gray-200"
                            }`}
                        >
                          {serviceInfo.isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {serviceInfo.isDueSoon && <Clock className="w-3 h-3 mr-1" />}
                          {!serviceInfo.isOverdue && !serviceInfo.isDueSoon && schedule.isActive && <CheckCircle className="w-3 h-3 mr-1" />}
                          {serviceInfo.isOverdue
                            ? "Overdue"
                            : serviceInfo.isDueSoon
                              ? "Due Soon"
                              : schedule.isActive
                                ? "Active"
                                : "Inactive"
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingSchedule(schedule)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit schedule"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {(serviceInfo.isOverdue || serviceInfo.isDueSoon) && (
                            <button
                              className="text-green-400 hover:text-green-300"
                              title="Perform maintenance"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Maintenance Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle *
                </label>
                <select
                  value={newSchedule.vehicleId}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, vehicleId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {(vehicles || []).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber}) - {vehicle.odometer.toLocaleString()} km
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Types * (Select multiple)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg p-2">
                  {[
                    { value: "oil_change", label: "Oil Change" },
                    { value: "tire_rotation", label: "Tire Rotation" },
                    { value: "brake_service", label: "Brake Service" },
                    { value: "engine_service", label: "Engine Service" },
                    { value: "transmission", label: "Transmission" },
                    { value: "inspection", label: "Inspection" },
                    { value: "repair", label: "Repair" },
                    { value: "battery_replacement", label: "Battery Replacement" },
                    { value: "other", label: "Other" },
                  ].map((serviceType) => (
                    <label key={serviceType.value} className="flex items-center space-x-2 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={newSchedule.types.includes(serviceType.value as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewSchedule({
                              ...newSchedule,
                              types: [...newSchedule.types, serviceType.value as any]
                            });
                          } else {
                            setNewSchedule({
                              ...newSchedule,
                              types: newSchedule.types.filter(t => t !== serviceType.value)
                            });
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{serviceType.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newSchedule.description}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="e.g., Regular oil change every 10,000 km"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Interval (km) *
                </label>
                <input
                  type="number"
                  value={newSchedule.intervalKm}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, intervalKm: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="10000"
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Interval (days)
                </label>
                <input
                  type="number"
                  value={newSchedule.intervalDays}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, intervalDays: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="180"
                  min="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Service Odometer (km) *
                </label>
                <input
                  type="number"
                  value={newSchedule.lastServiceOdometer}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, lastServiceOdometer: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Service Date *
                </label>
                <input
                  type="date"
                  value={newSchedule.lastServiceDate}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, lastServiceDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Service Center *
                </label>
                <input
                  type="text"
                  value={newSchedule.serviceCenterName}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, serviceCenterName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="AutoCare Service Center"
                  required
                />
              </div>

              {newSchedule.intervalKm > 0 && newSchedule.lastServiceOdometer >= 0 && (
                <div className="md:col-span-2 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Schedule Preview</h4>
                  <p className="text-sm text-blue-200">
                    Next service due at: <strong>{(newSchedule.lastServiceOdometer + newSchedule.intervalKm).toLocaleString()} km</strong>
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    Service will be performed every {newSchedule.intervalKm.toLocaleString()} km
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Maintenance Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle *
                </label>
                <select
                  value={editingSchedule.vehicleId}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, vehicleId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {(vehicles || []).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber}) - {vehicle.odometer.toLocaleString()} km
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Types * (Select multiple)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg p-2">
                  {[
                    { value: "oil_change", label: "Oil Change" },
                    { value: "tire_rotation", label: "Tire Rotation" },
                    { value: "brake_service", label: "Brake Service" },
                    { value: "engine_service", label: "Engine Service" },
                    { value: "transmission", label: "Transmission" },
                    { value: "inspection", label: "Inspection" },
                    { value: "repair", label: "Repair" },
                    { value: "battery_replacement", label: "Battery Replacement" },
                    { value: "other", label: "Other" },
                  ].map((serviceType) => (
                    <label key={serviceType.value} className="flex items-center space-x-2 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={editingSchedule.types && Array.isArray(editingSchedule.types) && editingSchedule.types.includes(serviceType.value as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingSchedule({
                              ...editingSchedule,
                              types: [...(editingSchedule.types || []), serviceType.value as any]
                            });
                          } else {
                            setEditingSchedule({
                              ...editingSchedule,
                              types: (editingSchedule.types || []).filter(t => t !== serviceType.value)
                            });
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{serviceType.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={editingSchedule.description}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="e.g., Regular oil change every 10,000 km"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Interval (km) *
                </label>
                <input
                  type="number"
                  value={editingSchedule.intervalKm}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, intervalKm: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="10000"
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Interval (days)
                </label>
                <input
                  type="number"
                  value={editingSchedule.intervalDays || ""}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, intervalDays: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="180"
                  min="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Service Odometer (km) *
                </label>
                <input
                  type="number"
                  value={editingSchedule.lastServiceOdometer}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, lastServiceOdometer: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Service Date *
                </label>
                <input
                  type="date"
                  value={new Date(editingSchedule.lastServiceDate).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, lastServiceDate: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Service Center *
                </label>
                <input
                  type="text"
                  value={editingSchedule.serviceCenterName}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, serviceCenterName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  placeholder="AutoCare Service Center"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingSchedule.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, isActive: e.target.value === "active" })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {editingSchedule.intervalKm > 0 && editingSchedule.lastServiceOdometer >= 0 && (
                <div className="md:col-span-2 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Updated Schedule Preview</h4>
                  <p className="text-sm text-blue-200">
                    Next service due at: <strong>{(editingSchedule.lastServiceOdometer + editingSchedule.intervalKm).toLocaleString()} km</strong>
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    Service will be performed every {editingSchedule.intervalKm.toLocaleString()} km
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => setEditingSchedule(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};