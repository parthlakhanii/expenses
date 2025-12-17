import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Button,
  message,
  Divider,
  Space,
  Select,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { saveBudget, getBudget } from "../services/budgetService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const BudgetForm = ({ open, onClose, onSuccess, month, year }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories
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
      // Load existing budget if available
      loadBudget();
    }
  }, [open, month, year]);

  const loadBudget = async () => {
    try {
      const budget = await getBudget(month, year);
      if (budget.overallBudget > 0) {
        form.setFieldsValue({
          overallBudget: budget.overallBudget,
          categoryBudgets: budget.categoryBudgets,
        });
      } else {
        form.resetFields();
      }
    } catch (error) {
      console.error("Failed to load budget:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await saveBudget(
        month,
        year,
        values.overallBudget || 0,
        values.categoryBudgets || []
      );

      message.success("Budget saved successfully!");
      form.resetFields();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      message.error("Failed to save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Set Monthly Budget"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText="Save Budget"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        {/* Overall Budget */}
        <Form.Item
          label="Overall Monthly Budget"
          name="overallBudget"
          rules={[
            { required: true, message: "Please enter an overall budget" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            size="large"
            prefix="$"
            precision={2}
            min={0}
            placeholder="0.00"
          />
        </Form.Item>

        <Divider>Category Budgets</Divider>

        {/* Category Budgets (dynamic list) */}
        <Form.List name="categoryBudgets">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "category"]}
                    rules={[{ required: true, message: "Select category" }]}
                  >
                    <Select
                      placeholder="Category"
                      style={{ width: 200 }}
                      showSearch
                    >
                      {categories.map((cat) => (
                        <Select.Option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "amount"]}
                    rules={[{ required: true, message: "Enter amount" }]}
                  >
                    <InputNumber
                      prefix="$"
                      precision={2}
                      min={0}
                      placeholder="0.00"
                      style={{ width: 150 }}
                    />
                  </Form.Item>
                  <DeleteOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Category Budget
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default BudgetForm;
