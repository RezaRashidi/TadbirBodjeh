"use client";
import {DatePicker as DatePickerJalali, jalaliPlugin, useJalaliLocaleListener} from "@realmodule/antd-jalali";
import {Button, Col, Form, Input, message, Row, Select} from "antd";
import dayjs from "dayjs";
import React, {useEffect, useRef, useState} from "react";

function RezaSelect(props) {
    const [list, setlist] = useState({});
    const next = useRef({});
    const pagenumber = useRef(1);

    useEffect(() => {
        fetch(`http://172.16.10.50:8000/api/logistics/?get_nulls=0&?page=${pagenumber.current}`)
            .then((res) => res.json())
            .then((res) => {
                next.correct = res.next
                setlist(res.results.map((item) => ({"value": item.id, "label": item.name, "key": item.id})))
            })


    }, [props.data])
    const onSearch = (value) => {
        fetch(`http://172.16.10.50:8000/api/logistics/?get_nulls=0?search=${value}`)
            .then((res) => res.json())
            .then((res) => {
                setlist(res.results.map((item) => ({"value": item.id, "label": item.name, "key": item.id})))
            })
    };
    const onPopupScroll = () => {
        if (next.correct !== null) {
            fetch(next.correct)
                .then((res) => res.json())
                .then((res) => {
                    next.correct = res.next
                    // console.log(res.next)
                    let resplt = res.results.map((item) => ({"value": item.id, "label": item.name}))
                    setlist([...list, ...resplt])
                    // console.log(resplt)
                    // console.log([...list, ...resplt])
                })
        }
    }
    const Deselect = ({value}) => {
        fetch(`http://172.16.10.50:8000/api/logistics/${value}/`, {
                method: "PATCH", headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }, body: JSON.stringify({"Fdoc_key": null}),
            })
        }
    ;
    return (
        <Select
            labelInValue
            allowClear={true}
            autoClearSearchValue={true}
            placeholder="انتخاب مدارک"
            // showSearch={true}
            // value={value}
            mode="multiple"
            filterOption={false}
            onSearch={onSearch}
            onPopupScroll={onPopupScroll}
            // notFoundContent={fetching ? <Spin size="small"/> : null}
            options={list}
            onDeselect={Deselect}
            {...props}

        />);
}

const Financial_docs = (prop) => {
    const [form] = Form.useForm();
    useJalaliLocaleListener();
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    const [form_date, set_form_date] = useState(dayjs(new Date(), {jalali: true}))
    useEffect(() => {
        if (prop.Fdata) {
            prop.Fdata.filter((item) => {
                if (item.id === prop.selectedid) {
                    // console.log(item)
                    form.setFieldsValue({
                        name: item.name,
                        date_doc: dayjs(new Date(item.date_doc)),
                        CostType: item.CostType,
                        descr: item.descr,
                        tax: item.tax,
                    })

                    fetch(`http://172.16.10.50:8000/api/logistics/?Fdoc_key=${item.id}`)
                        .then((res) => res.json())
                        .then((res) => {
                            // console.log(res)
                            form.setFieldsValue({
                                logistics: res.results.map((item) => ({"value": item.id, "label": item.name}))
                            })
                        })
                }


            })

        }
    }, [prop.Fdata, prop.selectedid]);

    //write fun that get the changed data from the form and update prop.Fdata with new data
    function updateData(data) {
        prop.Fdata.filter((item) => {
            if (item.id === prop.selectedid) {
                item.name = data.name;
                item.date_doc = data.date_doc;
                item.CostType = data.CostType;
                item.descr = data.descr;
                item.logistics = data.logistics;
                item.tax = data.tax;
                item.updated = data.updated
            }
        })
    }

    const onFinish = (values) => {
        const jsondata = {
            "name": values.name,
            "date_doc": values.date_doc,
            "CostType": values.CostType,
            "descr": values.descr,
            "F_conf": false,
            "ProgramId": "",
            "TopicId": "",
            "RowId": null,
            "tax": values.tax,
        }
        // console.log(values)
        const request = prop.selectedid ? fetch(`http://172.16.10.50:8000/api/financial/${prop.selectedid} /`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(jsondata),
        }) : fetch("http://172.16.10.50:8000/api/financial/", {
            method: "POST", headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }, body: JSON.stringify(jsondata),
        });
        request.then(response => {
            // console.log()
            if (response.ok) {
                response.json().then((response) => {

                    values.logistics.forEach((item) => {

                        // console.log({"Fdoc_key": response.id})
                        fetch(`http://172.16.10.50:8000/api/logistics/${item.value}/`, {
                            method: "PATCH", headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            }, body: JSON.stringify({"Fdoc_key": response.id}),
                        })
                        //.then((response) => console.log(response.json()))
                    })
                }).then(() => {
                    if (response.ok) {
                        prop.selectedid && updateData({...values, updated: dayjs(new Date())})
                        message.success("سند با موفقیت ثبت شد")
                        prop.selectedid && prop.modal(false)
                        !prop.selectedid && form.resetFields();
                    } else {
                        message.error("خطا در ثبت سند")
                    }
                })

                // form.resetFields();
            }
        })
        // request.then((response, reject) => response.json().then((value) => console.log(value)))
    };

    return (<Form
        form={form}
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{
            date_doc: form_date,

        }}
    >
        <Row gutter={50}>
            <Col span={8}>
                <Form.Item
                    name="name"
                    label="نام سند"
                    rules={[{
                        // required: true,
                        message: "نام سند را وارد نمایید",
                    },]}
                >
                    <Input/>
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item name="CostType" label="نوع هزینه">
                    <Select
                        showSearch
                        placeholder=" انتخاب نوع هزینه"
                        // optionFilterProp="children"
                        // onChange={onChange}
                        // onSearch={onSearch}
                        // filterOption={filterOption}
                        options={[{value: 'جاری',}, {value: 'عمرانی',}, {value: "متفرقه"}, {value: "تجهیزات"}, {value: "خارج از شمول"}]}
                    />
                </Form.Item>
            </Col>
            <Col span={6}>
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
            <Col span={7}>
                <Form.Item
                    name="tax"
                    label="کد رهگیری مالیاتی"
                    rules={[{
                        // required: true,
                        message: "کد رهگیری را وارد نمایید",
                    },]}
                >
                    <Input/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="logistics"
                    label="انتخاب مدارک"

                >
                    <RezaSelect data={prop.Fdata}/>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item
            wrapperCol={{
                // labelAlign: "left",
                offset: 8,
            }}
        >
            <Button type="primary" htmlType="submit">
                {prop.Fdata ? "ویرایش سند" : "ایجاد سند"}
            </Button>
        </Form.Item>
    </Form>)
}


export default Financial_docs;