import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Checkbox, Spin, Space, Switch, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Step 3: Preview Data
 * Shows transformed data with duplicate detection and statistics
 */
const PreviewStep = ({ sessionId, columnMapping, onNext, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/v1/csv/preview`, {
        sessionId,
        columnMapping
      });

      if (response.data.error_status) {
        throw new Error(response.data.message || 'Failed to generate preview');
      }

      // Add explicit index to each item for proper pagination handling
      const previewWithIndex = (response.data.data.preview || []).map((item, index) => ({
        ...item,
        _originalIndex: index
      }));

      setPreview(previewWithIndex);
      setStatistics(response.data.data.statistics || {});
      setLoading(false);

    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate preview';
      setError(errorMessage);
    }
  };

  const handleNext = () => {
    onNext({
      skipDuplicates,
      overwriteDuplicates: false,
      selectedRowIndices: selectionMode ? selectedRowKeys : null
    });
  };

  const handleSelectionModeChange = (checked) => {
    setSelectionMode(checked);
    if (checked) {
      // Select all non-duplicate rows by default when enabling selection mode
      const nonDuplicateIndices = preview
        .map((row) => (!skipDuplicates || !row.isDuplicate) ? row._originalIndex : null)
        .filter(index => index !== null);
      setSelectedRowKeys(nonDuplicateIndices);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const rowSelection = selectionMode ? {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      name: record.description,
    }),
  } : null;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      render: (date) => {
        // Date is already in YYYY-MM-DD format, just format it nicely
        const [year, month, day] = date.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      ellipsis: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: '15%',
      align: 'right',
      render: (amount) => {
        const isNegative = amount < 0;
        return (
          <span style={{ color: isNegative ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}>
            ${Math.abs(amount).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type) => {
        const color = type === 'Income' ? 'green' : type === 'Expense' ? 'red' : 'blue';
        const icon = type === 'Income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
        return <Tag icon={icon} color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: '20%',
      render: (_, record) => {
        if (record.isDuplicate) {
          return (
            <Tag icon={<WarningOutlined />} color="warning">
              Potential Duplicate
            </Tag>
          );
        }
        return <Tag color="success">New</Tag>;
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 24, color: '#999' }}>
          Analyzing data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Text type="danger" style={{ display: 'block', marginBottom: 32 }}>
          {error}
        </Text>

        <Space>
          <Button onClick={onBack}>
            Back
          </Button>
          <Button type="primary" onClick={fetchPreview}>
            Retry
          </Button>
        </Space>
      </div>
    );
  }

  const duplicateCount = statistics.potentialDuplicates || 0;
  const totalRows = statistics.totalRows || 0;
  const newRows = totalRows - duplicateCount;
  const incomeRows = statistics.incomeRows || 0;
  const expenseRows = statistics.expenseRows || 0;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text type="secondary">{totalRows} transactions</Text>
          {duplicateCount > 0 && (
            <Text type="warning" style={{ marginLeft: 16 }}>
              {duplicateCount} potential duplicate{duplicateCount > 1 ? 's' : ''}
            </Text>
          )}
        </div>
        <Space>
          <Text type="secondary">Select specific rows</Text>
          <Switch
            checked={selectionMode}
            onChange={handleSelectionModeChange}
          />
        </Space>
      </div>

      {selectionMode && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">{selectedRowKeys.length} selected</Text>
        </div>
      )}

      <Table
        dataSource={preview}
        columns={columns}
        rowSelection={rowSelection}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
          showQuickJumper: false,
          position: ['bottomCenter'],
          size: 'small',
          style: { marginTop: 16 }
        }}
        rowKey={(record) => record._originalIndex}
        rowClassName={(record) => record.isDuplicate ? 'duplicate-row' : ''}
        size="small"
        bordered={false}
      />

      <style>
        {`
          .duplicate-row {
            background-color: #fafafa !important;
          }
        `}
      </style>

      <div style={{ marginTop: 24 }}>
        <Checkbox
          checked={skipDuplicates}
          onChange={(e) => setSkipDuplicates(e.target.checked)}
        >
          Skip duplicates
        </Checkbox>
      </div>

      <div style={{
        marginTop: 32,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Button onClick={onBack}>
          Back
        </Button>

        <Button
          type="primary"
          onClick={handleNext}
          disabled={selectionMode ? selectedRowKeys.length === 0 : (skipDuplicates && newRows === 0)}
        >
          {(() => {
            if (selectionMode) {
              return selectedRowKeys.length === 0
                ? 'Select rows'
                : `Import ${selectedRowKeys.length}`;
            }
            return skipDuplicates && newRows === 0
              ? 'No new rows'
              : `Import ${skipDuplicates ? newRows : totalRows}`;
          })()}
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep;
