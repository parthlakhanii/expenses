const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const syncSplitwise = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/splitwise/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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

export const getSyncStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/splitwise/status`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to get sync status:", error);
    throw error;
  }
};
