import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [enableSplitwise, setEnableSplitwise] = useState(true);
  const [loading, setLoading] = useState(true);

  // Column visibility settings (localStorage only, not backend)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('dashboardVisibleColumns');
    return saved ? JSON.parse(saved) : {
      expenseType: true,
      dataSource: false,
    };
  });

  // Totals visibility settings (localStorage only, not backend)
  const [visibleTotals, setVisibleTotals] = useState(() => {
    const saved = localStorage.getItem('dashboardVisibleTotals');
    return saved ? JSON.parse(saved) : {
      expense: true,
      income: true,
      investment: false,
      transfer: false,
    };
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/user/settings`);
      if (!response.data.error_status) {
        setEnableSplitwise(response.data.data.settings.enableSplitwise ?? true);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEnableSplitwise = async (value) => {
    try {
      const response = await axios.put(`${API_URL}/api/v1/user/settings`, {
        enableSplitwise: value,
      });

      if (!response.data.error_status) {
        setEnableSplitwise(value);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  };

  const toggleColumn = (columnKey) => {
    const newVisibleColumns = {
      ...visibleColumns,
      [columnKey]: !visibleColumns[columnKey],
    };
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem('dashboardVisibleColumns', JSON.stringify(newVisibleColumns));
  };

  const toggleTotal = (totalKey) => {
    const newVisibleTotals = {
      ...visibleTotals,
      [totalKey]: !visibleTotals[totalKey],
    };
    setVisibleTotals(newVisibleTotals);
    localStorage.setItem('dashboardVisibleTotals', JSON.stringify(newVisibleTotals));
  };

  useEffect(() => {
    // Only fetch settings if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    enableSplitwise,
    loading,
    updateEnableSplitwise,
    refreshSettings: fetchSettings,
    visibleColumns,
    toggleColumn,
    visibleTotals,
    toggleTotal,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
