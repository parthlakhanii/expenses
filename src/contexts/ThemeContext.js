import React, { createContext, useState, useContext, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Update document body for global styling
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const themeConfig = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? '#6366f1' : '#4f46e5',
      borderRadius: 12,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      Layout: {
        headerBg: isDark ? '#0f172a' : '#ffffff',
        bodyBg: isDark ? '#0f172a' : '#f8fafc',
        siderBg: isDark ? '#1e293b' : '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
        itemSelectedColor: isDark ? '#818cf8' : '#4f46e5',
      },
      Button: {
        borderRadius: 10,
      },
      Input: {
        borderRadius: 10,
      },
      Select: {
        borderRadius: 10,
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
