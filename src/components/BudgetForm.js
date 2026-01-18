import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { PlusOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";
import { saveBudget, getBudget } from "../services/budgetService";
import { useCategories } from "../contexts/CategoryContext";
import moment from "moment";

const BudgetForm = ({ open, onClose, onSuccess, month, year }) => {
  const [form] = Form.useForm();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [copyingFromPrevious, setCopyingFromPrevious] = useState(false);
  const [hasPreviousBudget, setHasPreviousBudget] = useState(false);
  const addCategoryFnRef = useRef(null);
  const categoryBudgets = Form.useWatch("categoryBudgets", form);

  const loadBudget = useCallback(async () => {
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
  }, [month, year, form]);

  const checkPreviousBudget = useCallback(async () => {
    try {
      const previousDate = moment()
        .year(year)
        .month(month)
        .subtract(1, "month");
      const previousMonth = previousDate.month();
      const previousYear = previousDate.year();

      const budget = await getBudget(previousMonth, previousYear);
      setHasPreviousBudget(budget.overallBudget > 0);
    } catch (error) {
      setHasPreviousBudget(false);
    }
  }, [month, year]);

  useEffect(() => {
    if (open) {
      // Load existing budget if available
      loadBudget();
      checkPreviousBudget();
    }
  }, [open, month, year, loadBudget, checkPreviousBudget]);

  const copyFromPreviousMonth = async () => {
    setCopyingFromPrevious(true);
    try {
      const previousDate = moment()
        .year(year)
        .month(month)
        .subtract(1, "month");
      const previousMonth = previousDate.month();
      const previousYear = previousDate.year();

      const budget = await getBudget(previousMonth, previousYear);

      if (budget.overallBudget > 0) {
        form.setFieldsValue({
          overallBudget: budget.overallBudget,
          categoryBudgets: budget.categoryBudgets,
        });
        message.success(
          `Copied budget from ${previousDate.format("MMMM YYYY")}`
        );
      } else {
        message.warning("No budget found for previous month");
      }
    } catch (error) {
      console.error("Failed to copy from previous month:", error);
      message.error("Failed to copy budget from previous month");
    } finally {
      setCopyingFromPrevious(false);
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
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: 16 }}>
          {hasPreviousBudget && (
            <Button
              icon={<CopyOutlined />}
              loading={copyingFromPrevious}
              onClick={copyFromPreviousMonth}
              style={{ flex: 1 }}
            >
              Copy Previous
            </Button>
          )}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => addCategoryFnRef.current && addCategoryFnRef.current()}
            style={{ flex: 1 }}
          >
            Add Category
          </Button>
        </div>

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
            controls={false}
          />
        </Form.Item>

        {categoryBudgets && categoryBudgets.length > 0 && (
          <Divider>Category Budgets</Divider>
        )}

        {/* Category Budgets (dynamic list) */}
        <Form.List name="categoryBudgets">
          {(fields, { add, remove }) => {
            // Store the add function reference
            addCategoryFnRef.current = add;

            return (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  // Get already selected categories except the current row
                  const selectedCategories = (categoryBudgets || [])
                    .filter((_, index) => index !== name)
                    .map((item) => item?.category)
                    .filter(Boolean);

                  // Filter out already selected categories
                  const availableCategories = categories.filter(
                    (cat) => !selectedCategories.includes(cat.name)
                  );

                  return (
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
                          {availableCategories.map((cat) => (
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
                        controls={false}
                      />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                  );
                })}
              </>
            );
          }}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default BudgetForm;
