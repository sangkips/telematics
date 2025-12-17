import React, { useState } from 'react';
import { Save, Globe, Database, Clock, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import { SystemSettings as SystemSettingsType } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { useResponsiveContext } from '../../contexts/ResponsiveContext';

export const SystemSettings: React.FC = () => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const [settings, setSettings] = useState<SystemSettingsType>({
    companyName: 'Fleet Management Corp',
    apiEndpoint: 'https://api.fleetmanagement.com/v1',
    dataRetentionPeriod: 365,
    timezone: 'UTC',
    language: 'en',
    currency: 'USD'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would make an API call
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            System Settings
          </h2>
          {!isMobile && (
            <p className="text-gray-600">Configure global system parameters and preferences</p>
          )}
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            saved 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          } ${isMobile ? 'w-full justify-center min-h-[44px]' : ''}`}
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {isMobile ? (
        /* Mobile: Expandable Card Layout */
        <div className="space-y-4">
          {/* Company Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('company-info')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                </div>
                {expandedCards.includes('company-info') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('company-info') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                    <input
                      type="url"
                      value={settings.apiEndpoint}
                      onChange={(e) => setSettings({...settings, apiEndpoint: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Base URL for API consumption</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Management Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('data-management')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                </div>
                {expandedCards.includes('data-management') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('data-management') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Period</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={settings.dataRetentionPeriod}
                        onChange={(e) => setSettings({...settings, dataRetentionPeriod: parseInt(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                        min="1"
                        max="3650"
                      />
                      <span className="text-gray-600">days</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">How long to keep historical data</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Localization Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('localization')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Localization</h3>
                </div>
                {expandedCards.includes('localization') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('localization') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Financial Settings Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('financial-settings')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Financial Settings</h3>
                </div>
                {expandedCards.includes('financial-settings') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('financial-settings') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-400" />
              Company Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                <input
                  type="url"
                  value={settings.apiEndpoint}
                  onChange={(e) => setSettings({...settings, apiEndpoint: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                />
                <p className="text-xs text-gray-400 mt-1">Base URL for API consumption</p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-400" />
              Data Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Period</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.dataRetentionPeriod}
                    onChange={(e) => setSettings({...settings, dataRetentionPeriod: parseInt(e.target.value)})}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                    min="1"
                    max="3650"
                  />
                  <span className="text-gray-600">days</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">How long to keep historical data</p>
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Localization
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-amber-400" />
              Financial Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Configuration */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limiting</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requests per minute</span>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-brand-secondary-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requests per hour</span>
                <input
                  type="number"
                  defaultValue="10000"
                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-brand-secondary-400"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CORS Settings</label>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  placeholder="Allowed origins (comma separated)"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-brand-secondary-400"
                  defaultValue="https://dashboard.company.com, https://mobile.company.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};