import moment from "moment";

/**
 * Get date range based on time range option
 * @param {string} timeRange - Time range option (7d, 30d, 3m, 6m, 1y, all)
 * @returns {Object} {from, to, unit, periods} - Date range and grouping info
 */
export const getDateRangeFromOption = (timeRange) => {
  const today = moment();
  let from, to, unit, periods;

  switch (timeRange) {
    case "7d":
      from = today.clone().subtract(7, "days").startOf("day");
      to = today.clone().endOf("day");
      unit = "day";
      periods = 7;
      break;
    case "30d":
      from = today.clone().subtract(30, "days").startOf("day");
      to = today.clone().endOf("day");
      unit = "day";
      periods = 30;
      break;
    case "3m":
      from = today.clone().subtract(3, "months").startOf("month");
      to = today.clone().endOf("month");
      unit = "month";
      periods = 3;
      break;
    case "6m":
      from = today.clone().subtract(6, "months").startOf("month");
      to = today.clone().endOf("month");
      unit = "month";
      periods = 6;
      break;
    case "1y":
      from = today.clone().subtract(12, "months").startOf("month");
      to = today.clone().endOf("month");
      unit = "month";
      periods = 12;
      break;
    case "all":
      // Fetch last 5 years of data for "all" option
      from = today.clone().subtract(5, "years").startOf("month");
      to = today.clone().endOf("month");
      unit = "month";
      periods = 60; // 5 years = 60 months
      break;
    default:
      // Default to 6 months
      from = today.clone().subtract(6, "months").startOf("month");
      to = today.clone().endOf("month");
      unit = "month";
      periods = 6;
  }

  return {
    from: from.format("YYYY-MM-DD"),
    to: to.format("YYYY-MM-DD"),
    unit,
    periods,
  };
};

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
 * Calculate spending trends with flexible time range
 * @param {Array} allExpenses - All expense data
 * @param {string} unit - Grouping unit ('day' or 'month')
 * @param {number} periods - Number of periods to show
 * @returns {Array} Array of {month/day, amount} objects
 */
export const calculateSpendingTrendsByRange = (allExpenses, unit = "month", periods = 6) => {
  const trends = [];
  const today = moment();

  // Generate array of last N periods
  for (let i = periods - 1; i >= 0; i--) {
    const periodDate = today.clone().subtract(i, unit);
    const periodStart = periodDate.clone().startOf(unit);
    const periodEnd = periodDate.clone().endOf(unit);

    // Filter expenses for this period (only type: "Expense")
    const periodExpenses = allExpenses.filter((exp) => {
      const expDate = moment(exp.date);
      return (
        exp.type === "Expense" &&
        expDate.isSameOrAfter(periodStart) &&
        expDate.isSameOrBefore(periodEnd)
      );
    });

    // Sum up expenses
    const total = periodExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount || 0),
      0
    );

    trends.push({
      month: unit === "day" ? periodDate.format("MMM DD") : periodDate.format("MMM YY"),
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

/**
 * Calculate both expense and income trends with flexible time range
 * @param {Array} allTransactions - All transaction data
 * @param {string} unit - Grouping unit ('day' or 'month')
 * @param {number} periods - Number of periods to show
 * @returns {Array} Array of {month/day, expenses, income} objects
 */
export const calculateExpenseIncomeTrends = (allTransactions, unit = "month", periods = 6) => {
  const trends = [];
  const today = moment();

  // Generate array of last N periods
  for (let i = periods - 1; i >= 0; i--) {
    const periodDate = today.clone().subtract(i, unit);
    const periodStart = periodDate.clone().startOf(unit);
    const periodEnd = periodDate.clone().endOf(unit);

    // Filter transactions for this period
    const periodExpenses = allTransactions.filter((exp) => {
      const expDate = moment(exp.date);
      return (
        exp.type === "Expense" &&
        expDate.isSameOrAfter(periodStart) &&
        expDate.isSameOrBefore(periodEnd)
      );
    });

    const periodIncome = allTransactions.filter((exp) => {
      const expDate = moment(exp.date);
      return (
        exp.type === "Income" &&
        expDate.isSameOrAfter(periodStart) &&
        expDate.isSameOrBefore(periodEnd)
      );
    });

    // Sum up expenses and income
    const totalExpenses = periodExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount || 0),
      0
    );

    const totalIncome = periodIncome.reduce(
      (sum, exp) => sum + parseFloat(exp.amount || 0),
      0
    );

    trends.push({
      month: unit === "day" ? periodDate.format("MMM DD") : periodDate.format("MMM YY"),
      expenses: parseFloat(totalExpenses.toFixed(2)),
      income: parseFloat(totalIncome.toFixed(2)),
    });
  }

  return trends;
};
