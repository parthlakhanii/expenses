import { API_URL, getAuthHeaders } from "../utils/apiClient";

const getAllExpenses = async () => {
  const url = `${API_URL}/api/v1/expense`;
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching all expenses");
    throw error;
  }
};

const getExpensesByMonth = async (from, to) => {
  const url = `${API_URL}/api/v1/expense?startDate=${from}&endDate=${to}`;
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error(`Error fetching expenses form: ${from} to: ${to}`);
    throw error;
  }
};
const calculateTotals = async (expenseData) => {
  let totalExpense = 0;
  let totalIncome = 0;
  let totalInvestment = 0;
  let totalOthers = 0;

  if (!expenseData || !Array.isArray(expenseData)) {
    return {
      totalExpense: 0,
      totalIncome: 0,
      totalInvestment: 0,
      totalOthers: 0,
    };
  }

  for (const expense of expenseData) {
    if (expense.type === "Expense") {
      totalExpense += expense.amount;
    } else if (expense.type === "Income") {
      totalIncome += expense.amount;
    } else if (expense.type === "Investment") {
      totalInvestment += expense.amount;
    } else {
      totalOthers += expense.amount;
    }
  }
  return { totalExpense, totalIncome, totalInvestment, totalOthers };
};

const createExpense = async (expenseData) => {
  const url = `${API_URL}/api/v1/expense`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(expenseData),
    });
    const json = await response.json();
    if (json.error_status) {
      throw new Error(json.error_message || "Failed to create expense");
    }
    return json;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

const updateExpense = async (id, expenseData) => {
  const url = `${API_URL}/api/v1/expense/${id}`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(expenseData),
    });
    const json = await response.json();
    if (json.error_status) {
      throw new Error(json.error_message || "Failed to update expense");
    }
    return json;
  } catch (error) {
    console.error(`Error updating expense with id: ${id}`, error);
    throw error;
  }
};

const deleteExpenseById = async (id) => {
  const url = `${API_URL}/api/v1/expense/${id}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete the expense");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting expense with id: ${id}`, error);
    throw error;
  }
};

const getSplitWiseExpenseByUserName = async (from, to) => {
  const url = `${API_URL}/api/v1/splitwise?from=${from}&to=${to}`;
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    const data = json.data || [];
    return normalizeSplitWiseData(data);
  } catch (error) {
    console.error(`Error fetching Splitwise expenses`);
    throw error;
  }
};

const normalizeSplitWiseData = (data) => {
  return data.map((expense) => {
    // Backend filters expenses where the user paid (paid_share !== "0.0")
    // Find the user who paid (has non-zero paid_share)
    const currentUser = expense.users.find((user) => user.paid_share !== "0.0" && parseFloat(user.paid_share) > 0);

    return {
      amount: parseInt(expense.cost),
      date: new Date(expense.date).toISOString().split("T")[0],
      type: "Expense",
      description: expense.description,
      category: expense.category.name,
      source: "Splitwise API",
      paid_amount: parseInt(expense.cost),
      owed_share: currentUser ? parseInt(currentUser.owed_share) : 0,
    };
  });
};

export {
  getAllExpenses,
  getExpensesByMonth,
  calculateTotals,
  createExpense,
  updateExpense,
  deleteExpenseById,
  getSplitWiseExpenseByUserName,
};
