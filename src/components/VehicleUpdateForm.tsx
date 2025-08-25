import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle, PERMISSIONS } from '../types';
import { useVehicleUpdate } from '../contexts/VehicleUpdateContext';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { FormStateManager } from '../utils/formStateManager';
import { ErrorDisplay } from './ErrorDisplay';
import { NetworkErrorHandler } from './NetworkErrorHandler';
import { ValidationErrorSummary } from './ValidationErrorSummary';

interface VehicleUpdateFormProps {
  vehicle: Vehicle;
  onSuccess?: (updatedVehicle: Vehicle) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
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

interface ConflictData {
  field: string;
  currentValue: unknown;
  incomingValue: unknown;
  timestamp: string;
}

interface WarningDialog {
  isOpen: boolean;
  type: 'fuel_capacity' | 'odometer_decrease' | 'high_consumption' | null;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const VehicleUpdateForm: React.FC<VehicleUpdateFormProps> = ({
  vehicle,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { updateVehicle, connectionState, pendingUpdates } = useVehicleUpdate();
  const { hasPermission } = useAuth();

  // Check permissions
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_VEHICLES);

  // Form state
  const [formData, setFormData] = useState<FormData>({
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

  // Enhanced error handling
  const errorHandling = useErrorHandling({
    maxRetries: 3,
    retryDelay: 2000,
    autoRetry: false,
    onError: (error) => {
      console.error('Vehicle update error:', error);
    },
    onRetry: () => {
      console.log('Retrying vehicle update...');
    },
  });

  // Form state manager for state preservation during error recovery
  const [formStateManager] = useState(() =>
    new FormStateManager(formData as unknown as Record<string, unknown>, {
      persistKey: `vehicle-update-${vehicle.id}`,
      autoSave: true,
      autoSaveDelay: 1000,
      maxSubmitAttempts: 3,
    })
  );

  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [showConflictResolution, setShowConflictResolution] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [warningDialog, setWarningDialog] = useState<WarningDialog>({
    isOpen: false,
    type: null,
    message: '',
    onConfirm: () => { },
    onCancel: () => { },
  });

  // Track if form data has changed from original
  useEffect(() => {
    const hasChanges = (
      formData.name !== vehicle.name ||
      formData.plateNumber !== vehicle.plateNumber ||
      formData.make !== (vehicle.make || '') ||
      formData.model !== (vehicle.model || '') ||
      formData.year !== (vehicle.year || '') ||
      formData.vin !== (vehicle.vin || '') ||
      formData.driver !== vehicle.driver ||
      formData.status !== vehicle.status ||
      formData.maxFuelCapacity !== vehicle.maxFuelCapacity ||
      formData.odometer !== vehicle.odometer ||
      formData.fuelConsumption !== vehicle.fuelConsumption ||
      formData.location.lat !== vehicle.location.lat ||
      formData.location.lng !== vehicle.location.lng ||
      formData.location.address !== vehicle.location.address
    );
    setHasUnsavedChanges(hasChanges);
  }, [formData, vehicle]);

  // Real-time validation
  const validateField = useCallback((field: string, value: unknown): string => {
    switch (field) {
      case 'name':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Vehicle name is required';
        }
        if (value.trim().length > 100) {
          return 'Vehicle name must be less than 100 characters';
        }
        break;

      case 'plateNumber':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Plate number is required';
        }
        if (!/^[A-Z0-9-\s]+$/i.test(value)) {
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
        if (value && typeof value === 'string' && value.length > 0) {
          if (value.length !== 17) {
            return 'VIN must be exactly 17 characters';
          }
          if (!/^[A-HJ-NPR-Z0-9]+$/i.test(value)) {
            return 'VIN contains invalid characters';
          }
        }
        break;

      case 'driver':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Driver name is required';
        }
        break;

      case 'maxFuelCapacity':
        if (value !== '' && value !== null) {
          const capacity = Number(value);
          if (isNaN(capacity) || capacity <= 0) {
            return 'Fuel capacity must be a positive number';
          }
          if (capacity < vehicle.fuelLevel) {
            return `Fuel capacity cannot be less than current fuel level (${vehicle.fuelLevel}L)`;
          }
        }
        break;

      case 'odometer':
        if (value !== '' && value !== null) {
          const reading = Number(value);
          if (isNaN(reading) || reading < 0) {
            return 'Odometer reading must be a positive number';
          }
          if (reading < vehicle.odometer) {
            return `Odometer reading cannot be less than current reading (${vehicle.odometer} km)`;
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

      default:
        break;
    }
    return '';
  }, [vehicle.fuelLevel, vehicle.odometer]);

  // Validate all fields
  const validateForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'location') {
        const locationData = value as FormData['location'];
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
  }, [formData, validateField]);

  // Check for potentially problematic updates that need warnings
  const checkForWarnings = useCallback((field: string, value: unknown): WarningDialog | null => {
    switch (field) {
      case 'maxFuelCapacity':
        if (value !== '' && value !== null) {
          const capacity = Number(value);
          const currentCapacity = vehicle.maxFuelCapacity;

          // Warn if reducing capacity significantly (more than 20%)
          if (capacity < currentCapacity && (currentCapacity - capacity) / currentCapacity > 0.2) {
            return {
              isOpen: true,
              type: 'fuel_capacity',
              message: `You are reducing the fuel capacity from ${currentCapacity}L to ${capacity}L. This is a significant reduction (${Math.round(((currentCapacity - capacity) / currentCapacity) * 100)}%). Are you sure this is correct?`,
              onConfirm: () => {
                setWarningDialog(prev => ({ ...prev, isOpen: false }));
                // Proceed with the update
                setFormData(prev => ({ ...prev, maxFuelCapacity: capacity }));
              },
              onCancel: () => {
                setWarningDialog(prev => ({ ...prev, isOpen: false }));
                // Revert to original value
                setFormData(prev => ({ ...prev, maxFuelCapacity: vehicle.maxFuelCapacity }));
              },
            };
          }
        }
        break;

      case 'fuelConsumption':
        if (value !== '' && value !== null) {
          const consumption = Number(value);

          // Warn if consumption is unusually high (>25 L/100km) or unusually low (<2 L/100km)
          if (consumption > 25) {
            return {
              isOpen: true,
              type: 'high_consumption',
              message: `The fuel consumption rate of ${consumption} L/100km seems unusually high. Typical values range from 5-15 L/100km. Please verify this value is correct.`,
              onConfirm: () => {
                setWarningDialog(prev => ({ ...prev, isOpen: false }));
                setFormData(prev => ({ ...prev, fuelConsumption: consumption }));
              },
              onCancel: () => {
                setWarningDialog(prev => ({ ...prev, isOpen: false }));
                setFormData(prev => ({ ...prev, fuelConsumption: vehicle.fuelConsumption }));
              },
            };
          } else if (consumption < 2 && consumption > 0) {
            return {
              isOpen: true,
              type: 'high_consumption',
              message: `The fuel consumption rate of ${consumption} L/100km seems unusually low. Typical values range from 5-15 L/100km. Please verify this value is correct.`,
              onConfirm: () => {
                setWarningDialog(prev => ({ ...prev, isOpen: false }));
                setFormData(prev => ({ ...prev, fuelConsumption: consumption }));
              },
              onCancel: () => {
                setWarningDialog(prev => ({ ...prev, isOpen: false }));
                setFormData(prev => ({ ...prev, fuelConsumption: vehicle.fuelConsumption }));
              },
            };
          }
        }
        break;

      default:
        break;
    }
    return null;
  }, [vehicle.maxFuelCapacity, vehicle.fuelConsumption]);

  // Handle input changes with real-time validation, warnings, and sensitive field confirmation
  const handleInputChange = useCallback((field: string, value: unknown) => {
    // Check if this is a sensitive field that requires confirmation
    const sensitiveFields = ['vin', 'plateNumber'];
    if (sensitiveFields.includes(field) && value !== (vehicle as any)[field]) {
      // Show sensitive field confirmation dialog
      setWarningDialog({
        isOpen: true,
        type: null,
        message: `You are updating a sensitive field (${field}). This change will be logged for security purposes. Are you sure you want to continue?`,
        onConfirm: () => {
          setWarningDialog(prev => ({ ...prev, isOpen: false }));
          // Proceed with the update after confirmation
          updateFormField(field, value);
        },
        onCancel: () => {
          setWarningDialog(prev => ({ ...prev, isOpen: false }));
          // Don't update the field
        },
      });
      return;
    }

    // For technical specifications, check for warnings first
    if (['maxFuelCapacity', 'fuelConsumption'].includes(field)) {
      const warning = checkForWarnings(field, value);
      if (warning) {
        setWarningDialog(warning);
        return; // Don't update the form data yet, wait for user confirmation
      }
    }

    // Update the field normally
    updateFormField(field, value);
  }, [validateField, checkForWarnings, vehicle]);

  // Helper function to update form field with enhanced error handling
  const updateFormField = useCallback((field: string, value: unknown) => {
    // Update form data
    setFormData(prev => {
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

    // Update form state manager
    formStateManager.updateField(field as keyof FormData, value as FormData[keyof FormData]);

    // Clear field-specific error immediately when user starts typing
    errorHandling.clearValidationError(field);

    // Validate field in real-time
    const error = validateField(field, value);
    if (error) {
      errorHandling.setValidationError(field, error);
    }
  }, [validateField, formStateManager, errorHandling]);

  // Handle update conflicts
  const handleUpdateConflict = useCallback((errorMessage: string) => {
    console.log('Update conflict detected:', errorMessage);
    // In a real implementation, the server would provide conflict details
    // For now, we'll simulate conflict detection
    const conflictFields = ['name', 'plateNumber', 'status', 'driver'];
    const detectedConflicts: ConflictData[] = conflictFields.map(field => ({
      field,
      currentValue: (formData as unknown as Record<string, unknown>)[field],
      incomingValue: `Updated by another user`,
      timestamp: new Date().toISOString(),
    }));

    setConflicts(detectedConflicts);
    setShowConflictResolution(true);
    errorHandling.setFormError('Concurrent update detected. Please resolve conflicts.');
  }, [formData, errorHandling]);

  // Handle form submission with enhanced error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUpdate) {
      errorHandling.setFormError('You do not have permission to update vehicles');
      return;
    }

    // Check if max submit attempts reached
    if (formStateManager.isMaxSubmitAttemptsReached()) {
      errorHandling.setFormError('Maximum submission attempts reached. Please refresh the page and try again.');
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      errorHandling.setValidationErrors(errors);
      formStateManager.touchAllFields();
      return;
    }

    // Clear all errors before submission
    errorHandling.clearAllErrors();
    formStateManager.setSubmitting(true);
    formStateManager.incrementSubmitAttempts();

    try {
      // Use the error handling wrapper for the async operation
      const updatedVehicle = await errorHandling.wrapAsyncOperation(async () => {
        // Prepare update data
        const updateData: Partial<Vehicle> = {};

        // Only include changed fields
        if (formData.name !== vehicle.name) updateData.name = formData.name;
        if (formData.plateNumber !== vehicle.plateNumber) updateData.plateNumber = formData.plateNumber;
        if (formData.make !== (vehicle.make || '')) updateData.make = formData.make || undefined;
        if (formData.model !== (vehicle.model || '')) updateData.model = formData.model || undefined;
        if (formData.year !== (vehicle.year || '')) updateData.year = formData.year || undefined;
        if (formData.vin !== (vehicle.vin || '')) updateData.vin = formData.vin || undefined;
        if (formData.driver !== vehicle.driver) updateData.driver = formData.driver;
        if (formData.status !== vehicle.status) updateData.status = formData.status;
        if (formData.maxFuelCapacity !== vehicle.maxFuelCapacity) updateData.maxFuelCapacity = Number(formData.maxFuelCapacity);
        if (formData.odometer !== vehicle.odometer) updateData.odometer = Number(formData.odometer);
        if (formData.fuelConsumption !== vehicle.fuelConsumption) updateData.fuelConsumption = Number(formData.fuelConsumption);

        // Handle location updates
        if (
          formData.location.lat !== vehicle.location.lat ||
          formData.location.lng !== vehicle.location.lng ||
          formData.location.address !== vehicle.location.address
        ) {
          updateData.location = {
            lat: Number(formData.location.lat),
            lng: Number(formData.location.lng),
            address: formData.location.address,
          };
        }

        // Perform update with optimistic UI updates
        return await updateVehicle(vehicle.id, updateData, true);
      });

      // Success - save form state and reset
      formStateManager.save();
      setHasUnsavedChanges(false);
      onSuccess?.(updatedVehicle);

    } catch (error) {
      console.error('Vehicle update failed:', error);

      // Handle specific error types with enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('plate number') || error.message.includes('already exists')) {
          errorHandling.setValidationError('plateNumber', 'This plate number is already in use by another vehicle');
        } else if (error.message.includes('VIN') || error.message.includes('already exists')) {
          errorHandling.setValidationError('vin', 'This VIN is already in use by another vehicle');
        } else if (error.message.includes('conflict') || error.message.includes('concurrent')) {
          // Handle concurrent update conflicts
          handleUpdateConflict(error.message);
        } else if (error.message.includes('validation')) {
          // Handle server-side validation errors
          try {
            const validationResponse = JSON.parse(error.message);
            errorHandling.handleValidationResponse(validationResponse);
          } catch {
            errorHandling.setFormError(error.message);
          }
        }
        // Network and other errors are handled by the wrapAsyncOperation
      }
    } finally {
      formStateManager.setSubmitting(false);
    }
  }, [canUpdate, formData, vehicle, validateForm, updateVehicle, onSuccess, handleUpdateConflict, errorHandling, formStateManager]);

  // Handle conflict resolution
  const resolveConflict = useCallback((field: string, useIncoming: boolean) => {
    if (useIncoming) {
      // In a real implementation, we'd use the actual incoming value
      // For now, we'll just remove the conflict
      setConflicts(prev => prev.filter(c => c.field !== field));
    } else {
      // Keep current value, just remove from conflicts
      setConflicts(prev => prev.filter(c => c.field !== field));
    }

    // If no more conflicts, hide resolution UI
    if (conflicts.length <= 1) {
      setShowConflictResolution(false);
      setConflicts([]);
    }
  }, [conflicts]);

  // Retry failed update
  const retryUpdate = useCallback(() => {
    errorHandling.clearAllErrors();
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  }, [handleSubmit, errorHandling]);

  // Get pending update for this vehicle
  const pendingUpdate = useMemo(() => {
    return Object.values(pendingUpdates).find(update => update.vehicleId === vehicle.id);
  }, [pendingUpdates, vehicle.id]);

  // Connection status indicator
  const connectionStatus = useMemo(() => {
    switch (connectionState.status) {
      case 'connected':
        return { color: 'text-green-600', text: 'Connected', icon: '●' };
      case 'connecting':
        return { color: 'text-yellow-600', text: 'Connecting...', icon: '◐' };
      case 'disconnected':
        return { color: 'text-red-600', text: 'Disconnected', icon: '○' };
      case 'error':
        return { color: 'text-red-600', text: 'Connection Error', icon: '✕' };
      default:
        return { color: 'text-gray-600', text: 'Unknown', icon: '?' };
    }
  }, [connectionState.status]);

  if (!canUpdate) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Access Denied
            </h3>
            <div className="mt-2 text-sm text-red-700">
              You do not have permission to update vehicle information.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-lg rounded-lg ${className}`}>
      {/* Header with connection status */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Update Vehicle: {vehicle.name}
          </h2>
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className={`flex items-center text-sm ${connectionStatus.color}`}>
              <span className="mr-1">{connectionStatus.icon}</span>
              {connectionStatus.text}
              {connectionState.fallbackMode && (
                <span className="ml-1 text-xs text-gray-500">(Polling)</span>
              )}
            </div>

            {/* Pending update indicator */}
            {pendingUpdate && (
              <div className={`flex items-center text-sm ${pendingUpdate.status === 'pending' ? 'text-yellow-600' :
                pendingUpdate.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                {pendingUpdate.status === 'pending' && '⏳ Updating...'}
                {pendingUpdate.status === 'success' && '✓ Updated'}
                {pendingUpdate.status === 'error' && '✕ Failed'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conflict resolution UI */}
      {showConflictResolution && conflicts.length > 0 && (
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800 mb-3">
            Resolve Update Conflicts
          </h3>
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div key={conflict.field} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {conflict.field.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Your value: <span className="font-mono">{String(conflict.currentValue)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Other user's value: <span className="font-mono">{String(conflict.incomingValue)}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={() => resolveConflict(conflict.field, false)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Keep Mine
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveConflict(conflict.field, true)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Use Theirs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Error Display */}
      <div className="px-6 py-4 space-y-4">
        {/* Network Error Handler */}
        {errorHandling.errorState.networkError && (
          <NetworkErrorHandler
            error={errorHandling.errorState.networkError}
            onRetry={errorHandling.canRetry ? errorHandling.retry : undefined}
            onDismiss={errorHandling.clearNetworkError}
            maxRetries={3}
            showAutoRetry={false}
          />
        )}

        {/* Form Error Display */}
        {errorHandling.errorState.formError && (
          <ErrorDisplay
            error={errorHandling.errorState.formError}
            type="form"
            onDismiss={errorHandling.clearFormError}
          />
        )}

        {/* Validation Error Summary */}
        {errorHandling.hasValidationErrors && (
          <ValidationErrorSummary
            errors={Object.entries(errorHandling.errorState.validationErrors).map(([field, message]) => ({
              field,
              message,
            }))}
            touched={formStateManager.getState().touched}
            showOnlyTouched={true}
            onFieldFocus={(field) => {
              const element = document.querySelector(`[name="${field}"], #${field}`);
              if (element && 'focus' in element) {
                (element as HTMLElement).focus();
              }
            }}
            collapsible={true}
            maxVisible={5}
          />
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 border-b pb-2">
              Basic Information
            </h3>

            {/* Vehicle Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Vehicle Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="Enter vehicle name"
              />
              {errorHandling.errorState.validationErrors.name && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.name}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>

            {/* Plate Number */}
            <div>
              <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">
                Plate Number *
              </label>
              <input
                type="text"
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => handleInputChange('plateNumber', e.target.value.toUpperCase())}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.plateNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="ABC-123"
              />
              {errorHandling.errorState.validationErrors.plateNumber && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.plateNumber}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>

            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                Make
              </label>
              <input
                type="text"
                id="make"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Toyota, Ford, etc."
              />
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Camry, F-150, etc."
              />
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value ? parseInt(e.target.value) : '')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.year ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errorHandling.errorState.validationErrors.year && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.year}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>

            {/* VIN */}
            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                VIN
              </label>
              <input
                type="text"
                id="vin"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.vin ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="17-character VIN"
                maxLength={17}
              />
              {errorHandling.errorState.validationErrors.vin && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.vin}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>
          </div>

          {/* Operational Information */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 border-b pb-2">
              Operational Information
            </h3>

            {/* Driver */}
            <div>
              <label htmlFor="driver" className="block text-sm font-medium text-gray-700">
                Driver *
              </label>
              <input
                type="text"
                id="driver"
                value={formData.driver}
                onChange={(e) => handleInputChange('driver', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.driver ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="Driver name"
              />
              {errorHandling.errorState.validationErrors.driver && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.driver}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Vehicle['status'])}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-medium text-gray-900 border-b pb-2">
            Technical Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fuel Capacity */}
            <div>
              <label htmlFor="maxFuelCapacity" className="block text-sm font-medium text-gray-700">
                Fuel Capacity (L) *
              </label>
              <input
                type="number"
                id="maxFuelCapacity"
                value={formData.maxFuelCapacity}
                onChange={(e) => handleInputChange('maxFuelCapacity', e.target.value ? parseFloat(e.target.value) : '')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.maxFuelCapacity ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="60"
                min="0"
                step="0.1"
              />
              {errorHandling.errorState.validationErrors.maxFuelCapacity && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.maxFuelCapacity}
                  type="field"
                  showIcon={false}
                />
              )}
              <div className="mt-1 text-xs text-gray-500 space-y-1">
                <p>Current fuel level: {vehicle.fuelLevel}L</p>
                <p>Must be ≥ current fuel level</p>
              </div>
            </div>

            {/* Odometer */}
            <div>
              <label htmlFor="odometer" className="block text-sm font-medium text-gray-700">
                Odometer Reading (km) *
              </label>
              <input
                type="number"
                id="odometer"
                value={formData.odometer}
                onChange={(e) => handleInputChange('odometer', e.target.value ? parseFloat(e.target.value) : '')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.odometer ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="50000"
                min="0"
                step="0.1"
              />
              {errorHandling.errorState.validationErrors.odometer && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.odometer}
                  type="field"
                  showIcon={false}
                />
              )}
              <div className="mt-1 text-xs text-gray-500 space-y-1">
                <p>Current reading: {vehicle.odometer} km</p>
                <p>Must be ≥ current reading</p>
              </div>
            </div>

            {/* Fuel Consumption */}
            <div>
              <label htmlFor="fuelConsumption" className="block text-sm font-medium text-gray-700">
                Fuel Consumption (L/100km) *
              </label>
              <input
                type="number"
                id="fuelConsumption"
                value={formData.fuelConsumption}
                onChange={(e) => handleInputChange('fuelConsumption', e.target.value ? parseFloat(e.target.value) : '')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors.fuelConsumption ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="8.5"
                min="0"
                step="0.1"
              />
              {errorHandling.errorState.validationErrors.fuelConsumption && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors.fuelConsumption}
                  type="field"
                  showIcon={false}
                />
              )}
              <div className="mt-1 text-xs text-gray-500 space-y-1">
                <p>Current rate: {vehicle.fuelConsumption} L/100km</p>
                <p>Typical range: 5-15 L/100km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-medium text-gray-900 border-b pb-2">
            Location Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Latitude */}
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                id="lat"
                value={formData.location.lat}
                onChange={(e) => handleInputChange('location.lat', e.target.value ? parseFloat(e.target.value) : '')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors['location.lat'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="40.7128"
                min="-90"
                max="90"
                step="any"
              />
              {errorHandling.errorState.validationErrors['location.lat'] && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors['location.lat']}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>

            {/* Longitude */}
            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                id="lng"
                value={formData.location.lng}
                onChange={(e) => handleInputChange('location.lng', e.target.value ? parseFloat(e.target.value) : '')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorHandling.errorState.validationErrors['location.lng'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                placeholder="-74.0060"
                min="-180"
                max="180"
                step="any"
              />
              {errorHandling.errorState.validationErrors['location.lng'] && (
                <ErrorDisplay
                  error={errorHandling.errorState.validationErrors['location.lng']}
                  type="field"
                  showIcon={false}
                />
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
        </div>

        {/* Warning Dialog */}
        {warningDialog.isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Confirm Update
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {warningDialog.message}
                  </p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={warningDialog.onCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={warningDialog.onConfirm}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Form Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <span className="text-sm text-yellow-600">
                ● Unsaved changes
              </span>
            )}
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={formStateManager.getState().isSubmitting || !hasUnsavedChanges || showConflictResolution}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${formStateManager.getState().isSubmitting || !hasUnsavedChanges || showConflictResolution
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {formStateManager.getState().isSubmitting ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleUpdateForm;