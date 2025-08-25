import React from "react";
import {
    AlertTriangle,
    Calendar,
    Clock,
    Wrench,
    TrendingUp,
    CheckCircle,
} from "lucide-react";
import { Vehicle, MaintenanceRecord, MaintenanceSchedule } from "../types";
import { useMaintenanceRecords, useMaintenanceSchedules } from "../hooks/useApi";
import { useVehicleUpdate } from "../contexts/VehicleUpdateContext";
import { ConnectionMonitor } from "./ConnectionMonitor";

interface MaintenanceDashboardProps {
    vehicles: Vehicle[];
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
    vehicles: propVehicles,
}) => {
    const { vehicles: contextVehicles, connectionState, refreshVehicles } = useVehicleUpdate();

    // Use context vehicles if available, otherwise fall back to props
    const vehicles = Object.keys(contextVehicles).length > 0
        ? Object.values(contextVehicles)
        : propVehicles;
    const { data: maintenanceRecords, loading: recordsLoading, error: recordsError } = useMaintenanceRecords();
    const { data: maintenanceSchedules, loading: schedulesLoading, error: schedulesError } = useMaintenanceSchedules();

    if (recordsLoading || schedulesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (recordsError || schedulesError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400 mb-4">Failed to load maintenance data</p>
            </div>
        );
    }
    // Calculate maintenance statistics based on schedules and records
    const getMaintenanceStats = () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        let overdue = 0;
        let dueSoon = 0;
        let upToDate = 0;
        let totalCost = 0;
        let recentServices = 0;

        // Process maintenance schedules to determine overdue/due soon
        (maintenanceSchedules || []).forEach((schedule) => {
            if (!schedule.isActive) return;

            const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
            if (!vehicle) return;

            const currentOdometer = vehicle.odometer;
            const nextServiceOdometer = schedule.nextServiceOdometer;
            const kmUntilService = nextServiceOdometer - currentOdometer;

            if (kmUntilService < 0) {
                overdue++; // Past due odometer
            } else if (kmUntilService <= 1000) {
                dueSoon++; // Due within 1000km
            } else {
                upToDate++; // Not due yet
            }
        });

        // Calculate total maintenance cost (last 30 days) from completed records
        (maintenanceRecords || []).forEach((record) => {
            if (record.status === "completed") {
                const recordDate = new Date(record.performedAt);
                if (recordDate >= thirtyDaysAgo) {
                    totalCost += record.cost;
                    recentServices++;
                }
            }
        });

        return { overdue, dueSoon, upToDate, totalCost, recentServices };
    };

    const getUpcomingServices = () => {
        const upcoming: Array<{
            vehicle: Vehicle;
            schedule: MaintenanceSchedule;
            nextServiceOdometer: number;
            kmUntilService: number;
            isOverdue: boolean;
            isDueSoon: boolean;
        }> = [];

        // Get maintenance schedules that are due or overdue
        (maintenanceSchedules || []).forEach((schedule) => {
            if (!schedule.isActive) return;

            const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
            if (!vehicle) return;

            const currentOdometer = vehicle.odometer;
            const nextServiceOdometer = schedule.nextServiceOdometer;
            const kmUntilService = nextServiceOdometer - currentOdometer;
            const isOverdue = kmUntilService < 0;
            const isDueSoon = kmUntilService <= 1000 && kmUntilService > 0;

            // Only show services that are due soon or overdue
            if (isOverdue || isDueSoon) {
                upcoming.push({
                    vehicle,
                    schedule,
                    nextServiceOdometer,
                    kmUntilService,
                    isOverdue,
                    isDueSoon,
                });
            }
        });

        // Sort by urgency: overdue first, then by km remaining
        return upcoming
            .sort((a, b) => {
                if (a.isOverdue && !b.isOverdue) return -1;
                if (!a.isOverdue && b.isOverdue) return 1;
                return Math.abs(a.kmUntilService) - Math.abs(b.kmUntilService);
            })
            .slice(0, 5);
    };

    const getRecentMaintenance = () => {
        const recent: Array<{
            vehicle: Vehicle;
            record: MaintenanceRecord;
        }> = [];

        // Use maintenance records from API instead of vehicle.maintenanceRecords
        (maintenanceRecords || []).forEach((record) => {
            const vehicle = vehicles.find(v => v.id === record.vehicleId);
            if (vehicle) {
                recent.push({ vehicle, record });
            }
        });

        return recent
            .sort((a, b) => new Date(b.record.performedAt).getTime() - new Date(a.record.performedAt).getTime())
            .slice(0, 5);
    };

    const stats = getMaintenanceStats();
    const upcomingServices = getUpcomingServices();
    const recentMaintenance = getRecentMaintenance();

    return (
        <div className="space-y-6">
            {/* Connection Status Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Maintenance Dashboard</h2>
                <ConnectionMonitor
                    connectionState={connectionState}
                    onManualRefresh={refreshVehicles}
                    className="text-white"
                />
            </div>

            {/* Maintenance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-red-900 bg-opacity-50 rounded-lg p-6 border border-red-700">
                    <div className="flex items-center">
                        <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.overdue}</div>
                            <div className="text-red-300 text-sm">Overdue Services</div>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-900 bg-opacity-50 rounded-lg p-6 border border-amber-700">
                    <div className="flex items-center">
                        <Clock className="w-8 h-8 text-amber-400 mr-3" />
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.dueSoon}</div>
                            <div className="text-amber-300 text-sm">Due Soon (30 days)</div>
                        </div>
                    </div>
                </div>

                <div className="bg-green-900 bg-opacity-50 rounded-lg p-6 border border-green-700">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.upToDate}</div>
                            <div className="text-green-300 text-sm">Up to Date</div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 border border-blue-700">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-blue-400 mr-3" />
                        <div>
                            <div className="text-2xl font-bold text-white">
                                ${stats.totalCost.toFixed(0)}
                            </div>
                            <div className="text-blue-300 text-sm">Monthly Cost</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Services */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                        <h3 className="text-lg font-semibold text-white">Upcoming Services</h3>
                    </div>

                    <div className="space-y-3">
                        {upcomingServices.length > 0 ? (
                            upcomingServices.map((service, index) => (
                                <div
                                    key={`${service.vehicle.id}-${index}`}
                                    className={`p-3 rounded-lg border ${service.isOverdue
                                        ? "bg-red-900 bg-opacity-30 border-red-700"
                                        : service.isDueSoon
                                            ? "bg-amber-900 bg-opacity-30 border-amber-700"
                                            : "bg-gray-700 border-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                {service.vehicle.name} ({service.vehicle.plateNumber})
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {service.schedule.description}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Service due at: {service.nextServiceOdometer.toLocaleString()} km
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Current: {service.vehicle.odometer.toLocaleString()} km
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`text-sm font-medium ${service.isOverdue
                                                    ? "text-red-400"
                                                    : service.isDueSoon
                                                        ? "text-amber-400"
                                                        : "text-gray-300"
                                                    }`}
                                            >
                                                {service.isOverdue
                                                    ? `${Math.abs(service.kmUntilService).toLocaleString()} km overdue`
                                                    : service.kmUntilService === 0
                                                        ? "Due now"
                                                        : `${service.kmUntilService.toLocaleString()} km remaining`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                No upcoming services scheduled
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Maintenance */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Wrench className="w-5 h-5 text-green-400 mr-2" />
                        <h3 className="text-lg font-semibold text-white">Recent Maintenance</h3>
                    </div>

                    <div className="space-y-3">
                        {recentMaintenance.length > 0 ? (
                            recentMaintenance.map((item, index) => (
                                <div
                                    key={`${item.record.id}-${index}`}
                                    className="p-3 bg-gray-700 rounded-lg border border-gray-600"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                {item.vehicle.name} ({item.vehicle.plateNumber})
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {item.record.description}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(item.record.performedAt).toLocaleDateString()} •
                                                {item.record.serviceCenter}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-400">
                                                ${item.record.cost.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                @ {item.record.odometer.toLocaleString()} km
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                No recent maintenance records
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};