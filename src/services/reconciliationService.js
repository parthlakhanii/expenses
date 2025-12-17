const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Get unreconciled transactions for a date range
 */
export const getUnreconciledTransactions = async (from, to) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/reconciliation/unreconciled?from=${from}&to=${to}`
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
      `${API_URL}/api/v1/reconciliation/suggestions?from=${from}&to=${to}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch reconciliation suggestions:", error);
    throw error;
  }
};
