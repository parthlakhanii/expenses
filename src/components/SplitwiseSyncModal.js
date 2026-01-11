import React, { useState } from "react";
import { Modal, Radio, DatePicker, Space, Typography } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const SplitwiseSyncModal = ({
  visible,
  onConfirm,
  onCancel,
  isFirstSync,
  lastSyncedAt,
}) => {
  const { isMobile } = useResponsive();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [durationType, setDurationType] = useState(
    isFirstSync ? "all" : "since_last_sync"
  );
  const [customRange, setCustomRange] = useState([null, null]);

  const handleOk = () => {
    let startDate = null;
    let endDate = moment().format("YYYY-MM-DD");
    let syncAll = false; // Flag to indicate "sync all" vs incremental

    switch (durationType) {
      case "since_last_sync":
        // Sync from last synced date to now
        if (lastSyncedAt) {
          startDate = moment(lastSyncedAt).format("YYYY-MM-DD");
        } else {
          // Fallback to last month if no last sync date
          startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
        }
        break;
      case "last_month":
        startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
        break;
      case "last_3_months":
        startDate = moment().subtract(3, "months").format("YYYY-MM-DD");
        break;
      case "last_6_months":
        startDate = moment().subtract(6, "months").format("YYYY-MM-DD");
        break;
      case "last_year":
        startDate = moment().subtract(1, "year").format("YYYY-MM-DD");
        break;
      case "custom":
        if (customRange[0] && customRange[1]) {
          startDate = customRange[0].format("YYYY-MM-DD");
          endDate = customRange[1].format("YYYY-MM-DD");
        }
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
        syncAll = true; // Explicitly sync all data
        break;
    }

    onConfirm(startDate, endDate, syncAll);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SyncOutlined style={{ color: "#34d399", fontSize: "18px" }} />
          <span style={{ color: theme.text.primary }}>Sync Splitwise</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Sync"
      cancelText="Cancel"
      width={isMobile ? "90vw" : 480}
      styles={{
        header: {
          background: theme.bg.secondary,
          borderBottom: `1px solid ${theme.border.primary}`,
          padding: "20px 24px",
        },
        body: {
          background: theme.bg.secondary,
          padding: "24px",
        },
        footer: {
          background: theme.bg.secondary,
          borderTop: `1px solid ${theme.border.primary}`,
          padding: "16px 24px",
        },
        content: {
          background: theme.bg.secondary,
          borderRadius: "12px",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.6)"
            : "0 4px 16px rgba(0,0,0,0.12)",
        },
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: "14px",
          }}
        >
          Select the time period for syncing:
        </Text>
      </div>

      <Radio.Group
        value={durationType}
        onChange={(e) => setDurationType(e.target.value)}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {!isFirstSync && lastSyncedAt && (
            <Radio
              value="since_last_sync"
              style={{
                padding: "10px 12px",
                background: durationType === "since_last_sync"
                  ? isDark ? "#1a1a1a" : "#f5f5f5"
                  : "transparent",
                borderRadius: "8px",
                width: "100%",
                marginLeft: 0,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: theme.text.primary, fontWeight: 500 }}>
                  Since Last Sync
                </span>
                <Text
                  style={{
                    fontSize: 12,
                    marginLeft: 24,
                    color: theme.text.tertiary,
                  }}
                >
                  From {moment(lastSyncedAt).format("MMM DD, YYYY h:mm A")} to
                  now
                </Text>
              </div>
            </Radio>
          )}
          <Radio
            value="last_month"
            style={{
              padding: "10px 12px",
              background: durationType === "last_month"
                ? isDark ? "#1a1a1a" : "#f5f5f5"
                : "transparent",
              borderRadius: "8px",
              width: "100%",
              marginLeft: 0,
              color: theme.text.primary,
            }}
          >
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>Last Month</span>
          </Radio>
          <Radio
            value="last_3_months"
            style={{
              padding: "10px 12px",
              background: durationType === "last_3_months"
                ? isDark ? "#1a1a1a" : "#f5f5f5"
                : "transparent",
              borderRadius: "8px",
              width: "100%",
              marginLeft: 0,
            }}
          >
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>Last 3 Months</span>
          </Radio>
          <Radio
            value="last_6_months"
            style={{
              padding: "10px 12px",
              background: durationType === "last_6_months"
                ? isDark ? "#1a1a1a" : "#f5f5f5"
                : "transparent",
              borderRadius: "8px",
              width: "100%",
              marginLeft: 0,
            }}
          >
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>Last 6 Months</span>
          </Radio>
          <Radio
            value="last_year"
            style={{
              padding: "10px 12px",
              background: durationType === "last_year"
                ? isDark ? "#1a1a1a" : "#f5f5f5"
                : "transparent",
              borderRadius: "8px",
              width: "100%",
              marginLeft: 0,
            }}
          >
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>Last Year</span>
          </Radio>
          <Radio
            value="all"
            style={{
              padding: "10px 12px",
              background: durationType === "all"
                ? isDark ? "#1a1a1a" : "#f5f5f5"
                : "transparent",
              borderRadius: "8px",
              width: "100%",
              marginLeft: 0,
            }}
          >
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>All Time</span>
          </Radio>
          <Radio
            value="custom"
            style={{
              padding: "10px 12px",
              background: durationType === "custom"
                ? isDark ? "#1a1a1a" : "#f5f5f5"
                : "transparent",
              borderRadius: "8px",
              width: "100%",
              marginLeft: 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              <span style={{ color: theme.text.primary, fontWeight: 500 }}>Custom Range</span>
              {durationType === "custom" && (
                <RangePicker
                  value={customRange}
                  onChange={setCustomRange}
                  format="MMM DD, YYYY"
                  style={{
                    marginLeft: 24,
                    width: "calc(100% - 24px)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
};

export default SplitwiseSyncModal;
