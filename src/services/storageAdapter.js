import * as localStorageService from './localStorageService';
import * as expenseService from './expenseService';
import * as budgetService from './budgetService';
import * as categoryService from './categoryService';

let storageMode = 'cloud';

export const setStorageMode = (mode) => {
  storageMode = mode;
};

export const getStorageMode = () => {
  return storageMode;
};

// Expense operations
export const getAllExpenses = async () => {
  if (storageMode === 'local') {
    return await localStorageService.getAllExpenses();
  }
  return await expenseService.getAllExpenses();
};

export const getExpensesByMonth = async (from, to) => {
  if (storageMode === 'local') {
    const allExpenses = await localStorageService.getAllExpenses();
    return allExpenses.filter(
      (expense) => expense.date >= from && expense.date <= to
    );
  }
  return await expenseService.getExpensesByMonth(from, to);
};

export const createExpense = async (expenseData) => {
  // Always call backend for auto-categorization
  // Backend checks storage mode and only saves for cloud users
  const response = await expenseService.createExpense(expenseData);

  // For local mode, backend returns categorized data without saving to DB
  // We need to store it in IndexedDB
  if (storageMode === 'local') {
    const categorizedExpense = Array.isArray(response.data)
      ? response.data[0]
      : response.data;
    await localStorageService.addExpense(categorizedExpense);
    return categorizedExpense;
  }

  // For cloud mode, backend already saved it
  return response;
};

export const updateExpense = async (id, expenseData) => {
  if (storageMode === 'local') {
    return await localStorageService.updateExpense(id, expenseData);
  }
  return await expenseService.updateExpense(id, expenseData);
};

export const deleteExpenseById = async (id) => {
  if (storageMode === 'local') {
    return await localStorageService.deleteExpense(id);
  }
  return await expenseService.deleteExpenseById(id);
};

// Category operations
export const getAllCategories = async () => {
  if (storageMode === 'local') {
    return await localStorageService.getAllCategories();
  }
  return await categoryService.getAllCategories();
};

export const createCategory = async (categoryData) => {
  if (storageMode === 'local') {
    return await localStorageService.addCategory(categoryData);
  }
  return await categoryService.createCategory(categoryData);
};

export const updateCategory = async (id, categoryData) => {
  if (storageMode === 'local') {
    return await localStorageService.updateCategory(id, categoryData);
  }
  return await categoryService.updateCategory(id, categoryData);
};

export const deleteCategory = async (id) => {
  if (storageMode === 'local') {
    return await localStorageService.deleteCategory(id);
  }
  return await categoryService.deleteCategory(id);
};

// Budget operations
export const getBudget = async (month, year) => {
  if (storageMode === 'local') {
    return await localStorageService.getBudget(month, year);
  }
  return await budgetService.getBudget(month, year);
};

export const saveBudget = async (month, year, overallBudget, categoryBudgets) => {
  if (storageMode === 'local') {
    return await localStorageService.saveBudget(month, year, overallBudget, categoryBudgets);
  }
  return await budgetService.saveBudget(month, year, overallBudget, categoryBudgets);
};

export const deleteBudget = async (month, year) => {
  if (storageMode === 'local') {
    return await localStorageService.deleteBudget(month, year);
  }
  return await budgetService.deleteBudget(month, year);
};

// Re-export utility functions
export { calculateTotals, getSplitWiseExpenseByUserName } from './expenseService';
