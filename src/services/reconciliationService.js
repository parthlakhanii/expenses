import { API_URL, getAuthHeaders } from '../utils/apiClient';

/**
 * Get unreconciled transactions for a date range
 */
export const getUnreconciledTransactions = async (from, to) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/reconciliation/unreconciled?from=${from}&to=${to}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch unreconciled transactions:", error);
    throw error;
  }
};

/**
 * Update reconciliation status for a single transaction
 */
export const updateReconciliationStatus = async (transactionId, status) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/reconciliation/status`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ transactionId, status }),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to update reconciliation status:", error);
    throw error;
  }
};

/**
 * Bulk update reconciliation status
 */
export const bulkUpdateReconciliationStatus = async (transactionIds, status) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/reconciliation/status/bulk`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ transactionIds, status }),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to bulk update reconciliation status:", error);
    throw error;
  }
};

/**
 * Get reconciliation suggestions (potential matches)
 */
export const getReconciliationSuggestions = async (from, to) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/reconciliation/suggestions?from=${from}&to=${to}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch reconciliation suggestions:", error);
    throw error;
  }
};
