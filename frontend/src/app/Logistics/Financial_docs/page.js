"use client";
import React, { useState, useRef } from "react";
import {
  Button,
  Form,
  Input,
  Radio,
  InputNumber,
  Upload,
  Checkbox,
  Col,
  Divider,
  Row,
    message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DatePicker } from "zaman";
import { UploadOutlined } from "@ant-design/icons";

const layout = {
  // colon:true,
  // layout: "Inline",
  //
  labelAlign: "left",
  // labelCol: {
  //     span: 8,
  // },
  // wrapperCol: {
  //     span: 12,
  // },
};

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: "${label} is required!",
  types: {
    email: "${label} is not a valid email!",
    number: "${label} is not a valid number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

const onFinish = (values) => {
  console.log(values);
};
const App = () => {
  const formRef = useRef();
  // const [fileList, setFileList] = useState([]);
  // const [uploading, setUploading] = useState(false);
  // const handleUpload = () => {
  //
  //     const formData = new FormData();
  //     fileList.forEach((file) => {
  //         formData.append('files[]', file);
  //     });
  //     setUploading(true);
  //     // You can use any AJAX library you like
  //     fetch('http://localhost:8000/api/logistics-uploads/', {
  //         method: 'POST',
  //         body: formData,
  //     })
  //         .then((res) => res.json())
  //         .then(() => {
  //             setFileList([]);
  //
  //             message.success('upload successfully.');
  //         })
  //         .catch(() => {
  //             message.error('upload failed.');
  //         })
  //         .finally(() => {
  //             setUploading(false);
  //         });
  // };
  // const propsUpload = {
  //     onRemove: (file) => {
  //         const index = fileList.indexOf(file);
  //         const newFileList = fileList.slice();
  //         newFileList.splice(index, 1);
  //         setFileList(newFileList);
  //     },
  //     beforeUpload: (file) => {
  //         setFileList([...fileList, file]);
  //         return false;
  //     },
  //     fileList,
  // };

  const propsUpload = {
    // name: "file",
    action: "http://localhost:8000/api/logistics-uploads/",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    UploadFile:{
      crossOrigin:'*',

    },
    data(file){
      return{name: file.name}
    }

  };
  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish}
      style={{
        Width: "100%",
      }}
      initialValues={{ remember: true }}
      validateMessages={validateMessages}
      // onFinishFailed={onFinishFailed}
      autoComplete="on"
      ref={formRef}
    >
      <Row gutter={50}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="نام کالا/خدمات"
            rules={[
              {
                required: true,
                message: "نام خدمات یا کلا را وارد نمایید",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="نوع ارائه"
            name="type"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Radio.Group value="">
              <Radio.Button value="کالا">کالا</Radio.Button>
              <Radio.Button value="خدمات">خدمات</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="Payment_type"
            label="نوع پرداخت"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Checkbox onChange={() => {}}>پرداخت مستقیم</Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={50}>
        <Col span={12}>
          <Form.Item
            name="seller_id"
            label="کد ملی/ شناسه"
            rules={[
              {
                type: "text",
              },
            ]}
          >
            <Input placeholder="شناسه فروشنده" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="price"
            label="قیمت"
            rules={[
              {
                type: "number",
                min: 0,
              },
            ]}
          >
            <InputNumber
              //  formatter={(value) => ` ﷼${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              addonBefore={"﷼"}
              // prefix="﷼"
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={50}>
        <Col span={12}>
          <Form.Item
            colon={false}
            name="seller"
            // label="ارائه دهنده"
            label={<p style={{ paddingLeft: "1.5rem" }}>ارائه دهنده:</p>}
            //   labelCol={{span: 4}}
            // style={{paddingLeft: '1.5rem'}}

            rules={[
              {
                type: "text",
              },
            ]}
          >
            <Input placeholder=" فروشگاه/شرکت/شخص" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="date_doc" label="تاریخ">
            <DatePicker
              inputClass="border-2 rounded-md text-center"
              className={"text-center"}
              round="x4"
              onChange={(e) => console.log(e.value)}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            name="descr"
            label="توضیحات"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 16 }}
          >
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>

      <Upload {...propsUpload}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>

      <Form.Item
        wrapperCol={{
          ...layout.wrapperCol,
          offset: 8,
        }}
      >
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
export default App;