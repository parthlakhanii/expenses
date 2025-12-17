import moment from "moment";

/**
 * Calculate spending trends over the last N months
 * @param {Array} allExpenses - All expense data
 * @param {number} monthsBack - Number of months to look back (default 6)
 * @returns {Array} Array of {month, amount} objects
 */
export const calculateSpendingTrends = (allExpenses, monthsBack = 6) => {
  const trends = [];
  const today = moment();

  // Generate array of last N months
  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = today.clone().subtract(i, "months");
    const monthStart = monthDate.clone().startOf("month");
    const monthEnd = monthDate.clone().endOf("month");

    // Filter expenses for this month (only type: "Expense")
    const monthExpenses = allExpenses.filter((exp) => {
      const expDate = moment(exp.date);
      return (
        exp.type === "Expense" &&
        expDate.isSameOrAfter(monthStart) &&
        expDate.isSameOrBefore(monthEnd)
      );
    });

    // Sum up expenses
    const total = monthExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount || 0),
      0
    );

    trends.push({
      month: monthDate.format("MMM YY"),
      amount: parseFloat(total.toFixed(2)),
    });
  }

  return trends;
};

/**
 * Calculate category breakdown for given expenses
 * @param {Array} expenses - Expense data for the period
 * @returns {Array} Array of {category, value} objects sorted by value
 */
export const calculateCategoryBreakdown = (expenses) => {
  const categoryTotals = {};

  // Only include type: "Expense"
  const expenseOnly = expenses.filter((exp) => exp.type === "Expense");

  expenseOnly.forEach((exp) => {
    const category = exp.category || "Other";
    categoryTotals[category] =
      (categoryTotals[category] || 0) + parseFloat(exp.amount || 0);
  });

  // Convert to array and sort by value descending
  return Object.entries(categoryTotals)
    .map(([category, value]) => ({
      category,
      value: parseFloat(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Get top N spending categories
 * @param {Array} expenses - Expense data for the period
 * @param {number} topN - Number of top categories to return (default 5)
 * @returns {Array} Array of {category, amount, percentage} objects
 */
export const getTopCategories = (expenses, topN = 5) => {
  const breakdown = calculateCategoryBreakdown(expenses);
  const totalSpending = breakdown.reduce((sum, cat) => sum + cat.value, 0);

  return breakdown.slice(0, topN).map((cat) => ({
    category: cat.category,
    amount: cat.value,
    percentage:
      totalSpending > 0
        ? parseFloat(((cat.value / totalSpending) * 100).toFixed(1))
        : 0,
  }));
};
