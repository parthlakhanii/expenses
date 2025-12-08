import React, { useEffect, useState } from "react";
import { DatePicker, Form, Modal } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CollectionCreateForm = ({ initialValues, onFormInstanceReady }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    onFormInstanceReady(form);
  }, []);

  return (
    <Form layout="vertical" form={form} name="form_in_modal">
      <Form.Item
        name="RangePicker"
        // label="RangePicker"
        rules={[{ required: true, message: "come on!" }]}
      >
        <RangePicker />
      </Form.Item>
    </Form>
  );
};

const CollectionCreateFormModal = ({ open, onCreate, onCancel }) => {
  const [formInstance, setFormInstance] = useState();
  return (
    <Modal
      open={open}
      title="Import from Splitwise"
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
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
      />
    </Modal>
  );
};

const ImportFromSW = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState();

  const onCreate = async (values) => {
    const from = values.RangePicker[0];
    const to = values.RangePicker[1];

    await CallSplitWiseAPI(from, to);

    await onClose();
    setFormValues(values);
  };

  const CallSplitWiseAPI = async (from, to) => {
    const url = `${API_URL}/api/v1/splitwise?from=${from}&to=${to}&avoid_duplicates=true`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    await fetch(url, options);
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

export default ImportFromSW;
