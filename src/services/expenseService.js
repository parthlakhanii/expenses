const USER_ID = 20691939;

const getAllExpenses = async () => {
  const url = "http://localhost:3001/api/v1/expense";
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching all expenses");
    throw error;
  }
};

const getExpensesByMonth = async (from, to) => {
  const url = `http://localhost:3001/api/v1/expense?startDate=${from}&endDate=${to}`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.data;
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
  console.log({ totalExpense, totalIncome });
  return { totalExpense, totalIncome, totalInvestment, totalOthers };
};

const deleteExpenseById = async (id) => {
  const url = `http://localhost:3001/api/v1/expense/${id}`;
  try {
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete the expense");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting expense with id: ${id}`, error);
    throw error;
  }
};

const getSplitWiseExpenseByUserName = async (from, to, userName) => {
  const url = `http://localhost:3001/api/v1/splitwise?from=${from}&to=${to}&user=${userName}`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    json.data = normalizeSplitWiseData(json.data);
    return json.data;
  } catch (error) {
    console.error(`Error fetching Splitwise expenses for user: ${userName}`);
    throw error;
  }
};

const normalizeSplitWiseData = (data) => {
  return data.map((expense) => ({
    amount: parseInt(expense.cost),
    date: new Date(expense.date).toISOString().split("T")[0],
    type: "Expense",
    description: expense.description,
    category: expense.category.name,
    source: "Splitwise API",
    paid_amount: parseInt(expense.cost),
    owed_share: parseInt(
      expense.users.find((user) => user.user_id === USER_ID).owed_share
    ),
  }));
};

export {
  getAllExpenses,
  getExpensesByMonth,
  calculateTotals,
  deleteExpenseById,
  getSplitWiseExpenseByUserName,
};
