import React, { useEffect, useState, useCallback } from "react";
import { Layout, Button, Card } from "antd";
import { EditOutlined, LeftOutlined, RightOutlined, PlusOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import moment from "moment";
import BudgetOverview from "../components/BudgetOverview";
import BudgetForm from "../components/BudgetForm";
import BudgetCharts from "../components/BudgetCharts";
import CategoryBudgets from "../components/CategoryBudgets";
import { getBudgetTracking } from "../services/budgetService";
import { colors } from "../styles/theme";

const { Header, Content } = Layout;

const Budgets = () => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [selectedDate, setSelectedDate] = useState(moment());
  const [budgetData, setBudgetData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchBudgetData = useCallback(async () => {
    try {
      const data = await getBudgetTracking(
        selectedDate.month(),
        selectedDate.year()
      );
      setBudgetData(data);
    } catch (error) {
      console.error("Failed to load budget data:", error);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handlePreviousMonth = () => {
    setSelectedDate(selectedDate.clone().subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setSelectedDate(selectedDate.clone().add(1, "month"));
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchBudgetData();
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: theme.bg.primary,
      }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: theme.bg.primary,
          padding: "12px 48px 0 48px",
          border: "none",
        }}
      >
        {/* Month selector */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button
            icon={<LeftOutlined />}
            onClick={handlePreviousMonth}
            type="text"
            style={{
              color: theme.text.primary,
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: theme.text.primary,
            }}
          >
            {selectedDate.format("MMMM YYYY")}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={handleNextMonth}
            type="text"
            style={{
              color: theme.text.primary,
            }}
          />
        </div>

        {budgetData?.hasBudget && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setIsFormOpen(true)}
            style={{ color: theme.text.secondary }}
          />
        )}
      </Header>

      <Content style={{ padding: "12px 48px 24px 48px" }}>
        {budgetData?.hasBudget ? (
          <>
            {/* Overall budget overview */}
            <BudgetOverview overall={budgetData.overall} />

            {/* Charts section */}
            <BudgetCharts categories={budgetData.categories} />

            {/* Category breakdown table */}
            <CategoryBudgets categories={budgetData.categories} />
          </>
        ) : (
          <Card
            style={{
              textAlign: "center",
              padding: "48px",
              background: theme.bg.secondary,
              border: `1px solid ${theme.border.primary}`,
              borderRadius: "12px",
            }}
          >
            <h3 style={{ color: theme.text.primary }}>
              No budget set for {selectedDate.format("MMMM YYYY")}
            </h3>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsFormOpen(true)}
              style={{ marginTop: "16px" }}
            >
              Create Budget
            </Button>
          </Card>
        )}
      </Content>

      <BudgetForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        month={selectedDate.month()}
        year={selectedDate.year()}
      />
    </Layout>
  );
};

export default Budgets;
