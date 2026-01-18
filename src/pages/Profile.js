import React from "react";
import { Layout, Card, Descriptions, Avatar, Space, Typography, Button, message } from "antd";
import { UserOutlined, MailOutlined, LogoutOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { colors } from "../styles/theme";

const { Content, Header } = Layout;
const { Title } = Typography;

const Profile = () => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const cardStyle = {
    background: theme.bg.secondary,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: "12px",
    marginBottom: "12px",
  };

  const headerStyle = {
    background: "transparent",
    border: "none",
    padding: "24px 48px 0 48px",
    height: "auto",
  };

  const contentStyle = {
    padding: "12px 48px 24px 48px",
    background: theme.bg.primary,
    minHeight: "100vh",
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <Layout style={{ minHeight: "100vh", background: theme.bg.primary }}>
      <Header style={headerStyle}>
        <Title
          level={2}
          style={{
            margin: 0,
            lineHeight: 1.2,
            color: theme.text.primary
          }}
        >
          Profile
        </Title>
      </Header>

      <Content style={contentStyle}>
        {/* Profile Card */}
        <Card variant="borderless" style={cardStyle}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Avatar and Name Section */}
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <Avatar
                size={100}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "36px",
                  fontWeight: 600,
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
              <Title
                level={3}
                style={{
                  marginTop: "16px",
                  marginBottom: "4px",
                  color: theme.text.primary,
                }}
              >
                {user?.name || "User"}
              </Title>
              <div
                style={{
                  color: theme.text.secondary,
                  fontSize: "14px",
                }}
              >
                {user?.email}
              </div>
            </div>

            {/* Account Details */}
            <Descriptions
              title="Account Information"
              bordered
              column={1}
              size="middle"
              labelStyle={{
                background: theme.bg.tertiary,
                color: theme.text.secondary,
                fontWeight: 500,
              }}
              contentStyle={{
                background: theme.bg.secondary,
                color: theme.text.primary,
              }}
            >
              <Descriptions.Item label={<><UserOutlined style={{ marginRight: 8 }} />Name</>}>
                {user?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined style={{ marginRight: 8 }} />Email</>}>
                {user?.email || "N/A"}
              </Descriptions.Item>
              {user?.createdAt && (
                <Descriptions.Item label="Member Since">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Logout Button */}
            <div style={{ textAlign: "center", paddingTop: "16px" }}>
              <Button
                danger
                type="primary"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size="large"
              >
                Logout
              </Button>
            </div>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default Profile;
