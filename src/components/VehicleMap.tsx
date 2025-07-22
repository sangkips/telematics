import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Zap, Maximize, Minimize, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Vehicle } from '../types';
import { useResponsive } from '../hooks/useResponsive';
import { useResponsiveContext } from '../contexts/ResponsiveContext';
import { BottomSheet } from './BottomSheet';
import { VehicleDetails } from './VehicleDetails';
import { triggerHapticFeedback } from '../utils/responsive';

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
  const { isMobile, touchDevice } = useResponsive();
  const { bottomSheetOpen, setBottomSheetOpen } = useResponsiveContext();

  // Map state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedVehicleForSheet, setSelectedVehicleForSheet] = useState<Vehicle | null>(null);

  // Touch/gesture state
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Touch distance calculation for pinch gestures
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - start dragging
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY
      });
    } else if (e.touches.length === 2) {
      // Two touches - start pinching
      setIsPinching(true);
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling

    if (e.touches.length === 1 && isDragging && !isPinching) {
      // Single touch drag - pan the map
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;

      // Limit panning based on zoom level
      const maxPan = 100 * zoom;
      setPanX(Math.max(-maxPan, Math.min(maxPan, newX)));
      setPanY(Math.max(-maxPan, Math.min(maxPan, newY)));
    } else if (e.touches.length === 2 && isPinching) {
      // Two touch pinch - zoom the map
      const currentDistance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const zoomDelta = currentDistance / lastTouchDistance;
        const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta));
        setZoom(newZoom);
      }
      setLastTouchDistance(currentDistance);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPinching(false);
    setLastTouchDistance(0);

    // Handle double tap to zoom
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      if (touchDevice) {
        triggerHapticFeedback('light');
      }
      setZoom(zoom === 1 ? 2 : 1);
      setPanX(0);
      setPanY(0);
    }
    setLastTap(now);
  };

  // Handle mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!touchDevice) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panX,
        y: e.clientY - panY
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !touchDevice) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const maxPan = 100 * zoom;
      setPanX(Math.max(-maxPan, Math.min(maxPan, newX)));
      setPanY(Math.max(-maxPan, Math.min(maxPan, newY)));
    }
  }, [isDragging, touchDevice, dragStart.x, dragStart.y, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging && !touchDevice) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, touchDevice, handleMouseMove, handleMouseUp]);

  // Handle vehicle selection
  const handleVehicleClick = (vehicle: Vehicle) => {
    if (touchDevice) {
      triggerHapticFeedback('light');
    }

    if (isMobile) {
      // On mobile, show bottom sheet
      setSelectedVehicleForSheet(vehicle);
      setBottomSheetOpen(true);
    } else {
      // On desktop, use existing callback
      onVehicleSelect?.(vehicle);
    }
  };

  // Control functions
  const handleZoomIn = () => {
    setZoom(Math.min(3, zoom * 1.2));
    if (touchDevice) triggerHapticFeedback('light');
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, zoom / 1.2));
    if (touchDevice) triggerHapticFeedback('light');
  };

  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    if (touchDevice) triggerHapticFeedback('medium');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (touchDevice) triggerHapticFeedback('medium');
  };

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

  const mapHeight = isFullScreen ? 'h-screen' : 'h-96';
  const mapClasses = isFullScreen
    ? 'fixed inset-0 z-50 bg-gray-900'
    : 'relative bg-gray-900 rounded-lg overflow-hidden';

  return (
    <>
      <div className={mapClasses}>
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className={`relative ${mapHeight} bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden select-none`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Map Content with Transform */}
          <div
            ref={mapRef}
            className="absolute inset-0 transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
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
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${touchDevice ? 'active:scale-95' : 'hover:scale-110'
                  } ${selectedVehicle?.id === vehicle.id || selectedVehicleForSheet?.id === vehicle.id
                    ? 'scale-125 z-10' : ''
                  }`}
                style={{
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index * 10)}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVehicleClick(vehicle);
                }}
              >
                {/* Marker */}
                <div className={`relative ${getMarkerColor(vehicle)} rounded-full p-2 shadow-lg border-2 border-white ${touchDevice ? 'min-w-[44px] min-h-[44px] flex items-center justify-center' : ''
                  }`}>
                  {getMarkerIcon(vehicle)}
                </div>

                {/* Vehicle Info Popup - Only show on desktop hover */}
                {!touchDevice && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
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
                )}
              </div>
            ))}
          </div>

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
            {/* Full Screen Toggle */}
            <button
              onClick={toggleFullScreen}
              className="bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg shadow-lg hover:bg-opacity-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {/* Zoom Controls */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={handleZoomIn}
                className="bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg shadow-lg hover:bg-opacity-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg shadow-lg hover:bg-opacity-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* Reset View */}
            <button
              onClick={handleResetView}
              className="bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg shadow-lg hover:bg-opacity-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Updates Indicator */}
          <div className="absolute top-4 left-4 flex items-center text-green-400 z-20">
            <Zap className="w-4 h-4 mr-1 animate-pulse" />
            <span className="text-sm">Live</span>
          </div>

          {/* Zoom Level Indicator */}
          {zoom !== 1 && (
            <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 text-white px-3 py-1 rounded-lg text-sm z-20">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Legend - Only show when not in full screen or on desktop */}
        {(!isFullScreen || !isMobile) && (
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
        )}
      </div>

      {/* Bottom Sheet for Mobile Vehicle Details */}
      {isMobile && selectedVehicleForSheet && (
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => {
            setBottomSheetOpen(false);
            setSelectedVehicleForSheet(null);
          }}
          title={selectedVehicleForSheet.name}
          snapPoints={[40, 70, 90]}
          initialSnap={1}
        >
          <VehicleDetails vehicle={selectedVehicleForSheet} />
        </BottomSheet>
      )}
    </>
  );
};