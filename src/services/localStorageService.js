import { openDB } from 'idb';

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 2; // Incremented to add userId index

// Get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || null;
  } catch {
    return null;
  }
};

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Expenses store
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', {
          keyPath: '_id',
          autoIncrement: false,
        });
        expenseStore.createIndex('date', 'date');
        expenseStore.createIndex('category', 'category');
        expenseStore.createIndex('type', 'type');
        expenseStore.createIndex('source', 'source');
        expenseStore.createIndex('userId', 'userId');
      } else {
        // Add userId index to existing store (for migration from v1 to v2)
        const expenseStore = transaction.objectStore('expenses');
        if (!expenseStore.indexNames.contains('userId')) {
          expenseStore.createIndex('userId', 'userId');
        }
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', {
          keyPath: 'name',
        });
      }

      // Budgets store
      if (!db.objectStoreNames.contains('budgets')) {
        const budgetStore = db.createObjectStore('budgets', {
          keyPath: '_id',
          autoIncrement: false,
        });
        budgetStore.createIndex('month_year', ['month', 'year'], { unique: false });
      }

      // Sync metadata store (tracks what needs to be synced)
      if (!db.objectStoreNames.contains('sync_metadata')) {
        const syncStore = db.createObjectStore('sync_metadata', {
          keyPath: 'key',
        });
        syncStore.createIndex('lastSyncTime', 'lastSyncTime');
      }
    },
  });
};

// Generate unique ID (mimics MongoDB ObjectId)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ==================== EXPENSE OPERATIONS ====================

export const addExpense = async (expense) => {
  const db = await initDB();
  const userId = getCurrentUserId();
  const expenseWithId = {
    ...expense,
    _id: expense._id || generateId(),
    userId: expense.userId || userId, // Ensure userId is set
    createdAt: expense.createdAt || new Date().toISOString(),
  };
  await db.add('expenses', expenseWithId);
  await markNeedsSync();
  return expenseWithId;
};

export const getAllExpenses = async () => {
  const db = await initDB();
  const userId = getCurrentUserId();
  if (!userId) {
    return []; // No user logged in
  }
  const allExpenses = await db.getAll('expenses');
  // Filter by userId to prevent data leakage
  return allExpenses.filter(exp => exp.userId === userId);
};

export const getExpensesByDateRange = async (startDate, endDate) => {
  const db = await initDB();
  const userId = getCurrentUserId();
  if (!userId) {
    return []; // No user logged in
  }
  const expenses = await db.getAll('expenses');
  // Filter by userId AND date range
  return expenses.filter((exp) => exp.userId === userId && exp.date >= startDate && exp.date <= endDate);
};

export const getExpenseById = async (id) => {
  const db = await initDB();
  const userId = getCurrentUserId();
  const expense = await db.get('expenses', id);
  // Verify ownership before returning
  if (expense && expense.userId === userId) {
    return expense;
  }
  return null; // Not found or doesn't belong to current user
};

export const updateExpense = async (id, updates) => {
  const db = await initDB();
  const userId = getCurrentUserId();
  const expense = await db.get('expenses', id);
  if (!expense) {
    throw new Error('Expense not found');
  }
  // Verify ownership before updating
  if (expense.userId !== userId) {
    throw new Error('Unauthorized: Cannot update another user\'s expense');
  }
  const updated = { ...expense, ...updates, userId }; // Preserve userId
  await db.put('expenses', updated);
  await markNeedsSync();
  return updated;
};

export const deleteExpense = async (id) => {
  const db = await initDB();
  const userId = getCurrentUserId();
  const expense = await db.get('expenses', id);
  // Verify ownership before deleting
  if (expense && expense.userId !== userId) {
    throw new Error('Unauthorized: Cannot delete another user\'s expense');
  }
  await db.delete('expenses', id);
  await markNeedsSync();
};

export const bulkAddExpenses = async (expenses) => {
  const db = await initDB();
  const userId = getCurrentUserId();
  const tx = db.transaction('expenses', 'readwrite');
  const results = [];

  for (const expense of expenses) {
    const expenseWithId = {
      ...expense,
      _id: expense._id || generateId(),
      userId: expense.userId || userId, // Ensure userId is set
      createdAt: expense.createdAt || new Date().toISOString(),
    };
    await tx.store.add(expenseWithId);
    results.push(expenseWithId);
  }

  await tx.done;
  await markNeedsSync();
  return results;
};

// ==================== CATEGORY OPERATIONS ====================

export const getAllCategories = async () => {
  const db = await initDB();
  const categories = await db.getAll('categories');
  return categories;
};

export const addCategory = async (category) => {
  const db = await initDB();
  await db.add('categories', category);
  await markNeedsSync();
  return category;
};

export const updateCategory = async (name, updates) => {
  const db = await initDB();
  const category = await db.get('categories', name);
  if (!category) {
    throw new Error('Category not found');
  }
  const updated = { ...category, ...updates };
  await db.put('categories', updated);
  await markNeedsSync();
  return updated;
};

export const deleteCategory = async (name) => {
  const db = await initDB();
  await db.delete('categories', name);
  await markNeedsSync();
};

export const bulkAddCategories = async (categories) => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readwrite');

  for (const category of categories) {
    await tx.store.put(category);
  }

  await tx.done;
  await markNeedsSync();
  return categories;
};

// ==================== BUDGET OPERATIONS ====================

export const getBudget = async (month, year) => {
  const db = await initDB();
  const budgets = await db.getAll('budgets');
  return budgets.find((b) => b.month === month && b.year === year);
};

export const saveBudget = async (budgetData) => {
  const db = await initDB();
  const existing = await getBudget(budgetData.month, budgetData.year);

  const budget = {
    ...budgetData,
    _id: existing?._id || generateId(),
  };

  await db.put('budgets', budget);
  await markNeedsSync();
  return budget;
};

export const getAllBudgets = async () => {
  const db = await initDB();
  return db.getAll('budgets');
};

export const deleteBudget = async (month, year) => {
  const db = await initDB();
  const budget = await getBudget(month, year);
  if (budget) {
    await db.delete('budgets', budget._id);
    await markNeedsSync();
  }
};

// ==================== SYNC METADATA ====================

export const markNeedsSync = async () => {
  const db = await initDB();
  await db.put('sync_metadata', {
    key: 'needsSync',
    value: true,
    lastModified: Date.now(),
  });
};

export const getSyncMetadata = async () => {
  const db = await initDB();
  return db.get('sync_metadata', 'needsSync');
};

export const updateSyncMetadata = async (data) => {
  const db = await initDB();
  await db.put('sync_metadata', {
    key: 'needsSync',
    ...data,
  });
};

export const getLastSyncTime = async () => {
  const db = await initDB();
  const metadata = await db.get('sync_metadata', 'lastSyncTime');
  return metadata?.value || 0;
};

export const setLastSyncTime = async (timestamp) => {
  const db = await initDB();
  await db.put('sync_metadata', {
    key: 'lastSyncTime',
    value: timestamp,
  });
};

// ==================== PASSWORD VERIFICATION (CANARY) ====================

/**
 * Store encrypted canary for password verification
 * @param {string} encryptedCanary - Encrypted test string
 */
export const setPasswordCanary = async (encryptedCanary) => {
  const db = await initDB();
  await db.put('sync_metadata', {
    key: 'passwordCanary',
    value: encryptedCanary,
  });
};

/**
 * Get encrypted canary for password verification
 * @returns {string|null} Encrypted canary or null if not set
 */
export const getPasswordCanary = async () => {
  const db = await initDB();
  const metadata = await db.get('sync_metadata', 'passwordCanary');
  return metadata?.value || null;
};

// ==================== DATA EXPORT/IMPORT ====================

export const exportAllData = async () => {
  const db = await initDB();
  return {
    expenses: await db.getAll('expenses'),
    categories: await db.getAll('categories'),
    budgets: await db.getAll('budgets'),
    exportedAt: new Date().toISOString(),
    version: DB_VERSION,
  };
};

export const importData = async (data, clearExisting = true, markForSync = true) => {
  const db = await initDB();

  if (clearExisting) {
    // Clear existing data
    await db.clear('expenses');
    await db.clear('categories');
    await db.clear('budgets');
  }

  // Import expenses
  if (data.expenses && data.expenses.length > 0) {
    const tx = db.transaction('expenses', 'readwrite');
    for (const expense of data.expenses) {
      await tx.store.put(expense); // Use put to allow overwrite
    }
    await tx.done;
  }

  // Import categories
  if (data.categories && data.categories.length > 0) {
    const tx = db.transaction('categories', 'readwrite');
    for (const category of data.categories) {
      await tx.store.put(category);
    }
    await tx.done;
  }

  // Import budgets
  if (data.budgets && data.budgets.length > 0) {
    const tx = db.transaction('budgets', 'readwrite');
    for (const budget of data.budgets) {
      await tx.store.put(budget);
    }
    await tx.done;
  }

  // Only mark for sync if this is a local import (not from sync download)
  if (markForSync) {
    await markNeedsSync();
  }
};

export const clearAllData = async () => {
  const db = await initDB();
  await db.clear('expenses');
  await db.clear('categories');
  await db.clear('budgets');
  await db.clear('sync_metadata');
};
