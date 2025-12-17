import React from "react";
import { Card, Row, Col } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BudgetCharts = ({ categories }) => {
  const { isDark } = useTheme();

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  // Prepare data for bar chart (budgeted vs spent)
  const barData = categories
    .filter((cat) => cat.budgeted > 0)
    .map((cat) => ({
      category: cat.category,
      Budgeted: cat.budgeted,
      Spent: cat.spent,
    }));

  // Prepare data for pie chart (spending distribution)
  const pieData = categories
    .filter((cat) => cat.spent > 0)
    .map((cat) => ({
      name: cat.category,
      value: cat.spent,
    }));

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

  return (
    <Row gutter={24}>
      {/* Bar Chart: Budgeted vs Spent */}
      <Col span={12}>
        <Card title="Budget vs Actual" bordered={false} style={cardStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Budgeted" fill="#60a5fa" />
              <Bar dataKey="Spent" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      {/* Pie Chart: Spending Distribution */}
      <Col span={12}>
        <Card title="Spending by Category" bordered={false} style={cardStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
};

export default BudgetCharts;
