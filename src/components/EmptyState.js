import React from "react";
import { Button, Card, Space, Typography } from "antd";
import {
  PlusOutlined,
  FileAddOutlined,
  SyncOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";

const { Title, Text } = Typography;

const EmptyState = ({
  onAddExpense,
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
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
          borderRadius: "12px",
          boxShadow: isDark
            ? "0 4px 6px -1px rgba(0,0,0,0.3)"
            : "0 1px 3px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: "48px 32px" }}
      >
        <InboxOutlined
          style={{
            fontSize: "64px",
            color: theme.text.tertiary,
            marginBottom: "24px",
          }}
        />
        <Title level={3} style={{ color: theme.text.primary, marginBottom: "8px" }}>
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
          Get started by adding your first expense or importing data
        </Text>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            block
            onClick={onAddExpense}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              height: "48px",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            Add Expense
          </Button>

          <Button
            icon={<FileAddOutlined />}
            size="large"
            block
            onClick={onImportCSV}
            style={{
              height: "48px",
              fontSize: "15px",
              background: theme.bg.tertiary,
              border: `1px solid ${theme.border.secondary}`,
              color: theme.text.primary,
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
                height: "48px",
                fontSize: "15px",
                background: theme.bg.tertiary,
                border: `1px solid ${theme.border.secondary}`,
                color: theme.text.primary,
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
