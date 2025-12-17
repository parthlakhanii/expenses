import React, { useState } from 'react';
import { Button, Menu } from 'antd';
import {
  HomeOutlined,
  CalculatorOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const SideNav = ({ currentView, onViewChange, onCollapse }) => {
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'budgets',
      icon: <CalculatorOutlined />,
      label: 'Budgets',
    },
    {
      key: 'reconciliation',
      icon: <LinkOutlined />,
      label: 'Match Splits',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      disabled: true,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      disabled: true,
    },
  ];

  return (
    <div
      style={{
        width: collapsed ? 80 : 240,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: isDark ? '#1e293b' : '#ffffff',
        borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        zIndex: 1000,
      }}
    >
      {/* Logo and Collapse Button */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {!collapsed && (
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            Expense Tracker
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleCollapse}
          style={{
            fontSize: 16,
            width: 32,
            height: 32,
            color: isDark ? '#e2e8f0' : '#1e293b',
          }}
        />
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={[currentView]}
          onClick={({ key }) => onViewChange(key)}
          items={menuItems}
          inlineCollapsed={collapsed}
          style={{
            background: isDark ? '#1e293b' : '#ffffff',
            border: 'none',
            paddingTop: '8px',
          }}
          theme={isDark ? 'dark' : 'light'}
        />
      </div>

      {/* Theme Toggle at Bottom */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
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
            color: isDark ? '#e2e8f0' : '#1e293b',
          }}
        />
      </div>
    </div>
  );
};

export default SideNav;
