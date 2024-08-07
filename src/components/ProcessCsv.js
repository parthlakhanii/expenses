import React, { useEffect, useState } from "react";
import { Form, message, Modal, Upload, Select, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const CollectionCreateForm = ({
  initialValues,
  onFormInstanceReady,
  onCancel,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    onFormInstanceReady(form);
  }, []);

  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const props = {
    name: "file",
    multiple: false,
    accept: ".csv",
    headers: {
      token: "token",
      "Content-Type": "multipart/form-data",
      // boundary: "WebKitFormBoundary1ETilgImp3YsXW06",
    },
    data(file) {
      const formData = new FormData();
      formData.set("type", "credit");
      formData.set("CSV", file);
    },
    action: "http://localhost:3001/api/v1/processCsv",
    onChange(info) {
      const { status, originFileObj } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
      console.log("originFileObj ", originFileObj);
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const [csvType, setCsvType] = useState(null);
  const [fileSource, setFileSource] = useState("");

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
      const response = await axios
        .post("http://localhost:3001/api/v1/processCsv", data, config)
        .then();
      // onSuccess(expenseService.GetAllData());
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
  const [formInstance, setFormInstance] = useState();
  return (
    <Modal
      open={open}
      title="Import CSV"
      destroyOnClose
      footer={null}
      onCancel={onCancel}
    >
      <CollectionCreateForm
        initialValues={initialValues}
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
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
