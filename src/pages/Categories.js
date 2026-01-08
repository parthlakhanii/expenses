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
      width: 80,
      render: (icon) => (
        <span style={{ fontSize: "24px" }}>{icon || "📁"}</span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.isDefault && (
            <Tag
              color="blue"
              style={{
                fontSize: "11px",
                marginTop: "4px",
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
      width: 120,
      render: (color) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              background: color,
              border: `1px solid ${theme.border.secondary}`,
            }}
          />
          <span style={{ fontSize: "12px", color: theme.text.secondary }}>
            {color}
          </span>
        </div>
      ),
    },
    {
      title: "Keywords",
      dataIndex: "keywords",
      key: "keywords",
      render: (keywords) => (
        <div style={{ maxWidth: "400px" }}>
          {keywords && keywords.length > 0 ? (
            <Space wrap>
              {keywords.slice(0, 5).map((keyword, index) => (
                <Tag
                  key={index}
                  style={{
                    background: theme.bg.tertiary,
                    border: `1px solid ${theme.border.primary}`,
                    color: theme.text.primary,
                    fontSize: "11px",
                  }}
                >
                  {keyword}
                </Tag>
              ))}
              {keywords.length > 5 && (
                <Tooltip title={keywords.slice(5).join(", ")}>
                  <Tag
                    style={{
                      background: theme.border.primary,
                      border: "none",
                      color: theme.text.secondary,
                      fontSize: "11px",
                    }}
                  >
                    +{keywords.length - 5} more
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
      title: "Splitwise Mapping",
      dataIndex: "splitwiseMapping",
      key: "splitwiseMapping",
      width: 180,
      show: enableSplitwise, // Only show if Splitwise is enabled
      render: (mapping) => (
        <div>
          {mapping && mapping.length > 0 ? (
            <span style={{ fontSize: "12px", color: theme.text.secondary }}>
              {mapping.length} {mapping.length === 1 ? "mapping" : "mappings"}
            </span>
          ) : (
            <span style={{ color: theme.text.tertiary, fontSize: "12px" }}>
              None
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Category">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: colors.accent.primary }}
            />
          </Tooltip>
          {!record.isDefault && (
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
                  icon={<DeleteOutlined />}
                  style={{ color: colors.accent.error }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Filter columns based on show property
  const columns = allColumns.filter(column => column.show !== false);

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    minHeight: "calc(100vh - 100px)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TagsOutlined />
            <span>Category Management</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Category
          </Button>
        }
        bordered={false}
        style={cardStyle}
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
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
