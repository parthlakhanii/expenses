import React from "react";
import { Alert, Button, Space } from "antd";
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, StopOutlined } from "@ant-design/icons";
import moment from "moment";
import { useTheme } from "../contexts/ThemeContext";

const SyncStatusIndicator = ({ syncStatus, onRefresh, loading, onCancelSync, cancelling, dismissed, onClose }) => {
  const { isDark } = useTheme();

  if (!syncStatus) {
    return null;
  }

  // Don't show if user dismissed it
  if (dismissed) {
    return null;
  }

  const getStatusConfig = () => {
    if (syncStatus.status === "in_progress") {
      return {
        type: "info",
        icon: <SyncOutlined spin />,
        message: "Splitwise Sync in Progress",
        description: syncStatus.recordsProcessed > 0
          ? `${syncStatus.recordsProcessed} records processed...`
          : "Processing your data. This may take a while if you have a lot of records.",
        showCancelButton: true,
      };
    }

    if (syncStatus.status === "success") {
      return {
        type: "success",
        icon: <CheckCircleOutlined />,
        message: "Last Sync Successful",
        description: `${syncStatus.recordsProcessed} records synced ${moment(syncStatus.lastSyncedAt).fromNow()}`,
      };
    }

    if (syncStatus.status === "cancelled") {
      return {
        type: "warning",
        icon: <StopOutlined />,
        message: "Sync Cancelled",
        description: syncStatus.errorMessage || "Sync was cancelled by user",
      };
    }

    if (syncStatus.status === "failed") {
      return {
        type: "error",
        icon: <CloseCircleOutlined />,
        message: "Last Sync Failed",
        description: syncStatus.errorMessage || "An error occurred during sync",
      };
    }

    return null;
  };

  const config = getStatusConfig();

  if (!config) {
    return null;
  }

  // Only show if sync is in progress or recently completed (within 1 hour)
  const shouldShow =
    syncStatus.status === "in_progress" ||
    syncStatus.status === "failed" ||
    (syncStatus.status === "success" && syncStatus.lastSyncedAt &&
     moment().diff(moment(syncStatus.lastSyncedAt), 'hours') < 1);

  if (!shouldShow && !syncStatus.hasNeverSynced) {
    return null;
  }

  return (
    <Alert
      type={config.type}
      icon={config.icon}
      message={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>{config.message}</span>
          {syncStatus.status === "in_progress" && (
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                type="text"
              >
                Check Status
              </Button>
              <Button
                size="small"
                icon={<StopOutlined />}
                onClick={onCancelSync}
                loading={cancelling}
                danger
                type="text"
              >
                Stop Sync
              </Button>
            </Space>
          )}
        </Space>
      }
      description={config.description}
      showIcon
      closable={syncStatus.status !== "in_progress"}
      onClose={onClose}
      style={{
        marginBottom: "16px",
        background: isDark ? "#1e293b" : "#ffffff",
        border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      }}
    />
  );
};

export default SyncStatusIndicator;
