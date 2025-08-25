import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, X, Bell } from 'lucide-react';
import { useAlertSystem } from '../contexts/AlertSystemContext';
import { useResponsive } from '../hooks/useResponsive';
import { Alert } from '../types/alerts';

interface AlertNotification {
  id: string;
  alert: Alert;
  timestamp: Date;
  read: boolean;
}

export const AlertNotifications: React.FC = () => {
  const { isMobile } = useResponsive();
  const { alerts } = useAlertSystem();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  // Monitor for new alerts
  useEffect(() => {
    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    
    if (activeAlerts.length > lastAlertCount) {
      // New alerts detected
      const newAlerts = activeAlerts.slice(lastAlertCount);
      const newNotifications = newAlerts.map(alert => ({
        id: `notification-${alert.id}-${Date.now()}`,
        alert,
        timestamp: new Date(),
        read: false
      }));
      
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50
      
      // Show browser notification for critical alerts
      newAlerts.forEach(alert => {
        if (alert.severity === 'critical' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`Critical Alert: ${alert.title}`, {
              body: alert.message,
              icon: '/alert-icon.png',
              tag: alert.id
            });
          }
        }
      });
    }
    
    setLastAlertCount(activeAlerts.length);
  }, [alerts, lastAlertCount]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900 border-red-700';
      case 'high': return 'text-orange-400 bg-orange-900 border-orange-700';
      case 'medium': return 'text-amber-400 bg-amber-900 border-amber-700';
      case 'low': return 'text-blue-400 bg-blue-900 border-blue-700';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700 ${
          isMobile ? 'min-h-[44px] min-w-[44px]' : ''
        }`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Notification Panel */}
          <div className={`absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 ${
            isMobile ? 'w-screen max-w-sm -mr-4' : 'w-96'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-gray-750' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.alert.severity === 'critical' ? 'bg-red-500' :
                          notification.alert.severity === 'high' ? 'bg-orange-500' :
                          notification.alert.severity === 'medium' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.alert.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {notification.alert.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(notification.alert.severity)}`}>
                                  {notification.alert.severity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {notification.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-white rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700">
                <button
                  onClick={() => {
                    setNotifications([]);
                    setShowNotifications(false);
                  }}
                  className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};