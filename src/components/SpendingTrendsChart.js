import React, { useEffect, useState, useCallback } from "react";
import { Card } from "antd";
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
  const [hasExpenses, setHasExpenses] = useState(false);
  const [hasIncome, setHasIncome] = useState(false);
  const [hasInvestment, setHasInvestment] = useState(false);

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

      // Check if each type has any non-zero values
      const totalExpenses = trends.reduce((sum, d) => sum + d.expenses, 0);
      const totalIncome = trends.reduce((sum, d) => sum + d.income, 0);
      const totalInvestment = trends.reduce((sum, d) => sum + d.investment, 0);

      setHasExpenses(totalExpenses > 0);
      setHasIncome(totalIncome > 0);
      setHasInvestment(totalInvestment > 0);
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
          {hasExpenses && (
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
          {hasIncome && (
            <p
              style={{
                color: "#34d399",
                margin: "4px 0",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Income: ${data.income.toFixed(2)}
            </p>
          )}
          {hasInvestment && (
            <p
              style={{
                color: "#60a5fa",
                margin: "4px 0",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Investment: ${data.investment.toFixed(2)}
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

  // Wealthsimple-style time selector component
  const TimeSelector = () => (
    <div
      style={{
        display: "inline-flex",
        background: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.04)",
        borderRadius: "8px",
        padding: "2px",
        gap: "2px",
      }}
    >
      {timeRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTimeRange(option.value)}
          style={{
            padding: "6px 14px",
            border: "none",
            borderRadius: "6px",
            background:
              timeRange === option.value
                ? isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "#ffffff"
                : "transparent",
            color:
              timeRange === option.value
                ? theme.text.primary
                : theme.text.tertiary,
            fontWeight: timeRange === option.value ? 600 : 500,
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow:
              timeRange === option.value
                ? isDark
                  ? "0 1px 3px rgba(0, 0, 0, 0.4)"
                  : "0 1px 2px rgba(0, 0, 0, 0.08)"
                : "none",
            position: "relative",
            zIndex: timeRange === option.value ? 1 : 0,
          }}
          onMouseEnter={(e) => {
            if (timeRange !== option.value) {
              e.target.style.color = theme.text.secondary;
            }
          }}
          onMouseLeave={(e) => {
            if (timeRange !== option.value) {
              e.target.style.color = theme.text.tertiary;
            }
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <Card
      title="Cash Flow"
      variant="borderless"
      style={cardStyle}
      loading={loading}
      styles={{ header: { borderBottom: "none" } }}
      extra={<TimeSelector />}
    >
      <ResponsiveContainer width="100%" height={350}>
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
          {hasExpenses && (
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
          {hasIncome && (
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
          {hasInvestment && (
            <Line
              type="monotone"
              dataKey="investment"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="Investment"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default SpendingTrendsChart;
