import React, { useState } from "react";
import { Modal, Radio, DatePicker, Space, Typography } from "antd";
import { useResponsive } from "../hooks/useResponsive";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const SplitwiseSyncModal = ({ visible, onConfirm, onCancel, isFirstSync, lastSyncedAt }) => {
  const { isMobile } = useResponsive();
  const [durationType, setDurationType] = useState(
    isFirstSync ? "all" : "since_last_sync"
  );
  const [customRange, setCustomRange] = useState([null, null]);

  const handleOk = () => {
    let startDate = null;
    let endDate = moment().format("YYYY-MM-DD");
    let syncAll = false; // Flag to indicate "sync all" vs incremental

    switch (durationType) {
      case "since_last_sync":
        // Sync from last synced date to now
        if (lastSyncedAt) {
          startDate = moment(lastSyncedAt).format("YYYY-MM-DD");
        } else {
          // Fallback to last month if no last sync date
          startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
        }
        break;
      case "last_month":
        startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
        break;
      case "last_3_months":
        startDate = moment().subtract(3, "months").format("YYYY-MM-DD");
        break;
      case "last_6_months":
        startDate = moment().subtract(6, "months").format("YYYY-MM-DD");
        break;
      case "last_year":
        startDate = moment().subtract(1, "year").format("YYYY-MM-DD");
        break;
      case "custom":
        if (customRange[0] && customRange[1]) {
          startDate = customRange[0].format("YYYY-MM-DD");
          endDate = customRange[1].format("YYYY-MM-DD");
        }
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
        syncAll = true; // Explicitly sync all data
        break;
    }

    onConfirm(startDate, endDate, syncAll);
  };

  return (
    <Modal
      title="Sync Splitwise Expenses"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Sync"
      cancelText="Cancel"
      width={isMobile ? "90vw" : 450}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Select the time period for syncing Splitwise expenses:
        </Text>
      </div>

      <Radio.Group
        value={durationType}
        onChange={(e) => setDurationType(e.target.value)}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {!isFirstSync && lastSyncedAt && (
            <Radio value="since_last_sync">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span>Since Last Sync</span>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 24 }}>
                  From {moment(lastSyncedAt).format("MMM DD, YYYY h:mm A")} to now
                </Text>
              </div>
            </Radio>
          )}
          <Radio value="last_month">Last Month</Radio>
          <Radio value="last_3_months">Last 3 Months</Radio>
          <Radio value="last_6_months">Last 6 Months</Radio>
          <Radio value="last_year">Last Year</Radio>
          <Radio value="all">All Time</Radio>
          <Radio value="custom">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Custom Range:</span>
              {durationType === "custom" && (
                <RangePicker
                  value={customRange}
                  onChange={setCustomRange}
                  format="YYYY-MM-DD"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
};

export default SplitwiseSyncModal;
