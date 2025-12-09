import React, { useState } from 'react';
import { Table, Select, Button, Alert, Tag, Space, Input } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * Step 2: Column Mapping
 * Allows user to map CSV columns to expense fields
 */
const MappingStep = ({ sessionData, onNext, onBack }) => {
  // Initialize with auto-detected mapping
  const [mapping, setMapping] = useState(sessionData.suggestedMapping || {
    date: null,
    amount: null,
    description: null,
    type: null,
    category: null,
    tags: null
  });

  // State for manual data source input
  const [manualSource, setManualSource] = useState('');

  // Define required and optional fields
  const fields = [
    {
      key: 'date',
      label: 'Transaction Date',
      required: true,
      description: 'When the transaction occurred'
    },
    {
      key: 'amount',
      label: 'Amount',
      required: true,
      description: 'Transaction value (supports $, €, £, etc.)'
    },
    {
      key: 'description',
      label: 'Description',
      required: true,
      description: 'What the transaction was for'
    },
    {
      key: 'type',
      label: 'Transaction Type',
      required: false,
      description: 'Income, Expense, Investment (auto-detected if not mapped)'
    },
    {
      key: 'category',
      label: 'Category',
      required: false,
      description: 'Transaction category (e.g., Food, Transport)'
    },
    {
      key: 'tags',
      label: 'Tags',
      required: false,
      description: 'Comma-separated tags'
    }
  ];

  // Check if all required fields are mapped
  const requiredFields = fields.filter(f => f.required);
  const isValid = requiredFields.every(field =>
    mapping[field.key] !== null && mapping[field.key] !== undefined
  );

  // Get sample value from preview data
  const getSampleValue = (columnIndex) => {
    if (columnIndex === null || columnIndex === undefined) {
      return '-';
    }

    const firstRow = sessionData.preview?.[0];
    if (!firstRow || !firstRow[columnIndex]) {
      return '-';
    }

    const value = firstRow[columnIndex];
    // Truncate long values
    return value.length > 30 ? value.substring(0, 30) + '...' : value;
  };

  // Handle column selection
  const handleColumnChange = (fieldKey, columnIndex) => {
    setMapping({
      ...mapping,
      [fieldKey]: columnIndex
    });
  };

  // Prepare table data
  const tableData = fields.map(field => ({
    key: field.key,
    field: field.label,
    required: field.required,
    description: field.description,
    csvColumn: mapping[field.key],
    sampleValue: getSampleValue(mapping[field.key])
  }));

  const columns = [
    {
      title: 'What we need',
      dataIndex: 'field',
      key: 'field',
      width: '25%',
      render: (text, record) => (
        <Space>
          {text}
          {record.required && <Tag color="red">Required</Tag>}
        </Space>
      )
    },
    {
      title: 'Column from your CSV',
      key: 'mapping',
      width: '35%',
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder={record.required ? 'Choose a column (required)' : 'Choose a column (optional)'}
          value={record.csvColumn}
          onChange={(value) => handleColumnChange(record.key, value)}
          allowClear={!record.required}
        >
          {sessionData.headers?.map((header, index) => (
            <Option key={index} value={index}>
              {header}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Example from your file',
      dataIndex: 'sampleValue',
      key: 'sampleValue',
      width: '25%',
      render: (text) => (
        <span style={{
          fontFamily: 'monospace',
          fontSize: '0.9em',
          color: text === '-' ? '#999' : '#000'
        }}>
          {text}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: '15%',
      render: (_, record) => {
        if (record.required && (record.csvColumn === null || record.csvColumn === undefined)) {
          return <Tag icon={<ExclamationCircleOutlined />} color="warning">Not mapped</Tag>;
        }
        if (record.csvColumn !== null && record.csvColumn !== undefined) {
          return <Tag icon={<CheckCircleOutlined />} color="success">Mapped</Tag>;
        }
        return null;
      }
    }
  ];

  const handleNext = () => {
    onNext({
      mapping,
      manualSource: manualSource || 'CSV Import',
      manualPaymentType: ''
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        bordered={false}
        size="middle"
      />

      <div style={{ marginTop: 32 }}>
        <Input
          placeholder="Data source (optional) - e.g., Scotia Chequing, Tangerine Savings"
          value={manualSource}
          onChange={(e) => setManualSource(e.target.value)}
          style={{ width: '100%' }}
        />
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
          disabled={!isValid}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default MappingStep;
