import React, { useState } from 'react';
import { X, AlertTriangle, Fuel, Gauge, Wrench, Shield } from 'lucide-react';
import { useAlertSystem } from '../contexts/AlertSystemContext';
import { AlertType, AlertSeverity, CreateAlertRequest } from '../types/alerts';
import { useResponsive } from '../hooks/useResponsive';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: string;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  vehicleId: defaultVehicleId
}) => {
  const { isMobile } = useResponsive();
  const { createAlert } = useAlertSystem();
  
  const [formData, setFormData] = useState<CreateAlertRequest>({
    vehicleId: defaultVehicleId || '',
    type: 'maintenance',
    severity: 'medium',
    title: '',
    message: '',
    metadata: {}
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alertTypes: { value: AlertType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'fuel_theft',
      label: 'Fuel Theft',
      icon: <Fuel className="w-5 h-5 text-red-400" />,
      description: 'Unauthorized fuel removal detected'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
      description: 'Vehicle requires maintenance attention'
    },
    {
      value: 'speeding',
      label: 'Speeding',
      icon: <Gauge className="w-5 h-5 text-orange-400" />,
      description: 'Vehicle exceeded speed limit'
    },
    {
      value: 'unauthorized',
      label: 'Unauthorized Access',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      description: 'Unauthorized vehicle access attempt'
    },
    {
      value: 'low_fuel',
      label: 'Low Fuel',
      icon: <Fuel className="w-5 h-5 text-yellow-400" />,
      description: 'Vehicle fuel level is critically low'
    }
  ];

  const severityLevels: { value: AlertSeverity; label: string; color: string; description: string }[] = [
    {
      value: 'critical',
      label: 'Critical',
      color: 'text-red-400 bg-red-900 border-red-700',
      description: 'Immediate attention required'
    },
    {
      value: 'high',
      label: 'High',
      color: 'text-orange-400 bg-orange-900 border-orange-700',
      description: 'High priority issue'
    },
    {
      value: 'medium',
      label: 'Medium',
      color: 'text-amber-400 bg-amber-900 border-amber-700',
      description: 'Moderate priority issue'
    },
    {
      value: 'low',
      label: 'Low',
      color: 'text-blue-400 bg-blue-900 border-blue-700',
      description: 'Low priority issue'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createAlert(formData);
      onClose();
      // Reset form
      setFormData({
        vehicleId: defaultVehicleId || '',
        type: 'maintenance',
        severity: 'medium',
        title: '',
        message: '',
        metadata: {}
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-gray-800 rounded-lg w-full max-h-[90vh] overflow-y-auto ${
        isMobile ? 'max-w-full' : 'max-w-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create New Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Vehicle ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle ID *
            </label>
            <input
              type="text"
              value={formData.vehicleId}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                isMobile ? 'min-h-[44px]' : ''
              }`}
              placeholder="Enter vehicle ID"
              required
            />
          </div>

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Type *
            </label>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {alertTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="alertType"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AlertType }))}
                    className="sr-only"
                  />
                  {type.icon}
                  <div className="flex-1">
                    <div className="text-white font-medium">{type.label}</div>
                    <div className="text-gray-400 text-sm">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Severity Level *
            </label>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {severityLevels.map((severity) => (
                <label
                  key={severity.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.severity === severity.value
                      ? `border-blue-500 ${severity.color} bg-opacity-30`
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={severity.value}
                    checked={formData.severity === severity.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as AlertSeverity }))}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full ${severity.color.split(' ')[0]} ${severity.color.split(' ')[1]}`}></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{severity.label}</div>
                    <div className="text-gray-400 text-sm">{severity.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                isMobile ? 'min-h-[44px]' : ''
              }`}
              placeholder="Enter alert title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter detailed alert message"
              required
            />
          </div>

          {/* Additional Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Information (Optional)
            </label>
            <div className="space-y-3">
              {formData.type === 'speeding' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Speed (km/h)"
                    onChange={(e) => handleMetadataChange('speed', e.target.value)}
                    className={`px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      isMobile ? 'min-h-[44px]' : ''
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Speed Limit (km/h)"
                    onChange={(e) => handleMetadataChange('speedLimit', e.target.value)}
                    className={`px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      isMobile ? 'min-h-[44px]' : ''
                    }`}
                  />
                </div>
              )}
              
              {formData.type === 'fuel_theft' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Fuel Lost (L)"
                    onChange={(e) => handleMetadataChange('fuelLost', e.target.value)}
                    className={`px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      isMobile ? 'min-h-[44px]' : ''
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    onChange={(e) => handleMetadataChange('location', e.target.value)}
                    className={`px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      isMobile ? 'min-h-[44px]' : ''
                    }`}
                  />
                </div>
              )}
              
              {formData.type === 'low_fuel' && (
                <input
                  type="number"
                  placeholder="Current Fuel Level (%)"
                  onChange={(e) => handleMetadataChange('fuelLevel', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                    isMobile ? 'min-h-[44px]' : ''
                  }`}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-4 border-t border-gray-700 ${
            isMobile ? 'flex-col' : 'justify-end'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-gray-400 hover:text-white transition-colors ${
                isMobile ? 'min-h-[44px]' : ''
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white rounded-lg transition-colors ${
                isMobile ? 'min-h-[44px]' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};