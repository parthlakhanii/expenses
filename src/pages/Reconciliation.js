import React, { useEffect, useState } from "react";
import { Layout, Button, Select, Row, Col, Statistic, Card, Typography, Alert } from "antd";
import { LeftOutlined, RightOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import moment from "moment";
import ReconciliationView from "../components/ReconciliationView";
import { getUnreconciledTransactions } from "../services/reconciliationService";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Reconciliation = () => {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [selectedDate]);

  const fetchTransactions = async () => {
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
  };

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
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: isDark ? "#0f172a" : "#f8fafc",
      }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isDark ? "#1e293b" : "#ffffff",
          padding: "24px 48px",
          borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            background: isDark ? "#0f172a" : "#ffffff",
            padding: "14px 16px",
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)"
              : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
            border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
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
              background: isDark ? "#1e293b" : "#f9fafb",
              border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`,
              borderRadius: "8px",
              minWidth: "36px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0px",
              background: isDark ? "#1e293b" : "#f9fafb",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`,
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
                background: isDark ? "#475569" : "#e5e7eb",
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
              background: isDark ? "#1e293b" : "#f9fafb",
              border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`,
              borderRadius: "8px",
              minWidth: "36px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "24px" }}>
          {transactions && (
            <>
              <Statistic
                title="Bank Transactions"
                value={transactions.bankTransactions?.length || 0}
                valueStyle={{
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  fontSize: "20px",
                }}
              />
              <Statistic
                title="Splitwise Expenses"
                value={transactions.splitwiseExpenses?.length || 0}
                valueStyle={{
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  fontSize: "20px",
                }}
              />
            </>
          )}
        </div>
      </Header>

      <Content style={{ padding: "24px 48px" }}>
        <Alert
          message="Match Splits"
          description="Link your bank transactions with Splitwise expenses you paid for to avoid double-counting. When you pay for a group expense, it appears both in your bank statement and Splitwise. Mark these as matched to exclude your share from budget calculations."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            background: isDark ? "#1e293b" : "#f0f9ff",
            border: `1px solid ${isDark ? "#334155" : "#bae6fd"}`,
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
                color: isDark ? "#94a3b8" : "#64748b",
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
