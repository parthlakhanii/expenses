import React, { useEffect, useState } from "react";
import { Card } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { calculateSpendingTrends } from "../utils/chartDataProcessing";
import { getExpensesByMonth } from "../services/expenseService";
import moment from "moment";

const SpendingTrendsChart = () => {
  const { isDark } = useTheme();
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      // Fetch last 6 months of data
      const startDate = moment().subtract(6, "months").startOf("month");
      const endDate = moment().endOf("month");

      const from = startDate.format("YYYY-MM-DD");
      const to = endDate.format("YYYY-MM-DD");

      const allExpenses = await getExpensesByMonth(from, to);
      const trends = calculateSpendingTrends(allExpenses, 6);
      setTrendData(trends);
    } catch (error) {
      console.error("Failed to fetch trend data:", error);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`,
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.12)",
          }}
        >
          <p
            style={{
              color: isDark ? "#e2e8f0" : "#1e293b",
              margin: 0,
              fontWeight: 500,
            }}
          >
            {payload[0].payload.month}
          </p>
          <p
            style={{
              color: "#f87171",
              margin: "4px 0 0 0",
              fontWeight: 600,
            }}
          >
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Spending Trends"
      bordered={false}
      style={cardStyle}
      loading={loading}
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={trendData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#334155" : "#e5e7eb"}
          />
          <XAxis
            dataKey="month"
            stroke={isDark ? "#94a3b8" : "#64748b"}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke={isDark ? "#94a3b8" : "#64748b"}
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#f87171"
            strokeWidth={2}
            dot={{ fill: "#f87171", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default SpendingTrendsChart;
