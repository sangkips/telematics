import React from 'react';
import { AlertTriangle, Droplets } from 'lucide-react';

interface FuelGaugeProps {
  level: number;
  capacity: number;
  vehicleName: string;
  size?: 'small' | 'medium' | 'large';
  showAlert?: boolean;
}

export const FuelGauge: React.FC<FuelGaugeProps> = ({
  level,
  capacity,
  vehicleName,
  size = 'medium',
  showAlert = false
}) => {
  const percentage = (level / capacity) * 100;
  const isLow = percentage < 25;
  const isCritical = percentage < 10;
  
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const getGaugeColor = () => {
    if (isCritical) return 'text-red-500';
    if (isLow) return 'text-amber-500';
    return 'text-green-500';
  };

  const getGradientColor = () => {
    if (isCritical) return 'from-red-500 to-red-400';
    if (isLow) return 'from-amber-500 to-amber-400';
    return 'from-green-500 to-green-400';
  };

  return (
    <div className="relative">
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-700"
          />
          
          {/* Fuel level arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#fuelGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.827} 282.7`}
            className="transition-all duration-500 ease-out"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="fuelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={getGradientColor().split(' ')[0].replace('from-', 'stop-')} />
              <stop offset="100%" className={getGradientColor().split(' ')[1].replace('to-', 'stop-')} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Droplets className={`w-6 h-6 mx-auto mb-1 ${getGaugeColor()}`} />
            <div className="text-sm font-bold text-white">{Math.round(percentage)}%</div>
          </div>
        </div>
      </div>
      
      {/* Vehicle name and alerts */}
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gray-300">{vehicleName}</div>
        <div className="text-xs text-gray-400">{level}L / {capacity}L</div>
        
        {showAlert && (isLow || isCritical) && (
          <div className={`flex items-center justify-center mt-1 text-xs ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {isCritical ? 'Critical' : 'Low Fuel'}
          </div>
        )}
      </div>
    </div>
  );
};