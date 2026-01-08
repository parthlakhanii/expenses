import React, { useEffect, useState, useCallback } from "react";
import { Layout, Button, Select, Statistic, Card, Alert } from "antd";
import { LeftOutlined, RightOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";
import moment from "moment";
import ReconciliationView from "../components/ReconciliationView";
import { getUnreconciledTransactions } from "../services/reconciliationService";

const { Header, Content } = Layout;

const Reconciliation = () => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [selectedDate, setSelectedDate] = useState(moment());
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const year = selectedDate.year();
      const month = selectedDate.month();
      const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        lastDay
      ).padStart(2, "0")}`;

      const data = await getUnreconciledTransactions(from, to);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handlePreviousMonth = () => {
    setSelectedDate(selectedDate.clone().subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setSelectedDate(selectedDate.clone().add(1, "month"));
  };

  const handleReconciliationUpdate = () => {
    // Refresh data after reconciliation
    fetchTransactions();
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  const monthOptions = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const handleMonthChange = (month) => {
    const newDate = selectedDate.clone().month(month);
    setSelectedDate(newDate);
  };

  const handleYearChange = (year) => {
    const newDate = selectedDate.clone().year(year);
    setSelectedDate(newDate);
  };

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: theme.bg.primary,
      }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: theme.bg.primary,
          padding: "12px 48px 0 48px",
          height: "auto",
          border: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            background: theme.bg.secondary,
            padding: "14px 16px",
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)"
              : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
            border: `1px solid ${theme.border.primary}`,
          }}
        >
          <Button
            type="text"
            icon={<LeftOutlined style={{ fontSize: "12px" }} />}
            onClick={handlePreviousMonth}
            size="large"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              background: theme.bg.tertiary,
              border: `1px solid ${theme.border.secondary}`,
              borderRadius: "8px",
              minWidth: "36px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0px",
              background: theme.bg.tertiary,
              borderRadius: "8px",
              border: `1px solid ${theme.border.secondary}`,
              overflow: "hidden",
            }}
          >
            <Select
              value={selectedDate.month()}
              onChange={handleMonthChange}
              style={{
                width: 140,
                fontWeight: 600,
                fontSize: "15px",
              }}
              size="large"
              variant="borderless"
              options={monthOptions}
              suffixIcon={null}
            />
            <div
              style={{
                width: "1px",
                height: "24px",
                background: theme.border.secondary,
              }}
            ></div>
            <Select
              value={selectedDate.year()}
              onChange={handleYearChange}
              style={{
                width: 85,
                fontWeight: 600,
                fontSize: "15px",
              }}
              size="large"
              variant="borderless"
              options={yearOptions.map((year) => ({
                value: year,
                label: year,
              }))}
              suffixIcon={null}
            />
          </div>
          <Button
            type="text"
            icon={<RightOutlined style={{ fontSize: "12px" }} />}
            onClick={handleNextMonth}
            size="large"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              background: theme.bg.tertiary,
              border: `1px solid ${theme.border.secondary}`,
              borderRadius: "8px",
              minWidth: "36px",
            }}
          />
        </div>

        {transactions && (
          <div style={{ display: "flex", gap: "12px" }}>
            <Card
              bordered={false}
              style={{
                background: theme.bg.secondary,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: "12px",
                minWidth: "180px",
                boxShadow: isDark
                  ? "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{
                padding: "20px",
              }}
            >
              <Statistic
                title="Bank Transactions"
                value={transactions.bankTransactions?.length || 0}
                valueStyle={{
                  color: theme.text.primary,
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              />
            </Card>
            <Card
              bordered={false}
              style={{
                background: theme.bg.secondary,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: "12px",
                minWidth: "180px",
                boxShadow: isDark
                  ? "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{
                padding: "20px",
              }}
            >
              <Statistic
                title="Splitwise Expenses"
                value={transactions.splitwiseExpenses?.length || 0}
                valueStyle={{
                  color: theme.text.primary,
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </div>
        )}
      </Header>

      <Content style={{ padding: "12px 48px 24px 48px" }}>
        <Alert
          message="Match Splits"
          description="Link your bank transactions with Splitwise expenses you paid for to avoid double-counting. When you pay for a group expense, it appears both in your bank statement and Splitwise. Mark these as matched to exclude your share from budget calculations."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{
            marginBottom: "12px",
            borderRadius: "12px",
            background: theme.bg.secondary,
            border: `1px solid ${theme.border.primary}`,
          }}
        />
        {transactions ? (
          <ReconciliationView
            bankTransactions={transactions.bankTransactions || []}
            splitwiseExpenses={transactions.splitwiseExpenses || []}
            onUpdate={handleReconciliationUpdate}
          />
        ) : (
          <Card style={cardStyle}>
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: theme.text.secondary,
              }}
            >
              {loading ? "Loading..." : "No transactions to match"}
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default Reconciliation;
