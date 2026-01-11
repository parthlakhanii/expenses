import React, { useState, useEffect } from "react";
import { Input, message, Popover } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import {
  parseExpenseInput,
  getExamplePlaceholders,
} from "../utils/nlExpenseParser";
import { createExpense } from "../services/storageAdapter";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";

/**
 * QuickAddExpense Popover Component
 * Popover with natural language input for quickly adding expenses
 * Supports inputs like "Coffee $5", "$20 lunch", "15.50 uber yesterday"
 */
const QuickAddExpense = ({ open, onOpenChange, onSuccess, children }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = getExamplePlaceholders();

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Reset input when popover closes
  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleQuickAdd = async () => {
    if (!inputValue.trim()) {
      message.warning("Please enter an expense");
      return;
    }

    setLoading(true);

    try {
      // Parse the natural language input
      const parsed = parseExpenseInput(inputValue);

      if (!parsed.isValid) {
        message.error(parsed.error);
        setLoading(false);
        return;
      }

      // Create expense using the storage adapter
      // This will automatically handle cloud/local mode and backend auto-categorization
      const expenseData = {
        date: parsed.date,
        amount: parsed.amount,
        description: parsed.description,
        type: parsed.type,
        source: "Manual Entry", // Source is manual entry
        // Category will be auto-assigned by backend
      };

      await createExpense(expenseData);

      // Show success message
      message.success(`Added: ${parsed.description} - $${parsed.amount}`);

      // Clear input and close popover
      setInputValue("");
      onOpenChange(false);

      // Call onSuccess callback to refresh expense data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create expense:", error);
      message.error("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const popoverContent = (
    <div style={{ width: 320 }}>
      <div
        style={{
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 600,
          color: theme.text.primary,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ThunderboltOutlined style={{ color: "#8b5cf6" }} />
        Quick Add Expense
      </div>
      <Input
        autoFocus
        prefix={
          <ThunderboltOutlined
            style={{
              color: theme.text.secondary,
              fontSize: "14px",
            }}
          />
        }
        placeholder={placeholders[placeholderIndex]}
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={handleQuickAdd}
        size="large"
        disabled={loading}
        style={{
          borderColor: theme.border.primary,
          backgroundColor: theme.bg.primary,
          color: theme.text.primary,
        }}
      />
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={onOpenChange}
      placement="rightBottom"
      overlayStyle={{ zIndex: 2000 }}
    >
      {children}
    </Popover>
  );
};

export default QuickAddExpense;
