import React, { useState } from 'react';
import { Save, Shield, Key, Plus, Eye, EyeOff, Copy, RefreshCw, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { SecuritySettings as SecuritySettingsType, ApiKey } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { useResponsiveContext } from '../../contexts/ResponsiveContext';

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'pk_live_••••••••••••••••••••••••',
    type: 'production',
    status: 'active',
    permissions: ['read', 'write'],
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date()
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'pk_test_••••••••••••••••••••••••',
    type: 'development',
    status: 'active',
    permissions: ['read'],
    createdAt: new Date('2024-02-01'),
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

export const SecuritySettings: React.FC = () => {
  const { isMobile } = useResponsive();
  const { expandedCards, toggleExpandedCard } = useResponsiveContext();
  const [settings, setSettings] = useState<SecuritySettingsType>({
    sessionTimeout: 60,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    maxFailedLogins: 5,
    twoFactorAuth: false,
    ipWhitelist: []
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'production' | 'development' | 'test'>('development');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving security settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const generateApiKey = () => {
    const prefix = newKeyType === 'production' ? 'pk_live_' : 'pk_test_';
    const randomKey = prefix + Math.random().toString(36).substring(2, 32);
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: randomKey,
      type: newKeyType,
      status: 'active',
      permissions: ['read'],
      createdAt: new Date()
    };

    setApiKeys([...apiKeys, newKey]);
    setShowNewKeyModal(false);
    setNewKeyName('');
  };

  const revokeApiKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: 'revoked' as const } : key
      ));
    }
  };

  const deleteApiKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getKeyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900';
      case 'inactive': return 'text-gray-400 bg-gray-900';
      case 'revoked': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case 'production': return 'text-red-400 bg-red-900';
      case 'development': return 'text-blue-400 bg-blue-900';
      case 'test': return 'text-amber-400 bg-amber-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  return (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Security Settings
          </h2>
          {!isMobile && (
            <p className="text-gray-600">Manage API keys, security policies, and access controls</p>
          )}
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${isMobile ? 'w-full justify-center min-h-[44px]' : ''}`}
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {isMobile ? (
        /* Mobile: Expandable Card Layout */
        <div className="space-y-4">
          {/* API Keys Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('api-keys')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewKeyModal(true);
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Generate New API Key"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {expandedCards.includes('api-keys') ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            {expandedCards.includes('api-keys') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-3 mt-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium text-sm truncate">{apiKey.name}</h4>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getKeyTypeColor(apiKey.type)}`}>
                              {apiKey.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getKeyStatusColor(apiKey.status)}`}>
                              {apiKey.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {apiKey.status === 'active' && (
                            <button
                              onClick={() => revokeApiKey(apiKey.id)}
                              className="p-2 text-amber-400 hover:text-amber-300 hover:bg-gray-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Revoke key"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Delete key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <code className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-300 font-mono block truncate">
                          {apiKey.key}
                        </code>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        Created: {apiKey.createdAt.toLocaleDateString()}<br />
                        Last used: {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Policies Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('security-policies')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Security Policies</h3>
                </div>
                {expandedCards.includes('security-policies') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('security-policies') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Failed Login Attempts</label>
                    <input
                      type="number"
                      value={settings.maxFailedLogins}
                      onChange={(e) => setSettings({...settings, maxFailedLogins: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                      <p className="text-xs text-gray-600">Require 2FA for all users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Password Policy Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpandedCard('password-policy')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Password Policy</h3>
                </div>
                {expandedCards.includes('password-policy') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCards.includes('password-policy') && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                    <input
                      type="number"
                      value={settings.passwordPolicy.minLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        passwordPolicy: {
                          ...settings.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400 min-h-[44px]"
                      min="6"
                      max="32"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'requireUppercase', label: 'Require uppercase letters' },
                      { key: 'requireLowercase', label: 'Require lowercase letters' },
                      { key: 'requireNumbers', label: 'Require numbers' },
                      { key: 'requireSpecialChars', label: 'Require special characters' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">{label}</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.passwordPolicy[key as keyof typeof settings.passwordPolicy] as boolean}
                            onChange={(e) => setSettings({
                              ...settings,
                              passwordPolicy: {
                                ...settings.passwordPolicy,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-400" />
                API Keys
              </h3>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Generate New API Key</span>
              </button>
            </div>

            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-medium">{apiKey.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKeyTypeColor(apiKey.type)}`}>
                          {apiKey.type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKeyStatusColor(apiKey.status)}`}>
                          {apiKey.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <code className="bg-white border border-gray-200 px-3 py-1 rounded text-sm text-gray-300 font-mono">
                          {apiKey.key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="text-gray-400 hover:text-white"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        Created: {apiKey.createdAt.toLocaleDateString()} • 
                        Last used: {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {apiKey.status === 'active' && (
                        <button
                          onClick={() => revokeApiKey(apiKey.id)}
                          className="text-amber-400 hover:text-amber-300"
                          title="Revoke key"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Policies */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Security Policies
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  min="5"
                  max="480"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Failed Login Attempts</label>
                <input
                  type="number"
                  value={settings.maxFailedLogins}
                  onChange={(e) => setSettings({...settings, maxFailedLogins: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  min="1"
                  max="10"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                  <p className="text-xs text-gray-600">Require 2FA for all users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Password Policy */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                <input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: {
                      ...settings.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                  min="6"
                  max="32"
                />
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'requireUppercase', label: 'Require uppercase letters' },
                  { key: 'requireLowercase', label: 'Require lowercase letters' },
                  { key: 'requireNumbers', label: 'Require numbers' },
                  { key: 'requireSpecialChars', label: 'Require special characters' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">{label}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.passwordPolicy[key as keyof typeof settings.passwordPolicy] as boolean}
                        onChange={(e) => setSettings({
                          ...settings,
                          passwordPolicy: {
                            ...settings.passwordPolicy,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Mobile App API Key"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Type</label>
                <select
                  value={newKeyType}
                  onChange={(e) => setNewKeyType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-secondary-400"
                >
                  <option value="development">Development</option>
                  <option value="test">Test</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateApiKey}
                disabled={!newKeyName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};