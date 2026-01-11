import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
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
import './App.css';

// Inner component that has access to theme context
function AppContent() {
  const { isDark } = useTheme();
  const antdTheme = getAntdTheme(isDark);

  return (
    <ConfigProvider theme={antdTheme}>
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
