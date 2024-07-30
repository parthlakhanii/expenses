import React, { useEffect, useState } from "react";
import { FloatButton, Layout, Row, Col, ConfigProvider, Menu } from "antd";
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

const Dashboard = () => {
  const [isProcessCSVOpen, setIsProcessCSVOpen] = useState(false);
  const [isImportSWVOpen, setIsImportSWVOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() - 1).toString()
  );
  const USER_NAME = "parth";
  const USER_ID = "20691939";

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
      if (expenseData.length > 0) {
        const calculatedTotals = await calculateTotals(expenseData);
        setTotals(calculatedTotals);
      }
    };

    calculateAndSetTotals();
  }, [expenseData]); // This effect depends on expenseData

  const openProcessCSV = () => {
    setIsProcessCSVOpen(true);
  };

  const openImportSW = () => {
    setIsImportSWVOpen(true);
  };

  const openAddExpense = () => {
    setIsAddExpenseOpen(true);
  };

  const updateExpenseData = async (month, view) => {
    console.log("month ", month);
    console.log("month ", currentView);
    console.log("view ", view);
    const currentYear = new Date().getFullYear();
    const from = new Date(currentYear, month, 0);
    const to = new Date(currentYear, parseInt(month) + 1, 0);
    setCurrentView(view);
    setSelectedMonth(month);

    // console.log(from);
    // console.log(from.toISOString());
    // console.log(to);

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

  const items1 = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ].map((index, key) => ({
    key,
    label: index,
  }));

  // set expense data in a method before calling Expense List
  return (
    <>
      <Layout
        style={{ minHeight: "100vh", background: "white", headerBg: "white" }}
      >
        <SideMenu
          onMenuClick={(view) => updateExpenseData(selectedMonth, view)}
        />
        <Layout>
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              height: "auto",
            }}
          >
            {/* <div className="demo-logo" /> */}
            <Menu
              mode="horizontal"
              defaultSelectedKeys={selectedMonth}
              items={items1}
              style={{
                flex: 1,
                minWidth: 0,
                background: "white",
              }}
              onClick={(month) => updateExpenseData(month.key, currentView)}
            />
            {totals && <ExpenseTotal total={totals} />}
            {/* <HeaderNavigation /> */}
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
