import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Tag,
  message,
  Space,
  Button,
  Divider,
  Tooltip,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { createCategory, updateCategory } from "../services/categoryService";
import { colors } from "../styles/theme";

const CategoryFormModal = ({ open, onClose, onSuccess, category, enableSplitwise = false }) => {
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const theme = isDark ? colors.dark : colors.light;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [splitwiseMapping, setSplitwiseMapping] = useState([]);
  const [splitwiseInput, setSplitwiseInput] = useState("");

  const isEditMode = !!category;

  useEffect(() => {
    if (open && category) {
      // Editing existing category
      form.setFieldsValue({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
      setKeywords(category.keywords || []);
      setSplitwiseMapping(category.splitwiseMapping || []);
    } else if (open) {
      // Adding new category
      form.resetFields();
      setKeywords([]);
      setSplitwiseMapping([]);
    }
  }, [open, category, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const categoryData = {
        name: values.name,
        icon: values.icon || "📁",
        color: values.color || "#94a3b8",
        keywords: keywords,
        splitwiseMapping: splitwiseMapping,
      };

      if (isEditMode) {
        await updateCategory(category._id, categoryData);
        message.success("Category updated successfully");
      } else {
        await createCategory(categoryData);
        message.success("Category created successfully");
      }

      form.resetFields();
      setKeywords([]);
      setSplitwiseMapping([]);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(error.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleAddSplitwiseMapping = () => {
    const trimmed = splitwiseInput.trim().toLowerCase();
    if (trimmed && !splitwiseMapping.includes(trimmed)) {
      setSplitwiseMapping([...splitwiseMapping, trimmed]);
      setSplitwiseInput("");
    }
  };

  const handleRemoveSplitwiseMapping = (mapping) => {
    setSplitwiseMapping(splitwiseMapping.filter((m) => m !== mapping));
  };

  const handleCancel = () => {
    form.resetFields();
    setKeywords([]);
    setSplitwiseMapping([]);
    if (onClose) {
      onClose();
    }
  };

  // Common emoji icons for categories
  const commonIcons = [
    "🍽️",
    "🛒",
    "🚗",
    "🛍️",
    "🎬",
    "💡",
    "🏥",
    "✈️",
    "💪",
    "📚",
    "💇",
    "🏠",
    "🐾",
    "🎁",
    "📱",
    "💰",
    "💵",
    "🔄",
    "↩️",
    "❓",
    "🍕",
    "☕",
    "🎮",
    "📦",
    "🔧",
    "👕",
    "📈",
    "💼",
    "🎨",
    "🏃",
  ];

  return (
    <Modal
      title={isEditMode ? "Edit Category" : "Add New Category"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={isMobile ? "90vw" : 600}
      okText={isEditMode ? "Update" : "Create"}
      style={{
        top: 20,
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        {/* Category Name */}
        <Form.Item
          label="Category Name"
          name="name"
          rules={[
            { required: true, message: "Please enter a category name" },
            { max: 50, message: "Name must be less than 50 characters" },
          ]}
        >
          <Input
            placeholder="e.g., Work Expenses, Personal Care"
            size="large"
          />
        </Form.Item>

        {/* Icon and Color Row */}
        <Space size="large" style={{ width: "100%" }}>
          <Form.Item label="Icon" name="icon" style={{ flex: 1 }}>
            <Input
              placeholder="📁"
              size="large"
              maxLength={2}
              style={{ fontSize: "24px", textAlign: "center" }}
            />
          </Form.Item>

          <Form.Item label="Color" name="color" style={{ flex: 1 }}>
            <Input type="color" size="large" style={{ width: "100%" }} />
          </Form.Item>
        </Space>

        {/* Common Icons */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: "12px",
              color: theme.text.secondary,
              marginBottom: 8,
            }}
          >
            Quick Icons:
          </div>
          <Space wrap>
            {commonIcons.map((icon, index) => (
              <Tooltip key={index} title="Click to use">
                <Button
                  type="text"
                  onClick={() => form.setFieldsValue({ icon })}
                  style={{
                    fontSize: "20px",
                    padding: "4px 8px",
                    height: "auto",
                  }}
                >
                  {icon}
                </Button>
              </Tooltip>
            ))}
          </Space>
        </div>

        <Divider />

        {/* Keywords Section */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: 12,
              color: theme.text.primary,
            }}
          >
            Keywords for Auto-Categorization
          </div>
          <div
            style={{
              fontSize: "12px",
              color: theme.text.secondary,
              marginBottom: 12,
            }}
          >
            Add keywords to improve automatic categorization of transactions
          </div>

          <Space.Compact style={{ width: "100%", marginBottom: 12 }}>
            <Input
              placeholder="Enter keyword (e.g., amazon, starbucks)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onPressEnter={handleAddKeyword}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddKeyword}
            >
              Add
            </Button>
          </Space.Compact>

          <div
            style={{
              minHeight: "60px",
              padding: "12px",
              background: theme.bg.tertiary,
              border: `1px solid ${theme.border.primary}`,
              borderRadius: "8px",
            }}
          >
            {keywords.length > 0 ? (
              <Space wrap>
                {keywords.map((keyword, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => handleRemoveKeyword(keyword)}
                    style={{
                      background: theme.border.secondary,
                      border: "none",
                      color: theme.text.primary,
                      padding: "4px 8px",
                    }}
                  >
                    {keyword}
                  </Tag>
                ))}
              </Space>
            ) : (
              <div
                style={{
                  color: theme.text.tertiary,
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                No keywords added yet
              </div>
            )}
          </div>
        </div>

        {/* Splitwise Mapping Section */}
        {enableSplitwise && (
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: 12,
                color: theme.text.primary,
              }}
            >
              Splitwise Category Mapping (Optional)
            </div>
            <div
              style={{
                fontSize: "12px",
                color: theme.text.secondary,
                marginBottom: 12,
              }}
            >
              Map Splitwise categories to this category
            </div>

            <Space.Compact style={{ width: "100%", marginBottom: 12 }}>
              <Input
                placeholder="Enter Splitwise category name"
                value={splitwiseInput}
                onChange={(e) => setSplitwiseInput(e.target.value)}
                onPressEnter={handleAddSplitwiseMapping}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSplitwiseMapping}
              >
                Add
              </Button>
            </Space.Compact>

            <div
              style={{
                minHeight: "60px",
                padding: "12px",
                background: theme.bg.tertiary,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: "8px",
              }}
            >
              {splitwiseMapping.length > 0 ? (
                <Space wrap>
                  {splitwiseMapping.map((mapping, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => handleRemoveSplitwiseMapping(mapping)}
                      color="blue"
                      style={{
                        padding: "4px 8px",
                      }}
                    >
                      {mapping}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <div
                  style={{
                    color: theme.text.tertiary,
                    fontSize: "12px",
                    textAlign: "center",
                    padding: "8px 0",
                  }}
                >
                  No Splitwise mappings added
                </div>
              )}
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
