import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  message,
  Popconfirm,
  Space,
  Typography,
  Badge,
} from "antd";
import {
  CheckOutlined,
  LinkOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { updateReconciliationStatus } from "../services/reconciliationService";
import moment from "moment";

const { Text } = Typography;

const ReconciliationView = ({
  bankTransactions,
  splitwiseExpenses,
  onUpdate,
}) => {
  const { isDark } = useTheme();
  const [selectedBankTx, setSelectedBankTx] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "12px",
    marginBottom: "24px",
  };

  // Find potential matches for a bank transaction
  const findPotentialMatches = (bankTx) => {
    const matches = [];
    const bankDate = moment(bankTx.date);
    const bankAmount = parseFloat(bankTx.amount);

    splitwiseExpenses.forEach((swTx) => {
      const swDate = moment(swTx.date);
      const swPaidAmount = parseFloat(swTx.splitwise_paid_share || 0);
      const daysDiff = Math.abs(bankDate.diff(swDate, "days"));

      // Check if dates are within 3 days
      if (daysDiff <= 3 && swPaidAmount > 0) {
        // Check if bank amount is close to splitwise paid amount
        const amountDiff = Math.abs(bankAmount - swPaidAmount);
        const percentDiff = (amountDiff / bankAmount) * 100;

        // Match if amounts are within 10% of each other
        if (percentDiff <= 10) {
          const dateScore = Math.max(0, 100 - daysDiff * 20);
          const amountScore = Math.max(0, 100 - percentDiff * 10);
          const matchScore = Math.round((dateScore + amountScore) / 2);

          matches.push({
            transaction: swTx,
            matchScore,
            daysDiff,
            amountDiff: amountDiff.toFixed(2),
          });
        }
      }
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, 3); // Top 3 matches
  };

  const handleMarkAsMatched = async (transactionId) => {
    setLoading(true);
    try {
      await updateReconciliationStatus(
        transactionId,
        "reconciled_with_splitwise"
      );
      message.success("Transaction marked as matched with Splitwise");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to mark as matched:", error);
      message.error("Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (transactionId) => {
    setLoading(true);
    try {
      await updateReconciliationStatus(transactionId, null);
      message.success("Match status cleared");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to clear status:", error);
      message.error("Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  // Bank transactions columns
  const bankColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => moment(date).format("MMM DD, YYYY"),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount) => (
        <Text strong style={{ color: "#f87171" }}>
          ${parseFloat(amount).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        <Tag color="blue" style={{ borderRadius: "8px" }}>
          {category}
        </Tag>
      ),
    },
    {
      title: "Matches",
      key: "matches",
      width: 100,
      render: (_, record) => {
        const matches = findPotentialMatches(record);
        if (matches.length === 0) {
          return <Text type="secondary">No matches</Text>;
        }
        return (
          <Badge
            count={matches.length}
            style={{
              backgroundColor:
                matches[0].matchScore >= 80
                  ? "#34d399"
                  : matches[0].matchScore >= 60
                  ? "#fbbf24"
                  : "#94a3b8",
            }}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Popconfirm
          title="Mark as matched with Splitwise?"
          description="This bank transaction matches a Splitwise expense you paid for"
          onConfirm={() => handleMarkAsMatched(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={loading}
            style={{ borderRadius: "6px" }}
          >
            Matched
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Splitwise expenses columns
  const splitwiseColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => moment(date).format("MMM DD, YYYY"),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "You Paid",
      dataIndex: "splitwise_paid_share",
      key: "splitwise_paid_share",
      width: 120,
      render: (amount) => (
        <Text strong style={{ color: "#f87171" }}>
          ${parseFloat(amount).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => parseFloat(a.splitwise_paid_share) - parseFloat(b.splitwise_paid_share),
    },
    {
      title: "Your Share",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount) => (
        <Text style={{ color: "#60a5fa" }}>
          ${parseFloat(amount).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category) => (
        <Tag color="cyan" style={{ borderRadius: "8px" }}>
          {category}
        </Tag>
      ),
    },
  ];

  // Enhanced bank table with expandable rows showing potential matches
  const expandedRowRender = (record) => {
    const matches = findPotentialMatches(record);

    if (matches.length === 0) {
      return (
        <div style={{ padding: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
          No potential Splitwise matches found for this transaction
        </div>
      );
    }

    return (
      <Card
        size="small"
        title={
          <Space>
            <LinkOutlined />
            <Text>Potential Splitwise Matches</Text>
          </Space>
        }
        style={{
          background: isDark ? "#1e293b" : "#f9fafb",
          border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`,
        }}
      >
        {matches.map((match, index) => {
          const tx = match.transaction;
          return (
            <div
              key={tx.id}
              style={{
                padding: "12px",
                marginBottom: index < matches.length - 1 ? "8px" : "0",
                background: isDark ? "#0f172a" : "#ffffff",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                borderRadius: "8px",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col span={18}>
                  <Space direction="vertical" size="small">
                    <Space>
                      <Tag
                        color={
                          match.matchScore >= 80
                            ? "green"
                            : match.matchScore >= 60
                            ? "gold"
                            : "default"
                        }
                      >
                        {match.matchScore}% match
                      </Tag>
                      <Text strong>{tx.description}</Text>
                    </Space>
                    <Space size="large">
                      <Text type="secondary">
                        {moment(tx.date).format("MMM DD, YYYY")}
                      </Text>
                      <Text type="secondary">
                        {match.daysDiff === 0
                          ? "Same day"
                          : `${match.daysDiff} day${
                              match.daysDiff > 1 ? "s" : ""
                            } apart`}
                      </Text>
                      <Text strong style={{ color: "#f87171" }}>
                        ${parseFloat(tx.splitwise_paid_share).toFixed(2)} paid
                      </Text>
                      <Text type="secondary">
                        (${parseFloat(tx.amount).toFixed(2)} your share)
                      </Text>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    {match.matchScore >= 80 && (
                      <Tag icon={<CheckOutlined />} color="success">
                        High confidence
                      </Tag>
                    )}
                    {match.matchScore >= 60 && match.matchScore < 80 && (
                      <Tag icon={<WarningOutlined />} color="warning">
                        Medium confidence
                      </Tag>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>
          );
        })}
      </Card>
    );
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: isDark ? "#e2e8f0" : "#1e293b",
                  }}
                >
                  Bank Transactions
                </Text>
                <Badge
                  count={bankTransactions.length}
                  style={{ backgroundColor: "#f87171" }}
                />
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  (Not yet matched with Splitwise)
                </Text>
              </Space>
            }
            bordered={false}
            style={cardStyle}
          >
            <Table
              columns={bankColumns}
              dataSource={bankTransactions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => findPotentialMatches(record).length > 0,
              }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: isDark ? "#e2e8f0" : "#1e293b",
                  }}
                >
                  Splitwise Expenses
                </Text>
                <Badge
                  count={splitwiseExpenses.length}
                  style={{ backgroundColor: "#60a5fa" }}
                />
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  (You paid for these)
                </Text>
              </Space>
            }
            bordered={false}
            style={cardStyle}
          >
            <Table
              columns={splitwiseColumns}
              dataSource={splitwiseExpenses}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReconciliationView;
