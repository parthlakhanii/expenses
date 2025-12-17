import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
} from "antd";
import { useTheme } from "../contexts/ThemeContext";
import moment from "moment";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const AddExpense = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories on mount
    fetch(`${API_URL}/api/v1/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error_status && data.data?.categories) {
          setCategories(data.data.categories);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        date: moment(),
        source: "Manual Entry",
      });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format the expense data
      const expenseData = {
        date: values.date.format("YYYY-MM-DD"),
        amount: values.amount,
        description: values.description,
        type: values.type,
        category: values.category || "Other",
        source: values.source || "Manual Entry",
      };

      // Send to backend
      const response = await fetch(`${API_URL}/api/v1/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();

      if (!result.error_status) {
        message.success("Expense added successfully!");
        form.resetFields();
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.error_message || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      message.error("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Manual Expense"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText="Add Expense"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        {/* Date */}
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="MMM DD, YYYY"
            size="large"
          />
        </Form.Item>

        {/* Amount */}
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true, message: "Please enter an amount" },
            {
              type: "number",
              min: 0.01,
              message: "Amount must be greater than 0",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            size="large"
            prefix="$"
            precision={2}
            placeholder="0.00"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input
            size="large"
            placeholder="e.g., Grocery shopping at Costco"
            maxLength={200}
          />
        </Form.Item>

        {/* Type */}
        <Form.Item
          label="Transaction Type"
          name="type"
          rules={[{ required: true, message: "Please select a type" }]}
        >
          <Select size="large" placeholder="Select type">
            <Select.Option value="Expense">
              <span style={{ color: "#f87171" }}>💸 Expense</span>
            </Select.Option>
            <Select.Option value="Income">
              <span style={{ color: "#34d399" }}>💰 Income</span>
            </Select.Option>
            <Select.Option value="Investment">
              <span style={{ color: "#60a5fa" }}>📈 Investment</span>
            </Select.Option>
            <Select.Option value="Transfer">
              <span style={{ color: "#a78bfa" }}>🔄 Transfer</span>
            </Select.Option>
          </Select>
        </Form.Item>

        {/* Category */}
        <Form.Item
          label="Category"
          name="category"
          tooltip="Leave empty for auto-categorization based on description"
        >
          <Select
            size="large"
            placeholder="Auto-categorize (or select manually)"
            showSearch
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={categories?.map((cat) => ({
              value: cat.name,
              label: `${cat.icon} ${cat.name}`,
            }))}
          />
        </Form.Item>

        {/* Source */}
        <Form.Item label="Source (Optional)" name="source">
          <Input size="large" placeholder="e.g., Scotia Chequing, Cash" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddExpense;
