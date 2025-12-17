import React, { useMemo } from "react";
import { Card, Progress } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { getTopCategories } from "../utils/chartDataProcessing";

const TopCategoriesWidget = ({ expenseData }) => {
  const { isDark } = useTheme();

  const topCategories = useMemo(() => {
    return getTopCategories(expenseData || [], 5);
  }, [expenseData]);

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  const getColorByIndex = (index) => {
    const colors = [
      "#f87171",
      "#34d399",
      "#60a5fa",
      "#a78bfa",
      "#fbbf24",
    ];
    return colors[index % colors.length];
  };

  if (!topCategories || topCategories.length === 0) {
    return (
      <Card title="Top Categories" bordered={false} style={cardStyle}>
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: isDark ? "#94a3b8" : "#64748b",
          }}
        >
          No expense data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Top Spending Categories" bordered={false} style={cardStyle}>
      <div style={{ padding: "8px 0" }}>
        {topCategories.map((cat, index) => (
          <div
            key={cat.category}
            style={{
              marginBottom: index < topCategories.length - 1 ? "20px" : "0",
            }}
          >
            {/* Category name and amount */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: getColorByIndex(index),
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: isDark ? "#e2e8f0" : "#1e293b",
                  }}
                >
                  {cat.category}
                </span>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isDark ? "#e2e8f0" : "#1e293b",
                }}
              >
                ${cat.amount.toFixed(2)}
              </span>
            </div>

            {/* Progress bar */}
            <Progress
              percent={cat.percentage}
              strokeColor={getColorByIndex(index)}
              showInfo={false}
              size="small"
            />

            {/* Percentage text */}
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: isDark ? "#94a3b8" : "#64748b",
              }}
            >
              {cat.percentage}% of total spending
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopCategoriesWidget;
