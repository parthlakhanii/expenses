const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Get all categories with full details
 */
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (data.error_status) {
      throw new Error(data.message || "Failed to create category");
    }
    return data.data;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (data.error_status) {
      throw new Error(data.message || "Failed to update category");
    }
    return data.data;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    if (data.error_status) {
      throw new Error(data.message || "Failed to delete category");
    }
    return data.data;
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
};

/**
 * Add keywords to a category
 */
export const addKeywords = async (categoryId, keywords) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${categoryId}/keywords`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ keywords }),
    });
    const data = await response.json();
    if (data.error_status) {
      throw new Error(data.message || "Failed to add keywords");
    }
    return data.data;
  } catch (error) {
    console.error("Failed to add keywords:", error);
    throw error;
  }
};

/**
 * Remove keywords from a category
 */
export const removeKeywords = async (categoryId, keywords) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${categoryId}/keywords`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ keywords }),
    });
    const data = await response.json();
    if (data.error_status) {
      throw new Error(data.message || "Failed to remove keywords");
    }
    return data.data;
  } catch (error) {
    console.error("Failed to remove keywords:", error);
    throw error;
  }
};
