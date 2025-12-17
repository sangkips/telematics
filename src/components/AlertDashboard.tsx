import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Shield,
  Fuel,
  Gauge,
  Wrench,
  CheckCircle,
  X,
  Filter,
  Search,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronRight,
  Bug,
} from 'lucide-react';
import { useAlertSystem } from '../contexts/AlertSystemContext';
import { useResponsive } from '../hooks/useResponsive';
import { useResponsiveContext } from '../contexts/ResponsiveContext';
import { Alert, AlertType, AlertSeverity, AlertFilters } from '../types/alerts';

export const AlertDashboard: React.FC = () => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const {
    alerts,
    statistics,
    loading,
    error,
    fetchAlerts,
    resolveAlert,
    dismissAlert,
    resolveAlertsByVehicle,
    resolveAlertsByType,
    clearError,
  } = useAlertSystem();

  const [filters, setFilters] = useState<AlertFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters =
      (!filters.type || alert.type === filters.type) &&
      (!filters.severity || alert.severity === filters.severity) &&
      (!filters.status || alert.status === filters.status) &&
      (!filters.vehicleId || alert.vehicleId === filters.vehicleId);

    return matchesSearch && matchesFilters;
  });

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'fuel_theft': return <Fuel className="w-5 h-5 text-red-400" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'speeding': return <Gauge className="w-5 h-5 text-orange-400" />;
      case 'unauthorized': return <Shield className="w-5 h-5 text-purple-400" />;
      case 'low_fuel': return <Fuel className="w-5 h-5 text-yellow-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900 border-red-700';
      case 'high': return 'text-orange-400 bg-orange-900 border-orange-700';
      case 'medium': return 'text-amber-400 bg-amber-900 border-amber-700';
      case 'low': return 'text-blue-400 bg-blue-900 border-blue-700';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-900';
      case 'resolved': return 'text-green-400 bg-green-900';
      case 'dismissed': return 'text-gray-400 bg-gray-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const handleBulkResolve = async (type: 'vehicle' | 'type', value: string) => {
    try {
      if (type === 'vehicle') {
        await resolveAlertsByVehicle(value);
      } else {
        await resolveAlertsByType(value as AlertType);
      }
    } catch (error) {
      console.error('Bulk resolve failed:', error);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Alert Dashboard
          </h1>
          {!isMobile && (
            <p className="text-gray-400">Monitor and manage fleet alerts</p>
          )}
        </div>
        <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors ${isMobile ? 'flex-1 justify-center min-h-[44px]' : ''
              }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Create Alert</span>
          </button>
          <button
            onClick={() => {
              console.log('=== ALERT DEBUG INFO ===');
              console.log('Alerts:', alerts);
              console.log('Statistics:', statistics);
              console.log('Loading:', loading);
              console.log('Error:', error);
              console.log('API URL:', import.meta.env.VITE_API_URL || '/api/alerts');
              fetchAlerts();
            }}
            className={`flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors ${isMobile ? 'min-h-[44px]' : ''
              }`}
            title="Debug API Connection"
          >
            <Bug className="w-4 h-4" />
            {!isMobile && <span>Debug</span>}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Alerts</p>
                <p className="text-2xl font-bold text-white">{statistics.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-red-400">{statistics.active}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{statistics.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Dismissed</p>
                <p className="text-2xl font-bold text-gray-400">{statistics.dismissed}</p>
              </div>
              <X className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-4'}`}>
        <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-md'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 ${isMobile ? 'min-h-[44px]' : ''
              }`}
          />
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${isMobile ? 'w-full' : ''}`}>
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as AlertType || undefined }))}
            className={`bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500 ${isMobile ? 'min-h-[44px]' : ''
              }`}
          >
            <option value="">All Types</option>
            <option value="fuel_theft">Fuel Theft</option>
            <option value="maintenance">Maintenance</option>
            <option value="speeding">Speeding</option>
            <option value="unauthorized">Unauthorized</option>
            <option value="low_fuel">Low Fuel</option>
          </select>

          <select
            value={filters.severity || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as AlertSeverity || undefined }))}
            className={`bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500 ${isMobile ? 'min-h-[44px]' : ''
              }`}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
            className={`bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500 ${isMobile ? 'min-h-[44px]' : ''
              }`}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <button
            onClick={() => {
              setFilters({});
              setSearchTerm('');
            }}
            className={`bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors ${isMobile ? 'min-h-[44px]' : ''
              }`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {isMobile ? (
        /* Mobile: Card Layout */
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">No Alerts Found</h3>
              <p className="text-gray-400">No alerts match your current filters</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = expandedCards.includes(alert.id);

              return (
                <div
                  key={alert.id}
                  className={`bg-gray-800 rounded-lg border overflow-hidden ${getSeverityColor(alert.severity)}`}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpandedCard(alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-white truncate">
                              {alert.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className={`text-sm text-gray-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400 capitalize">
                              {alert.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {alert.timestamp.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resolveAlert(alert.id);
                              }}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Resolve alert"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissAlert(alert.id);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Dismiss alert"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Vehicle ID</p>
                          <p className="text-sm text-white">{alert.vehicleId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Severity</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        {alert.resolvedAt && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Resolved At</p>
                            <p className="text-sm text-white">{alert.resolvedAt.toLocaleString()}</p>
                          </div>
                        )}
                        {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 mb-1">Additional Info</p>
                            <div className="text-sm text-white">
                              {Object.entries(alert.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
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
                    Alert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">
                            {alert.title}
                          </div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {alert.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Vehicle: {alert.vehicleId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white capitalize">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {alert.timestamp.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {alert.status === 'active' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="text-green-400 hover:text-green-300"
                            title="Resolve alert"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Dismiss alert"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};