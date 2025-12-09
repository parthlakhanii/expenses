import React, { useState } from 'react';
import { Modal, Steps } from 'antd';
import {
  UploadOutlined,
  SettingOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import UploadStep from './UploadStep';
import MappingStep from './MappingStep';
import PreviewStep from './PreviewStep';
import ImportStep from './ImportStep';

const { Step } = Steps;

/**
 * CSV Import Wizard
 * Multi-step wizard for importing any CSV format
 */
const CsvImportWizard = ({ open, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    sessionId: null,
    headers: [],
    preview: [],
    totalRows: 0,
    suggestedMapping: {},
    columnMapping: {},
    importOptions: {},
    source: '',
    paymentType: ''
  });

  const handleClose = () => {
    // Reset wizard state
    setCurrentStep(0);
    setWizardData({
      sessionId: null,
      headers: [],
      preview: [],
      totalRows: 0,
      suggestedMapping: {},
      columnMapping: {},
      importOptions: {}
    });
    onClose();
  };

  const handleUploadComplete = (uploadData) => {
    setWizardData({
      ...wizardData,
      sessionId: uploadData.sessionId,
      headers: uploadData.headers,
      preview: uploadData.preview,
      totalRows: uploadData.totalRows,
      suggestedMapping: uploadData.suggestedMapping,
      source: uploadData.source,
      paymentType: uploadData.paymentType
    });
    setCurrentStep(1);
  };

  const handleMappingComplete = (data) => {
    setWizardData({
      ...wizardData,
      columnMapping: data.mapping,
      source: data.manualSource,
      paymentType: data.manualPaymentType
    });
    setCurrentStep(2);
  };

  const handlePreviewComplete = (importOptions) => {
    setWizardData({
      ...wizardData,
      importOptions
    });
    setCurrentStep(3);
  };

  const handleBackToMapping = () => {
    setCurrentStep(1);
  };

  const handleImportSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const steps = [
    {
      title: 'Upload',
      icon: <UploadOutlined />,
      description: 'Upload CSV file'
    },
    {
      title: 'Map Columns',
      icon: <SettingOutlined />,
      description: 'Map to fields'
    },
    {
      title: 'Preview',
      icon: <EyeOutlined />,
      description: 'Review data'
    },
    {
      title: 'Import',
      icon: <CheckCircleOutlined />,
      description: 'Import transactions'
    }
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            CSV Import
          </div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#666' }}>
            Import transactions from any bank or financial institution
          </div>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      maskClosable={true}
    >
      <div style={{ marginTop: 24 }}>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        <div>
          {currentStep === 0 && (
            <UploadStep onNext={handleUploadComplete} />
          )}

          {currentStep === 1 && (
            <MappingStep
              sessionData={wizardData}
              onNext={handleMappingComplete}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {currentStep === 2 && (
            <PreviewStep
              sessionId={wizardData.sessionId}
              columnMapping={wizardData.columnMapping}
              onNext={handlePreviewComplete}
              onBack={handleBackToMapping}
            />
          )}

          {currentStep === 3 && (
            <ImportStep
              sessionId={wizardData.sessionId}
              columnMapping={wizardData.columnMapping}
              options={{
                ...wizardData.importOptions,
                source: wizardData.source,
                paymentType: wizardData.paymentType
              }}
              onClose={handleClose}
              onRefreshData={handleImportSuccess}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CsvImportWizard;
