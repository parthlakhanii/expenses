import React, { useState } from 'react';
import { Upload, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosConfig';

const { Dragger } = Upload;

/**
 * Step 1: Upload CSV File
 * Handles file upload and displays auto-detected column mapping
 */
const UploadStep = ({ onNext }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    showUploadList: true,
    maxCount: 1,
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploading(true);
      setError(null);

      try {
        // Always upload to server for parsing (same logic for both modes)
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          '/api/v1/csv/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.error_status) {
          throw new Error(response.data.message || 'Upload failed');
        }

        setUploading(false);
        onSuccess(response.data);
        onNext(response.data.data);

      } catch (err) {
        setUploading(false);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to upload file';
        setError(errorMessage);
        onError(err);
      }
    },
    onRemove: () => {
      setError(null);
    }
  };

  return (
    <div style={{ padding: '40px 24px' }}>
      <Dragger {...uploadProps} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Drop CSV file here or click to upload
        </p>
        <p className="ant-upload-hint">
          Supports any CSV format from your bank or expense tracker
        </p>
      </Dragger>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginTop: 24 }}
        />
      )}
    </div>
  );
};

export default UploadStep;
