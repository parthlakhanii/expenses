import {
  exportAllData,
  getSyncMetadata,
  updateSyncMetadata,
  setLastSyncTime,
  getLastSyncTime,
  importData,
} from './localStorageService';
import { encryptData, decryptData, deriveEncryptionKey } from './encryptionService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Sync state management
let syncInterval = null;
let isSyncing = false;

/**
 * Get authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Upload local data to server (encrypted)
 * TRUE ZERO-KNOWLEDGE: Requires password for each sync operation
 * @param {string} email - User's email
 * @param {string} password - User's password (used to derive encryption key)
 */
export const uploadToCloud = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required for encryption');
  }

  try {
    isSyncing = true;

    // Export all local data
    const localData = await exportAllData();

    // Derive encryption key from password (never stored)
    const encryptionKey = deriveEncryptionKey(email, password);

    // Encrypt the data
    const encryptedData = encryptData(localData, encryptionKey);

    const requestBody = {
      // userId is extracted from JWT token by backend auth middleware
      encryptedData,
      timestamp: Date.now(),
    };

    // Upload to server
    const response = await fetch(`${API_URL}/api/v1/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload to cloud');
    }

    const result = await response.json();

    // Update sync metadata
    await updateSyncMetadata({
      value: false, // No longer needs sync
      lastSyncTime: Date.now(),
      lastUploadTime: Date.now(),
    });

    await setLastSyncTime(Date.now());

    return result;
  } catch (error) {
    console.error('Upload to cloud failed:', error);
    throw error;
  } finally {
    isSyncing = false;
  }
};

/**
 * Download data from server and merge with local
 * TRUE ZERO-KNOWLEDGE: Requires password for each sync operation
 * @param {string} email - User's email
 * @param {string} password - User's password (used to derive encryption key)
 */
export const downloadFromCloud = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required for decryption');
  }

  try {
    isSyncing = true;

    const lastSync = await getLastSyncTime();

    // Download from server
    const response = await fetch(`${API_URL}/api/v1/sync/download?since=${lastSync}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download from cloud');
    }

    const result = await response.json();

    if (!result.data || !result.data.encryptedData) {
      // No data to sync
      return { synced: false, message: 'No data to sync' };
    }

    // Derive encryption key from password (never stored)
    const encryptionKey = deriveEncryptionKey(email, password);

    // Decrypt the data
    let decryptedData;
    try {
      decryptedData = decryptData(result.data.encryptedData, encryptionKey);
    } catch (decryptError) {
      // Decryption failed - likely wrong password or server data encrypted with different password
      console.error('❌ Decryption failed:', decryptError.message);
      return {
        synced: false,
        decryptionFailed: true,
        error: decryptError.message,
      };
    }

    // Import will be handled by the caller (to give them control over merge strategy)
    await setLastSyncTime(Date.now());

    return {
      synced: true,
      data: decryptedData,
      serverTimestamp: result.data.timestamp,
    };
  } catch (error) {
    console.error('Download from cloud failed:', error);
    throw error;
  } finally {
    isSyncing = false;
  }
};

/**
 * Two-way sync: upload local changes, then download server changes
 * TRUE ZERO-KNOWLEDGE: Requires password for each sync operation
 * @param {string} email - User's email
 * @param {string} password - User's password (used to derive encryption key)
 */
export const syncWithCloud = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required for sync');
  }

  try {
    isSyncing = true;

    // Check if we need to sync
    const metadata = await getSyncMetadata();

    let uploaded = false;
    let downloaded = false;

    if (metadata?.value === true) {
      // We have local changes - upload first
      await uploadToCloud(email, password);
      uploaded = true;
    }

    // Then check for server changes
    const downloadResult = await downloadFromCloud(email, password);

    // If server has newer data, import it into IndexedDB
    if (downloadResult.synced && downloadResult.data) {
      // Don't clear existing data, merge with server data
      // Don't mark for sync since we just downloaded from server
      await importData(downloadResult.data, false, false);
      downloaded = true;
    } else if (downloadResult.decryptionFailed) {
      // Server has data but it's encrypted with a different password
      // Upload local data to overwrite the old server backup
      await uploadToCloud(email, password);
      uploaded = true;
    }

    return {
      success: true,
      uploaded,
      downloaded,
      lastSyncTime: Date.now(),
    };
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  } finally {
    isSyncing = false;
  }
};

/**
 * Get sync status
 */
export const getSyncStatus = async () => {
  const metadata = await getSyncMetadata();
  const lastSync = await getLastSyncTime();

  return {
    needsSync: metadata?.value === true,
    lastSyncTime: lastSync,
    isSyncing,
  };
};

/**
 * Enable automatic sync
 * @param {number} intervalMinutes - Sync interval in minutes (default: 5)
 */
export const enableAutoSync = (intervalMinutes = 5) => {
  // Clear existing interval if any
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  // Start periodic sync
  syncInterval = setInterval(async () => {
    if (!isSyncing) {
      try {
        await syncWithCloud();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  }, intervalMs);

  // Also sync immediately
  setTimeout(() => {
    syncWithCloud().catch((err) => console.error('Initial sync failed:', err));
  }, 1000);
};

/**
 * Disable automatic sync
 */
export const disableAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

/**
 * Check if auto-sync is enabled
 */
export const isAutoSyncEnabled = () => {
  return syncInterval !== null;
};

/**
 * Manual sync trigger
 * TRUE ZERO-KNOWLEDGE: Requires password for each sync operation
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const triggerManualSync = async (email, password) => {
  if (isSyncing) {
    return { success: false, message: 'Sync already in progress' };
  }

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const result = await syncWithCloud(email, password);
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Change password - re-encrypts all data with new password
 * @param {string} email - User's email
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 */
export const changePassword = async (email, oldPassword, newPassword) => {
  if (isSyncing) {
    throw new Error('Sync in progress. Please wait and try again.');
  }

  if (!email || !oldPassword || !newPassword) {
    throw new Error('Email and passwords are required');
  }

  try {
    isSyncing = true;

    // Step 1: Download encrypted backup from server
    const response = await fetch(`${API_URL}/api/v1/sync/download?since=0`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download backup from server');
    }

    const result = await response.json();

    // Check if there's data to re-encrypt
    if (!result.data || !result.data.encryptedData) {
      // No backup exists yet - just update local data
      // Export local data
      const localData = await exportAllData();

      // Re-encrypt with new password and upload
      const newKey = deriveEncryptionKey(email, newPassword);
      const newEncryptedData = encryptData(localData, newKey);

      const uploadResponse = await fetch(`${API_URL}/api/v1/sync/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          encryptedData: newEncryptedData,
          timestamp: Date.now(),
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload re-encrypted backup');
      }

      return { success: true, message: 'Password changed successfully' };
    }

    // Step 2: Decrypt with old password
    const oldKey = deriveEncryptionKey(email, oldPassword);
    let decryptedData;

    try {
      decryptedData = decryptData(result.data.encryptedData, oldKey);
    } catch (error) {
      throw new Error('Incorrect current password');
    }

    // Step 3: Re-encrypt with new password
    const newKey = deriveEncryptionKey(email, newPassword);
    const newEncryptedData = encryptData(decryptedData, newKey);

    // Step 4: Upload re-encrypted backup to server
    const uploadResponse = await fetch(`${API_URL}/api/v1/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        encryptedData: newEncryptedData,
        timestamp: Date.now(),
      }),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'Failed to upload re-encrypted backup');
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('❌ Password change failed:', error);
    throw error;
  } finally {
    isSyncing = false;
  }
};
