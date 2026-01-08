import React, { useState } from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';

/**
 * Change Password Modal for Local Mode Users
 * Re-encrypts all data with new password
 */
const ChangePasswordModal = ({ visible, onConfirm, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setError(null);

      // Call onConfirm with old and new passwords
      const result = await onConfirm(values.oldPassword, values.newPassword);

      // If confirm returns false, show error
      if (result === false) {
        setError('Incorrect current password. Please try again.');
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
      title="Change Password"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Change Password"
      cancelText="Cancel"
    >
      <p style={{ marginBottom: '16px' }}>
        All your encrypted data will be re-encrypted with the new password.
      </p>

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
          name="oldPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
