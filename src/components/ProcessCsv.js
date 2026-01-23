import React, { useEffect, useState } from "react";
import { Form, message, Modal, Upload, Select } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CollectionCreateForm = ({
  initialValues,
  onFormInstanceReady,
  onCancel,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    onFormInstanceReady(form);
  }, [form, onFormInstanceReady]);

  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const [csvType, setCsvType] = useState(null);
  const [fileSource] = useState("");

  const handleCsvTypeChange = (value) => {
    setCsvType(value);
  };

  const handleUpload = async ({ file, onSuccess }) => {
    const data = new FormData();
    data.append("csv", file);
    data.append("type", csvType);
    data.append("source", fileSource);
    const config = {
      headers: {
        "content-type":
          "multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s",
      },
    };
    try {
      await axios.post(`${API_URL}/api/v1/processCsv`, data, config);
      message.success("Yay!!");
      onCancel();
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("File upload failed");
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
    >
      <Form.Item label="Select File Type" name="csvType">
        <Select onChange={handleCsvTypeChange} placeholder="Select file type">
          <Option value="sc_cred">Scotia Momentum Credit Card</Option>
          <Option value="sc_cheq">Scotia Bank Account</Option>
          <Option value="ws_cash">Wealthsimple Cash</Option>
          <Option value="ws_tfsa">Wealthsimple TFSA</Option>
          <Option value="ci_cred">CIBC Credit Card</Option>

          {/* Add more options as needed */}
        </Select>
      </Form.Item>

      {csvType && (
        <Form.Item label="">
          <Form.Item
            name="Import CSV"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            noStyle
          >
            <Upload.Dragger
              name="file"
              multiple={false}
              customRequest={handleUpload}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload.
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
      )}
    </Form>
  );
};
const CollectionCreateFormModal = ({ open, onCancel, initialValues }) => {
  return (
    <Modal
      open={open}
      title="Import CSV"
      destroyOnHidden
      footer={null}
      onCancel={onCancel}
    >
      <CollectionCreateForm
        initialValues={initialValues}
        onFormInstanceReady={() => {}}
        onCancel={onCancel}
      />
    </Modal>
  );
};

const ProcessCSV = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState();

  const onCreate = (values) => {
    console.log("Received values of form: ", values);
    setFormValues(values);
    onClose();
  };

  return (
    <>
      <pre>{JSON.stringify(formValues, null, 2)}</pre>
      <CollectionCreateFormModal
        open={open}
        onCreate={onCreate}
        onCancel={onClose}
        initialValues={{
          modifier: "public",
        }}
      />
    </>
  );
};

export default ProcessCSV;
