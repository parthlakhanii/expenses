import React, { useEffect, useState } from "react";
import { FloatButton, Layout, DatePicker } from "antd";
import ProcessCSV from "../components/ProcessCsv";
import ImportFromSW from "../components/ImportFromSW";
import AddExpense from "../components/AddExpense";
import ExpenseList from "../components/ExpenseList";
import {
  CommentOutlined,
  PlusOutlined,
  FileExcelOutlined,
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
  const [isProcessCSVOpen, setIsProcessCSVOpen] = useState(false);
  const [isImportSWVOpen, setIsImportSWVOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(moment());
  const USER_NAME = process.env.REACT_APP_USER_NAME;
  const USER_ID = process.env.REACT_APP_USER_ID;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const from = new Date(currentYear, currentMonth, 1).toISOString();
        const to = new Date(currentYear, currentMonth + 1, 0).toISOString();
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

  const openProcessCSV = () => {
    setIsProcessCSVOpen(true);
  };

  const openImportSW = () => {
    setIsImportSWVOpen(true);
  };

  const openAddExpense = () => {
    setIsAddExpenseOpen(true);
  };

  const updateExpenseData = async (date, view) => {
    const year = date.year();
    const month = date.month();
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0);
    setCurrentView(view);
    setSelectedDate(date);

    if (view === "splitwise") {
      setExpenseData(
        await getSplitWiseExpenseByUserName(
          from.toISOString(),
          to.toISOString(),
          USER_NAME
        )
      );
    } else if (view === "dashboard") {
      setExpenseData(
        await getExpensesByMonth(
          from.toISOString(),
          to.toISOString(),
          USER_NAME
        )
      );
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      updateExpenseData(date, currentView);
    }
  };


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
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              picker="month"
              format="MMMM YYYY"
              allowClear={false}
              style={{
                minWidth: "200px",
                fontSize: "16px",
              }}
              size="large"
            />
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

      <ProcessCSV
        open={isProcessCSVOpen}
        onClose={() => setIsProcessCSVOpen(false)}
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
          onClick={openProcessCSV}
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
