"use client";
import {AuthActions} from "@/app/auth/utils";
import {api} from "@/app/fetcher";
import {url} from "@/app/Server";
import {UploadOutlined} from "@ant-design/icons";
import {DatePicker as DatePickerJalali, jalaliPlugin, useJalaliLocaleListener} from "@realmodule/antd-jalali";
import {Button, Col, Form, Input, InputNumber, message, Radio, Row, Select, Upload,} from "antd";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";


const Logistics_Doc = (prop) => {
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState([])
    const [Fdoc_key, set_Fdoc_key] = useState(null)
    const {handleJWTRefresh, storeToken, getToken} = AuthActions();
    const [location, setlocation] = useState([]);
    const [id, set_id] = useState(0)
    useJalaliLocaleListener();
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    const [form_date, set_form_date] = useState(dayjs(new Date(), {jalali: true}))

    let cheekbuttom = true
    if (Fdoc_key !== null) {
        if (
            prop.fin_state !== undefined
        ) {
            // console.log(prop.fin_state)
            cheekbuttom = prop.fin_state > 0
        }


    } else {
        cheekbuttom = false
    }
    // console.log(prop)
    useEffect(() => {
        if (prop.Fdata) {
            prop.Fdata.filter((item) => {

                if (item.id === prop.selectedid) {
                    set_Fdoc_key(item.Fdoc_key)
                    // console.log(item.Fdoc_key)
                    // console.log(item)
                    set_id(item.id)
                    var x = item.uploads.map((file) => {
                        return {
                            uid: file,
                            name: file.name,
                            status: 'done',
                            url: file.file,
                            response: {
                                id: file.id,
                                file: file.file
                            }
                        }
                    })
                    form.setFieldsValue({
                        name: item.name,
                        type: item.type,
                        price: item.price,
                        seller: item.seller,
                        seller_id: item.seller_id,
                        // date_doc: form.setFieldValue("date_doc", dayjs(new Date(item.date_doc))),
                        date_doc: dayjs(new Date(item.date_doc)),
                        Location: item.Location == null ? "" : item.Location.id,

                        descr: item.descr,
                        files: item.uploads,
                        vat: item.vat,
                        bank_name: item.bank_name,
                        account_number: item.account_number,
                        account_name: item.account_name

                    })
                    setlocation(prop.location)

                    setFileList(x)
                    // set_form_date(new Date(item.date_doc).toISOString())
                    // console.log(form.getFieldsValue().date_doc)
                    // form.setFieldValue("date_doc", {value: new Date(item.date_doc)})
                    // console.log(form.getFieldsValue().date_doc)

                }
            })
        } else {

            api().url("/api/subUnit?no_pagination=true").get().json().then(r => {
                console.log(r)
                setlocation(r)
            })

        }
    }, [prop.Fdata, prop.selectedid]);
    const delete_doc = () => {

        api().url("/api/logistics/" + id).delete().res(r => {

                prop.remove(prop.selectedid)
                prop.modal(false)
            }
        ).then(r => {
            // console.log(r)
        })
    }
    // console.log(prop)
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

//write fun that get the changed data from the form and update prop.Fdata with new data
    function updateData(data) {

        prop.Fdata.filter((item) => {
            if (item.id === prop.selectedid) {
                item.name = data.name
                item.type = data.type
                item.price = data.price
                item.seller = data.seller
                item.seller_id = data.seller_id
                item.date_doc = data.date_doc
                item.Location = data.Location
                item.descr = data.descr
                item.uploads = data.uploads
                item.vat = data.vat
                item.bank_name = data.bank_name
                item.account_number = data.account_number
                item.account_name = data.account_name

            }
        })
    }

    function update_fin() {

        prop.update_fin.filter((item) => {
            if (item.id === Fdoc_key) {
                console.log(item.id)
                item.updated = dayjs(new Date())
            }
        })
        console.log(prop.update_fin)
    }

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
        // console.log(values);
        const jsondata = {
            "name": values.name,
            "type": values.type,
            "price": typeof values.price !== 'undefined' ? values.price : 0,
            "seller": values.seller,
            "seller_id": values.seller_id,
            "date_doc": values.date_doc,
            "Location": values.Location,

            "descr": values.descr,
            // "F_conf": false,
            // "measure": "",
            // "CostDriver": "",
            // "Fdoc_key": null,
            "uploads": fileList.map((file) => {
                return file.response.id
            })
            ,
            "vat": values.vat,
            "bank_name": values.bank_name,
            "account_number": values.account_number,
            "account_name": values.account_name
        }
        let new_jasondata = {...jsondata}

        new_jasondata.uploads = fileList.map((file) => {
            return {
                name: file.name,
                file: file.url,
                id: file.response.id
            }
        })

        prop.selectedid && updateData(new_jasondata)
        // console.log(new_jasondata);
        const request = prop.selectedid ? api().url(`/api/logistics/${prop.selectedid}/`).put(jsondata).json() :
            api().url(`/api/logistics/`).post(jsondata).json()

        request.then(data => {
            // update_fin()
            // console.log(prop.update_fin.updated)
            message.success("مدارک با موفقیت ثبت شد")
            prop.selectedid && prop.modal(false)
            !prop.selectedid && form.resetFields() || setFileList([]);
        })
            .catch(error => {
                message.error("خطا در ثبت مدارک")
                // console.log(error)
            })
        // request.res(response => {
        //     if (response.ok) {
        //         message.success("مدارک با موفقیت ثبت شد")
        //         prop.selectedid && prop.modal(false)
        //         !prop.selectedid && form.resetFields();
        //     } else {
        //         message.error("خطا در ثبت مدارک")
        //     }


        // })
        // request.then((response, reject) => response.json().then((value) => console.log(value)))
    };
    const propsUpload = {
        name: "files",
        action: url + "/api/logistics-uploads/",
        headers: {
            // authorization: "authorization-text",
            authorization: `Bearer ${getToken("access")}`,

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

        }
        ,
        data(file) {
            // console.log(file)
            return {
                name: file.name,
                file: file
            }
        }
        , onDownload(file) {
            return file.response.file
        },
        fileList: fileList,
        onRemove(file) {
            api().url("/api/logistics-uploads/" + file.response.id).delete().res().then()
            // fetch("http://localhost:8000/api/logistics-uploads/" + file.response.id, {
            //     method: "delete",
            // })
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

                type: true,
                date_doc: form_date,

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
                                required: true,
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
                    <Form.Item name="date_doc" label="تاریخ">


                        {/*<JalaliLocaleListener/>*/}
                        <DatePickerJalali
                            // value={form_date}
                            // defaultValue={form_date}
                            onChange={e => {
                                set_form_date(e)

                            }
                            }
                        />
                    </Form.Item>
                </Col>

            </Row>
            <Row gutter={50}>
                <Col span={6}>
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
                <Col span={6}>
                    <Form.Item
                        colon={false}
                        name="seller"
                        // label="ارائه دهنده"
                        label={<p style={{}}>ارائه دهنده:</p>}
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
                <Col span={12}>
                    <Form.Item name="Location" label="محل هزینه" rules={[
                        {
                            required: true
                        },
                    ]}>
                        <Select
                            showSearch
                            filterOption={filterOption}
                            placeholder=" انتخاب محل هزینه"
                            // optionFilterProp="children"
                            // onChange={onChange}
                            // onSearch={onSearch}
                            // filterOption={filterOption}
                            options={

                                location.map((item) => {
                                    return {label: item.name, value: item.id}
                                })}


                        />

                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={50}>
                <Col span={6}>
                    <Form.Item
                        name="account_name"
                        label="در وجه"
                        rules={[
                            {
                                type: "text",
                            },
                        ]}
                    >
                        <Input placeholder="نام شخص"/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="bank_name" label="بانک" rules={[
                        {
                            required: false
                        },
                    ]}>
                        <Select
                            showSearch
                            filterOption={filterOption}
                            placeholder="انتخاب بانک"
                            // optionFilterProp="children"
                            // onChange={onChange}
                            // onSearch={onSearch}
                            // filterOption={filterOption}
                            options={
                                [
                                    {label: "بانک ملی ایران", value: "بانک ملی ایران"},
                                    {label: "بانک سپه", value: "بانک سپه"},
                                    {label: "بانک صنعت و معدن", value: "بانک صنعت و معدن"},
                                    {label: "بانک کشاورزی", value: "بانک کشاورزی"},
                                    {label: "بانک مسکن", value: "بانک مسکن"},
                                    {label: "بانک توسعه صادرات ایران", value: "بانک توسعه صادرات ایران"},
                                    {label: "بانک توسعه تعاون", value: "بانک توسعه تعاون"},
                                    {label: "پست بانک ایران", value: "پست بانک ایران"},
                                    {label: "بانک اقتصاد نوین", value: "بانک اقتصاد نوین"},
                                    {label: "بانک پارسیان", value: "بانک پارسیان"},
                                    {label: "بانک کارآفرین", value: "بانک کارآفرین"},
                                    {label: "بانک سامان", value: "بانک سامان"},
                                    {label: "بانک سینا", value: "بانک سینا"},
                                    {label: "بانک خاورمیانه", value: "بانک خاورمیانه"},
                                    {label: "بانک شهر", value: "بانک شهر"},
                                    {label: "بانک دی", value: "بانک دی"},
                                    {label: "بانک صادرات ایران", value: "بانک صادرات ایران"},
                                    {label: "بانک ملت", value: "بانک ملت"},
                                    {label: "بانک تجارت", value: "بانک تجارت"},
                                    {label: "بانک رفاه کارگران", value: "بانک رفاه کارگران"},
                                    {label: "بانک حکمت ایرانیان", value: "بانک حکمت ایرانیان"},
                                    {label: "بانک گردشگری", value: "بانک گردشگری"},
                                    {label: "بانک ایران زمین", value: "بانک ایران زمین"},
                                    {label: "بانک قوامین", value: "بانک قوامین"},
                                    {label: "بانک انصار", value: "بانک انصار"},
                                    {label: "بانک سرمایه", value: "بانک سرمایه"},
                                    {label: "بانک پاسارگاد", value: "بانک پاسارگاد"},
                                    {label: "بانک آینده", value: "بانک آینده"},
                                    {label: "بانک مهر اقتصاد", value: "بانک مهر اقتصاد"},
                                    {label: "بانک قرض‌الحسنه مهر ایران", value: "بانک قرض‌الحسنه مهر ایران"},
                                    {label: "بانک قرض‌الحسنه رسالت", value: "بانک قرض‌الحسنه رسالت"}
                                ]


                            }


                        />

                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        name="account_number"
                        label="شماره حساب"
                        rules={[
                            {
                                type: "text",
                            },
                        ]}
                    >
                        <Input placeholder=""/>
                    </Form.Item>
                </Col>


            </Row>
            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item
                        name="price"
                        label="قیمت"
                        rules={[
                            {
                                required: true,
                                type: "number",
                                min: 0,
                            },
                        ]}
                    >
                        <InputNumber
                            addonAfter={"﷼"}
                            formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => {
                                const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                                const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                                let newValue = value;
                                for (let i = 0; i < 10; i++) {
                                    newValue = newValue.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
                                }

                                return newValue?.replace(/\$\s?|(,*)/g, '')
                            }


                            }
                            style={{width: "100%"}}
                        />
                    </Form.Item>

                </Col>
                <Col span={12}>
                    <Form.Item
                        name="vat"
                        label="ارزش افزوده"
                        rules={[
                            {
                                required: true,
                                type: "number",
                                min: 0,
                            },
                        ]}
                    >
                        <InputNumber
                            addonAfter={"﷼"}
                            formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => {
                                const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                                const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                                let newValue = value;
                                for (let i = 0; i < 10; i++) {
                                    newValue = newValue.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
                                }

                                return newValue?.replace(/\$\s?|(,*)/g, '')
                            }


                            }
                            style={{width: "100%"}}
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
                        wrapperCol={{span: 22}}
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
                <Button disabled={cheekbuttom} type="primary"
                        htmlType="submit">
                    {prop.Fdata ? "ویرایش مدرک" : "ایجاد مدرک"}

                </Button>
                {prop.Fdata &&
                    <Button disabled={Fdoc_key !== null} isabled={Fdoc_key !== null} type="primary" danger
                            className={"!mr-20"}
                            onClick={delete_doc}>

                        حذف مدرک
                    </Button>}
            </Form.Item>
        </Form>
    )
        ;
};
export default Logistics_Doc;