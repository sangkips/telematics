import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Car,
  MapPin,
  User,
} from "lucide-react";
import { Vehicle } from "../../types";
import { useVehicles } from "../../hooks/useApi";
import { apiService } from "../../services/api";

export const VehicleManagement: React.FC = () => {
  const { data: vehicles, loading, error, refetch } = useVehicles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    plateNumber: "",
    driver: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    maxFuelCapacity: 100,
    fuelConsumption: 8.5,
  });

  const filteredVehicles = (vehicles || []).filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = async () => {
    try {
      const vehicleData = {
        ...newVehicle,
        fuelLevel: 100,
        location: {
          lat: 40.7128,
          lng: -74.006,
          address: "New York, NY",
        },
        speed: 0,
        status: "idle" as const,
        lastUpdate: new Date(),
        odometer: 0,
        alerts: [],
      };

      await apiService.createVehicle(vehicleData);
      await refetch(); // Refresh the vehicle list
      setShowAddModal(false);
      setNewVehicle({
        name: "",
        plateNumber: "",
        driver: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
        maxFuelCapacity: 100,
        fuelConsumption: 8.5,
      });
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      alert("Failed to add vehicle. Please try again.");
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;

    try {
      const updateData = {
        name: editingVehicle.name,
        plateNumber: editingVehicle.plateNumber,
        driver: editingVehicle.driver,
        make: editingVehicle.make,
        model: editingVehicle.model,
        year: editingVehicle.year,
        vin: editingVehicle.vin,
        maxFuelCapacity: editingVehicle.maxFuelCapacity,
        fuelConsumption: editingVehicle.fuelConsumption,
        status: editingVehicle.status,
        odometer: editingVehicle.odometer,
      };

      await apiService.updateVehicle(editingVehicle.id, updateData);
      await refetch(); // Refresh the vehicle list
      setEditingVehicle(null);
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      alert("Failed to update vehicle. Please try again.");
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await apiService.deleteVehicle(id);
        await refetch(); // Refresh the vehicle list
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
        alert("Failed to delete vehicle. Please try again.");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-900";
      case "idle":
        return "text-amber-400 bg-amber-900";
      case "maintenance":
        return "text-blue-400 bg-blue-900";
      case "offline":
        return "text-red-400 bg-red-900";
      default:
        return "text-gray-400 bg-gray-900";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Failed to load vehicles</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Vehicle Management</h2>
          <p className="text-gray-400">
            Manage your fleet vehicles and their configurations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fuel Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="w-8 h-8 text-blue-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {vehicle.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {vehicle.plateNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-white">
                        {vehicle.driver}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        vehicle.status
                      )}`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${vehicle.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white">
                        {vehicle.fuelLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-white truncate max-w-32">
                        {vehicle.location.address}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingVehicle(vehicle)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add New Vehicle
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={newVehicle.name}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Fleet Alpha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={newVehicle.plateNumber}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      plateNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Driver
                </label>
                <input
                  type="text"
                  value={newVehicle.driver}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, driver: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={newVehicle.make}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, make: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, model: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Camry"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  VIN
                </label>
                <input
                  type="text"
                  value={newVehicle.vin}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, vin: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="1HGBH41JXMN109186"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Edit Vehicle: {editingVehicle.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-300 border-b border-gray-600 pb-2">
                  Basic Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.name}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Fleet Alpha"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.plateNumber}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        plateNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="ABC-1234"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Driver *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.driver}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, driver: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingVehicle.status}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        status: e.target.value as Vehicle['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="idle">Idle</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-300 border-b border-gray-600 pb-2">
                  Vehicle Details
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Make
                    </label>
                    <input
                      type="text"
                      value={editingVehicle.make || ""}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, make: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={editingVehicle.model || ""}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, model: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Camry"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.year || ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        year: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.vin || ""}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, vin: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.odometer}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        odometer: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="50000"
                    min="0"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-md font-medium text-gray-300 border-b border-gray-600 pb-2">
                  Technical Specifications
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Fuel Capacity (L)
                    </label>
                    <input
                      type="number"
                      value={editingVehicle.maxFuelCapacity}
                      onChange={(e) =>
                        setEditingVehicle({
                          ...editingVehicle,
                          maxFuelCapacity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="100"
                      min="1"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Fuel Consumption (L/100km)
                    </label>
                    <input
                      type="number"
                      value={editingVehicle.fuelConsumption}
                      onChange={(e) =>
                        setEditingVehicle({
                          ...editingVehicle,
                          fuelConsumption: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="8.5"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => setEditingVehicle(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVehicle}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Update Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
