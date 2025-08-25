import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  User,
  Clock,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Wrench,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  MoreVertical,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Vehicle } from '../types';
import { FuelGauge } from './FuelGauge';
import { useResponsive } from '../hooks/useResponsive';
import { useResponsiveContext } from '../contexts/ResponsiveContext';
import { useVehicleUpdate } from '../contexts/VehicleUpdateContext';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onClick,
  onEdit,
  onDelete
}) => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const { connectionState, pendingUpdates } = useVehicleUpdate();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const isExpanded = expandedCards.includes(vehicle.id);

  // Check if this vehicle has pending updates
  const vehiclePendingUpdates = Object.values(pendingUpdates).filter(
    update => update.vehicleId === vehicle.id
  );
  const hasPendingUpdates = vehiclePendingUpdates.length > 0;
  const hasFailedUpdates = vehiclePendingUpdates.some(update => update.status === 'error');

  // Show updating animation for a brief moment after successful updates
  useEffect(() => {
    const successfulUpdates = vehiclePendingUpdates.filter(update => update.status === 'success');
    if (successfulUpdates.length > 0) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [vehiclePendingUpdates]);

  const getStatusColor = () => {
    switch (vehicle.status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-amber-400';
      case 'maintenance': return 'text-blue-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (vehicle.status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'idle': return <Pause className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const criticalAlerts = vehicle.alerts.filter(alert =>
    alert.severity === 'critical' && !alert.resolved
  );

  // Touch event handlers for swipe actions
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;

    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -120)); // Limit swipe to 120px
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging.current) return;

    isDragging.current = false;
    const deltaX = currentX.current - startX.current;

    // If swiped more than 60px, show actions
    if (deltaX < -60) {
      setSwipeOffset(-120);
      setShowActions(true);
    } else {
      setSwipeOffset(0);
      setShowActions(false);
    }
  };

  // Reset swipe when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setSwipeOffset(0);
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if we're showing swipe actions
    if (showActions) {
      e.stopPropagation();
      return;
    }
    onClick?.();
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpandedCard(vehicle.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(vehicle);
    setSwipeOffset(0);
    setShowActions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(vehicle);
    setSwipeOffset(0);
    setShowActions(false);
  };

  // Mobile horizontal layout
  if (isMobile) {
    return (
      <div className="relative overflow-hidden">
        <div
          ref={cardRef}
          className={`bg-gray-800 rounded-lg border transition-all duration-200 cursor-pointer group relative ${hasPendingUpdates || isUpdating
            ? 'border-blue-400 shadow-blue-400/20 shadow-lg'
            : hasFailedUpdates
              ? 'border-red-400 shadow-red-400/20 shadow-lg'
              : 'border-gray-700 hover:border-blue-500'
            }`}
          style={{ transform: `translateX(${swipeOffset}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCardClick}
        >
          {/* Real-time Update Indicator */}
          {(hasPendingUpdates || isUpdating || hasFailedUpdates) && (
            <div className="absolute top-2 left-2 z-10">
              {hasPendingUpdates && !hasFailedUpdates ? (
                <div className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Updating</span>
                </div>
              ) : hasFailedUpdates ? (
                <div className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                  <XCircle className="w-3 h-3" />
                  <span>Failed</span>
                </div>
              ) : isUpdating ? (
                <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Updated</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Connection Status Indicator */}
          <div className="absolute top-2 right-2 z-10">
            {connectionState.status === 'connected' && !connectionState.fallbackMode ? (
              <div title="Real-time connected">
                <Wifi className="w-4 h-4 text-green-400" />
              </div>
            ) : connectionState.status === 'connecting' ? (
              <div title="Connecting...">
                <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
              </div>
            ) : connectionState.fallbackMode ? (
              <div title="Polling mode">
                <RefreshCw className="w-4 h-4 text-orange-400" />
              </div>
            ) : (
              <div title="Disconnected">
                <WifiOff className="w-4 h-4 text-red-400" />
              </div>
            )}
          </div>
          {/* Mobile Horizontal Layout */}
          <div className="p-4">
            {/* Primary Info Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                      {vehicle.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{vehicle.plateNumber}</p>
                  </div>
                  <div className={`flex items-center ml-3 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="ml-1 text-sm capitalize hidden sm:inline">{vehicle.status}</span>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={handleExpandToggle}
                className="ml-3 p-2 text-gray-400 hover:text-white transition-colors touch-target"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Critical Alerts - Always Visible */}
            {criticalAlerts.length > 0 && (
              <div className="mb-3 p-2 bg-red-900 bg-opacity-50 rounded border border-red-700">
                <div className="flex items-center text-red-400">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Compact Info Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-300 min-w-0 flex-1">
                <User className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{vehicle.driver}</span>
              </div>
              <div className="ml-4 flex-shrink-0">
                <FuelGauge
                  level={vehicle.fuelLevel}
                  capacity={vehicle.maxFuelCapacity}
                  vehicleName=""
                  size="small"
                  showAlert={false}
                />
              </div>
            </div>

            {/* Expandable Secondary Information */}
            {isExpanded && (
              <div className="mt-4 space-y-3 border-t border-gray-700 pt-3">
                {/* Location and Speed */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="text-sm truncate">{vehicle.location.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-300">
                      <Gauge className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{vehicle.speed} km/h</span>
                    </div>

                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Maintenance Status */}
                {vehicle.nextServiceDue && (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wrench className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-300">Next Service</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {new Date(vehicle.nextServiceDue).toLocaleDateString()}
                        </div>
                        {vehicle.nextServiceOdometer && (
                          <div className="text-xs text-gray-400">
                            @ {vehicle.nextServiceOdometer.toLocaleString()} km
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                  <div>
                    <div className="text-xs text-gray-400">Odometer</div>
                    <div className="text-sm font-medium text-white">
                      {vehicle.odometer.toLocaleString()} km
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Fuel Efficiency</div>
                    <div className="text-sm font-medium text-white">
                      {vehicle.fuelConsumption} L/100km
                    </div>
                  </div>
                </div>

                {/* Critical Alert Details */}
                {criticalAlerts.length > 0 && (
                  <div className="space-y-2">
                    {criticalAlerts.map(alert => (
                      <div key={alert.id} className="p-2 bg-red-900 bg-opacity-30 rounded text-red-300 text-sm">
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swipe Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="absolute top-0 right-0 h-full flex items-center bg-gray-900">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="h-full px-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors touch-target"
                style={{ minWidth: '60px' }}
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="h-full px-4 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors touch-target"
                style={{ minWidth: '60px' }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet vertical layout (original design)
  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 shadow-lg border transition-all duration-200 cursor-pointer group relative ${hasPendingUpdates || isUpdating
        ? 'border-blue-400 shadow-blue-400/20 shadow-lg'
        : hasFailedUpdates
          ? 'border-red-400 shadow-red-400/20 shadow-lg'
          : 'border-gray-700 hover:border-blue-500'
        }`}
      onClick={onClick}
    >
      {/* Real-time Update Indicator */}
      {(hasPendingUpdates || isUpdating || hasFailedUpdates) && (
        <div className="absolute top-4 left-4 z-10">
          {hasPendingUpdates && !hasFailedUpdates ? (
            <div className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Updating</span>
            </div>
          ) : hasFailedUpdates ? (
            <div className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
              <XCircle className="w-3 h-3" />
              <span>Failed</span>
            </div>
          ) : isUpdating ? (
            <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
              <CheckCircle className="w-3 h-3" />
              <span>Updated</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-12 z-10">
        {connectionState.status === 'connected' && !connectionState.fallbackMode ? (
          <div title="Real-time connected">
            <Wifi className="w-4 h-4 text-green-400" />
          </div>
        ) : connectionState.status === 'connecting' ? (
          <div title="Connecting...">
            <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
          </div>
        ) : connectionState.fallbackMode ? (
          <div title="Polling mode">
            <RefreshCw className="w-4 h-4 text-orange-400" />
          </div>
        ) : (
          <div title="Disconnected">
            <WifiOff className="w-4 h-4 text-red-400" />
          </div>
        )}
      </div>
      {/* Desktop Actions Menu */}
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-gray-400 text-sm">{vehicle.plateNumber}</p>
        </div>
        <div className={`flex items-center ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-1 text-sm capitalize">{vehicle.status}</span>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 rounded-lg border border-red-700">
          <div className="flex items-center text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Critical Alert</span>
          </div>
          {criticalAlerts.map(alert => (
            <p key={alert.id} className="text-red-300 text-sm">
              {alert.message}
            </p>
          ))}
        </div>
      )}

      {/* Fuel Gauge */}
      <div className="mb-4">
        <FuelGauge
          level={vehicle.fuelLevel}
          capacity={vehicle.maxFuelCapacity}
          vehicleName=""
          size="small"
          showAlert={true}
        />
      </div>

      {/* Vehicle Info */}
      <div className="space-y-2">
        <div className="flex items-center text-gray-300">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{vehicle.driver}</span>
        </div>

        <div className="flex items-center text-gray-300">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm truncate">{vehicle.location.address}</span>
        </div>

        <div className="flex items-center text-gray-300">
          <Gauge className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{vehicle.speed} km/h</span>
        </div>

        <div className="flex items-center text-gray-300">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">
            {new Date(vehicle.lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Maintenance Status */}
      {vehicle.nextServiceDue && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wrench className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-300">Next Service</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {new Date(vehicle.nextServiceDue).toLocaleDateString()}
              </div>
              {vehicle.nextServiceOdometer && (
                <div className="text-xs text-gray-400">
                  @ {vehicle.nextServiceOdometer.toLocaleString()} km
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Odometer</div>
            <div className="text-sm font-medium text-white">
              {vehicle.odometer.toLocaleString()} km
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Fuel Efficiency</div>
            <div className="text-sm font-medium text-white">
              {vehicle.fuelConsumption} L/100km
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};