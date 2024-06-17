import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Upload } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
const CollectionCreateForm = ({ initialValues, onFormInstanceReady }) => {
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

  return (
    <Form
      layout="vertical"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
    >
      <Form.Item
        name="upload"
        // label="Upload"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        // extra="longgggggggggggggggggggggggggggggggggg"
        rules={[
          {
            required: true,
            message: "Please upload a file to import",
          },
        ]}
      >
        <Upload name="logo" listType="picture">
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item label="Dragger">
        <Form.Item
          name="dragger"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          noStyle
        >
          <Upload.Dragger name="files">
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
    </Form>
  );
};
const CollectionCreateFormModal = ({
  open,
  onCreate,
  onCancel,
  initialValues,
}) => {
  const [formInstance, setFormInstance] = useState();
  return (
    <Modal
      open={open}
      title="Import CSV"
      okText="Import"
      cancelText="Cancel"
      okButtonProps={{
        autoFocus: true,
      }}
      onCancel={onCancel}
      destroyOnClose
      onOk={async () => {
        try {
          const values = await formInstance?.validateFields();
          formInstance?.resetFields();
          onCreate(values);
        } catch (error) {
          console.log("Failed:", error);
        }
      }}
    >
      <CollectionCreateForm
        initialValues={initialValues}
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
      />
    </Modal>
  );
};

const AddExpense = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState();
  // const [open, setOpen] = useState(false);

  const onCreate = (values) => {
    console.log("Received values of form: ", values);
    setFormValues(values);
    onClose();
  };

  return (
    <>
      {/* <Button type="primary" onClick={() => setOpen(true)}>
        New Collection
      </Button> */}
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

export default AddExpense;
