import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ConfigProvider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Checkbox,
  Button,
  Space,
} from "antd";

import { deleteExpenseById, updateExpense } from "../services/storageAdapter";
import { useTheme } from "../contexts/ThemeContext";
import { useCategories } from "../contexts/CategoryContext";
import { colors } from "../styles/theme";

import "./../styles/ExpenseList.css";
import { DeleteOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType,
  categories,
  options,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {inputType === "select" ? (
          <Select
            ref={inputRef}
            onBlur={save}
            onChange={save}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={
              options ||
              categories?.map((cat) => ({
                value: cat.name,
                label: `${cat.icon} ${cat.name}`,
              }))
            }
          />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          // paddingRight: ,
          whiteSpace: "nowrap",
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const ExpenseList = ({ expenseData, view, visibleColumns = {} }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { categories } = useCategories();
  const [dataSource, setDataSource] = useState(expenseData);
  const [editable, setEditable] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Expense type options
  const expenseTypes = [
    { value: "Expense", label: "💸 Expense", color: "#f87171" },
    { value: "Income", label: "💰 Income", color: "#34d399" },
    { value: "Investment", label: "📈 Investment", color: "#60a5fa" },
    { value: "Transfer", label: "🔄 Transfer", color: "#a78bfa" },
  ];

  useEffect(() => {
    setEditable(view === "dashboard");
  }, [view]);

  useEffect(() => {
    setDataSource(expenseData);
  }, [expenseData]);

  // Filter data based on search text
  const filteredData = searchText
    ? dataSource.filter((item) => {
        const searchLower = searchText.toLowerCase();
        return (
          item.description?.toLowerCase().includes(searchLower) ||
          item.subDescription?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower) ||
          item.amount?.toString().includes(searchText) ||
          item.type?.toLowerCase().includes(searchLower) ||
          item.source?.toLowerCase().includes(searchLower) ||
          item.date?.includes(searchText)
        );
      })
    : dataSource;

  const handleDelete = (key) => {
    deleteExpenseById(key);
    const newData = dataSource.filter((item) => item._id !== key);
    setDataSource(newData);
  };

  // Custom filter dropdown for Expense Type (without "Select All")
  const ExpenseTypeFilter = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    const options = ["Income", "Expense", "Investment", "Transfer"];

    return (
      <div style={{ padding: 8 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {options.map(option => (
            <Checkbox
              key={option}
              checked={selectedKeys.includes(option)}
              onChange={(e) => {
                const keys = e.target.checked
                  ? [...selectedKeys, option]
                  : selectedKeys.filter(k => k !== option);
                setSelectedKeys(keys);
              }}
            >
              {option}
            </Checkbox>
          ))}
        </Space>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            onClick={() => confirm()}
            style={{ flex: 1 }}
          >
            OK
          </Button>
          <Button
            size="small"
            onClick={() => {
              clearFilters();
              confirm();
            }}
            style={{ flex: 1 }}
          >
            Reset
          </Button>
        </div>
      </div>
    );
  };

  const defaultColumns = [
    {
      title: "Date",
      dataIndex: "date",
      editable: editable,
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: "20%",
      editable: editable,
      render: (text, record) => {
        const color =
          record.type === "Income"
            ? "#34d399"
            : record.type === "Expense"
            ? "#f87171"
            : record.type === "Investment"
            ? "#60a5fa"
            : record.type === "Transfer"
            ? "#a78bfa"
            : "#d1d5db";
        return <span style={{ color: color, fontWeight: "500" }}>{text}</span>;
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    ...(view === "splitwise"
      ? [
          {
            title: "Owed Share",
            dataIndex: "owed_share",
            editable: false,
          },
        ]
      : []),
    {
      title: "Description",
      dataIndex: "description",
      editable: editable,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.subDescription && (
            <div
              style={{
                fontSize: "12px",
                color: isDark ? "#94a3b8" : "#64748b",
                marginTop: "2px",
              }}
            >
              {record.subDescription}
            </div>
          )}
        </div>
      ),
    },
    ...(visibleColumns.expenseType
      ? [
          {
            title: "Expense Type",
            dataIndex: "type",
            editable: editable,
            inputType: "select",
            filterDropdown: ExpenseTypeFilter,
            onFilter: (value, record) => record.type === value,
          },
        ]
      : []),
    {
      title: "Category",
      dataIndex: "category",
      editable: editable,
      inputType: "select",
      render: (category) => {
        const cat = categories.find((c) => c.name === category);
        return cat ? (
          <Tag
            color={cat.color}
            style={{
              fontSize: "13px",
              color: isDark ? "#1e293b" : "#1e293b",
            }}
          >
            {cat.icon} {cat.name}
          </Tag>
        ) : (
          category
        );
      },
    },
    ...(visibleColumns.dataSource
      ? [
          {
            title: "Data Source",
            dataIndex: "source",
            editable: editable,
            render: (source, record) => (
              <div>
                {source}
                {record.manuallyEdited && record.source === "Splitwise" && (
                  <Tag
                    color="orange"
                    style={{
                      marginLeft: "8px",
                      fontSize: "11px",
                    }}
                  >
                    Edited
                  </Tag>
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      title: "",
      dataIndex: "operation",
      render: (_, record) =>
        filteredData.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <DeleteOutlined
              style={{
                color: colors.accent.error,
                fontSize: "16px",
                cursor: "pointer",
                visibility: hoveredRowId === record._id ? "visible" : "hidden",
                opacity: hoveredRowId === record._id ? 1 : 0,
                transition: "opacity 0.2s ease, visibility 0.2s ease",
              }}
            />
          </Popconfirm>
        ) : null,
    },
  ];

  const handleSave = async (row) => {
    // Find the original record to compare values
    const originalRecord = dataSource.find((item) => item._id === row._id);

    if (!originalRecord) {
      console.warn("Original record not found for comparison");
      return;
    }

    // Compare editable fields to check if anything actually changed
    // Use String() and parseFloat() to handle type differences
    const hasChanges =
      String(originalRecord.date || "") !== String(row.date || "") ||
      parseFloat(originalRecord.amount || 0) !== parseFloat(row.amount || 0) ||
      String(originalRecord.description || "") !==
        String(row.description || "") ||
      String(originalRecord.type || "") !== String(row.type || "") ||
      String(originalRecord.category || "") !== String(row.category || "") ||
      String(originalRecord.source || "") !== String(row.source || "");

    // Skip API call if nothing changed
    if (!hasChanges) {
      console.log("No changes detected, skipping API call");
      return;
    }

    // Check if this is a Splitwise transaction
    const isSplitwiseTransaction = row.source === "Splitwise";

    // If it's a Splitwise transaction, show warning modal
    if (isSplitwiseTransaction) {
      Modal.confirm({
        title: "Edit Splitwise Transaction",
        icon: <ExclamationCircleOutlined />,
        content:
          "This transaction is from Splitwise. If you edit it, this record will no longer sync with Splitwise updates. Are you sure you want to proceed?",
        okText: "Yes, Edit",
        cancelText: "Cancel",
        onOk: async () => {
          await saveExpense({ ...row, manuallyEdited: true });
        },
      });
    } else {
      await saveExpense(row);
    }
  };

  const saveExpense = async (row) => {
    try {
      const result = await updateExpense(row._id, row);

      // Handle both cloud mode (returns { data: expense }) and local mode (returns expense directly)
      const updatedExpense = result.data || result;

      const newData = [...dataSource];
      // Use _id for matching (works for both cloud and local mode)
      const index = newData.findIndex((item) => item._id === row._id);

      if (index !== -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...updatedExpense,
        });
        setDataSource(newData);
      }
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        inputType: col.inputType,
        categories: categories,
        options: col.dataIndex === "type" ? expenseTypes : null,
      }),
    };
  });
  return (
    <>
      <Input
        prefix={<SearchOutlined style={{ color: theme.text.secondary }} />}
        placeholder="Search expenses..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 12, maxWidth: 500 }}
        allowClear
        size="large"
      />
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: theme.bg.secondary,
              headerColor: theme.text.primary,
              rowHoverBg: theme.bg.tertiary,
              borderColor: theme.border.primary,
            },
          },
        }}
      >
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          dataSource={filteredData}
          columns={columns}
          showSorterTooltip={false}
          onRow={(record) => ({
            onMouseEnter: () => setHoveredRowId(record._id),
            onMouseLeave: () => setHoveredRowId(null),
          })}
        />
      </ConfigProvider>
    </>
  );
};
export default ExpenseList;
