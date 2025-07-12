import React from 'react';
import { 
  MapPin, 
  User, 
  Clock, 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Pause
} from 'lucide-react';
import { Vehicle } from '../types';
import { FuelGauge } from './FuelGauge';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
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

  return (
    <div 
      className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
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