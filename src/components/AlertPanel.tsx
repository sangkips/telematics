import React from 'react';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onResolveAlert?: (alertId: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ 
  alerts, 
  onResolveAlert, 
  onDismissAlert 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-900 bg-opacity-50';
      case 'high': return 'border-orange-500 bg-orange-900 bg-opacity-50';
      case 'medium': return 'border-amber-500 bg-amber-900 bg-opacity-50';
      case 'low': return 'border-blue-500 bg-blue-900 bg-opacity-50';
      default: return 'border-gray-500 bg-gray-900 bg-opacity-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'low':
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'fuel_theft': return 'text-red-400';
      case 'maintenance': return 'text-blue-400';
      case 'speeding': return 'text-orange-400';
      case 'unauthorized': return 'text-purple-400';
      case 'low_fuel': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">All Clear</h3>
        <p className="text-gray-400">No active alerts for your fleet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Active Alerts ({alerts.filter(a => !a.resolved).length})
        </h3>
        <div className="flex items-center text-sm text-gray-400">
          <Clock className="w-4 h-4 mr-1" />
          Real-time monitoring
        </div>
      </div>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)} ${
            alert.resolved ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {getSeverityIcon(alert.severity)}
              <div className="ml-3">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getAlertTypeColor(alert.type)}`}>
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-white mt-1">{alert.message}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                  {alert.resolved && (
                    <span className="text-xs text-green-400 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!alert.resolved && onResolveAlert && (
                <button
                  onClick={() => onResolveAlert(alert.id)}
                  className="text-green-400 hover:text-green-300 transition-colors"
                  title="Mark as resolved"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {onDismissAlert && (
                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};