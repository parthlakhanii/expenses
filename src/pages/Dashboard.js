import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Layout,
  Select,
  Button,
  DatePicker,
  Segmented,
  Row,
  Col,
  message,
  Modal,
  Input,
} from "antd";
import CsvImportWizard from "../components/CsvImportWizard";
import AddExpense from "../components/AddExpense";
import ExpenseList from "../components/ExpenseList";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  MenuOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import {
  getExpensesByMonth,
  calculateTotals,
  createExpense,
} from "../services/storageAdapter";
import { parseExpenseInput, getExamplePlaceholders } from "../utils/nlExpenseParser";
import { getSplitWiseExpenseByUserName } from "../services/expenseService";
import {
  syncSplitwise,
  syncSplitwiseToLocal,
  getSyncStatus,
} from "../services/splitwiseSyncService";
import ExpenseTotal from "../components/ExpenseTotal";
import { Content, Header } from "antd/es/layout/layout";
import SideNav from "../components/SideNav";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import { useStorage } from "../contexts/StorageContext";
import { useResponsive } from "../hooks/useResponsive";
import moment from "moment";
import Budgets from "./Budgets";
import Reconciliation from "./Reconciliation";
import Settings from "./Settings";
import Categories from "./Categories";
import Profile from "./Profile";
import SpendingTrendsChart from "../components/SpendingTrendsChart";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import SplitwiseSyncModal from "../components/SplitwiseSyncModal";
import EmptyState from "../components/EmptyState";
import { colors, fontSize, fontWeight } from "../styles/theme";

const Dashboard = () => {
  const { isDark } = useTheme();
  const { enableSplitwise, visibleColumns, visibleTotals } = useSettings();
  const { storageMode } = useStorage();
  const { isMobile } = useResponsive();
  const theme = isDark ? colors.dark : colors.light;
  const [isCsvImportWizardOpen, setIsCsvImportWizardOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInput, setQuickAddInput] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const lastSyncStatusRef = useRef(null);
  const [expenseData, setExpenseData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [dateMode, setDateMode] = useState("monthly"); // "monthly" or "custom"
  const [customRange, setCustomRange] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [chartRefreshTrigger, setChartRefreshTrigger] = useState(0);

  const { RangePicker } = DatePicker;

  // Update expense data based on date and view
  const updateExpenseData = useCallback(async (date, view) => {
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
      setExpenseData(await getSplitWiseExpenseByUserName(from, to));
    } else if (view === "dashboard") {
      setExpenseData(await getExpensesByMonth(from, to));
    }
  }, []);

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);

      // If sync just completed, auto-refresh data and show message (only for background/first sync)
      if (
        lastSyncStatusRef.current?.status === "in_progress" &&
        status.status === "success"
      ) {
        // Only show toast if it was a background sync (first sync)
        // For subsequent syncs, the message is shown immediately in handleSplitwiseSync
        const wasFirstSync =
          lastSyncStatusRef.current?.hasNeverSynced ||
          !lastSyncStatusRef.current?.lastSyncedAt;
        if (wasFirstSync) {
          message.success(
            `First sync complete! ${status.recordsProcessed} records synced successfully.`
          );
        }

        if (
          currentView !== "budgets" &&
          currentView !== "reconciliation" &&
          currentView !== "settings" &&
          currentView !== "categories"
        ) {
          updateExpenseData(selectedDate, currentView);
          // Trigger chart refresh after sync completes
          setChartRefreshTrigger((prev) => prev + 1);
        }
      }

      lastSyncStatusRef.current = status;
      return status;
    } catch (error) {
      console.error("Failed to get sync status:", error);
    }
  }, [currentView, selectedDate, updateExpenseData]);

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

  // Fetch sync status on mount
  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // Auto-check on page visibility change (hybrid approach)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && syncStatus?.status === "in_progress") {
        fetchSyncStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncStatus, fetchSyncStatus]);

  // Show sync modal to select date range
  const handleSplitwiseSync = () => {
    setIsSyncModalOpen(true);
  };

  // Perform actual sync with selected date range
  const performSplitwiseSync = async (startDate, endDate, syncAll = false) => {
    setIsSyncModalOpen(false);
    setSyncing(true);

    try {
      const isFirstSync =
        syncStatus?.hasNeverSynced || !syncStatus?.lastSyncedAt;
      const isLocalMode = storageMode === "local";

      const dateRangeText =
        startDate && endDate
          ? ` from ${startDate} to ${endDate}`
          : startDate
          ? ` from ${startDate}`
          : "";

      if (isFirstSync) {
        // First sync: Non-blocking (background)
        const syncFunction = isLocalMode ? syncSplitwiseToLocal : syncSplitwise;

        syncFunction(startDate, endDate, syncAll).catch((error) => {
          console.error("Sync error:", error);
          message.error(error.message || "Failed to start Splitwise sync");
        });

        // Check if user selected "All Time" (no date range)
        const isAllTimeSync = !startDate && !endDate;

        // Show background message for first sync
        if (isAllTimeSync) {
          // Longer message for "All Time" sync
          message.info(
            `Splitwise sync started in background${
              isLocalMode ? " and will be stored locally" : ""
            }. This may take a while if you have a lot of records. You can continue using the app.`,
            5
          );
        } else {
          // Shorter message for date-range sync
          message.info(
            `Splitwise sync started in background${
              isLocalMode ? " and will be stored locally" : ""
            }${dateRangeText}.`,
            4
          );
        }

        // Update status after a moment to show "in_progress"
        setTimeout(() => {
          fetchSyncStatus();
        }, 2000);
      } else {
        // Subsequent sync: Blocking (await response)
        message.loading({
          content: `Syncing Splitwise data${
            isLocalMode ? " to local storage" : ""
          }${dateRangeText}...`,
          key: "splitwise-sync",
        });

        // Use appropriate sync function based on storage mode
        if (isLocalMode) {
          const result = await syncSplitwiseToLocal(
            startDate,
            endDate,
            syncAll
          );

          // Fetch updated status to refresh the banner
          await fetchSyncStatus();

          // Show detailed message for local mode
          message.success({
            content:
              result.synced > 0
                ? `${result.synced} new Splitwise expense(s) synced to local storage`
                : "All Splitwise expenses are up to date",
            key: "splitwise-sync",
            duration: 3,
          });
        } else {
          await syncSplitwise(startDate, endDate, syncAll);

          // Fetch updated status
          const updatedStatus = await fetchSyncStatus();

          // Show success message with record count
          if (updatedStatus?.status === "success") {
            message.success({
              content: `Sync complete! ${
                updatedStatus.recordsProcessed || 0
              } records synced.`,
              key: "splitwise-sync",
              duration: 3,
            });
          } else if (updatedStatus?.status === "failed") {
            message.error({
              content: updatedStatus.errorMessage || "Sync failed",
              key: "splitwise-sync",
              duration: 5,
            });
          }
        }

        // Refresh expense data for both local and cloud mode
        if (
          currentView !== "budgets" &&
          currentView !== "reconciliation" &&
          currentView !== "settings" &&
          currentView !== "categories"
        ) {
          updateExpenseData(selectedDate, currentView);
          // Trigger chart refresh after sync completes
          setChartRefreshTrigger((prev) => prev + 1);
        }
      }
    } catch (error) {
      message.error({
        content: error.message || "Failed to sync Splitwise",
        key: "splitwise-sync",
        duration: 5,
      });
    } finally {
      setSyncing(false);
    }
  };

  const openCsvImportWizard = () => {
    setIsCsvImportWizardOpen(true);
  };

  const openAddExpense = () => {
    setIsAddExpenseOpen(true);
  };

  const handleQuickAdd = async () => {
    if (!quickAddInput.trim()) {
      message.warning("Please enter an expense");
      return;
    }

    setQuickAddLoading(true);

    try {
      const parsed = parseExpenseInput(quickAddInput);

      if (!parsed.isValid) {
        message.error(parsed.error);
        setQuickAddLoading(false);
        return;
      }

      const expenseData = {
        date: parsed.date,
        amount: parsed.amount,
        description: parsed.description,
        type: parsed.type,
        source: "Manual",
      };

      await createExpense(expenseData);

      message.success(`Added: ${parsed.description} - $${parsed.amount}`);
      setQuickAddInput("");
      setIsQuickAddOpen(false);

      // Refresh expense data
      updateExpenseData(selectedDate, currentView);
      setChartRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to create expense:", error);
      message.error("Failed to add expense. Please try again.");
    } finally {
      setQuickAddLoading(false);
    }
  };

  const handleImportSuccess = () => {
    // Refresh expense data after successful import
    updateExpenseData(selectedDate, currentView);
    // Trigger chart refresh
    setChartRefreshTrigger((prev) => prev + 1);
  };

  const handleExpenseUpdate = () => {
    // Refresh expense data after successful edit
    updateExpenseData(selectedDate, currentView);
    // Trigger chart refresh
    setChartRefreshTrigger((prev) => prev + 1);
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
        setExpenseData(await getSplitWiseExpenseByUserName(from, to));
      } else if (currentView === "dashboard") {
        setExpenseData(await getExpensesByMonth(from, to));
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
    { value: 0, label: "Jan" },
    { value: 1, label: "Feb" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Apr" },
    { value: 4, label: "May" },
    { value: 5, label: "Jun" },
    { value: 6, label: "Jul" },
    { value: 7, label: "Aug" },
    { value: 8, label: "Sep" },
    { value: 9, label: "Oct" },
    { value: 10, label: "Nov" },
    { value: 11, label: "Dec" },
  ];

  // set expense data in a method before calling Expense List
  return (
    <>
      <style>
        {`
          .month-selector-dropdown .rc-virtual-list-holder {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .month-selector-dropdown .rc-virtual-list-holder::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .month-selector-dropdown .rc-virtual-list-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
          }
        `}
      </style>
      <SideNav
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view !== "budgets" && view !== "reconciliation") {
            updateExpenseData(selectedDate, view);
          }
        }}
        enableSplitwise={enableSplitwise}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
        onQuickAddSuccess={handleImportSuccess}
        onAddExpense={openAddExpense}
        onImportCSV={openCsvImportWizard}
        onSplitwiseSync={handleSplitwiseSync}
        syncing={syncing}
        syncStatus={syncStatus}
      />
      {currentView === "budgets" ? (
        <div style={{ marginLeft: isMobile ? 0 : 80 }}>
          <Budgets />
        </div>
      ) : currentView === "categories" ? (
        <div style={{ marginLeft: isMobile ? 0 : 80 }}>
          <Categories enableSplitwise={enableSplitwise} />
        </div>
      ) : currentView === "reconciliation" ? (
        <div style={{ marginLeft: isMobile ? 0 : 80 }}>
          <Reconciliation />
        </div>
      ) : currentView === "profile" ? (
        <div style={{ marginLeft: isMobile ? 0 : 80 }}>
          <Profile />
        </div>
      ) : currentView === "settings" ? (
        <div style={{ marginLeft: isMobile ? 0 : 80 }}>
          <Settings />
        </div>
      ) : (
        <Layout
          style={{
            minHeight: "100vh",
            marginLeft: isMobile ? 0 : 80,
            background: theme.bg.primary,
          }}
        >
          <Header
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              background: theme.bg.primary,
              height: "auto",
              padding: isMobile ? "16px" : "12px 48px 0 48px",
              border: "none",
              gap: isMobile ? "16px" : "16px",
            }}
          >
            {isMobile && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileDrawerOpen(true)}
                  style={{
                    fontSize: 20,
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.text.primary,
                    flexShrink: 0,
                  }}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                background: theme.bg.secondary,
                padding: "10px 14px",
                borderRadius: "12px",
                boxShadow: isDark
                  ? "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                border: `1px solid ${theme.border.primary}`,
                width: isMobile ? "100%" : "280px",
              }}
            >
              <Segmented
                options={[
                  { label: "Month", value: "monthly" },
                  {
                    label: "Custom",
                    value: "custom",
                    icon: <CalendarOutlined />,
                  },
                ]}
                value={dateMode}
                onChange={handleDateModeChange}
                block
                style={{
                  background: theme.bg.tertiary,
                  padding: "4px",
                  fontWeight: 500,
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
                      background: theme.bg.tertiary,
                      border: `1px solid ${theme.border.secondary}`,
                      borderRadius: "8px",
                      minWidth: "36px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0px",
                      flex: 1,
                      background: theme.bg.tertiary,
                      borderRadius: "8px",
                      border: `1px solid ${theme.border.secondary}`,
                      overflow: "hidden",
                    }}
                  >
                    <Select
                      value={selectedDate.month()}
                      onChange={handleMonthChange}
                      style={{
                        flex: 1,
                        fontWeight: fontWeight.semibold,
                        fontSize: fontSize.md,
                        textAlign: "center",
                      }}
                      size="large"
                      variant="borderless"
                      options={monthOptions}
                      suffixIcon={null}
                      popupMatchSelectWidth={false}
                      popupClassName="month-selector-dropdown"
                    />
                    <div
                      style={{
                        width: "1px",
                        height: "24px",
                        background: theme.border.secondary,
                      }}
                    ></div>
                    <Select
                      value={selectedDate.year()}
                      onChange={handleYearChange}
                      style={{
                        width: 85,
                        fontWeight: fontWeight.semibold,
                        fontSize: fontSize.md,
                        textAlign: "center",
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
                      background: theme.bg.tertiary,
                      border: `1px solid ${theme.border.secondary}`,
                      borderRadius: "8px",
                      minWidth: "36px",
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
                    border: `1px solid ${theme.border.secondary}`,
                    background: theme.bg.tertiary,
                  }}
                  format="MMM DD, YYYY"
                />
              )}
            </div>
            {isMobile && totals && expenseData && expenseData.length > 0 && (
              <div style={{ width: "100%" }}>
                <ExpenseTotal total={totals} visibleTotals={visibleTotals} />
              </div>
            )}
            {!isMobile && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "24px" }}
              >
                {totals && expenseData && expenseData.length > 0 && (
                  <ExpenseTotal total={totals} visibleTotals={visibleTotals} />
                )}
              </div>
            )}
          </Header>
          <Content
            style={{
              padding: isMobile ? "16px" : "12px 48px 24px 48px",
              minHeight: "calc(100vh - 128px)",
            }}
          >
            {expenseData && expenseData.length > 0 ? (
              <>
                {/* Charts Section */}
                <Row gutter={[16, 12]} style={{ marginBottom: 12 }}>
                  <Col xs={24} sm={24} md={12}>
                    <SpendingTrendsChart refreshTrigger={chartRefreshTrigger} />
                  </Col>
                  <Col xs={24} sm={24} md={12}>
                    <CategoryBreakdownChart expenseData={expenseData} />
                  </Col>
                </Row>

                {/* Expense List */}
                <ExpenseList
                  expenseData={expenseData}
                  view={currentView}
                  visibleColumns={visibleColumns}
                  onExpenseUpdate={handleExpenseUpdate}
                />
              </>
            ) : (
              <EmptyState
                onAddExpense={openAddExpense}
                onQuickAdd={() => setIsQuickAddOpen(true)}
                onImportCSV={() => setIsCsvImportWizardOpen(true)}
                onSyncSplitwise={handleSplitwiseSync}
                showSplitwiseSync={enableSplitwise}
              />
            )}
          </Content>
        </Layout>
      )}

      <CsvImportWizard
        open={isCsvImportWizardOpen}
        onClose={() => setIsCsvImportWizardOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <AddExpense
        open={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <SplitwiseSyncModal
        visible={isSyncModalOpen}
        onConfirm={performSplitwiseSync}
        onCancel={() => setIsSyncModalOpen(false)}
        isFirstSync={syncStatus?.hasNeverSynced || !syncStatus?.lastSyncedAt}
        lastSyncedAt={syncStatus?.lastSyncedAt}
      />

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThunderboltOutlined style={{ color: "#8b5cf6" }} />
            Quick Add Expense
          </div>
        }
        open={isQuickAddOpen}
        onOk={handleQuickAdd}
        onCancel={() => {
          setIsQuickAddOpen(false);
          setQuickAddInput("");
        }}
        okText="Add"
        cancelText="Cancel"
        confirmLoading={quickAddLoading}
        styles={{
          body: { paddingTop: 16 },
        }}
      >
        <Input
          autoFocus
          prefix={<ThunderboltOutlined />}
          placeholder={getExamplePlaceholders()[0]}
          value={quickAddInput}
          onChange={(e) => setQuickAddInput(e.target.value)}
          onPressEnter={handleQuickAdd}
          size="large"
          disabled={quickAddLoading}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: theme.text.secondary }}>
          Examples: "Coffee $5", "$20 lunch", "15.50 uber yesterday"
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;
