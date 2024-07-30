import React, { useContext, useEffect, useRef, useState } from "react";
import { ConfigProvider, Form, Input, Popconfirm, Table } from "antd";
import { deleteExpenseById } from "../services/expenseService";

import "./../styles/ExpenseList.css";
import { DeleteTwoTone } from "@ant-design/icons";

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
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
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
  const [dataSource, setDataSource] = useState(expenseData);
  const [count, setCount] = useState(2);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    setEditable(view === "dashboard");
  }, [view]);

  useEffect(() => {
    setDataSource(expenseData);
  }, [expenseData]);

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
            ? "green"
            : record.type === "Expense"
            ? "red"
            : record.type === "Investment"
            ? "blue"
            : "gray";
        return <span style={{ color: color }}>{text}</span>;
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
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Expense Type",
      dataIndex: "type",
      editable: editable,
      sorter: (a, b) => a.type.localeCompare(b.type),
      filters: [
        { text: "Income", value: "Income" },
        { text: "Expense", value: "Expense" },
        { text: "Investment", value: "Investment" },
      ],
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => record.type.startsWith(value),
    },
    {
      title: "Category",
      dataIndex: "category",
      editable: editable,
      sorter: (a, b) => a.category.localeCompare(b.category),
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
            <DeleteTwoTone />
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
    const url = `http://localhost:3001/api/v1/expense/${row._id}`;
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
      }),
    };
  });
  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            /* here is your component tokens */
            headerBg: "white",
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
