import React, { useMemo } from "react";
import { Card } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calculateCategoryBreakdown } from "../utils/chartDataProcessing";
import { colors } from "../styles/theme";

const CategoryBreakdownChart = ({ expenseData }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const categoryData = useMemo(() => {
    return calculateCategoryBreakdown(expenseData || []);
  }, [expenseData]);

  // Enhanced color palette - more vibrant and distinct
  const COLORS = [
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
  ];

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "0px",
    height: "450px",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);

      return (
        <div
          style={{
            background: theme.bg.elevated,
            border: `1px solid ${theme.border.secondary}`,
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: isDark
              ? "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)"
              : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            minWidth: "150px",
          }}
        >
          <p
            style={{
              color: theme.text.primary,
              margin: 0,
              fontWeight: 600,
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            {payload[0].payload.category}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: payload[0].payload.fill,
              }}
            />
            <p
              style={{
                color: theme.text.secondary,
                margin: 0,
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              ${payload[0].value.toFixed(2)}
            </p>
          </div>
          <p
            style={{
              color: payload[0].payload.fill,
              margin: "4px 0 0 18px",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (!categoryData || categoryData.length === 0) {
    return (
      <Card title="Category Breakdown" bordered={false} style={cardStyle} headStyle={{ borderBottom: "none" }}>
        <div
          style={{
            height: 320,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: theme.text.secondary,
            fontSize: "14px",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 500 }}>
            No expenses to display
          </div>
          <div style={{ fontSize: "13px", opacity: 0.8 }}>
            Add expenses to see category breakdown
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Category Breakdown" bordered={false} style={cardStyle} headStyle={{ borderBottom: "none" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={130}
              innerRadius={85}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={0}
              animationBegin={0}
              animationDuration={800}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={theme.bg.secondary}
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CategoryBreakdownChart;
