import React, { useEffect, useState } from "react";
import {
  FloatButton,
  Layout,
  Select,
  Button,
  DatePicker,
  Segmented,
} from "antd";
import CsvImportWizard from "../components/CsvImportWizard";
import ImportFromSW from "../components/ImportFromSW";
import AddExpense from "../components/AddExpense";
import ExpenseList from "../components/ExpenseList";
import {
  CommentOutlined,
  PlusOutlined,
  FileExcelOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import {
  getExpensesByMonth,
  calculateTotals,
  getSplitWiseExpenseByUserName,
} from "../services/expenseService";
import ExpenseTotal from "../components/ExpenseTotal";
import { Content, Header } from "antd/es/layout/layout";
import SideMenu from "../components/SideMenu";
import { ReactComponent as SplitwiseIcon } from "../styles/splitwise-icon-black.svg";
import moment from "moment";

const Dashboard = () => {
  const [isCsvImportWizardOpen, setIsCsvImportWizardOpen] = useState(false);
  const [isImportSWVOpen, setIsImportSWVOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [dateMode, setDateMode] = useState("monthly"); // "monthly" or "custom"
  const [customRange, setCustomRange] = useState(null);
  const USER_NAME = process.env.REACT_APP_USER_NAME;
  const USER_ID = process.env.REACT_APP_USER_ID;
  const { RangePicker } = DatePicker;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        // Use YYYY-MM-DD format strings instead of ISO strings to avoid timezone issues
        const from = `${currentYear}-${String(currentMonth + 1).padStart(
          2,
          "0"
        )}-01`;
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        const to = `${currentYear}-${String(currentMonth + 1).padStart(
          2,
          "0"
        )}-${String(lastDay).padStart(2, "0")}`;
        const data = await getExpensesByMonth(from, to);
        setExpenseData(data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    const calculateAndSetTotals = async () => {
      const calculatedTotals = await calculateTotals(expenseData);
      setTotals(calculatedTotals);
    };

    calculateAndSetTotals();
  }, [expenseData]);

  const openCsvImportWizard = () => {
    setIsCsvImportWizardOpen(true);
  };

  const openImportSW = () => {
    setIsImportSWVOpen(true);
  };

  const openAddExpense = () => {
    setIsAddExpenseOpen(true);
  };

  const handleImportSuccess = () => {
    // Refresh expense data after successful import
    updateExpenseData(selectedDate, currentView);
  };

  const updateExpenseData = async (date, view) => {
    const year = date.year();
    const month = date.month();
    // Use YYYY-MM-DD format strings instead of ISO strings to avoid timezone issues
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      lastDay
    ).padStart(2, "0")}`;
    setCurrentView(view);
    setSelectedDate(date);

    if (view === "splitwise") {
      setExpenseData(await getSplitWiseExpenseByUserName(from, to, USER_NAME));
    } else if (view === "dashboard") {
      setExpenseData(await getExpensesByMonth(from, to, USER_NAME));
    }
  };

  const handleMonthChange = (month) => {
    const newDate = selectedDate.clone().month(month);
    updateExpenseData(newDate, currentView);
  };

  const handleYearChange = (year) => {
    const newDate = selectedDate.clone().year(year);
    updateExpenseData(newDate, currentView);
  };

  const handlePreviousMonth = () => {
    const newDate = selectedDate.clone().subtract(1, "month");
    updateExpenseData(newDate, currentView);
  };

  const handleNextMonth = () => {
    const newDate = selectedDate.clone().add(1, "month");
    updateExpenseData(newDate, currentView);
  };

  const handleCustomRangeChange = async (dates) => {
    if (dates && dates[0] && dates[1]) {
      setCustomRange(dates);
      const from = dates[0].format("YYYY-MM-DD");
      const to = dates[1].format("YYYY-MM-DD");

      if (currentView === "splitwise") {
        setExpenseData(
          await getSplitWiseExpenseByUserName(from, to, USER_NAME)
        );
      } else if (currentView === "dashboard") {
        setExpenseData(await getExpensesByMonth(from, to, USER_NAME));
      }
    }
  };

  const handleDateModeChange = (mode) => {
    setDateMode(mode);
    if (mode === "monthly") {
      // Reset to current month when switching back to monthly
      updateExpenseData(selectedDate, currentView);
    }
  };

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  const monthOptions = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // set expense data in a method before calling Expense List
  return (
    <>
      <Layout
        style={{ minHeight: "100vh", background: "white", headerBg: "white" }}
      >
        <SideMenu
          onMenuClick={(view) => updateExpenseData(selectedDate, view)}
        />
        <Layout>
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "white",
              height: "auto",
              padding: "16px 48px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#ffffff",
              padding: "14px 16px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
              width: "380px"
            }}>
              <Segmented
                options={[
                  { label: "Month", value: "monthly" },
                  {
                    label: "Custom Range",
                    value: "custom",
                    icon: <CalendarOutlined />,
                  },
                ]}
                value={dateMode}
                onChange={handleDateModeChange}
                block
                style={{
                  background: "#f3f4f6",
                  padding: "4px",
                  fontWeight: 500
                }}
              />

              {dateMode === "monthly" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: "6px",
                  }}
                >
                  <Button
                    type="text"
                    icon={<LeftOutlined style={{ fontSize: "12px" }} />}
                    onClick={handlePreviousMonth}
                    size="large"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 8px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      minWidth: "36px"
                    }}
                  />
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0px",
                    flex: 1,
                    background: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden"
                  }}>
                    <Select
                      value={selectedDate.month()}
                      onChange={handleMonthChange}
                      style={{
                        flex: 1,
                        fontWeight: 600,
                        fontSize: "15px"
                      }}
                      size="large"
                      variant="borderless"
                      options={monthOptions}
                      suffixIcon={null}
                      popupMatchSelectWidth={false}
                    />
                    <div style={{
                      width: "1px",
                      height: "24px",
                      background: "#e5e7eb"
                    }}></div>
                    <Select
                      value={selectedDate.year()}
                      onChange={handleYearChange}
                      style={{
                        width: 85,
                        fontWeight: 600,
                        fontSize: "15px"
                      }}
                      size="large"
                      variant="borderless"
                      options={yearOptions.map((year) => ({
                        value: year,
                        label: year,
                      }))}
                      suffixIcon={null}
                    />
                  </div>
                  <Button
                    type="text"
                    icon={<RightOutlined style={{ fontSize: "12px" }} />}
                    onClick={handleNextMonth}
                    size="large"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 8px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      minWidth: "36px"
                    }}
                  />
                </div>
              ) : (
                <RangePicker
                  value={customRange}
                  onChange={handleCustomRangeChange}
                  size="large"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb"
                  }}
                  format="MMM DD, YYYY"
                />
              )}
            </div>
            {totals && <ExpenseTotal total={totals} />}
          </Header>
          <Content
            style={{
              padding: "0 48px",
            }}
          >
            {expenseData && (
              <ExpenseList expenseData={expenseData} view={currentView} />
            )}
          </Content>
        </Layout>

        {/* <Row justify="center" align="middle" style={{ minHeight: "100vh" }}> */}
        {/* </Row> */}
      </Layout>

      <CsvImportWizard
        open={isCsvImportWizardOpen}
        onClose={() => setIsCsvImportWizardOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <ImportFromSW
        open={isImportSWVOpen}
        onClose={() => setIsImportSWVOpen(false)}
      />

      <AddExpense
        open={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{
          right: 24,
        }}
        icon={<PlusOutlined />}
      >
        <FloatButton
          onClick={openCsvImportWizard}
          tooltip={<div>Import CSV</div>}
          icon={<FileExcelOutlined />}
        />
        <FloatButton
          onClick={openImportSW}
          tooltip={<div>Sync Splitwise</div>}
          icon={<SplitwiseIcon />}
        />
        <FloatButton
          onClick={openAddExpense}
          tooltip={<div>Add Expense</div>}
          icon={<CommentOutlined />}
        />
      </FloatButton.Group>
    </>
  );
};

export default Dashboard;
