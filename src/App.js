import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StorageProvider } from './contexts/StorageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { getAntdTheme } from './styles/theme';
import { useResponsive } from './hooks/useResponsive';
import './App.css';

// Inner component that has access to theme context
function AppContent() {
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const antdTheme = getAntdTheme(isDark);

  return (
    <ConfigProvider theme={antdTheme}>
      {isMobile && showMobileWarning && (
        <div
          style={{
            background: isDark ? '#422006' : '#fef3c7',
            borderBottom: `1px solid ${isDark ? '#854d0e' : '#f59e0b'}`,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span
            style={{
              color: isDark ? '#fcd34d' : '#92400e',
              fontSize: 13,
            }}
          >
            This app is optimized for desktop. Some features may not work well on mobile.
          </span>
          <CloseOutlined
            onClick={() => setShowMobileWarning(false)}
            style={{
              color: isDark ? '#fcd34d' : '#92400e',
              cursor: 'pointer',
              fontSize: 12,
              flexShrink: 0,
            }}
          />
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <StorageProvider>
          <AuthProvider>
            <SettingsProvider>
              <CategoryProvider>
                <AppContent />
              </CategoryProvider>
            </SettingsProvider>
          </AuthProvider>
        </StorageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
