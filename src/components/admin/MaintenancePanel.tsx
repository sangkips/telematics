import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MaintenanceRecord } from "../../types";
import { useMaintenanceRecords, useVehicles } from "../../hooks/useApi";
import { apiService } from "../../services/api";
import { useResponsive } from "../../hooks/useResponsive";
import { useResponsiveContext } from "../../contexts/ResponsiveContext";
import { useVehicleUpdate } from "../../contexts/VehicleUpdateContext";

const SERVICE_TYPES = [
  { value: "oil_change", label: "Oil Change" },
  { value: "tire_rotation", label: "Tire Rotation" },
  { value: "brake_service", label: "Brake Service" },
  { value: "engine_service", label: "Engine Service" },
  { value: "transmission", label: "Transmission" },
  { value: "inspection", label: "Inspection" },
  { value: "repair", label: "Repair" },
  { value: "battery_replacement", label: "Battery Replacement" },
  { value: "other", label: "Other" },
] as const;

// Extract the service type values
type ServiceType = (typeof SERVICE_TYPES)[number]['value'];

export const MaintenancePanel: React.FC = () => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const { data: maintenanceRecords, loading: recordsLoading, error: recordsError, refetch: refetchRecords } = useMaintenanceRecords();
  const { data: apiVehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { vehicles: contextVehicles } = useVehicleUpdate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ServiceType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceRecord["status"]>("all");

  // Use context vehicles if available, otherwise fall back to API vehicles
  const vehicles = Object.keys(contextVehicles).length > 0 
    ? Object.values(contextVehicles) 
    : (apiVehicles || []);

  const [newRecord, setNewRecord] = useState({
    vehicleId: "",
    types: [] as ServiceType[],
    description: "",
    cost: 0,
    currency: "USD",
    serviceCenter: "",
    performedAt: new Date().toISOString().split('T')[0],
    odometer: 0,
    partsReplaced: "",
    notes: "",
    status: "pending" as MaintenanceRecord["status"],
  });

  const filteredRecords = (maintenanceRecords || []).filter((record) => {
    const vehicle = (vehicles || []).find(v => v.id === record.vehicleId);
    const vehicleName = vehicle ? `${vehicle.name} ${vehicle.plateNumber}` : "";

    const matchesSearch =
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.serviceCenter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || (record.types && Array.isArray(record.types) && record.types.includes(typeFilter));
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
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

  const getStatusColor = (status: MaintenanceRecord["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-900";
      case "pending":
        return "text-amber-400 bg-amber-900";
      case "cancelled":
        return "text-red-400 bg-red-900";
      default:
        return "text-gray-400 bg-gray-900";
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = (vehicles || []).find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name} (${vehicle.plateNumber})` : "Unknown Vehicle";
  };

  const handleAddRecord = async () => {
    try {
      const recordData = {
        vehicleId: newRecord.vehicleId,
        types: newRecord.types,
        description: newRecord.description,
        cost: newRecord.cost,
        currency: newRecord.currency,
        serviceCenter: newRecord.serviceCenter,
        performedAt: new Date(newRecord.performedAt),
        odometer: newRecord.odometer,
        partsReplaced: newRecord.partsReplaced ? newRecord.partsReplaced.split(',').map(p => p.trim()) : undefined,
        notes: newRecord.notes || undefined,
        status: newRecord.status,
      };

      await apiService.createMaintenanceRecord(recordData);
      await refetchRecords();
      setShowAddModal(false);

      // Reset form
      setNewRecord({
        vehicleId: "",
        types: [],
        description: "",
        cost: 0,
        currency: "USD",
        serviceCenter: "",
        performedAt: new Date().toISOString().split('T')[0],
        odometer: 0,
        partsReplaced: "",
        notes: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Failed to add maintenance record:", error);
      alert("Failed to add maintenance record. Please try again.");
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      const updateData = {
        vehicleId: editingRecord.vehicleId,
        types: editingRecord.types,
        description: editingRecord.description,
        cost: editingRecord.cost,
        currency: editingRecord.currency,
        serviceCenter: editingRecord.serviceCenter,
        performedAt: editingRecord.performedAt,
        odometer: editingRecord.odometer,
        partsReplaced: editingRecord.partsReplaced,
        notes: editingRecord.notes,
        status: editingRecord.status,
      };

      await apiService.updateMaintenanceRecord(editingRecord.id, updateData);
      await refetchRecords();
      setEditingRecord(null);
    } catch (error) {
      console.error("Failed to update maintenance record:", error);
      alert("Failed to update maintenance record. Please try again.");
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      try {
        await apiService.deleteMaintenanceRecord(id);
        await refetchRecords();
      } catch (error) {
        console.error("Failed to delete maintenance record:", error);
        alert("Failed to delete maintenance record. Please try again.");
      }
    }
  };

  // Loading and error states
  if (recordsLoading || vehiclesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (recordsError || vehiclesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">
          Failed to load maintenance data: {recordsError || vehiclesError}
        </p>
        <button
          onClick={() => {
            refetchRecords();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <h2 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {isMobile ? 'Maintenance Records' : 'Maintenance Management'}
          </h2>
          {!isMobile && (
            <p className="text-gray-400">
              Track vehicle maintenance records and service schedules
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${
            isMobile ? 'w-full justify-center min-h-[44px]' : ''
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-4'}`}>
        <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-md'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={isMobile ? "Search records..." : "Search maintenance records..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 ${
              isMobile ? 'min-h-[44px]' : ''
            }`}
          />
        </div>

        <div className={`flex items-center space-x-2 ${isMobile ? 'justify-between' : ''}`}>
          {!isMobile && <Filter className="w-4 h-4 text-gray-400" />}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | ServiceType)}
            className={`bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500 ${
              isMobile ? 'flex-1 min-h-[44px]' : ''
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
            <option value="battery_replacement">Battery Replacement</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | MaintenanceRecord["status"])}
            className={`bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500 ${
              isMobile ? 'flex-1 min-h-[44px]' : ''
            }`}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Maintenance Records - Responsive Layout */}
      {isMobile ? (
        /* Mobile: Card-based Layout */
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">No Records Found</h3>
              <p className="text-gray-400">No maintenance records match your current filters</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isExpanded = expandedCards.includes(record.id);
              return (
                <div
                  key={record.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                >
                  {/* Card Header - Always Visible */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpandedCard(record.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Wrench className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-white truncate">
                              {getVehicleName(record.vehicleId)}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {record.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {record.status === "cancelled" && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {record.status}
                            </span>
                          </div>
                          <p className="text-sm text-blue-400 mb-1">
                            {getTypesDisplay(record.types)}
                          </p>
                          <p className={`text-sm text-gray-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {record.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(record.performedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {record.cost.toFixed(2)} {record.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRecord(record);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Edit record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecord(record.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Delete record"
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
                          <p className="text-xs text-gray-400 mb-1">Service Center</p>
                          <p className="text-sm text-white">{record.serviceCenter}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Odometer</p>
                          <p className="text-sm text-white">{record.odometer.toLocaleString()} km</p>
                        </div>
                        {record.partsReplaced && record.partsReplaced.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Parts Replaced</p>
                            <p className="text-sm text-white">
                              {Array.isArray(record.partsReplaced) 
                                ? record.partsReplaced.join(', ') 
                                : record.partsReplaced}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Notes</p>
                            <p className="text-sm text-white">{record.notes}</p>
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
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Odometer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Wrench className="w-8 h-8 text-blue-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {getVehicleName(record.vehicleId)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {record.serviceCenter}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{getTypesDisplay(record.types)}</div>
                      <div className="text-xs text-gray-400 truncate max-w-32">
                        {record.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-white">
                          {new Date(record.performedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {record.odometer.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-white">
                          {record.cost.toFixed(2)} {record.currency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {record.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                        {record.status === "cancelled" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingRecord(record)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-300"
                          title="View details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Maintenance Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add Maintenance Record
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vehicle *
                </label>
                <select
                  value={newRecord.vehicleId}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, vehicleId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {(vehicles || []).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service Types * (Select multiple)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg p-2">
                  {SERVICE_TYPES.map((serviceType) => (
                    <label key={serviceType.value} className="flex items-center space-x-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={newRecord.types.includes(serviceType.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRecord({
                              ...newRecord,
                              types: [...newRecord.types, serviceType.value]
                            });
                          } else {
                            setNewRecord({
                              ...newRecord,
                              types: newRecord.types.filter(t => t !== serviceType.value)
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of the service performed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={newRecord.performedAt}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, performedAt: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  value={newRecord.odometer}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, odometer: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cost *
                </label>
                <input
                  type="number"
                  value={newRecord.cost}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, cost: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="150.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service Center *
                </label>
                <input
                  type="text"
                  value={newRecord.serviceCenter}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, serviceCenter: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Service Center Name"
                  required
                />
              </div>



              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Parts Replaced
                </label>
                <input
                  type="text"
                  value={newRecord.partsReplaced}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, partsReplaced: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Oil Filter, Engine Oil (comma separated)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Additional notes about the service..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Maintenance Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Edit Maintenance Record
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vehicle *
                </label>
                <select
                  value={editingRecord.vehicleId}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, vehicleId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {(vehicles || []).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service Types * (Select multiple)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg p-2">
                  {SERVICE_TYPES.map((serviceType) => (
                    <label key={serviceType.value} className="flex items-center space-x-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={editingRecord.types.includes(serviceType.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingRecord({
                              ...editingRecord,
                              types: [...editingRecord.types, serviceType.value]
                            });
                          } else {
                            setEditingRecord({
                              ...editingRecord,
                              types: editingRecord.types.filter(t => t !== serviceType.value)
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={editingRecord.description}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of the service performed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={new Date(editingRecord.performedAt).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, performedAt: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  value={editingRecord.odometer}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, odometer: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cost *
                </label>
                <input
                  type="number"
                  value={editingRecord.cost}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, cost: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="150.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service Center *
                </label>
                <input
                  type="text"
                  value={editingRecord.serviceCenter}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, serviceCenter: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Service Center Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={editingRecord.status}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, status: e.target.value as MaintenanceRecord["status"] })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>



              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Parts Replaced
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingRecord.partsReplaced) ? editingRecord.partsReplaced.join(', ') : editingRecord.partsReplaced || ""}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      partsReplaced: e.target.value ? e.target.value.split(',').map(p => p.trim()) : undefined
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Oil Filter, Engine Oil (comma separated)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={editingRecord.notes || ""}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, notes: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Additional notes about the service..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecord}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};