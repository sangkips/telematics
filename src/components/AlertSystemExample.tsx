import React, { useState } from 'react';
import { AlertSystemProvider } from '../contexts/AlertSystemContext';
import { AlertDashboard } from './AlertDashboard';
import { CreateAlertModal } from './CreateAlertModal';
import { AlertNotifications } from './AlertNotifications';
import { useResponsive } from '../hooks/useResponsive';

export const AlertSystemExample: React.FC = () => {
  const { isMobile } = useResponsive();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <AlertSystemProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Header with Notifications */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white">
                  Fleet Alert System
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors ${
                    isMobile ? 'text-sm' : ''
                  }`}
                >
                  Create Alert
                </button>
                <AlertNotifications />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto">
          <AlertDashboard />
        </main>

        {/* Create Alert Modal */}
        <CreateAlertModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AlertSystemProvider>
  );
};

// Usage in your main App component:
export const AppWithAlerts: React.FC = () => {
  return (
    <div>
      {/* Your existing app content */}
      
      {/* Alert System Integration */}
      <AlertSystemExample />
    </div>
  );
};