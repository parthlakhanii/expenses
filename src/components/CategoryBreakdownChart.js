import React, { useMemo } from "react";
import { Card } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calculateCategoryBreakdown } from "../utils/chartDataProcessing";

const CategoryBreakdownChart = ({ expenseData }) => {
  const { isDark } = useTheme();

  const categoryData = useMemo(() => {
    return calculateCategoryBreakdown(expenseData || []);
  }, [expenseData]);

  const COLORS = [
    "#f87171",
    "#34d399",
    "#60a5fa",
    "#a78bfa",
    "#fbbf24",
    "#fb923c",
    "#ec4899",
    "#a3e635",
  ];

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);

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
            {payload[0].payload.category}
          </p>
          <p
            style={{
              color: payload[0].payload.fill,
              margin: "4px 0 0 0",
              fontWeight: 600,
            }}
          >
            ${payload[0].value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Don't show label for slices < 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: "12px", fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!categoryData || categoryData.length === 0) {
    return (
      <Card title="Category Breakdown" bordered={false} style={cardStyle}>
        <div
          style={{
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDark ? "#94a3b8" : "#64748b",
          }}
        >
          No expense data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Category Breakdown" bordered={false} style={cardStyle}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={90}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "16px",
          justifyContent: "center",
        }}
      >
        {categoryData.slice(0, 8).map((cat, index) => (
          <div
            key={cat.category}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: COLORS[index % COLORS.length],
              }}
            />
            <span>{cat.category}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CategoryBreakdownChart;
