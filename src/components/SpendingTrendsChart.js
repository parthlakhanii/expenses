import React, { useEffect, useState, useCallback } from "react";
import { Card, Checkbox, Space } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  calculateExpenseIncomeTrends,
  getDateRangeFromOption,
} from "../utils/chartDataProcessing";
import { getExpensesByMonth } from "../services/storageAdapter";
import { colors } from "../styles/theme";

const SpendingTrendsChart = ({ refreshTrigger }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6m");
  const [showExpenses, setShowExpenses] = useState(true);
  const [showIncome, setShowIncome] = useState(true);

  const fetchTrendData = useCallback(async () => {
    setLoading(true);
    try {
      const rangeInfo = getDateRangeFromOption(timeRange);
      const { from, to, unit, periods } = rangeInfo;

      const allTransactions = await getExpensesByMonth(from, to);
      const trends = calculateExpenseIncomeTrends(
        allTransactions,
        unit,
        periods
      );
      setTrendData(trends);
    } catch (error) {
      console.error("Failed to fetch trend data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchTrendData();
  }, [timeRange, refreshTrigger, fetchTrendData]);

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "0px",
    height: "450px",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: theme.bg.elevated,
            border: `1px solid ${theme.border.secondary}`,
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0,0,0,0.5)"
              : "0 1px 3px rgba(0,0,0,0.12)",
          }}
        >
          <p
            style={{
              color: theme.text.primary,
              margin: 0,
              fontWeight: 500,
              marginBottom: "8px",
            }}
          >
            {data.month}
          </p>
          {showExpenses && (
            <p
              style={{
                color: "#f87171",
                margin: "4px 0",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Expenses: ${data.expenses.toFixed(2)}
            </p>
          )}
          {showIncome && (
            <p
              style={{
                color: "#34d399",
                margin: "4px 0 0 0",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Income: ${data.income.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions = [
    { label: "3M", value: "3m" },
    { label: "6M", value: "6m" },
    { label: "1Y", value: "1y" },
    { label: "All", value: "all" },
  ];

  return (
    <Card
      title="Cash Flow"
      bordered={false}
      style={cardStyle}
      loading={loading}
      headStyle={{ borderBottom: "none" }}
      // extra={
      //   <Space size="small">
      //     <Checkbox
      //       checked={showExpenses}
      //       onChange={(e) => setShowExpenses(e.target.checked)}
      //       style={{
      //         color: isDark ? "#94a3b8" : "#64748b",
      //       }}
      //     >
      //       <span style={{ color: "#f87171", fontWeight: 500 }}>Expenses</span>
      //     </Checkbox>
      //     <Checkbox
      //       checked={showIncome}
      //       onChange={(e) => setShowIncome(e.target.checked)}
      //       style={{
      //         color: isDark ? "#94a3b8" : "#64748b",
      //       }}
      //     >
      //       <span style={{ color: "#34d399", fontWeight: 500 }}>Income</span>
      //     </Checkbox>
      //   </Space>
      // }
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={trendData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <XAxis
            dataKey="month"
            stroke={theme.text.tertiary}
            tick={false}
            tickLine={false}
            height={0}
          />
          <YAxis
            stroke={theme.text.tertiary}
            tick={false}
            tickLine={false}
            width={0}
          />
          <Tooltip content={<CustomTooltip />} />
          {showExpenses && (
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="Expenses"
            />
          )}
          {showIncome && (
            <Line
              type="monotone"
              dataKey="income"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="Income"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Time range selector at bottom */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          paddingBottom: 12,
        }}
      >
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            style={{
              padding: "6px 16px",
              border: "none",
              borderRadius: "8px",
              background:
                timeRange === option.value
                  ? isDark
                    ? "#404040"
                    : "#64748b"
                  : theme.bg.tertiary,
              color:
                timeRange === option.value ? "#ffffff" : theme.text.secondary,
              fontWeight: timeRange === option.value ? 600 : 500,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: "52px",
              boxShadow:
                timeRange === option.value
                  ? isDark
                    ? "0 2px 6px rgba(0, 0, 0, 0.6)"
                    : "0 2px 6px rgba(100, 116, 139, 0.3)"
                  : "none",
            }}
            onMouseEnter={(e) => {
              if (timeRange !== option.value) {
                e.target.style.background = theme.border.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (timeRange !== option.value) {
                e.target.style.background = theme.bg.tertiary;
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default SpendingTrendsChart;
