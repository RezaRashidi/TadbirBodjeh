"use client";

import {api} from "@/app/fetcher";
import {DatePicker as DatePickerJalali, jalaliPlugin, useJalaliLocaleListener} from "@realmodule/antd-jalali";
import {Button, Col, Form, Input, InputNumber, message, Row} from "antd";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";

export default function Tankhah(prop: { Fdata: any, selectedid: number, modal: any }) {
    const [form] = Form.useForm();
    useJalaliLocaleListener();
    dayjs.extend(jalaliPlugin);
    dayjs["calendar"]('jalali');

    useEffect(() => {


        if (prop.Fdata) {
            prop.Fdata.filter((item) => {
                if (item.id === prop.selectedid) {
                    // console.log(item)
                    form.setFieldsValue({
                        name: item.name,
                        doc_num: item.doc_num,
                        price: item.price,
                        date_doc: dayjs(new Date(item.date_doc)),
                        descr: item.descr,
                    })
                }
            })
        }
    })

    function updateData(data) {
        prop.Fdata.filter((item) => {
            if (item.id === prop.selectedid) {
                item.name = data.name
                item.doc_num = data.doc_num
                item.price = data.price
                item.date_doc = data.date_doc
                item.descr = data.descr
            }
        })
    }

    const onFinish = (values) => {
        const jsondata = {
            "name": values.name,
            "price": values.price,
            "doc_num": values.doc_num,
            "date_doc": values.date_doc,
            "CostType": values.price,
            "descr": values.descr,
        }
        const request = prop.selectedid ? api().url(`/api/pettycash/${prop.selectedid}/`).put(jsondata).json() : api().url(`/api/pettycash/`).post(jsondata).json()
        request.catch((err) => {
            console.log(err.error)
            message.error("خطا در ثبت سند")
        })
        request.then((res) => {
            prop.selectedid && updateData(values)
            message.success("سند با موفقیت ثبت شد")
            prop.selectedid && prop.modal(false)
            !prop.selectedid && form.resetFields();
        })

    }
    const [form_date, set_form_date] = useState(dayjs(new Date()).locale('jalali'));
    return (<Form
        form={form}
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{
            date_doc: form_date,
        }}
    >
        <Row gutter={50}>
            <Col span={6}>
                <Form.Item
                    name="name"
                    label="عنوان"
                    rules={[{
                        required: true,
                        message: "نام سند را وارد نمایید",
                    },]}
                >
                    <Input/>
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item
                    name="doc_num"
                    label="شماره سند"
                    rules={[{
                        // required: true,
                        message: "شماره سند را وارد نمایید",
                    },]}
                >
                    <Input/>
                </Form.Item>
            </Col>
            <Col span={4}>
                <Form.Item name="date_doc" label="تاریخ">
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
            <Col span={6}>
                <Form.Item
                    name="price"
                    label="مبلغ"
                    rules={[
                        {
                            type: "number",
                            min: 0,
                        },
                    ]}
                >
                    <InputNumber
                        addonAfter={"﷼"}
                        formatter={(value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        style={{width: "100%"}}
                    />
                </Form.Item>
            </Col>
        </Row>
        <Row>
            <Col span={19}>
                <Form.Item
                    name="descr"
                    label="توضیحات"
                    // labelCol={{span: 4}}
                    // wrapperCol={{span: 16}}
                >
                    <Input.TextArea/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={50}>

        </Row>
        <Form.Item
            wrapperCol={{
                // labelAlign: "left",
                offset: 8,
            }}
        >
            <Button type="primary" htmlType="submit">
                {prop.Fdata ? "ویرایش تنخواه" : "ایجاد تنخواه"}
            </Button>
        </Form.Item>
    </Form>)
}