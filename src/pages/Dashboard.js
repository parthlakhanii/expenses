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
  MoneyCollectOutlined,
} from "@ant-design/icons";
import {
  getAllExpenses,
  getExpensesByMonth,
  calculateTotals,
} from "../services/expenseService";
import ExpenseTotal from "../components/ExpenseTotal";
import { Content, Header } from "antd/es/layout/layout";

// class Dashboard extends React.Component {}

const Dashboard = () => {
  const [isProcessCSVOpen, setIsProcessCSVOpen] = useState(false);
  const [isImportSWVOpen, setIsImportSWVOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [totals, setTotals] = useState(null);

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

  const updateExpenseData = async (month) => {
    const currentYear = new Date().getFullYear();
    const from = new Date(currentYear, month.key, 0);
    const to = new Date(currentYear, parseInt(month.key) + 1, 0);

    console.log(from);
    console.log(from.toISOString());
    console.log(to);

    setExpenseData(
      await getExpensesByMonth(from.toISOString(), to.toISOString())
    );
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
            // theme="dark"
            mode="horizontal"
            defaultSelectedKeys={[(new Date().getMonth() - 1).toString()]}
            items={items1}
            style={{
              flex: 1,
              minWidth: 0,
              background: "white",
            }}
            onClick={updateExpenseData}
          />
          {totals && <ExpenseTotal total={totals} />}
          {/* <HeaderNavigation /> */}
        </Header>
        <Content
          style={{
            padding: "0 48px",
          }}
        >
          {expenseData && <ExpenseList expenseData={expenseData} />}
        </Content>
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
          icon={<MoneyCollectOutlined />}
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
