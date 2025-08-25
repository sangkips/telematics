import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Gauge, 
  Fuel, 
  Clock, 
  User, 
  AlertTriangle,
  Navigation,
  Battery,
  Edit3,
  Save,
  X,
  RotateCcw,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Vehicle, PERMISSIONS } from '../types';
import { useVehicleUpdate } from '../contexts/VehicleUpdateContext';
import { useAuth } from '../contexts/AuthContext';
import { SecurityValidation, usePermissionCheck } from './SecurityValidation';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onVehicleUpdate?: (updatedVehicle: Vehicle) => void;
}

interface EditableFields {
  name: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number | '';
  vin: string;
  driver: string;
  status: Vehicle['status'];
  maxFuelCapacity: number | '';
  odometer: number | '';
  fuelConsumption: number | '';
  location: {
    lat: number | '';
    lng: number | '';
    address: string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({ 
  vehicle, 
  onVehicleUpdate 
}) => {
  const { 
    updateVehicle, 
    connectionState, 
    pendingUpdates, 
    getVehicle 
  } = useVehicleUpdate();
  const { hasPermission } = useAuth();

  // State management
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    name: vehicle.name,
    plateNumber: vehicle.plateNumber,
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    vin: vehicle.vin || '',
    driver: vehicle.driver,
    status: vehicle.status,
    maxFuelCapacity: vehicle.maxFuelCapacity,
    odometer: vehicle.odometer,
    fuelConsumption: vehicle.fuelConsumption,
    location: {
      lat: vehicle.location.lat,
      lng: vehicle.location.lng,
      address: vehicle.location.address,
    },
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<EditableFields | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get current vehicle data (may be updated via WebSocket)
  const currentVehicle = getVehicle(vehicle.id) || vehicle;

  // Check permissions
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_VEHICLES);

  // Update editable fields when vehicle data changes (real-time updates)
  useEffect(() => {
    if (!isEditMode) {
      setEditableFields({
        name: currentVehicle.name,
        plateNumber: currentVehicle.plateNumber,
        make: currentVehicle.make || '',
        model: currentVehicle.model || '',
        year: currentVehicle.year || '',
        vin: currentVehicle.vin || '',
        driver: currentVehicle.driver,
        status: currentVehicle.status,
        maxFuelCapacity: currentVehicle.maxFuelCapacity,
        odometer: currentVehicle.odometer,
        fuelConsumption: currentVehicle.fuelConsumption,
        location: {
          lat: currentVehicle.location.lat,
          lng: currentVehicle.location.lng,
          address: currentVehicle.location.address,
        },
      });
    }
  }, [currentVehicle, isEditMode]);

  // Track unsaved changes
  useEffect(() => {
    if (!originalData) return;
    
    const hasChanges = (
      editableFields.name !== originalData.name ||
      editableFields.plateNumber !== originalData.plateNumber ||
      editableFields.make !== originalData.make ||
      editableFields.model !== originalData.model ||
      editableFields.year !== originalData.year ||
      editableFields.vin !== originalData.vin ||
      editableFields.driver !== originalData.driver ||
      editableFields.status !== originalData.status ||
      editableFields.maxFuelCapacity !== originalData.maxFuelCapacity ||
      editableFields.odometer !== originalData.odometer ||
      editableFields.fuelConsumption !== originalData.fuelConsumption ||
      editableFields.location.lat !== originalData.location.lat ||
      editableFields.location.lng !== originalData.location.lng ||
      editableFields.location.address !== originalData.location.address
    );
    setHasUnsavedChanges(hasChanges);
  }, [editableFields, originalData]);

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

  // Validation functions
  const validateField = useCallback((field: string, value: unknown): string => {
    switch (field) {
      case 'name':
        if (!value || String(value).trim().length === 0) {
          return 'Vehicle name is required';
        }
        if (String(value).trim().length > 100) {
          return 'Vehicle name must be less than 100 characters';
        }
        break;

      case 'plateNumber':
        if (!value || String(value).trim().length === 0) {
          return 'Plate number is required';
        }
        if (!/^[A-Z0-9-\s]+$/i.test(String(value))) {
          return 'Plate number can only contain letters, numbers, hyphens, and spaces';
        }
        break;

      case 'year':
        if (value !== '' && value !== null) {
          const yearNum = Number(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
            return `Year must be between 1900 and ${currentYear + 1}`;
          }
        }
        break;

      case 'vin':
        if (value && String(value).length > 0) {
          if (String(value).length !== 17) {
            return 'VIN must be exactly 17 characters';
          }
          if (!/^[A-HJ-NPR-Z0-9]+$/i.test(String(value))) {
            return 'VIN contains invalid characters';
          }
        }
        break;

      case 'driver':
        if (!value || String(value).trim().length === 0) {
          return 'Driver name is required';
        }
        break;

      case 'maxFuelCapacity':
        if (value !== '' && value !== null) {
          const capacity = Number(value);
          if (isNaN(capacity) || capacity <= 0) {
            return 'Fuel capacity must be a positive number';
          }
          if (capacity < currentVehicle.fuelLevel) {
            return `Fuel capacity cannot be less than current fuel level (${currentVehicle.fuelLevel}L)`;
          }
        }
        break;

      case 'odometer':
        if (value !== '' && value !== null) {
          const reading = Number(value);
          if (isNaN(reading) || reading < 0) {
            return 'Odometer reading must be a positive number';
          }
          if (reading < currentVehicle.odometer) {
            return `Odometer reading cannot be less than current reading (${currentVehicle.odometer} km)`;
          }
        }
        break;

      case 'fuelConsumption':
        if (value !== '' && value !== null) {
          const consumption = Number(value);
          if (isNaN(consumption) || consumption <= 0) {
            return 'Fuel consumption must be a positive number';
          }
        }
        break;

      case 'location.lat':
        if (value !== '' && value !== null) {
          const lat = Number(value);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            return 'Latitude must be between -90 and 90';
          }
        }
        break;

      case 'location.lng':
        if (value !== '' && value !== null) {
          const lng = Number(value);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            return 'Longitude must be between -180 and 180';
          }
        }
        break;

      case 'location.address':
        if (!value || String(value).trim().length === 0) {
          return 'Address is required';
        }
        break;

      default:
        break;
    }
    return '';
  }, [currentVehicle.fuelLevel, currentVehicle.odometer]);

  // Handle input changes with real-time validation
  const handleInputChange = useCallback((field: string, value: unknown) => {
    setEditableFields(prev => {
      if (field.startsWith('location.')) {
        const locationField = field.split('.')[1];
        return {
          ...prev,
          location: {
            ...prev.location,
            [locationField]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });

    // Clear field-specific error immediately when user starts typing
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Validate field in real-time
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  }, [validateField]);

  // Enter edit mode
  const enterEditMode = useCallback(() => {
    if (!canUpdate) return;
    
    setIsEditMode(true);
    setOriginalData({ ...editableFields });
    setValidationErrors({});
    setSubmitError(null);
  }, [canUpdate, editableFields]);

  // Exit edit mode without saving
  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditableFields(originalData || editableFields);
    setOriginalData(null);
    setValidationErrors({});
    setSubmitError(null);
    setHasUnsavedChanges(false);
  }, [originalData, editableFields]);

  // Rollback to original data
  const rollbackChanges = useCallback(() => {
    if (originalData) {
      setEditableFields({ ...originalData });
      setValidationErrors({});
      setSubmitError(null);
    }
  }, [originalData]);

  // Validate all fields
  const validateForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    Object.entries(editableFields).forEach(([key, value]) => {
      if (key === 'location') {
        const locationData = value as EditableFields['location'];
        Object.entries(locationData).forEach(([locKey, locValue]) => {
          const error = validateField(`location.${locKey}`, locValue);
          if (error) {
            errors[`location.${locKey}`] = error;
          }
        });
      } else {
        const error = validateField(key, value);
        if (error) {
          errors[key] = error;
        }
      }
    });

    return errors;
  }, [editableFields, validateField]);

  // Handle form submission
  const handleSave = useCallback(async () => {
    if (!canUpdate) {
      setSubmitError('You do not have permission to update vehicles');
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare update data - only include changed fields
      const updateData: Partial<Vehicle> = {};
      
      if (originalData) {
        if (editableFields.name !== originalData.name) updateData.name = editableFields.name;
        if (editableFields.plateNumber !== originalData.plateNumber) updateData.plateNumber = editableFields.plateNumber;
        if (editableFields.make !== originalData.make) updateData.make = editableFields.make || undefined;
        if (editableFields.model !== originalData.model) updateData.model = editableFields.model || undefined;
        if (editableFields.year !== originalData.year) updateData.year = editableFields.year || undefined;
        if (editableFields.vin !== originalData.vin) updateData.vin = editableFields.vin || undefined;
        if (editableFields.driver !== originalData.driver) updateData.driver = editableFields.driver;
        if (editableFields.status !== originalData.status) updateData.status = editableFields.status;
        if (editableFields.maxFuelCapacity !== originalData.maxFuelCapacity) updateData.maxFuelCapacity = Number(editableFields.maxFuelCapacity);
        if (editableFields.odometer !== originalData.odometer) updateData.odometer = Number(editableFields.odometer);
        if (editableFields.fuelConsumption !== originalData.fuelConsumption) updateData.fuelConsumption = Number(editableFields.fuelConsumption);
        
        // Handle location updates
        if (
          editableFields.location.lat !== originalData.location.lat ||
          editableFields.location.lng !== originalData.location.lng ||
          editableFields.location.address !== originalData.location.address
        ) {
          updateData.location = {
            lat: Number(editableFields.location.lat),
            lng: Number(editableFields.location.lng),
            address: editableFields.location.address,
          };
        }
      }

      // Perform update with optimistic UI updates
      const updatedVehicle = await updateVehicle(currentVehicle.id, updateData, true);
      
      // Exit edit mode and notify parent
      setIsEditMode(false);
      setOriginalData(null);
      setHasUnsavedChanges(false);
      onVehicleUpdate?.(updatedVehicle);

    } catch (error) {
      console.error('Vehicle update failed:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('plate number') || error.message.includes('already exists')) {
          setValidationErrors(prev => ({
            ...prev,
            plateNumber: 'This plate number is already in use by another vehicle',
          }));
        } else if (error.message.includes('VIN') || error.message.includes('already exists')) {
          setValidationErrors(prev => ({
            ...prev,
            vin: 'This VIN is already in use by another vehicle',
          }));
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError('Failed to update vehicle. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [canUpdate, editableFields, originalData, validateForm, updateVehicle, currentVehicle.id, onVehicleUpdate]);

  // Get pending update for this vehicle
  const pendingUpdate = useMemo(() => {
    return Object.values(pendingUpdates).find(update => update.vehicleId === currentVehicle.id);
  }, [pendingUpdates, currentVehicle.id]);

  // Connection status indicator
  const connectionStatus = useMemo(() => {
    switch (connectionState.status) {
      case 'connected':
        return { 
          color: 'text-green-400', 
          text: 'Connected', 
          icon: <Wifi className="w-4 h-4" /> 
        };
      case 'connecting':
        return { 
          color: 'text-yellow-400', 
          text: 'Connecting...', 
          icon: <RefreshCw className="w-4 h-4 animate-spin" /> 
        };
      case 'disconnected':
        return { 
          color: 'text-red-400', 
          text: 'Disconnected', 
          icon: <WifiOff className="w-4 h-4" /> 
        };
      case 'error':
        return { 
          color: 'text-red-400', 
          text: 'Connection Error', 
          icon: <XCircle className="w-4 h-4" /> 
        };
      default:
        return { 
          color: 'text-gray-400', 
          text: 'Unknown', 
          icon: <AlertCircle className="w-4 h-4" /> 
        };
    }
  }, [connectionState.status]);

  return (
    <div className="space-y-6">
      {/* Header with Connection Status and Edit Controls */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editableFields.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`bg-gray-800 text-white border rounded px-2 py-1 text-xl font-bold ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Vehicle name"
                  />
                ) : (
                  currentVehicle.name
                )}
              </h2>
              {validationErrors.name && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
              )}
              <p className="text-gray-300">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editableFields.plateNumber}
                    onChange={(e) => handleInputChange('plateNumber', e.target.value.toUpperCase())}
                    className={`bg-gray-800 text-gray-300 border rounded px-2 py-1 text-sm ${
                      validationErrors.plateNumber ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Plate number"
                  />
                ) : (
                  currentVehicle.plateNumber
                )}
              </p>
              {validationErrors.plateNumber && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.plateNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className={`flex items-center text-sm ${connectionStatus.color}`}>
            {connectionStatus.icon}
            <span className="ml-1">{connectionStatus.text}</span>
            {connectionState.fallbackMode && (
              <span className="ml-1 text-xs text-gray-400">(Polling)</span>
            )}
          </div>

          {/* Pending Update Indicator */}
          {pendingUpdate && (
            <div className={`flex items-center text-sm ${
              pendingUpdate.status === 'pending' ? 'text-yellow-400' :
              pendingUpdate.status === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {pendingUpdate.status === 'pending' && <RefreshCw className="w-4 h-4 animate-spin mr-1" />}
              {pendingUpdate.status === 'success' && <CheckCircle className="w-4 h-4 mr-1" />}
              {pendingUpdate.status === 'error' && <XCircle className="w-4 h-4 mr-1" />}
              <span>
                {pendingUpdate.status === 'pending' && 'Updating...'}
                {pendingUpdate.status === 'success' && 'Updated'}
                {pendingUpdate.status === 'error' && 'Failed'}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            isEditMode ? editableFields.status : currentVehicle.status
          )}`}>
            {getStatusIcon(isEditMode ? editableFields.status : currentVehicle.status)}
            <span className="ml-1 capitalize">
              {isEditMode ? editableFields.status : currentVehicle.status}
            </span>
          </div>

          {/* Edit Controls - Wrapped with Security Validation */}
          <SecurityValidation 
            requiredPermission={PERMISSIONS.UPDATE_VEHICLES}
            showError={false}
          >
            <div className="flex items-center space-x-2">
              {!isEditMode ? (
                <button
                  onClick={enterEditMode}
                  className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  {hasUnsavedChanges && (
                    <button
                      onClick={rollbackChanges}
                      className="flex items-center px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                      title="Rollback changes"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded text-sm transition-colors"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={exitEditMode}
                    className="flex items-center px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </SecurityValidation>
        </div>
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center text-gray-300 mb-1">
            <Gauge className="w-4 h-4 mr-2" />
            <span className="text-sm">Speed</span>
          </div>
          <div className="text-2xl font-bold text-white">{currentVehicle.speed}</div>
          <div className="text-xs text-gray-400">km/h</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center text-gray-300 mb-1">
            <Fuel className="w-4 h-4 mr-2" />
            <span className="text-sm">Fuel</span>
          </div>
          <div className="text-2xl font-bold text-white">{currentVehicle.fuelLevel}</div>
          <div className="text-xs text-gray-400">%</div>
        </div>
      </div>

      {/* Basic Information Section */}
      {isEditMode && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Make</label>
              <input
                type="text"
                value={editableFields.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                placeholder="Toyota, Ford, etc."
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
              <input
                type="text"
                value={editableFields.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                placeholder="Camry, F-150, etc."
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
              <input
                type="number"
                value={editableFields.year}
                onChange={(e) => handleInputChange('year', e.target.value ? parseInt(e.target.value) : '')}
                className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                  validationErrors.year ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {validationErrors.year && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.year}</p>
              )}
            </div>

            {/* VIN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">VIN</label>
              <input
                type="text"
                value={editableFields.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                  validationErrors.vin ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="17-character VIN"
                maxLength={17}
              />
              {validationErrors.vin && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.vin}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Location</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          {isEditMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Latitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    value={editableFields.location.lat}
                    onChange={(e) => handleInputChange('location.lat', e.target.value ? parseFloat(e.target.value) : '')}
                    className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                      validationErrors['location.lat'] ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="40.7128"
                    min="-90"
                    max="90"
                    step="any"
                  />
                  {validationErrors['location.lat'] && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors['location.lat']}</p>
                  )}
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    value={editableFields.location.lng}
                    onChange={(e) => handleInputChange('location.lng', e.target.value ? parseFloat(e.target.value) : '')}
                    className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                      validationErrors['location.lng'] ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="-74.0060"
                    min="-180"
                    max="180"
                    step="any"
                  />
                  {validationErrors['location.lng'] && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors['location.lng']}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                  <input
                    type="text"
                    value={editableFields.location.address}
                    onChange={(e) => handleInputChange('location.address', e.target.value)}
                    className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                      validationErrors['location.address'] ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Street address"
                  />
                  {validationErrors['location.address'] && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors['location.address']}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">{currentVehicle.location.address}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {currentVehicle.location.lat.toFixed(6)}, {currentVehicle.location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Driver Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Driver</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          {isEditMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Driver Name</label>
              <input
                type="text"
                value={editableFields.driver}
                onChange={(e) => handleInputChange('driver', e.target.value)}
                className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                  validationErrors.driver ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Driver name"
              />
              {validationErrors.driver && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.driver}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-white font-medium">{currentVehicle.driver || 'No driver assigned'}</p>
                <p className="text-sm text-gray-400">Current driver</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Status */}
      {isEditMode && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Operational Status</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={editableFields.status}
              onChange={(e) => handleInputChange('status', e.target.value as Vehicle['status'])}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      )}

      {/* Technical Specifications */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Technical Specifications</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fuel Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fuel Capacity (L)
                </label>
                <input
                  type="number"
                  value={editableFields.maxFuelCapacity}
                  onChange={(e) => handleInputChange('maxFuelCapacity', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                    validationErrors.maxFuelCapacity ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="60"
                  min="0"
                  step="0.1"
                />
                {validationErrors.maxFuelCapacity && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.maxFuelCapacity}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Current fuel level: {currentVehicle.fuelLevel}L
                </p>
              </div>

              {/* Odometer */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Odometer (km)
                </label>
                <input
                  type="number"
                  value={editableFields.odometer}
                  onChange={(e) => handleInputChange('odometer', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                    validationErrors.odometer ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="50000"
                  min="0"
                  step="0.1"
                />
                {validationErrors.odometer && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.odometer}</p>
                )}
              </div>

              {/* Fuel Consumption */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fuel Consumption (L/100km)
                </label>
                <input
                  type="number"
                  value={editableFields.fuelConsumption}
                  onChange={(e) => handleInputChange('fuelConsumption', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full bg-gray-700 text-white border rounded px-3 py-2 text-sm ${
                    validationErrors.fuelConsumption ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="8.5"
                  min="0"
                  step="0.1"
                />
                {validationErrors.fuelConsumption && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.fuelConsumption}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div className="flex items-center">
                  <Fuel className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-300">Fuel Capacity</span>
                </div>
                <span className="font-medium text-white">
                  {currentVehicle.maxFuelCapacity}L
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div className="flex items-center">
                  <Gauge className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-300">Odometer</span>
                </div>
                <span className="font-medium text-white">
                  {currentVehicle.odometer.toLocaleString()} km
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div className="flex items-center">
                  <Fuel className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-300">Fuel Consumption</span>
                </div>
                <span className="font-medium text-white">
                  {currentVehicle.fuelConsumption} L/100km
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <Navigation className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-300">Last Update</span>
                </div>
                <span className="font-medium text-white">
                  {currentVehicle.lastUpdate ? new Date(currentVehicle.lastUpdate).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Alerts */}
      {currentVehicle.alerts && currentVehicle.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          <div className="space-y-2">
            {currentVehicle.alerts.filter(alert => !alert.resolved).map((alert) => (
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