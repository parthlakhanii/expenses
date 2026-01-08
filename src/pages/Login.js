import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../contexts/StorageContext";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { createPasswordCanary } from "../services/encryptionService";
import { setPasswordCanary } from "../services/localStorageService";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { refreshFromLocalStorage } = useStorage();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    setLoading(false);

    if (result.success) {
      // Refresh StorageContext to pick up latest settings from localStorage
      refreshFromLocalStorage();

      // Get user's storage mode
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const storageMode = user?.settings?.storageMode || "cloud";

      // For local mode users, create password canary for future sync verification
      // This is done during login when we have the password, so it's ready when they sync
      if (storageMode === "local") {
        try {
          const canary = createPasswordCanary(values.email, values.password);
          await setPasswordCanary(canary);
        } catch (error) {
          console.error("Failed to create password canary:", error);
          // Don't fail login if canary creation fails
        }
      }

      navigate("/dashboard");
    } else {
      message.error(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: isDark ? "#0f172a" : "#f8fafc",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: isDark ? "#1e293b" : "#ffffff",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email address" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ marginTop: 16 }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
