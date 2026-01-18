import React, { useMemo } from "react";
import { Card, Progress, Row, Col, Typography } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../contexts/ThemeContext";
import { useCategories } from "../contexts/CategoryContext";
import { colors } from "../styles/theme";

const { Text } = Typography;

const CategoryBudgets = ({ categories }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { categories: allCategories } = useCategories();

  // Create a color map from categories
  const categoryColorMap = useMemo(() => {
    const map = {};
    allCategories.forEach((cat) => {
      map[cat.name] = cat.color || "#94a3b8";
    });
    return map;
  }, [allCategories]);

  const getColor = (status) => {
    if (status === "exceeded") return "#f87171";
    if (status === "warning") return "#fbbf24";
    return "#34d399";
  };

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "0px",
    boxShadow: isDark
      ? "0 1px 3px rgba(0, 0, 0, 0.3)"
      : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  const categoriesWithBudget = categories.filter((cat) => cat.budgeted > 0);

  // Pie chart data - only budgeted categories with spending
  const pieData = categoriesWithBudget
    .filter((cat) => cat.spent > 0)
    .map((cat) => ({
      name: cat.category,
      value: cat.spent,
      color: categoryColorMap[cat.category] || "#94a3b8",
    }));

  const totalSpent = pieData.reduce((sum, cat) => sum + cat.value, 0);

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalSpent) * 100).toFixed(1);
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
          <p style={{ color: theme.text.primary, margin: 0, fontWeight: 600, fontSize: "13px" }}>
            {payload[0].name}
          </p>
          <p style={{ color: payload[0].payload.color, margin: "4px 0 0", fontWeight: 600, fontSize: "12px" }}>
            ${payload[0].value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Don't render if no categories have budgets and no spending
  if (categoriesWithBudget.length === 0 && pieData.length === 0) {
    return null;
  }

  return (
    <Card
      title="Spending by Category"
      variant="borderless"
      style={cardStyle}
      styles={{ header: { borderBottom: "none" } }}
    >
      <Row gutter={[24, 16]}>
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <Col xs={24} md={10} lg={8}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={85}
                    innerRadius={55}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={theme.bg.secondary}
                        strokeWidth={2}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Text style={{ color: theme.text.secondary, fontSize: 12 }}>Total Spent</Text>
                <div style={{ color: theme.text.primary, fontSize: 20, fontWeight: 600 }}>
                  ${totalSpent.toFixed(2)}
                </div>
              </div>
            </div>
          </Col>
        )}

        {/* Category Progress Bars */}
        <Col xs={24} md={pieData.length > 0 ? 14 : 24} lg={pieData.length > 0 ? 16 : 24}>
          <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 8 }}>
            {categoriesWithBudget.map((cat, index) => (
              <div
                key={cat.category}
                style={{
                  marginBottom: index === categoriesWithBudget.length - 1 ? "0px" : "12px",
                  padding: "12px 14px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border.primary}`,
                }}
              >
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: categoryColorMap[cat.category] || "#94a3b8",
                        }}
                      />
                      <Text
                        strong
                        style={{
                          color: theme.text.primary,
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {cat.category}
                      </Text>
                    </div>
                  </Col>
                  <Col>
                    <Text
                      style={{
                        color: theme.text.secondary,
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      ${cat.spent.toFixed(2)} / ${cat.budgeted.toFixed(2)}
                    </Text>
                  </Col>
                </Row>
                <Progress
                  percent={Math.min(cat.percentage, 100)}
                  strokeColor={getColor(cat.status)}
                  trailColor={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}
                  strokeWidth={6}
                  strokeLinecap="round"
                  showInfo={true}
                  format={() => (
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>
                      {cat.percentage.toFixed(0)}%
                    </span>
                  )}
                />
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CategoryBudgets;
