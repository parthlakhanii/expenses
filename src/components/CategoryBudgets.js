import React from "react";
import { Card, Progress, Row, Col, Typography } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const { Text } = Typography;

const CategoryBudgets = ({ categories }) => {
  const { isDark } = useTheme();

  const getColor = (status) => {
    if (status === "exceeded") return "#f87171";
    if (status === "warning") return "#fbbf24";
    return "#34d399";
  };

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  return (
    <Card title="Category Breakdown" bordered={false} style={cardStyle}>
      {categories
        .filter((cat) => cat.budgeted > 0)
        .map((cat) => (
          <div
            key={cat.category}
            style={{
              marginBottom: "24px",
              padding: "12px",
              background: isDark ? "#1e293b" : "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <Row justify="space-between" style={{ marginBottom: "8px" }}>
              <Col>
                <Text strong style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
                  {cat.category}
                </Text>
              </Col>
              <Col>
                <Text style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
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
