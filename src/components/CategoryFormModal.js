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
  Popover,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "../contexts/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { createCategory, updateCategory } from "../services/categoryService";
import { colors } from "../styles/theme";

const CategoryFormModal = ({
  open,
  onClose,
  onSuccess,
  category,
  enableSplitwise = false,
}) => {
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const theme = isDark ? colors.dark : colors.light;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [splitwiseMapping, setSplitwiseMapping] = useState([]);
  const [splitwiseInput, setSplitwiseInput] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Watch form values for reactivity
  const iconValue = Form.useWatch("icon", form);
  const colorValue = Form.useWatch("color", form);

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
      form.setFieldsValue({
        color: "#94a3b8",
      });
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

  const handleEmojiSelect = (emojiData) => {
    form.setFieldsValue({ icon: emojiData.emoji });
    setEmojiPickerOpen(false);
  };

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
        top: 100,
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }} initialValues={{ color: "#94a3b8" }}>
        {/* Category Name with Icon and Color */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Popover
            content={
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                theme={isDark ? "dark" : "light"}
                width={300}
                height={400}
              />
            }
            trigger="click"
            open={emojiPickerOpen}
            onOpenChange={setEmojiPickerOpen}
            placement="bottomLeft"
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: theme.bg.tertiary,
                border: `1px solid ${theme.border.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: iconValue ? 16 : 14,
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
                color: theme.text.tertiary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.border.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bg.tertiary;
              }}
            >
              {iconValue || "😀"}
            </div>
          </Popover>
          <Form.Item name="icon" hidden>
            <Input />
          </Form.Item>

          <label
            style={{
              position: "relative",
              width: 32,
              height: 32,
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.bg.tertiary,
              border: `1px solid ${theme.border.primary}`,
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: colorValue || "#94a3b8",
                transition: "all 0.2s",
              }}
            />
            <Form.Item
              name="color"
              style={{ margin: 0, position: "absolute", top: 0, left: 0 }}
            >
              <input
                type="color"
                onChange={(e) => form.setFieldsValue({ color: e.target.value })}
                value={colorValue || "#94a3b8"}
                style={{
                  width: 32,
                  height: 32,
                  opacity: 0,
                  cursor: "pointer",
                  border: "none",
                }}
              />
            </Form.Item>
          </label>

          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Please enter a category name" },
              { max: 50, message: "Name must be less than 50 characters" },
            ]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Input placeholder="Category name" />
          </Form.Item>
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

          {keywords.length > 0 && (
            <div
              style={{
                minHeight: "60px",
                padding: "12px",
                background: theme.bg.tertiary,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: "8px",
              }}
            >
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
            </div>
          )}
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
