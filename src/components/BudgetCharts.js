import React from "react";
import { Card } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BudgetCharts = ({ categories }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "0px",
    boxShadow: isDark
      ? "0 1px 3px rgba(0, 0, 0, 0.3)"
      : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  // Prepare data for bar chart (budgeted vs spent)
  const barData = categories
    .filter((cat) => cat.budgeted > 0)
    .map((cat) => ({
      category: cat.category,
      Budgeted: cat.budgeted,
      Spent: cat.spent,
    }));

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: theme.bg.elevated,
            border: `1px solid ${theme.border.secondary}`,
            borderRadius: "8px",
            padding: "10px 14px",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0,0,0,0.5)"
              : "0 1px 3px rgba(0,0,0,0.12)",
          }}
        >
          <p
            style={{
              color: theme.text.primary,
              margin: 0,
              fontWeight: 600,
              marginBottom: "6px",
              fontSize: "13px",
            }}
          >
            {payload[0].payload.category}
          </p>
          <p
            style={{
              color: "#60a5fa",
              margin: "4px 0",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            Budgeted: ${payload[0].value.toFixed(2)}
          </p>
          <p
            style={{
              color: "#f87171",
              margin: "4px 0",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            Spent: ${payload[1].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Budget vs Actual"
      variant="borderless"
      style={{ ...cardStyle, marginBottom: 12 }}
      styles={{ header: { borderBottom: "none" } }}
      extra={
        <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "#60a5fa",
              }}
            />
            <span style={{ color: theme.text.secondary }}>Budgeted</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "#f87171",
              }}
            />
            <span style={{ color: theme.text.secondary }}>Spent</span>
          </div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={barData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          // barGap={-2}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.border.primary}
            strokeOpacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="category"
            stroke={theme.text.tertiary}
            tick={{ fill: theme.text.tertiary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={theme.text.tertiary}
            tick={{ fill: theme.text.tertiary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "transparent" }} />
          <Bar
            dataKey="Budgeted"
            fill="#60a5fa"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="Spent"
            fill="#f87171"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BudgetCharts;
