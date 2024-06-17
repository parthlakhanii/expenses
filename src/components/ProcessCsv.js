import React, { useEffect, useState } from "react";
import { Form, message, Modal, Upload, Select, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

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
    // customRequest: (options) => {
    // 	const data= new FormData()
    // 	data.append('file', options.file)
    // 	const config= {
    // 		"headers": {
    // 			"content-type": 'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s'
    // 		}
    // 	}
    // 	axios.post(options.action, data, config).then((res) => {
    // 		options.onSuccess(res.data, options.file)
    // 	}).catch((err) => {
    // 		console.log(err)
    // 	})
    // },
    onChange(info) {
      // const { status } = info.file;
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
      // handleFileUpload(originFileObj);
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  // const handleFileUpload = async (file, fileType) => {
  //   const formData = new FormData();
  //   console.log("fileType ", fileType);
  //   formData.append("csv", file);
  //   formData.append("type", fileType);

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:3001/api/v1/processCsv",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     message.success(response.data.message);
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     message.error("File upload failed");
  //   }
  // };

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
      <Form.Item label="Enter file name" name="fileSource">
        <Input onChange={(e) => setFileSource(e.target.value)} />
      </Form.Item>

      <Form.Item label="Select File Type" name="csvType">
        <Select onChange={handleCsvTypeChange} placeholder="Select file type">
          <Option value="credit">Credit card</Option>
          <Option value="chequing">Bank account</Option>
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
              // {...props}
              name="file"
              multiple={false}
              // action="http://localhost:3001/api/v1/processCsv"
              // customRequest={({ onSuccess }) => onSuccess("ok")}
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

const ProcessCSV = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState();

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

export default ProcessCSV;
