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
import { useCategories } from "../contexts/CategoryContext";
import { useResponsive } from "../hooks/useResponsive";
import { createExpense } from "../services/storageAdapter";
import moment from "moment";

const AddExpense = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { categories } = useCategories();
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        date: moment(),
        type: "Expense",
        source: "Manual Entry",
      });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format the expense data
      // If category is not selected, send undefined - backend will auto-categorize
      const expenseData = {
        date: values.date.format("YYYY-MM-DD"),
        amount: values.amount,
        description: values.description,
        type: values.type,
        category: values.category, // undefined if not selected
        source: values.source || "Manual Entry",
      };

      // Send to backend for categorization and storage
      // Backend handles both cloud and local mode appropriately
      await createExpense(expenseData);

      message.success("Transaction added successfully!");
      form.resetFields();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      message.error("Failed to add transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Transaction"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={isMobile ? "90vw" : 600}
      okText="Add"
      cancelText="Cancel"
      destroyOnHidden
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
            placeholder="Grocery shopping at Costco"
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
