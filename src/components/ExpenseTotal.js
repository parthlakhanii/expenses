import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const ExpenseTotal = ({ total }) => {
  const { isDark } = useTheme();

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    overflow: "hidden",
  };

  const cardBodyStyle = {
    padding: "20px",
    overflow: "hidden",
  };

  const titleStyle = {
    color: isDark ? "#94a3b8" : "#64748b",
    fontSize: "13px",
    fontWeight: 500,
  };

  const colStyle = {
    minWidth: "180px",
  };

  return (
    <Row gutter={12}>
      <Col flex="1 1 0" style={colStyle}>
        <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
          <Statistic
            title="Expense"
            value={total.totalExpense}
            precision={2}
            valueStyle={{
              color: "#f87171",
              fontSize: "20px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
            style={{ ...titleStyle }}
          />
        </Card>
      </Col>
      <Col flex="1 1 0" style={colStyle}>
        <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
          <Statistic
            title="Income"
            value={total.totalIncome}
            precision={2}
            valueStyle={{
              color: "#34d399",
              fontSize: "20px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          />
        </Card>
      </Col>
      <Col flex="1 1 0" style={colStyle}>
        <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
          <Statistic
            title="Investment"
            value={total.totalInvestment}
            precision={2}
            valueStyle={{
              color: "#60a5fa",
              fontSize: "20px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          />
        </Card>
      </Col>
      <Col flex="1 1 0" style={colStyle}>
        <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
          <Statistic
            title="Transfer"
            value={total.totalOthers}
            precision={2}
            valueStyle={{
              color: "#a78bfa",
              fontSize: "20px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ExpenseTotal;
