import React from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const BudgetOverview = ({ overall }) => {
  const { isDark } = useTheme();

  const getColor = (status) => {
    if (status === "exceeded") return "#f87171"; // Red
    if (status === "warning") return "#fbbf24"; // Yellow
    return "#34d399"; // Green
  };

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  return (
    <Card bordered={false} style={cardStyle}>
      <Row gutter={24}>
        <Col span={8}>
          <Statistic
            title="Total Budget"
            value={overall.budgeted}
            precision={2}
            prefix="$"
            valueStyle={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Spent"
            value={overall.spent}
            precision={2}
            prefix="$"
            valueStyle={{ color: getColor(overall.status) }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Remaining"
            value={overall.remaining}
            precision={2}
            prefix="$"
            valueStyle={{
              color: overall.remaining < 0 ? "#f87171" : "#34d399",
            }}
          />
        </Col>
      </Row>
      <div style={{ marginTop: "24px" }}>
        <Progress
          percent={Math.min(overall.percentage, 100)}
          strokeColor={getColor(overall.status)}
          size="large"
        />
      </div>
    </Card>
  );
};

export default BudgetOverview;
