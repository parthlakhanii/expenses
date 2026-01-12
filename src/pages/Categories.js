import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  message,
  Popconfirm,
  Tag,
  Space,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { useCategories } from "../contexts/CategoryContext";
import { deleteCategory } from "../services/categoryService";
import CategoryFormModal from "../components/CategoryFormModal";
import { colors } from "../styles/theme";

const Categories = ({ enableSplitwise = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { categories, loading, refreshCategories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleDelete = async (categoryId, categoryName) => {
    try {
      await deleteCategory(categoryId);
      message.success(`Category "${categoryName}" deleted successfully`);
      refreshCategories();
    } catch (error) {
      message.error(error.message || "Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    refreshCategories();
  };

  const allColumns = [
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 70,
      render: (icon) => (
        <div
          style={{
            fontSize: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon || "📁"}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: "14px",
              color: theme.text.primary,
              marginBottom: record.isDefault ? "6px" : 0,
            }}
          >
            {name}
          </div>
          {record.isDefault && (
            <Tag
              style={{
                fontSize: "10px",
                padding: "0px 6px",
                borderRadius: "3px",
                background: isDark
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(59, 130, 246, 0.1)",
                color: isDark ? "#60a5fa" : "#3b82f6",
                border: "none",
              }}
            >
              Default
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 140,
      render: (color) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: color,
              border: `1px solid ${theme.border.secondary}`,
              boxShadow: isDark
                ? "0 1px 3px rgba(0, 0, 0, 0.4)"
                : "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      ),
    },
    {
      title: "Keywords",
      dataIndex: "keywords",
      key: "keywords",
      render: (keywords) => (
        <div style={{ maxWidth: "500px" }}>
          {keywords && keywords.length > 0 ? (
            <Space wrap size={4}>
              {keywords.slice(0, 8).map((keyword, index) => (
                <Tag
                  key={index}
                  style={{
                    background: theme.bg.tertiary,
                    border: `1px solid ${theme.border.primary}`,
                    color: theme.text.primary,
                    fontSize: "11px",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    margin: 0,
                  }}
                >
                  {keyword}
                </Tag>
              ))}
              {keywords.length > 8 && (
                <Tooltip title={keywords.slice(8).join(", ")}>
                  <Tag
                    style={{
                      background: theme.border.primary,
                      border: "none",
                      color: theme.text.secondary,
                      fontSize: "11px",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      margin: 0,
                    }}
                  >
                    +{keywords.length - 8}
                  </Tag>
                </Tooltip>
              )}
            </Space>
          ) : (
            <span style={{ color: theme.text.tertiary, fontSize: "12px" }}>
              No keywords
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip
            title={
              record.isDefault
                ? "System categories cannot be edited"
                : "Edit Category"
            }
          >
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: "16px" }} />}
              onClick={() => handleEdit(record)}
              disabled={record.isDefault}
              style={{
                color: record.isDefault ? undefined : colors.accent.primary,
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
          {record.isDefault ? (
            <Tooltip title="System categories cannot be deleted">
              <Button
                type="text"
                icon={<DeleteOutlined style={{ fontSize: "16px" }} />}
                disabled={true}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Tooltip>
          ) : (
            <Popconfirm
              title="Delete Category"
              description={`Are you sure you want to delete "${record.name}"?`}
              onConfirm={() => handleDelete(record._id, record.name)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete Category">
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ fontSize: "16px" }} />}
                  style={{
                    color: colors.accent.error,
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    minHeight: "calc(100vh - 100px)",
    boxShadow: isDark
      ? "0 1px 3px rgba(0, 0, 0, 0.3)"
      : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  return (
    <div
      style={{
        padding: "24px",
        background: theme.bg.primary,
        minHeight: "100vh",
      }}
    >
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TagsOutlined style={{ fontSize: "18px" }} />
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Category Management
            </span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              borderRadius: "6px",
              height: "36px",
              fontWeight: 500,
            }}
          >
            Add Category
          </Button>
        }
        bordered={false}
        style={cardStyle}
      >
        <Table
          columns={allColumns}
          dataSource={categories}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
            style: { marginTop: "16px" },
          }}
          style={{
            background: theme.bg.secondary,
          }}
        />
      </Card>

      <CategoryFormModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={editingCategory}
        enableSplitwise={enableSplitwise}
      />
    </div>
  );
};

export default Categories;
