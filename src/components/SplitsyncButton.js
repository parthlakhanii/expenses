import React, { useState, useEffect } from "react";
import { Button, message, Tooltip } from "antd";
import { SyncOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { syncSplitwise, getSyncStatus } from "../services/splitwiseSyncService";
import moment from "moment";

const SplitSyncButton = ({ onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    fetchSyncStatus();

    // Update time ago every minute
    const interval = setInterval(() => {
      if (syncStatus?.lastSyncedAt) {
        setTimeAgo(moment(syncStatus.lastSyncedAt).fromNow());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (syncStatus?.lastSyncedAt) {
      setTimeAgo(moment(syncStatus.lastSyncedAt).fromNow());
    }
  }, [syncStatus]);

  const fetchSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error("Failed to get sync status:", error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncSplitwise();
      message.success(
        `Synced ${result.recordsProcessed} Splitwise records successfully!`
      );
      await fetchSyncStatus();
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      message.error(error.message || "Failed to sync Splitwise data");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {syncStatus && !syncStatus.hasNeverSynced && (
        <Tooltip title={`Last synced: ${moment(syncStatus.lastSyncedAt).format("MMM DD, YYYY h:mm A")}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
            <ClockCircleOutlined />
            <span>{timeAgo}</span>
          </div>
        </Tooltip>
      )}
      <Button
        type="primary"
        icon={<SyncOutlined spin={syncing} />}
        onClick={handleSync}
        loading={syncing}
        style={{
          borderRadius: "8px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        }}
      >
        {syncing ? "Syncing..." : "Sync Splitwise"}
      </Button>
    </div>
  );
};

export default SplitSyncButton;
