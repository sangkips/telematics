import React from 'react';
import { 
  MapPin, 
  Gauge, 
  Fuel, 
  Clock, 
  User, 
  AlertTriangle,
  Navigation,
  Battery
} from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-amber-600 bg-amber-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Navigation className="w-4 h-4" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <Battery className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{vehicle.name}</h2>
          <p className="text-gray-300">{vehicle.plateNumber}</p>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
          {getStatusIcon(vehicle.status)}
          <span className="ml-1 capitalize">{vehicle.status}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center text-gray-300 mb-1">
            <Gauge className="w-4 h-4 mr-2" />
            <span className="text-sm">Speed</span>
          </div>
          <div className="text-2xl font-bold text-white">{vehicle.speed}</div>
          <div className="text-xs text-gray-400">km/h</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center text-gray-300 mb-1">
            <Fuel className="w-4 h-4 mr-2" />
            <span className="text-sm">Fuel</span>
          </div>
          <div className="text-2xl font-bold text-white">{vehicle.fuelLevel}</div>
          <div className="text-xs text-gray-400">%</div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Location</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">{vehicle.location.address}</p>
              <p className="text-sm text-gray-400 mt-1">
                {vehicle.location.lat.toFixed(6)}, {vehicle.location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Driver</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-white font-medium">{vehicle.driver || 'No driver assigned'}</p>
              <p className="text-sm text-gray-400">Current driver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Vehicle Stats</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center">
              <Gauge className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-300">Odometer</span>
            </div>
            <span className="font-medium text-white">
              {vehicle.odometer.toLocaleString()} km
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center">
              <Fuel className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-300">Fuel Consumption</span>
            </div>
            <span className="font-medium text-white">
              {vehicle.fuelConsumption} L/100km
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <Navigation className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-300">Last Update</span>
            </div>
            <span className="font-medium text-white">
              {vehicle.lastUpdate ? new Date(vehicle.lastUpdate).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Alerts */}
      {vehicle.alerts && vehicle.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          <div className="space-y-2">
            {vehicle.alerts.filter(alert => !alert.resolved).map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-3 ${
                alert.severity === 'critical' ? 'bg-red-900 border-red-700' :
                alert.severity === 'high' ? 'bg-orange-900 border-orange-700' :
                alert.severity === 'medium' ? 'bg-amber-900 border-amber-700' :
                'bg-blue-900 border-blue-700'
              }`}>
                <div className="flex items-start">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'high' ? 'text-orange-400' :
                    alert.severity === 'medium' ? 'text-amber-400' :
                    'text-blue-400'
                  }`} />
                  <div>
                    <p className={`font-medium capitalize ${
                      alert.severity === 'critical' ? 'text-red-200' :
                      alert.severity === 'high' ? 'text-orange-200' :
                      alert.severity === 'medium' ? 'text-amber-200' :
                      'text-blue-200'
                    }`}>
                      {alert.type.replace('_', ' ')}
                    </p>
                    <p className={`text-sm mt-1 ${
                      alert.severity === 'critical' ? 'text-red-300' :
                      alert.severity === 'high' ? 'text-orange-300' :
                      alert.severity === 'medium' ? 'text-amber-300' :
                      'text-blue-300'
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};