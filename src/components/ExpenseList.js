import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ConfigProvider,
  Form,
  Input,
  Popconfirm,
  Select,
  Table,
  Tag,
} from "antd";
import { deleteExpenseById } from "../services/expenseService";
import { useTheme } from "../contexts/ThemeContext";

import "./../styles/ExpenseList.css";
import { DeleteOutlined } from "@ant-design/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

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

const ExpenseList = ({ expenseData, view }) => {
  const { isDark } = useTheme();
  const [dataSource, setDataSource] = useState(expenseData);
  const [count, setCount] = useState(2);
  const [editable, setEditable] = useState(false);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    // Fetch categories from backend
    fetch(`${API_URL}/api/v1/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error_status && data.data?.categories) {
          setCategories(data.data.categories);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const handleDelete = (key) => {
    deleteExpenseById(key);
    const newData = dataSource.filter((item) => item._id !== key);
    setDataSource(newData);
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
            sorter: (a, b) => a.owed_share - b.owed_share,
          },
        ]
      : []),
    {
      title: "Description",
      dataIndex: "description",
      editable: editable,
      sorter: (a, b) => a.description.localeCompare(b.description),
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
    {
      title: "Expense Type",
      dataIndex: "type",
      editable: editable,
      inputType: "select",
      sorter: (a, b) => a.type.localeCompare(b.type),
      filters: [
        { text: "Income", value: "Income" },
        { text: "Expense", value: "Expense" },
        { text: "Investment", value: "Investment" },
        { text: "Transfer", value: "Transfer" },
      ],
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => record.type.startsWith(value),
    },
    {
      title: "Category",
      dataIndex: "category",
      editable: editable,
      inputType: "select",
      sorter: (a, b) => a.category.localeCompare(b.category),
      render: (category) => {
        const cat = categories.find((c) => c.name === category);
        return cat ? (
          <Tag
            color={cat.color}
            style={{
              fontSize: "13px",
              color: "#1e293b",
            }}
          >
            {cat.icon} {cat.name}
          </Tag>
        ) : (
          category
        );
      },
    },
    {
      title: "Data Source",
      dataIndex: "source",
      editable: editable,
      sorter: (a, b) => a.source.localeCompare(b.source),
    },
    {
      title: "",
      dataIndex: "operation",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <DeleteOutlined
              style={{
                color: isDark ? "#60a5fa" : "#3b82f6",
                fontSize: "16px",
                cursor: "pointer",
              }}
            />
          </Popconfirm>
        ) : null,
    },
  ];
  const handleAdd = () => {
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: "32",
      address: `London, Park Lane no. ${count}`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };
  const handleSave = async (row) => {
    const url = `${API_URL}/api/v1/expense/${row._id}`;
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(row),
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((json) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => json.data.id === item.id);
        console.log("index of the data => ", index);
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...json.data,
        });
        setDataSource(newData);
      });
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
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: isDark ? "#1e293b" : "#ffffff",
            headerColor: isDark ? "#e2e8f0" : "#1e293b",
            rowHoverBg: isDark ? "#334155" : "#f8fafc",
            borderColor: isDark ? "#334155" : "#e2e8f0",
          },
        },
      }}
    >
      <div>
        {/* <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add a row
      </Button> */}
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          // bordered
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    </ConfigProvider>
  );
};
export default ExpenseList;
