import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { colors, fontSize, fontWeight } from "../styles/theme";

const ExpenseTotal = ({ total, visibleTotals }) => {
  const { isDark } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const theme = isDark ? colors.dark : colors.light;

  // Default to showing all if not specified
  const totals = visibleTotals || {
    expense: true,
    income: true,
    investment: true,
    transfer: true,
  };

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    overflow: "hidden",
  };

  const cardBodyStyle = {
    padding: "24px 20px",
    overflow: "hidden",
  };

  const titleStyle = {
    color: theme.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  };

  const valueStyle = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  };

  // Use fixed grid on mobile/tablet, flexible auto-sizing on desktop
  const colProps = isMobile
    ? { span: 24 }  // Full width on mobile (stacked)
    : isTablet
    ? { span: 12 }  // 2 per row on tablet
    : {};           // Flex on desktop

  const cardStyleWithWidth = isMobile || isTablet
    ? cardStyle
    : { ...cardStyle, minWidth: "180px" };

  return (
    <Row gutter={[12, 12]} style={{ display: "flex" }}>
      {totals.expense && total.totalExpense !== 0 && (
        <Col {...colProps} style={!(isMobile || isTablet) ? { flex: "1 1 auto" } : {}}>
          <Card variant="borderless" style={cardStyleWithWidth} styles={{ body: cardBodyStyle }}>
            <Statistic
              title="Expense"
              value={total.totalExpense}
              precision={2}
              valueStyle={{
                ...valueStyle,
                color: "#f87171",
              }}
              style={{ ...titleStyle }}
            />
          </Card>
        </Col>
      )}
      {totals.income && total.totalIncome !== 0 && (
        <Col {...colProps} style={!(isMobile || isTablet) ? { flex: "1 1 auto" } : {}}>
          <Card variant="borderless" style={cardStyleWithWidth} styles={{ body: cardBodyStyle }}>
            <Statistic
              title="Income"
              value={total.totalIncome}
              precision={2}
              valueStyle={{
                ...valueStyle,
                color: "#34d399",
              }}
            />
          </Card>
        </Col>
      )}
      {totals.investment && total.totalInvestment !== 0 && (
        <Col {...colProps} style={!(isMobile || isTablet) ? { flex: "1 1 auto" } : {}}>
          <Card variant="borderless" style={cardStyleWithWidth} styles={{ body: cardBodyStyle }}>
            <Statistic
              title="Investment"
              value={total.totalInvestment}
              precision={2}
              valueStyle={{
                ...valueStyle,
                color: "#60a5fa",
              }}
            />
          </Card>
        </Col>
      )}
      {totals.transfer && total.totalOthers !== 0 && (
        <Col {...colProps} style={!(isMobile || isTablet) ? { flex: "1 1 auto" } : {}}>
          <Card variant="borderless" style={cardStyleWithWidth} styles={{ body: cardBodyStyle }}>
            <Statistic
              title="Transfer"
              value={total.totalOthers}
              precision={2}
              valueStyle={{
                ...valueStyle,
                color: "#a78bfa",
              }}
            />
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default ExpenseTotal;
