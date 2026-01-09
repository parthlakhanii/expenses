import React, { useState } from 'react';
import { Menu, Drawer, FloatButton } from 'antd';
import QuickAddExpense from './QuickAddExpense';
import {
  HomeOutlined,
  CalculatorOutlined,
  UserOutlined,
  SettingOutlined,
  LinkOutlined,
  TagsOutlined,
  PlusOutlined,
  EditOutlined,
  FileExcelOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { ReactComponent as SplitwiseIcon } from '../styles/splitwise-icon.svg';
import { colors } from '../styles/theme';
import moment from 'moment';

const SideNav = ({
  currentView,
  onViewChange,
  enableSplitwise = false,
  mobileOpen,
  onMobileClose,
  onAddExpense,
  onImportCSV,
  onSplitwiseSync,
  onQuickAddSuccess,
  syncing,
  syncStatus,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { isMobile } = useResponsive();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const allMenuItems = [
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
      key: 'categories',
      icon: <TagsOutlined />,
      label: 'Categories',
    },
    {
      key: 'reconciliation',
      icon: <LinkOutlined />,
      label: 'Match Splits',
      show: enableSplitwise, // Only show if Splitwise is enabled
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Preferences',
    },
  ];

  // Filter menu items based on show property
  const menuItems = allMenuItems.filter(item => item.show !== false);

  const handleMenuClick = (key) => {
    onViewChange(key);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  // Shared sidebar content
  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 18 : 16,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          Expenses
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={[currentView]}
          onClick={({ key }) => handleMenuClick(key)}
          items={menuItems}
          inlineCollapsed={!isMobile}
          style={{
            background: theme.bg.secondary,
            border: 'none',
            paddingTop: '8px',
          }}
          theme={isDark ? 'dark' : 'light'}
        />
      </div>

      {/* Action Buttons Area */}
      <div
        style={{
          padding: '12px',
          position: 'relative',
          height: '120px',
        }}
      >
        {/* FloatButton.Group for main actions - positioned on top */}
        <FloatButton.Group
          trigger="click"
          type="primary"
          style={{
            position: 'absolute',
            right: 16,
            bottom: 80,
          }}
          icon={<PlusOutlined />}
        >
          <FloatButton
            onClick={onImportCSV}
            tooltip={<div>Import CSV</div>}
            icon={<FileExcelOutlined />}
          />
          {enableSplitwise && (
            <FloatButton
              onClick={onSplitwiseSync}
              loading={syncing}
              tooltip={
                <div>
                  Sync Splitwise
                  {syncStatus && !syncStatus.hasNeverSynced && (
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      Last: {moment(syncStatus.lastSyncedAt).fromNow()}
                    </div>
                  )}
                </div>
              }
              icon={<SplitwiseIcon className="splitwise-icon-theme" />}
            />
          )}
          <FloatButton
            onClick={onAddExpense}
            tooltip={<div>Add Expense</div>}
            icon={<EditOutlined />}
          />
        </FloatButton.Group>

        {/* Quick Add FloatButton at the bottom with Popover */}
        <QuickAddExpense
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          onSuccess={onQuickAddSuccess}
        >
          <FloatButton
            icon={<ThunderboltOutlined />}
            tooltip={!quickAddOpen ? "Quick Add Expense" : ""}
            type="primary"
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          />
        </QuickAddExpense>
      </div>
    </>
  );

  // Mobile: Render as Drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        onClose={onMobileClose}
        open={mobileOpen}
        closable={false}
        width={200}
        bodyStyle={{ padding: 0 }}
        styles={{
          body: {
            background: theme.bg.secondary,
            padding: 0,
          },
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: theme.bg.secondary,
          }}
        >
          {sidebarContent}
        </div>
      </Drawer>
    );
  }

  // Desktop: Render as fixed sidebar
  return (
    <div
      style={{
        width: 80,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: theme.bg.secondary,
        borderRight: `1px solid ${theme.border.primary}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {sidebarContent}
    </div>
  );
};

export default SideNav;
