import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Radio, Space, Checkbox, Tooltip } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CloudOutlined, LaptopOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useStorage } from '../contexts/StorageContext';
import { useCategories } from '../contexts/CategoryContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { createPasswordCanary } from '../services/encryptionService';
import { setPasswordCanary } from '../services/localStorageService';
import { colors } from '../styles/theme';

const { Title, Text } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { signup } = useAuth();
  const { refreshFromLocalStorage } = useStorage();
  const { refreshCategories } = useCategories();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const storageMode = Form.useWatch('storageMode', form);

  const onFinish = async (values) => {
    setLoading(true);
    const result = await signup(values.name, values.email, values.password, values.storageMode || 'cloud');
    setLoading(false);

    if (result.success) {
      // Refresh StorageContext to pick up new settings
      refreshFromLocalStorage();

      // Fetch categories after successful signup
      refreshCategories();

      // For local mode users, create password canary for future sync verification
      if (values.storageMode === 'local') {
        try {
          const canary = createPasswordCanary(values.email, values.password);
          await setPasswordCanary(canary);
        } catch (error) {
          console.error('Failed to create password canary:', error);
          // Don't fail signup if canary creation fails
        }
      }

      message.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      message.error(result.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: theme.bg.primary,
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: isDark
            ? '0 4px 12px rgba(0,0,0,0.5)'
            : '0 4px 12px rgba(0,0,0,0.1)',
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: theme.text.primary }}>
            Create Account
          </Title>
          <Text type="secondary">Sign up to get started</Text>
        </div>

        <Form
          name="signup"
          form={form}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Full Name (optional)"
            rules={[
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full name (defaults to email username)"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email address"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm password"
            />
          </Form.Item>

          <Form.Item
            name="storageMode"
            label="Storage Preference"
            initialValue="cloud"
            rules={[{ required: true, message: 'Please select a storage mode' }]}
          >
            <Radio.Group>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="cloud">
                  <Space align="start">
                    <CloudOutlined style={{ marginTop: 4 }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>Cloud Storage</div>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        • Data stored on server, accessible from any device
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        • Password can be reset if forgotten
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        • Standard encryption in transit and at rest
                      </Text>
                    </div>
                  </Space>
                </Radio>
                <Radio value="local">
                  <Space align="start">
                    <LaptopOutlined style={{ marginTop: 4 }} />
                    <div>
                      <Space style={{ marginBottom: 4 }}>
                        <div style={{ fontWeight: 500 }}>Local Storage + Encrypted Backup</div>
                        <Tooltip title="You'll enter your password each time you sync. Your password is never stored. You can change your password anytime (requires current password). If you forget your password, the old encrypted backup cannot be recovered, but your local browser data remains accessible and can be backed up again with a new password.">
                          <InfoCircleOutlined style={{ fontSize: '14px', color: '#8b5cf6' }} />
                        </Tooltip>
                      </Space>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        • Data stored in your browser (offline-first)
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        • Zero-knowledge encrypted cloud backup
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#f59e0b' }}>
                        ⚠️ Forgotten password means lost backup
                      </Text>
                    </div>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {storageMode === 'local' && (
            <Form.Item
              name="confirmEncryption"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error('You must acknowledge the encryption risks')),
                },
              ]}
              style={{ marginBottom: '16px' }}
            >
              <Checkbox>
                <Text style={{ fontSize: '13px' }}>
                  I understand that if I <strong>forget my password</strong>, my <strong>encrypted backup cannot be recovered</strong>
                </Text>
              </Checkbox>
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                marginTop: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: '#ffffff',
                height: 44,
                fontWeight: 500,
              }}
            >
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account? <Link to="/login">Sign in</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
