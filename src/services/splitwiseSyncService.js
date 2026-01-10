import { API_URL, getAuthHeaders } from '../utils/apiClient';
import { bulkAddExpenses, getAllExpenses } from './localStorageService';

export const syncSplitwise = async (startDate = null, endDate = null, syncAll = false) => {
  try {
    // Backend expects 'from' and 'to' as query parameters, not in body
    const params = new URLSearchParams();
    if (startDate) params.append('from', startDate);
    if (endDate) params.append('to', endDate);
    if (syncAll) params.append('all', 'true'); // Flag to sync all data, not just incremental

    const url = `${API_URL}/api/v1/splitwise/sync${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    const data = await response.json();

    if (data.error_status) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error("Failed to sync Splitwise:", error);
    throw error;
  }
};

/**
 * Sync Splitwise expenses to IndexedDB for local mode users
 * Fetches Splitwise expenses from backend and stores them locally
 * @param {string} startDate - Optional start date (YYYY-MM-DD)
 * @param {string} endDate - Optional end date (YYYY-MM-DD)
 * @param {boolean} syncAll - Optional flag to sync all data (not just incremental)
 */
export const syncSplitwiseToLocal = async (startDate = null, endDate = null, syncAll = false) => {
  try {
    // Trigger backend sync and get the synced expenses directly
    // For local mode, backend returns processed expenses without saving to DB
    const syncResult = await syncSplitwise(startDate, endDate, syncAll);

    // Extract the synced expenses array from the response
    // For local mode, each item is { data: expenseData, message: "...", ... }
    // We need to extract the .data from each item
    const rawExpenses = syncResult.synced || [];
    const splitwiseExpenses = rawExpenses.map(item => item.data || item);

    if (splitwiseExpenses.length === 0) {
      return { synced: 0, message: 'No Splitwise expenses to sync' };
    }

    // Get existing expenses from IndexedDB
    const existingExpenses = await getAllExpenses();
    const existingIds = new Set(existingExpenses.map(exp => exp.splitwise_id).filter(Boolean));

    // Filter out expenses that already exist (check by splitwise_id)
    const newExpenses = splitwiseExpenses.filter(exp =>
      exp.splitwise_id && !existingIds.has(exp.splitwise_id)
    );

    if (newExpenses.length > 0) {
      // Store new Splitwise expenses in IndexedDB
      await bulkAddExpenses(newExpenses);
    }

    return {
      synced: newExpenses.length,
      total: splitwiseExpenses.length,
      skipped: splitwiseExpenses.length - newExpenses.length,
      message: `Synced ${newExpenses.length} Splitwise expense(s) to local storage`,
    };
  } catch (error) {
    console.error("Failed to sync Splitwise to local:", error);
    throw error;
  }
};

export const getSyncStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/splitwise/status`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to get sync status:", error);
    throw error;
  }
};

export const cancelSync = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/splitwise/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (data.error_status) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    console.error("Failed to cancel sync:", error);
    throw error;
  }
};
