import React, { useState, useCallback, useRef } from 'react';
import { AlertTriangle, CheckCircle, Clock, X, MoreVertical, RefreshCw, Trash2, Check } from 'lucide-react';
import { Alert } from '../types';
import { useResponsive } from '../hooks/useResponsive';
import { useResponsiveContext } from '../contexts/ResponsiveContext';

interface AlertPanelProps {
  alerts: Alert[];
  onResolveAlert?: (alertId: string) => void;
  onDismissAlert?: (alertId: string) => void;
  onRefresh?: () => Promise<void>;
}

interface SwipeableAlertCardProps {
  alert: Alert;
  isSelected: boolean;
  onSelect: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  isMobile: boolean;
}

const SwipeableAlertCard: React.FC<SwipeableAlertCardProps> = ({
  alert,
  isSelected,
  onSelect,
  onResolve,
  onDismiss,
  isMobile
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  
  const isExpanded = expandedCards.includes(alert.id);

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

  // Touch/swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow left swipe (negative offset)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -120));
    }
  }, [isMobile, isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    setIsDragging(false);
    
    // Show actions if swiped far enough
    if (swipeOffset < -60) {
      setSwipeOffset(-120);
      setShowActions(true);
    } else {
      setSwipeOffset(0);
      setShowActions(false);
    }
  }, [isMobile, swipeOffset]);

  // Mouse handlers for desktop fallback
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    startX.current = e.clientX;
    setIsDragging(true);
  }, [isMobile]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile || !isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX.current;
    
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -120));
    }
  }, [isMobile, isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isMobile) return;
    setIsDragging(false);
    
    if (swipeOffset < -60) {
      setSwipeOffset(-120);
      setShowActions(true);
    } else {
      setSwipeOffset(0);
      setShowActions(false);
    }
  }, [isMobile, swipeOffset]);

  const handleCardClick = () => {
    if (isMobile && !showActions) {
      toggleExpandedCard(alert.id);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(alert.id);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action background */}
      {isMobile && (
        <div className="absolute right-0 top-0 h-full flex items-center bg-gray-700 rounded-r-lg">
          <div className="flex items-center space-x-2 px-4">
            {!alert.resolved && onResolve && (
              <button
                onClick={() => onResolve(alert.id)}
                className="p-2 bg-gray-900 rounded-full text-white hover:bg-gray-800 transition-colors"
                title="Resolve"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                title="Dismiss"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className={`rounded-lg border transition-transform duration-200 ${getSeverityColor(alert.severity)} ${
          alert.resolved ? 'opacity-50' : ''
        } ${isMobile ? 'cursor-pointer' : ''}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCardClick}
      >
        <div className={`p-4 ${isMobile ? 'min-h-[80px]' : ''}`}>
          <div className="flex items-start justify-between">
            {/* Selection checkbox for batch operations */}
            <div className="flex items-start space-x-3">
              {isMobile && (
                <button
                  onClick={handleSelectClick}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-gray-900 border-gray-900' 
                      : 'border-gray-400 hover:border-blue-400'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              )}
              
              {getSeverityIcon(alert.severity)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-sm font-medium ${getAlertTypeColor(alert.type)}`}>
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {alert.severity}
                  </span>
                </div>
                
                <p className={`text-white ${isMobile && !isExpanded ? 'line-clamp-2' : ''}`}>
                  {alert.message}
                </p>
                
                {/* Mobile: Show additional details when expanded */}
                {isMobile && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>Alert ID: {alert.id}</div>
                      {alert.vehicleId && <div>Vehicle: {alert.vehicleId}</div>}
                      <div>Created: {alert.timestamp.toLocaleString()}</div>
                      {alert.resolved && alert.resolvedAt && (
                        <div>Resolved: {alert.resolvedAt.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
                
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
            
            {/* Desktop actions */}
            {!isMobile && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectClick}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-gray-900 border-gray-900' 
                      : 'border-gray-400 hover:border-blue-400'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>
                
                {!alert.resolved && onResolve && (
                  <button
                    onClick={() => onResolve(alert.id)}
                    className="text-green-400 hover:text-green-300 transition-colors p-1"
                    title="Mark as resolved"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-gray-400 hover:text-gray-300 transition-colors p-1"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AlertPanel: React.FC<AlertPanelProps> = ({ 
  alerts, 
  onResolveAlert, 
  onDismissAlert,
  onRefresh
}) => {
  const { isMobile } = useResponsive();
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !onRefresh) return;
    startY.current = e.touches[0].clientY;
    scrollTop.current = containerRef.current?.scrollTop || 0;
  }, [isMobile, onRefresh]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !onRefresh) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only allow pull-to-refresh when at the top
    if (scrollTop.current === 0 && diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, 80);
      setPullDistance(distance);
      setIsPulling(distance > 40);
    }
  }, [isMobile, onRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || !onRefresh) return;
    
    if (isPulling && pullDistance > 40) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [isMobile, onRefresh, isPulling, pullDistance]);

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    const unresolved = alerts.filter(a => !a.resolved);
    setSelectedAlerts(
      selectedAlerts.length === unresolved.length 
        ? [] 
        : unresolved.map(a => a.id)
    );
  };

  const handleBatchResolve = () => {
    if (onResolveAlert) {
      selectedAlerts.forEach(alertId => onResolveAlert(alertId));
      setSelectedAlerts([]);
    }
  };

  const handleBatchDismiss = () => {
    if (onDismissAlert) {
      selectedAlerts.forEach(alertId => onDismissAlert(alertId));
      setSelectedAlerts([]);
    }
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

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const hasSelectedAlerts = selectedAlerts.length > 0;

  return (
    <div className="space-y-4">
      {/* Pull-to-refresh indicator */}
      {isMobile && onRefresh && (
        <div 
          className={`transition-all duration-200 overflow-hidden ${
            pullDistance > 0 ? 'h-16' : 'h-0'
          }`}
        >
          <div className="flex items-center justify-center h-16 text-gray-400">
            <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing || isPulling ? 'animate-spin' : ''}`} />
            <span className="text-sm">
              {isRefreshing ? 'Refreshing...' : isPulling ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Header with batch actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">
            Active Alerts ({unresolvedAlerts.length})
          </h3>
          {hasSelectedAlerts && (
            <span className="text-sm text-blue-400">
              {selectedAlerts.length} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isMobile && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-gray-300 transition-colors p-1"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            Real-time monitoring
          </div>
        </div>
      </div>

      {/* Batch action buttons */}
      {hasSelectedAlerts && (
        <div className={`flex items-center justify-between p-3 bg-gray-700 rounded-lg ${
          isMobile ? 'sticky bottom-0 z-10' : ''
        }`}>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {selectedAlerts.length === unresolvedAlerts.length ? 'Deselect All' : 'Select All'}
          </button>
          
          <div className="flex items-center space-x-2">
            {onResolveAlert && (
              <button
                onClick={handleBatchResolve}
                className={`px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm ${
                  isMobile ? 'min-h-[44px]' : ''
                }`}
              >
                Resolve ({selectedAlerts.length})
              </button>
            )}
            {onDismissAlert && (
              <button
                onClick={handleBatchDismiss}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm ${
                  isMobile ? 'min-h-[44px]' : ''
                }`}
              >
                Dismiss ({selectedAlerts.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alert cards */}
      <div 
        ref={containerRef}
        className="space-y-3 max-h-96 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {alerts
          .sort((a, b) => {
            // Sort by severity (critical first), then by timestamp (newest first)
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 4) - 
                               (severityOrder[b.severity as keyof typeof severityOrder] || 4);
            if (severityDiff !== 0) return severityDiff;
            return b.timestamp.getTime() - a.timestamp.getTime();
          })
          .map((alert) => (
            <SwipeableAlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedAlerts.includes(alert.id)}
              onSelect={handleSelectAlert}
              onResolve={onResolveAlert}
              onDismiss={onDismissAlert}
              isMobile={isMobile}
            />
          ))}
      </div>
    </div>
  );
};