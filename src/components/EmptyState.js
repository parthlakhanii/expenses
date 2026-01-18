import React from "react";
import { Button, Card, Space, Typography } from "antd";
import {
  PlusOutlined,
  FileAddOutlined,
  SyncOutlined,
  InboxOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";

const { Title, Text } = Typography;

const EmptyState = ({
  onAddExpense,
  onQuickAdd,
  onImportCSV,
  onSyncSplitwise,
  showSplitwiseSync = false,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        padding: "24px",
      }}
    >
      <Card
        style={{
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          background: isDark ? "#0f0f0f" : "#fafafa",
          border: "none",
          borderRadius: "16px",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.6)"
            : "0 2px 12px rgba(0,0,0,0.08)",
        }}
        styles={{ body: { padding: "40px 28px" } }}
      >
        {/* <InboxOutlined
          style={{
            fontSize: "64px",
            color: theme.text.tertiary,
            marginBottom: "24px",
          }}
        /> */}
        {/* <Title
          level={3}
          style={{ color: theme.text.primary, marginBottom: "8px" }}
        >
          No Data Available
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: "15px",
            color: theme.text.secondary,
            display: "block",
            marginBottom: "32px",
          }}
        >
          Get started by adding your first transaction or importing data
        </Text> */}

        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            block
            onClick={onAddExpense}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              height: "44px",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "10px",
            }}
          >
            Add Transaction
          </Button>

          <Button
            icon={<ThunderboltOutlined />}
            size="large"
            block
            onClick={onQuickAdd}
            style={{
              height: "44px",
              fontSize: "14px",
              background: isDark ? "#1a1a1a" : "#ffffff",
              border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
              color: theme.text.primary,
              borderRadius: "10px",
            }}
          >
            Quick Add
          </Button>

          <Button
            icon={<FileAddOutlined />}
            size="large"
            block
            onClick={onImportCSV}
            style={{
              height: "44px",
              fontSize: "14px",
              background: isDark ? "#1a1a1a" : "#ffffff",
              border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
              color: theme.text.primary,
              borderRadius: "10px",
            }}
          >
            Import from CSV
          </Button>

          {showSplitwiseSync && (
            <Button
              icon={<SyncOutlined />}
              size="large"
              block
              onClick={onSyncSplitwise}
              style={{
                height: "44px",
                fontSize: "14px",
                background: isDark ? "#1a1a1a" : "#ffffff",
                border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e5e5",
                color: theme.text.primary,
                borderRadius: "10px",
              }}
            >
              Sync from Splitwise
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default EmptyState;
