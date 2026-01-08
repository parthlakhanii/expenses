import React from "react";
import { Card, Progress, Row, Col, Typography } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";

const { Text } = Typography;

const CategoryBudgets = ({ categories }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

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
  };

  const categoriesWithBudget = categories.filter((cat) => cat.budgeted > 0);

  // Don't render if no categories have budgets
  if (categoriesWithBudget.length === 0) {
    return null;
  }

  return (
    <Card title="Category Breakdown" bordered={false} style={cardStyle}>
      {categoriesWithBudget.map((cat) => (
          <div
            key={cat.category}
            style={{
              marginBottom: "12px",
              padding: "12px",
              background: theme.bg.tertiary,
              borderRadius: "8px",
            }}
          >
            <Row justify="space-between" style={{ marginBottom: "8px" }}>
              <Col>
                <Text strong style={{ color: theme.text.primary }}>
                  {cat.category}
                </Text>
              </Col>
              <Col>
                <Text style={{ color: theme.text.primary }}>
                  ${cat.spent.toFixed(2)} / ${cat.budgeted.toFixed(2)}
                </Text>
              </Col>
            </Row>
            <Progress
              percent={Math.min(cat.percentage, 100)}
              strokeColor={getColor(cat.status)}
              showInfo={true}
              format={(percent) => `${cat.percentage.toFixed(1)}%`}
            />
          </div>
        ))}
    </Card>
  );
};

export default CategoryBudgets;
