import React from 'react';
import { Button, Space, Segmented } from 'antd';
import {
  HomeOutlined,
  CalculatorOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { ReactComponent as SplitwiseIcon } from '../styles/splitwise-icon.svg';
import { useTheme } from '../contexts/ThemeContext';

const TopNav = ({ currentView, onViewChange }) => {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    {
      label: (
        <Space>
          <HomeOutlined />
          <span>Dashboard</span>
        </Space>
      ),
      value: 'dashboard',
    },
    {
      label: (
        <Space>
          <SplitwiseIcon
            className="splitwise-icon-theme"
            style={{ width: 14, height: 14 }}
          />
          <span>Splitwise</span>
        </Space>
      ),
      value: 'splitwise',
    },
    {
      label: (
        <Space>
          <CalculatorOutlined />
          <span>Budgets</span>
        </Space>
      ),
      value: 'budgets',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 64,
        background: isDark ? '#1e293b' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}
      >
        Expense Tracker
      </div>

      {/* Navigation */}
      <Segmented
        options={navItems}
        value={currentView}
        onChange={onViewChange}
        style={{
          background: isDark ? '#0f172a' : '#f1f5f9',
          padding: 4,
        }}
      />

      {/* Theme Toggle */}
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{
          fontSize: 18,
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </div>
  );
};

export default TopNav;
