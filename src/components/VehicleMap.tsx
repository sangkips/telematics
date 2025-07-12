import React from 'react';
import { MapPin, Navigation, Zap } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

export const VehicleMap: React.FC<VehicleMapProps> = ({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect 
}) => {
  const getMarkerColor = (vehicle: Vehicle) => {
    switch (vehicle.status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-amber-500';
      case 'maintenance': return 'bg-blue-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (vehicle: Vehicle) => {
    if (vehicle.status === 'active') {
      return <Navigation className="w-3 h-3 text-white" />;
    }
    return <MapPin className="w-3 h-3 text-white" />;
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Simulated Map Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-600"></div>
            ))}
          </div>
        </div>

        {/* Vehicle Markers */}
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
              selectedVehicle?.id === vehicle.id ? 'scale-125 z-10' : ''
            }`}
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${30 + (index * 10)}%`,
            }}
            onClick={() => onVehicleSelect?.(vehicle)}
          >
            {/* Marker */}
            <div className={`relative ${getMarkerColor(vehicle)} rounded-full p-2 shadow-lg border-2 border-white`}>
              {getMarkerIcon(vehicle)}
            </div>
            
            {/* Vehicle Info Popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-600 min-w-48">
                <div className="text-white font-medium">{vehicle.name}</div>
                <div className="text-gray-300 text-sm">{vehicle.plateNumber}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {vehicle.location.address}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-400">
                    Speed: {vehicle.speed} km/h
                  </div>
                  <div className="text-xs text-gray-400">
                    Fuel: {vehicle.fuelLevel}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Real-time Updates Indicator */}
        <div className="absolute top-4 right-4 flex items-center text-green-400">
          <Zap className="w-4 h-4 mr-1 animate-pulse" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Vehicle Status</div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Idle</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Maintenance</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};