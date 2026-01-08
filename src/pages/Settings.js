import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Button,
  message,
  Spin,
  Typography,
  Divider,
  Switch,
  Space,
  Checkbox,
  Radio,
  Tooltip,
} from "antd";
import {
  LinkOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
  CloudOutlined,
  LaptopOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import { useStorage } from "../contexts/StorageContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "../utils/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import {
  triggerManualSync,
  getSyncStatus,
  changePassword,
} from "../services/syncService";
import {
  createPasswordCanary,
  verifyPassword,
} from "../services/encryptionService";
import {
  setPasswordCanary,
  getPasswordCanary,
} from "../services/localStorageService";
import PasswordPromptModal from "../components/PasswordPromptModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import moment from "moment";
import { colors } from "../styles/theme";

const { Content, Header } = Layout;
const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const Settings = () => {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const {
    enableSplitwise,
    updateEnableSplitwise,
    visibleColumns,
    toggleColumn,
    visibleTotals,
    toggleTotal,
  } = useSettings();
  const {
    storageMode,
    syncEnabled,
    setSyncEnabled,
  } = useStorage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [splitwiseConnected, setSplitwiseConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [updatingStorage, setUpdatingStorage] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncNeedsUpdate, setSyncNeedsUpdate] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState(null); // 'enable' or 'sync'
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Check Splitwise connection status
    fetchSplitwiseStatus();

    // Check for OAuth callback result
    const params = new URLSearchParams(location.search);
    const splitwiseResult = params.get("splitwise");

    if (splitwiseResult === "success") {
      message.success("Splitwise account connected successfully!");
      // Clean up URL
      navigate("/settings", { replace: true });
      // Refresh status
      fetchSplitwiseStatus();
    } else if (splitwiseResult === "error") {
      const errorMessage =
        params.get("message") || "Failed to connect Splitwise account";
      message.error(errorMessage);
      // Clean up URL
      navigate("/settings", { replace: true });
    }
  }, [location, navigate]);

  // Fetch sync status when in local mode with sync enabled
  useEffect(() => {
    if (storageMode === "local" && syncEnabled) {
      fetchLocalSyncStatus();
    }
  }, [storageMode, syncEnabled]);

  const fetchLocalSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setLastSyncTime(status.lastSyncTime);
      setSyncNeedsUpdate(status.needsSync);
    } catch (error) {
      console.error("Failed to get sync status:", error);
    }
  };

  const fetchSplitwiseStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/v1/auth/splitwise/status`
      );
      if (!response.data.error_status) {
        setSplitwiseConnected(response.data.data.splitwiseConnected);
      }
    } catch (error) {
      console.error("Error fetching Splitwise status:", error);
      message.error("Failed to load Splitwise connection status");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSplitwise = () => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Redirect to backend OAuth initiation endpoint with token
    // The backend will redirect to Splitwise, then back to /dashboard?splitwise=success
    window.location.href = `${API_URL}/api/v1/auth/splitwise?token=${token}`;
  };

  const handleDisconnectSplitwise = async () => {
    try {
      setDisconnecting(true);
      const response = await axios.post(
        `${API_URL}/api/v1/auth/splitwise/disconnect`
      );

      if (!response.data.error_status) {
        message.success("Splitwise account disconnected successfully");
        setSplitwiseConnected(false);
      } else {
        message.error(
          response.data.message || "Failed to disconnect Splitwise"
        );
      }
    } catch (error) {
      console.error("Error disconnecting Splitwise:", error);
      message.error("Failed to disconnect Splitwise account");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleSplitwise = async (checked) => {
    try {
      setUpdatingSettings(true);
      const result = await updateEnableSplitwise(checked);

      if (result.success) {
        message.success(
          checked
            ? "Splitwise integration enabled"
            : "Splitwise integration disabled"
        );
      } else {
        message.error(result.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error("Failed to update settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleToggleColumn = (columnKey) => {
    toggleColumn(columnKey);
    message.success(
      `Column ${!visibleColumns[columnKey] ? "shown" : "hidden"}`
    );
  };

  const handleToggleTotal = (totalKey) => {
    toggleTotal(totalKey);
    message.success(
      `Total ${!visibleTotals[totalKey] ? "shown" : "hidden"}`
    );
  };

  const handleSyncEnabledChange = async (checked) => {
    try {
      setUpdatingStorage(true);
      await setSyncEnabled(checked);
    } catch (error) {
      console.error("Error updating sync:", error);
      message.error("Failed to update sync settings");
    } finally {
      setUpdatingStorage(false);
    }
  };

  const handleManualSync = () => {
    // Show password modal for sync
    setPasswordModalMode("sync");
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    const userEmail = user?.email;
    if (!userEmail) {
      message.error("User email not found");
      return false;
    }

    try {
      setChangingPassword(true);
      message.loading({
        content: "Changing password...",
        key: "change-password",
      });

      // Verify old password with canary first
      const canary = await getPasswordCanary();
      if (canary) {
        const isValid = verifyPassword(userEmail, oldPassword, canary);
        if (!isValid) {
          message.error({
            content: "Incorrect current password",
            key: "change-password",
            duration: 3,
          });
          return false; // Keep modal open
        }
      }

      // Change password (re-encrypts all data)
      await changePassword(userEmail, oldPassword, newPassword);

      // Update local canary with new password
      const newCanary = createPasswordCanary(userEmail, newPassword);
      await setPasswordCanary(newCanary);

      message.success({
        content: "Password changed successfully!",
        key: "change-password",
        duration: 3,
      });

      setShowChangePasswordModal(false);
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage = error.message || "Failed to change password";

      if (errorMessage.includes("current password")) {
        message.error({
          content: "Incorrect current password",
          key: "change-password",
          duration: 3,
        });
        return false; // Keep modal open
      } else {
        message.error({
          content: errorMessage,
          key: "change-password",
          duration: 3,
        });
        setShowChangePasswordModal(false);
        return false;
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordConfirm = async (password) => {
    const userEmail = user?.email;
    if (!userEmail) {
      message.error("User email not found");
      return false;
    }

    if (passwordModalMode === "sync") {
      // Performing manual sync
      try {
        setSyncing(true);
        message.loading({
          content: "Verifying password...",
          key: "manual-sync",
        });

        // Verify password using canary before attempting sync
        const canary = await getPasswordCanary();

        if (canary) {
          const isValid = verifyPassword(userEmail, password, canary);

          if (!isValid) {
            message.error({
              content: "Incorrect password",
              key: "manual-sync",
              duration: 3,
            });
            return false; // Keep modal open
          }
        }

        message.loading({ content: "Syncing data...", key: "manual-sync" });
        const result = await triggerManualSync(userEmail, password);

        if (result.success) {
          // If canary doesn't exist yet, create it now (for backwards compatibility)
          if (!canary) {
            const newCanary = createPasswordCanary(userEmail, password);
            await setPasswordCanary(newCanary);
          }

          // Show appropriate success message
          let successMessage = "Sync completed successfully!";
          if (result.uploaded && !result.downloaded) {
            successMessage = "Local data backed up to cloud successfully!";
          }

          message.success({
            content: successMessage,
            key: "manual-sync",
            duration: 3,
          });
          setShowPasswordModal(false);
          // Refresh sync status
          await fetchLocalSyncStatus();
          return true;
        } else {
          // Check if it's a password error
          if (result.error && result.error.includes("password")) {
            message.error({
              content: "Incorrect password",
              key: "manual-sync",
              duration: 3,
            });
            return false; // Keep modal open
          } else {
            message.error({
              content: result.message || result.error || "Sync failed",
              key: "manual-sync",
              duration: 3,
            });
            return false;
          }
        }
      } catch (error) {
        console.error("Manual sync error:", error);
        const errorMessage = error.message || "Failed to sync data";

        if (
          errorMessage.includes("password") ||
          errorMessage.includes("decrypt")
        ) {
          message.error({
            content: "Incorrect password",
            key: "manual-sync",
            duration: 3,
          });
          return false; // Keep modal open for retry
        } else {
          message.error({
            content: errorMessage,
            key: "manual-sync",
            duration: 3,
          });
          setShowPasswordModal(false);
          return false;
        }
      } finally {
        setSyncing(false);
      }
    }
  };

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  const headerStyle = {
    background: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.primary}`,
    padding: "24px 48px",
  };

  const contentStyle = {
    padding: "24px 48px",
    background: theme.bg.primary,
    minHeight: "100vh",
  };

  return (
    <Layout style={{ minHeight: "100vh", background: theme.bg.primary }}>
      <Header style={headerStyle}>
        <Title level={2} style={{ margin: 0, color: theme.text.primary }}>
          Settings
        </Title>
      </Header>

      <Content style={contentStyle}>
        {/* Splitwise Integration */}
        <Card title="Splitwise Integration" bordered={false} style={cardStyle}>
          <Spin spinning={loading}>
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Status: </Text>
              {splitwiseConnected ? (
                <>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text style={{ color: "#52c41a" }}>Connected</Text>
                </>
              ) : (
                <>
                  <CloseCircleOutlined
                    style={{ color: "#8b5cf6", marginRight: "8px" }}
                  />
                  <Text>Not Connected</Text>
                </>
              )}
            </div>

            <Text
              type="secondary"
              style={{ display: "block", marginBottom: "24px" }}
            >
              {splitwiseConnected
                ? "Your Splitwise account is connected. You can sync your shared expenses from Splitwise."
                : "Connect your Splitwise account to import and sync shared expenses automatically."}
            </Text>

            {splitwiseConnected ? (
              <Button
                type="default"
                danger
                icon={<DisconnectOutlined />}
                onClick={handleDisconnectSplitwise}
                loading={disconnecting}
              >
                Disconnect Splitwise
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={handleConnectSplitwise}
              >
                Connect Splitwise
              </Button>
            )}
          </Spin>
        </Card>

        <Divider />

        {/* Storage Mode */}
        <Card title="Storage & Privacy" bordered={false} style={cardStyle}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ display: "block", marginBottom: "12px" }}>
                Storage Mode
              </Text>
              <div
                style={{
                  padding: "12px 16px",
                  background: theme.bg.tertiary,
                  borderRadius: "8px",
                  border: `1px solid ${theme.border.secondary}`,
                  marginBottom: "8px",
                }}
              >
                <Space>
                  {storageMode === "cloud" ? (
                    <CloudOutlined />
                  ) : (
                    <LaptopOutlined />
                  )}
                  <div>
                    <Text style={{ fontWeight: 500 }}>
                      {storageMode === "cloud"
                        ? "Cloud Storage"
                        : "Local Storage"}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      {storageMode === "cloud"
                        ? "Data stored on server, accessible from any device"
                        : "Data stored in your browser only"}
                    </Text>
                  </div>
                </Space>
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Storage mode is set during signup and cannot be changed
              </Text>
            </div>

            {storageMode === "local" && (
              <>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <div>
                      <Space style={{ marginBottom: "4px" }}>
                        <Text strong>Encrypted Cloud Backup</Text>
                        <Tooltip title="You'll enter your password each time you sync. Your password is never stored.">
                          <InfoCircleOutlined
                            style={{
                              color: theme.text.secondary,
                              fontSize: "14px",
                            }}
                          />
                        </Tooltip>
                      </Space>
                      <Text
                        type="secondary"
                        style={{ fontSize: "13px", display: "block" }}
                      >
                        Zero-knowledge encrypted backup
                      </Text>
                    </div>
                    <Switch
                      checked={syncEnabled}
                      onChange={handleSyncEnabledChange}
                      loading={updatingStorage}
                    />
                  </Space>
                </div>

                {syncEnabled && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: theme.bg.tertiary,
                      borderRadius: "8px",
                      border: `1px solid ${theme.border.secondary}`,
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <Text
                        style={{ fontSize: "13px", color: theme.text.primary }}
                      >
                        {lastSyncTime && lastSyncTime > 0
                          ? `Last synced ${moment(lastSyncTime).fromNow()}`
                          : "Never synced"}
                        {syncNeedsUpdate && (
                          <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
                            • Pending
                          </span>
                        )}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<CloudUploadOutlined />}
                      onClick={handleManualSync}
                      loading={syncing}
                      size="small"
                    >
                      Sync Now
                    </Button>
                  </div>
                )}
              </>
            )}
          </Space>
        </Card>

        <Divider />

        {/* Preferences */}
        <Card title="Preferences" bordered={false} style={cardStyle}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ display: "block", marginBottom: "12px" }}>
                Theme
              </Text>
              <Radio.Group
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Radio value="system">
                    <div>
                      <Text>System</Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px", display: "block", marginLeft: "24px" }}
                      >
                        Follow system theme preference
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="light">
                    <div>
                      <Text>Light</Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px", display: "block", marginLeft: "24px" }}
                      >
                        Always use light mode
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="dark">
                    <div>
                      <Text>Dark</Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px", display: "block", marginLeft: "24px" }}
                      >
                        Always use dark mode
                      </Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                  <Text
                    strong
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Enable Splitwise Integration
                  </Text>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    Show Splitwise sync options and features in the dashboard
                  </Text>
                </div>
                <Switch
                  checked={enableSplitwise}
                  onChange={handleToggleSplitwise}
                  loading={updatingSettings}
                />
              </Space>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div>
              <Text strong style={{ display: "block", marginBottom: "12px" }}>
                Dashboard Columns
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                Choose which columns to display in the expense table
              </Text>
              <Space direction="vertical" size="middle">
                <Checkbox
                  checked={visibleColumns.expenseType}
                  onChange={() => handleToggleColumn("expenseType")}
                >
                  <div>
                    <Text>Expense Type</Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      Show income, expense, investment, transfer
                    </Text>
                  </div>
                </Checkbox>
                <Checkbox
                  checked={visibleColumns.dataSource}
                  onChange={() => handleToggleColumn("dataSource")}
                >
                  <div>
                    <Text>Data Source</Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      Show where the expense came from (Splitwise, Wealthsimple,
                      etc.)
                    </Text>
                  </div>
                </Checkbox>
              </Space>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div>
              <Text strong style={{ display: "block", marginBottom: "12px" }}>
                Dashboard Totals
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                Choose which totals to display in the dashboard header
              </Text>
              <Space direction="vertical" size="middle">
                <Checkbox
                  checked={visibleTotals.expense}
                  onChange={() => handleToggleTotal("expense")}
                  disabled
                >
                  <div>
                    <Text>Expense</Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      Always visible
                    </Text>
                  </div>
                </Checkbox>
                <Checkbox
                  checked={visibleTotals.income}
                  onChange={() => handleToggleTotal("income")}
                  disabled
                >
                  <div>
                    <Text>Income</Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      Always visible
                    </Text>
                  </div>
                </Checkbox>
                <Checkbox
                  checked={visibleTotals.investment}
                  onChange={() => handleToggleTotal("investment")}
                >
                  <div>
                    <Text>Investment</Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      Show investment total
                    </Text>
                  </div>
                </Checkbox>
                <Checkbox
                  checked={visibleTotals.transfer}
                  onChange={() => handleToggleTotal("transfer")}
                >
                  <div>
                    <Text>Transfer</Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      Show transfer total
                    </Text>
                  </div>
                </Checkbox>
              </Space>
            </div>
          </Space>
        </Card>
      </Content>

      {/* Password Prompt Modal for True Zero-Knowledge Encryption */}
      <PasswordPromptModal
        visible={showPasswordModal}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setShowPasswordModal(false)}
        title="Enter Password to Sync"
        description="Enter your password to decrypt and sync your data."
        loading={syncing}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onConfirm={handleChangePassword}
        onCancel={() => setShowChangePasswordModal(false)}
        loading={changingPassword}
      />
    </Layout>
  );
};

export default Settings;
