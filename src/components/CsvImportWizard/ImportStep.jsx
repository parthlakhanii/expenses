import React, { useState, useEffect, useRef } from 'react';
import { Button, Spin, Typography, message } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Step 4: Import Transactions
 * Performs the actual import and shows results
 */
const ImportStep = ({ sessionId, columnMapping, options, onClose, onRefreshData }) => {
  const [importing, setImporting] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const hasImported = useRef(false);

  useEffect(() => {
    // Prevent double import in React 18 strict mode
    if (!hasImported.current) {
      hasImported.current = true;
      performImport();
    }
  }, []);

  const performImport = async () => {
    setImporting(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/v1/csv/import`, {
        sessionId,
        columnMapping,
        options: {
          skipDuplicates: options.skipDuplicates,
          overwriteDuplicates: options.overwriteDuplicates || false,
          source: options.source || 'CSV Import',
          paymentType: options.paymentType || 'CSV Import',
          selectedRowIndices: options.selectedRowIndices || null
        }
      });

      if (response.data.error_status) {
        throw new Error(response.data.message || 'Import failed');
      }

      setResult(response.data.data);
      setImporting(false);

      // Refresh the main data after successful import
      if (onRefreshData) {
        setTimeout(() => {
          onRefreshData();
        }, 1000);
      }

    } catch (err) {
      setImporting(false);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to import transactions';
      setError(errorMessage);
    }
  };

  const handleRollback = async () => {
    if (!result?.importId) return;

    try {
      await axios.delete(`${API_URL}/api/v1/csv/import/${result.importId}`);

      message.success('Import rolled back successfully');

      if (onRefreshData) {
        onRefreshData();
      }

      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to rollback import');
    }
  };

  if (importing) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          size="large"
        />
        <p style={{ marginTop: 24, color: '#999' }}>
          Importing...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 24 }} />

        <div style={{ fontSize: 18, marginBottom: 8 }}>
          Import failed
        </div>

        <Text type="secondary" style={{ display: 'block', marginBottom: 48 }}>
          {error}
        </Text>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button onClick={onClose}>
            Close
          </Button>
          <Button type="primary" onClick={performImport}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const imported = result?.imported || 0;
  const duplicatesSkipped = result?.duplicatesSkipped || 0;
  const importId = result?.importId;

  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 24 }} />

      <div style={{ fontSize: 18, marginBottom: 8 }}>
        Imported {imported} transaction{imported !== 1 ? 's' : ''}
      </div>

      {duplicatesSkipped > 0 && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {duplicatesSkipped} duplicate{duplicatesSkipped !== 1 ? 's' : ''} skipped
        </Text>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        marginTop: 48
      }}>
        {importId && imported > 0 && (
          <Button
            onClick={handleRollback}
          >
            Undo
          </Button>
        )}

        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};

export default ImportStep;
