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
    boxShadow: isDark
      ? "0 1px 3px rgba(0, 0, 0, 0.3)"
      : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  return (
    <Card variant="borderless" style={cardStyle}>
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title={<span style={{ fontSize: "13px", color: theme.text.secondary }}>Total Budget</span>}
            value={overall.budgeted}
            precision={2}
            prefix="$"
            valueStyle={{ color: theme.text.primary, fontSize: "24px", fontWeight: 600 }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title={<span style={{ fontSize: "13px", color: theme.text.secondary }}>Spent</span>}
            value={overall.spent}
            precision={2}
            prefix="$"
            valueStyle={{ color: getColor(overall.status), fontSize: "24px", fontWeight: 600 }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title={<span style={{ fontSize: "13px", color: theme.text.secondary }}>Remaining</span>}
            value={overall.remaining}
            precision={2}
            prefix="$"
            valueStyle={{
              color: overall.remaining < 0 ? "#f87171" : "#34d399",
              fontSize: "24px",
              fontWeight: 600,
            }}
          />
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <Progress
          percent={Math.min(overall.percentage, 100)}
          strokeColor={getColor(overall.status)}
          trailColor={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}
          strokeWidth={10}
          strokeLinecap="round"
        />
      </div>
    </Card>
  );
};

export default BudgetOverview;
