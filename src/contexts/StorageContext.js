import React, { createContext, useContext, useState, useEffect } from 'react';
import { disableAutoSync } from '../services/syncService';
import * as storageAdapter from '../services/storageAdapter';

const StorageContext = createContext(null);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  // Storage mode: 'cloud' or 'local'
  const [storageMode, setStorageModeState] = useState('cloud');

  // Sync settings (for local mode)
  const [syncEnabled, setSyncEnabledState] = useState(false);
  const [syncFrequency, setSyncFrequencyState] = useState('manual');

  // Loading state
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from user settings on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const settings = user?.settings || {};

      const mode = settings.storageMode || 'cloud';
      setStorageModeState(mode);
      setSyncEnabledState(settings.syncEnabled || false);
      setSyncFrequencyState('manual'); // Always manual for true zero-knowledge
      setIsInitialized(true);

      // Update storageAdapter so it knows which mode to use
      storageAdapter.setStorageMode(mode);

      // TRUE ZERO-KNOWLEDGE: Auto-sync is disabled, all syncs require password
    } catch (error) {
      console.error('Error initializing storage settings:', error);
      // Set defaults if there's an error
      setStorageModeState('cloud');
      setSyncEnabledState(false);
      setSyncFrequencyState('manual');
      setIsInitialized(true);
      storageAdapter.setStorageMode('cloud');
    }
  }, []);

  // Refresh settings from localStorage (called after signup/login)
  const refreshFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const settings = user?.settings || {};

      const mode = settings.storageMode || 'cloud';
      setStorageModeState(mode);
      setSyncEnabledState(settings.syncEnabled || false);
      setSyncFrequencyState('manual'); // Always manual for true zero-knowledge

      // Update storageAdapter so it knows which mode to use
      storageAdapter.setStorageMode(mode);
      console.log('🔄 StorageAdapter mode updated to:', mode);

      // TRUE ZERO-KNOWLEDGE: Auto-sync is disabled, all syncs require password
    } catch (error) {
      console.error('Error refreshing storage settings:', error);
    }
  };

  // Update storage mode
  const setStorageMode = async (mode) => {
    setStorageModeState(mode);

    // Update storageAdapter
    storageAdapter.setStorageMode(mode);

    // Save to user settings
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.settings = user.settings || {};
    user.settings.storageMode = mode;
    localStorage.setItem('user', JSON.stringify(user));

    // Update on server
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          storageMode: mode,
        }),
      });
    } catch (error) {
      console.error('Failed to update storage mode:', error);
    }
  };

  // Update sync enabled
  const setSyncEnabled = async (enabled) => {
    setSyncEnabledState(enabled);

    // Save to user settings
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.settings = user.settings || {};
    user.settings.syncEnabled = enabled;
    localStorage.setItem('user', JSON.stringify(user));

    // TRUE ZERO-KNOWLEDGE: No auto-sync, all syncs are manual and require password

    // Update on server
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          syncEnabled: enabled,
        }),
      });
    } catch (error) {
      console.error('Failed to update sync enabled:', error);
    }
  };

  // Update sync frequency (not used for true zero-knowledge, always manual)
  const setSyncFrequency = async (frequency) => {
    // TRUE ZERO-KNOWLEDGE: Frequency is always 'manual', but keep this for compatibility
    setSyncFrequencyState('manual');
  };

  // Cleanup on logout
  const cleanup = () => {
    disableAutoSync();
  };

  const value = {
    storageMode,
    setStorageMode,
    syncEnabled,
    setSyncEnabled,
    syncFrequency,
    setSyncFrequency,
    isInitialized,
    cleanup,
    refreshFromLocalStorage,
    isLocalMode: storageMode === 'local',
    isCloudMode: storageMode === 'cloud',
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
