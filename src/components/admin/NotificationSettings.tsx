import React, { useState } from 'react';
import { Save, Bell, Mail, MessageSquare, Webhook, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { useResponsiveContext } from '../../contexts/ResponsiveContext';

export const NotificationSettings: React.FC = () => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const [settings, setSettings] = useState<NotificationSettingsType>({
    maxSpeed: 80,
    lowFuelThreshold: 20,
    fuelTheftThreshold: 15,
    maintenanceReminder: true,
    channels: {
      email: true,
      sms: false,
      push: true,
      webhook: false
    },
    webhookUrl: '',
    emailRecipients: ['admin@company.com', 'fleet@company.com']
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateChannel = (channel: keyof NotificationSettingsType['channels'], enabled: boolean) => {
    setSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: enabled
      }
    });
  };

  const addEmailRecipient = () => {
    const email = prompt('Enter email address:');
    if (email && email.includes('@')) {
      setSettings({
        ...settings,
        emailRecipients: [...settings.emailRecipients, email]
      });
    }
  };

  const removeEmailRecipient = (index: number) => {
    setSettings({
      ...settings,
      emailRecipients: settings.emailRecipients.filter((_, i) => i !== index)
    });
  };

  return (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Notification Settings
          </h2>
          {!isMobile && (
            <p className="text-gray-600">Configure alert thresholds and notification channels</p>
          )}
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-brand-accent-600 hover:bg-brand-accent-700 text-white'
          } ${isMobile ? 'w-full justify-center min-h-[44px]' : ''}`}
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {isMobile ? (
        /* Mobile: Expandable Card Layout */
        <div className="space-y-4">
          {/* Alert Thresholds Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('alert-thresholds')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Alert Thresholds</h3>
                </div>
                {expandedCards.includes('alert-thresholds') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('alert-thresholds') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Speed Alert</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={settings.maxSpeed}
                        onChange={(e) => setSettings({...settings, maxSpeed: parseInt(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                        min="1"
                        max="200"
                      />
                      <span className="text-gray-600">km/h</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Alert when vehicle exceeds this speed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Fuel Alert</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={settings.lowFuelThreshold}
                        onChange={(e) => setSettings({...settings, lowFuelThreshold: parseInt(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                        min="1"
                        max="50"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Alert when fuel level drops below this percentage</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Theft Detection</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={settings.fuelTheftThreshold}
                        onChange={(e) => setSettings({...settings, fuelTheftThreshold: parseInt(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                        min="1"
                        max="50"
                      />
                      <span className="text-gray-600">L</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Alert when fuel drops by this amount suddenly</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Maintenance Reminders</label>
                      <p className="text-xs text-gray-600">Send periodic maintenance alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceReminder}
                        onChange={(e) => setSettings({...settings, maintenanceReminder: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Channels Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('notification-channels')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3>
                </div>
                {expandedCards.includes('notification-channels') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('notification-channels') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-green-400 mr-3" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-600">Send alerts via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.channels.email}
                        onChange={(e) => updateChannel('email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                        <p className="text-xs text-gray-600">Send alerts via SMS</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.channels.sms}
                        onChange={(e) => updateChannel('sms', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 text-purple-400 mr-3" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                        <p className="text-xs text-gray-600">Browser/mobile push alerts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.channels.push}
                        onChange={(e) => updateChannel('push', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Webhook className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Webhook</label>
                        <p className="text-xs text-gray-600">Send to external systems</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.channels.webhook}
                        onChange={(e) => updateChannel('webhook', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                    </label>
                  </div>
                  
                  {settings.channels.webhook && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                      <input
                        type="url"
                        value={settings.webhookUrl}
                        onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                        placeholder="https://your-system.com/webhook"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alert Thresholds */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
              Alert Thresholds
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Speed Alert</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.maxSpeed}
                    onChange={(e) => setSettings({...settings, maxSpeed: parseInt(e.target.value)})}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                    min="1"
                    max="200"
                  />
                  <span className="text-gray-600">km/h</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Alert when vehicle exceeds this speed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Fuel Alert</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.lowFuelThreshold}
                    onChange={(e) => setSettings({...settings, lowFuelThreshold: parseInt(e.target.value)})}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                    min="1"
                    max="50"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Alert when fuel level drops below this percentage</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Theft Detection</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.fuelTheftThreshold}
                    onChange={(e) => setSettings({...settings, fuelTheftThreshold: parseInt(e.target.value)})}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                    min="1"
                    max="50"
                  />
                  <span className="text-gray-600">L</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Alert when fuel drops by this amount suddenly</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Reminders</label>
                  <p className="text-xs text-gray-600">Send periodic maintenance alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceReminder}
                    onChange={(e) => setSettings({...settings, maintenanceReminder: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-400" />
              Notification Channels
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-600">Send alerts via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.channels.email}
                    onChange={(e) => updateChannel('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-blue-400 mr-3" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-xs text-gray-600">Send alerts via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.channels.sms}
                    onChange={(e) => updateChannel('sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-600">Browser/mobile push alerts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.channels.push}
                    onChange={(e) => updateChannel('push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Webhook className="w-5 h-5 text-orange-400 mr-3" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Webhook</label>
                    <p className="text-xs text-gray-600">Send to external systems</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.channels.webhook}
                    onChange={(e) => updateChannel('webhook', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent-600"></div>
                </label>
              </div>
              
              {settings.channels.webhook && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                    placeholder="https://your-system.com/webhook"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Recipients */}
      {settings.channels.email && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-green-400" />
            Email Recipients
          </h3>
          
          <div className="space-y-3">
            {settings.emailRecipients.map((email, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
                <span className="text-white">{email}</span>
                <button
                  onClick={() => removeEmailRecipient(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button
              onClick={addEmailRecipient}
              className="w-full border-2 border-dashed border-gray-600 rounded-lg py-3 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
            >
              + Add Email Recipient
            </button>
          </div>
        </div>
      )}
    </div>
  );
};