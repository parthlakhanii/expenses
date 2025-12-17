import React, { useEffect, useState } from "react";
import { Layout, Button, Card } from "antd";
import { PlusOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import moment from "moment";
import BudgetOverview from "../components/BudgetOverview";
import BudgetForm from "../components/BudgetForm";
import BudgetCharts from "../components/BudgetCharts";
import CategoryBudgets from "../components/CategoryBudgets";
import { getBudgetTracking } from "../services/budgetService";

const { Header, Content } = Layout;

const Budgets = () => {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [budgetData, setBudgetData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgetData();
  }, [selectedDate]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const data = await getBudgetTracking(
        selectedDate.month(),
        selectedDate.year()
      );
      setBudgetData(data);
    } catch (error) {
      console.error("Failed to load budget data:", error);
    } finally {
      setLoading(false);
    }
  };

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
        background: isDark ? "#0f172a" : "#f8fafc",
      }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isDark ? "#1e293b" : "#ffffff",
          padding: "24px 48px",
          borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        }}
      >
        {/* Month selector */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button
            icon={<LeftOutlined />}
            onClick={handlePreviousMonth}
            type="text"
            style={{
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
          >
            {selectedDate.format("MMMM YYYY")}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={handleNextMonth}
            type="text"
            style={{
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsFormOpen(true)}
        >
          Set Budget
        </Button>
      </Header>

      <Content style={{ padding: "24px 48px" }}>
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
              background: isDark ? "#0f172a" : "#ffffff",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              borderRadius: "12px",
            }}
          >
            <h3 style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
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
