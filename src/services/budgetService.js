import { API_URL, getAuthHeaders } from '../utils/apiClient';

export const saveBudget = async (month, year, overallBudget, categoryBudgets) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/budget`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ month, year, overallBudget, categoryBudgets }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to save budget:", error);
    throw error;
  }
};

export const getBudget = async (month, year) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/budget?month=${month}&year=${year}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch budget:", error);
    throw error;
  }
};

export const getBudgetTracking = async (month, year) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/budget/tracking?month=${month}&year=${year}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch budget tracking:", error);
    throw error;
  }
};

export const deleteBudget = async (month, year) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/budget?month=${month}&year=${year}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to delete budget:", error);
    throw error;
  }
};
