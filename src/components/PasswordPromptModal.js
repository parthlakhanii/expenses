import React, { useState } from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';

/**
 * Password Prompt Modal for Zero-Knowledge Encryption
 * Prompts user for password before encryption/decryption operations
 */
const PasswordPromptModal = ({
  visible,
  onConfirm,
  onCancel,
  title = "Enter Password",
  description = "Enter your password to encrypt and sync your data",
  loading = false
}) => {
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setError(null);

      // Call onConfirm with the password
      const result = await onConfirm(values.password);

      // If confirm returns false, show error
      if (result === false) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Clear form and close modal
      form.resetFields();
    } catch (error) {
      // Validation error or other error
      if (error.errorFields) {
        // Form validation error - don't show custom error
        return;
      }
      setError(error.message || 'An error occurred');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Confirm"
      cancelText="Cancel"
    >
      <p style={{ marginBottom: '16px' }}>{description}</p>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter your password' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordPromptModal;
