import React from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";

const BudgetOverview = ({ overall }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const getColor = (status) => {
    if (status === "exceeded") return "#f87171"; // Red
    if (status === "warning") return "#fbbf24"; // Yellow
    return "#34d399"; // Green
  };

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "12px",
  };

  return (
    <Card bordered={false} style={cardStyle}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title="Total Budget"
            value={overall.budgeted}
            precision={2}
            prefix="$"
            valueStyle={{ color: theme.text.primary }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Spent"
            value={overall.spent}
            precision={2}
            prefix="$"
            valueStyle={{ color: getColor(overall.status) }}
          />
        </Col>
        <Col xs={24} sm={8}>
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
      <div style={{ marginTop: "16px" }}>
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
