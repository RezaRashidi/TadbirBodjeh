"use client";
import {UploadOutlined} from "@ant-design/icons";
import {Button, Checkbox, Col, Form, Input, InputNumber, message, Radio, Row, Select, Upload,} from "antd";
import React, {useEffect, useState} from "react";
import {DatePicker} from "zaman";


/* eslint-disable no-template-curly-in-string */


const Logistics_Doc = (prop) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([])
    useEffect(() => {
        if (prop.Fdata) {
            prop.Fdata.filter((item) => {
                if (item.id === prop.selectedid) {
                    // console.log(item)
                    var x = item.uploads.map((file) => {
                        return {
                            uid: file,
                            name: file.name,
                            status: 'done',
                            url: file.file
                        }
                    })
                    form.setFieldsValue({
                        name: item.name,
                        type: item.type,
                        price: item.price,
                        seller: item.seller,
                        seller_id: item.seller_id,
                        date_doc: {value: item.date_doc},
                        Location: item.Location,
                        Payment_type: item.Payment_type,
                        descr: item.descr,
                        files: item.uploads
                    })
                    setFileList(x)
                }
            })
        }
    }, [prop.Fdata, prop.selectedid]);
    // console.log(prop)


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
        const jsondata = {
            "name": values.name,
            "type": values.type,
            "price": typeof values.price !== 'undefined' ? values.price : 0,
            "seller": values.seller,
            "seller_id": values.seller_id,
            "date_doc": values.date_doc.value,
            "Location": values.Location,
            "Payment_type": values.Payment_type,
            "descr": values.descr,
            "F_conf": false,
            "measure": "",
            "CostDriver": "",
            "Fdoc_key": null,
            "uploads": fileList.map((file) => {
                return file.response.id
            })
        }
        // console.log(jsondata);
        var request = fetch("http://127.0.0.1:8000/api/logistics/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(jsondata),

        })

        request.then(response => {
            response.ok ? message.success("مدارک با موفقیت ثبت شد") : null
            form.resetFields();

        })
        request.then((response, reject) => response.json().then((value) => console.log(value)))
    };
    const propsUpload = {
        name: "files",
        action: "http://localhost:8000/api/logistics-uploads/",
        headers: {
            authorization: "authorization-text",
        },
        onChange(info) {
            let newFileList = [...info.fileList];
            newFileList = newFileList.map((file) => {
                if (file.response) {
                    // Component will show file.url as link
                    file.url = file.response.file;
                }
                return file;
            });
            setFileList(newFileList);
            if (info.file.status !== "uploading") {
                // console.log(info.file, info.fileList);
            }
            if (info.file.status === "done") {

                message.success(`${info.file.name} file uploaded successfully`);
                // console.log("done");
                // console.log(info.file, info.fileList);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        UploadFile: {
            crossOrigin: '*',

        },
        data(file) {
            return {name: file.name}
        }
        , onDownload(file) {
            return file.response.file
        },
        fileList: fileList,
        onRemove(file) {
            fetch("http://localhost:8000/api/logistics-uploads/" + file.response.id, {
                method: "delete",
            })
        }

    };
    return (
        <Form
            labelAlign="left"
            form={form}
            name="nest-messages"
            onFinish={onFinish}
            style={{
                Width: "100%",
            }}
            initialValues={{
                Payment_type: true,
                type: true,
                date_doc: {value: new Date().toISOString()},

            }}
            validateMessages={validateMessages}
            // onFinishFailed={onFinishFailed}
            autoComplete="on"

        >
            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item
                        name="name"
                        label="نام کالا/خدمات"
                        rules={[
                            {
                                // required: true,
                                message: "نام خدمات یا کلا را وارد نمایید",
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        label="نوع ارائه"
                        name="type"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                    >
                        <Radio.Group>
                            <Radio.Button value={true} defaultChecked={true}>کالا</Radio.Button>
                            <Radio.Button value={false}>خدمات</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="Payment_type"
                        label="نوع پرداخت"
                        valuePropName="checked"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}>
                        <Checkbox>پرداخت مستقیم</Checkbox>
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
                        <Input placeholder="شناسه فروشنده"/>
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
                            style={{width: "100%"}}
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
                        label={<p style={{paddingLeft: "1.5rem"}}>ارائه دهنده:</p>}
                        //   labelCol={{span: 4}}
                        // style={{paddingLeft: '1.5rem'}}

                        rules={[
                            {
                                type: "text",
                            },
                        ]}
                    >
                        <Input placeholder=" فروشگاه/شرکت/شخص"/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="date_doc" label="تاریخ">
                        <DatePicker
                            inputClass="border-2 rounded-md text-center"
                            className={"text-center"}
                            round="x4"
                            // defaultValue={Date.now()}
                            position="right"
                            customShowDateFormat="YYYY MMMM DD"
                            onChange={(e) => {
                                // console.log(Date.parse(e.value))
                                // console.log(e)
                            }

                            }
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="Location" label="محل هزینه">
                        <Select
                            showSearch
                            placeholder=" انتخاب محل هزینه"
                            // optionFilterProp="children"
                            // onChange={onChange}
                            // onSearch={onSearch}
                            // filterOption={filterOption}
                            options={[
                                {value: 'حوزه ریاست',},
                                {value: 'مدیریت طرح و برنامه اسلامی شدن، نظارت و ارزیابی',},
                                {value: "اداره حراست"},
                                {value: "دفتر ریاست، روابط عمومی و بین الملل"},
                                {value: "گروه امور شاهد و ایثارگر"},
                                {value: "دبیرخانه هیات اجرایی جذب"},
                                {value: " اداره امور حقوقی و قراردادها"},
                                {value: "مدیریت توسعه فناوري اطلاعات، امنیت و هوشمندسازی"},
                                {value: "حوزه معاونت آموزشی"},
                                {value: "مدیریت امور آموزشی و تحصیلات تکمیلی"},
                                {value: "اداره آموزش‌هاي آزاد و مجازی"},
                                {value: "گروه هدایت استعدادهای درخشان"},
                                {value: "اداره خلاقیت هنری و امور نمایشگاهی کشورهای اسلامی"},
                                {value: "حوزه معاونت اداري، عمرانی و مالی"},
                                {value: "مدیریت منابع انسانی، اداري و پشتیبانی"},
                                {value: "مدیریت فنی، نظارت بر امور عمرانی، استحکام بخشی و مرمت"},
                                {value: "مدیریت امور مالی"},
                                {value: "اداره بودجه و تشکیلات"},
                                {value: "حوزه معاونت پژوهش، کارآفرینی و فناوری"},
                                {value: " مدیریت امور پژوهشی"},
                                {value: "مدیریت کارآفرینی، و فناوری‌های نرم و ارتباط با جامعه"},
                                {value: "کتابخانه مرکزي، مرکز اسناد و آثار"},
                                {value: " اداره آزمایشگاه مرکزی"},
                                {value: "مدیریت امور فرهنگی و اجتماعی"},
                                {value: " مدیریت امور دانشجویی"},
                                {value: " اداره تربیت بدنی"},
                                {value: " اداره مشاوره، سلامت و سبک زندگی دانشجویان و امور زنان و خانواده"},
                                {value: "دانشکده ها"},
                                {value: " دانشکده مهندسی معماري و شهرسازي"},
                                {value: "دانشکده هنرهای کاربردی"},
                                {value: " دانشکده فرش"},
                                {value: " دانشکده هنرهاي تجسمی"},
                                {value: " دانشکده طراحی"},
                                {value: "دانشکده چند رسانه اي"},
                                {value: "دانشکده هنرهاي اسلامی"},
                                {value: " آموزشکده فرش هریس"},
                            ]}
                        />

                    </Form.Item>
                </Col>

            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        name="descr"
                        label="توضیحات"
                        labelCol={{span: 2}}
                        wrapperCol={{span: 15}}
                    >
                        <Input.TextArea/>
                    </Form.Item>
                </Col>
            </Row>

            <Upload {...propsUpload}>
                <Button icon={<UploadOutlined/>}>ضمیمه فایل</Button>
            </Upload>

            <Form.Item
                wrapperCol={{

                    offset: 8,
                }}
            >
                <Button type="primary" htmlType="submit">
                    ایجاد مدرک
                </Button>
            </Form.Item>
        </Form>
    );
};
export default Logistics_Doc;