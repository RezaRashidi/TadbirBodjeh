"use client";
import {Button, Col, Form, Input, message, Row, Select} from "antd";
import React, {useMemo, useRef, useState} from "react";
import {DatePicker} from "zaman";

function RezaSelect(props) {
    const [list, setlist] = useState({});
    const next = useRef({});
    const pagenumber = useRef(1);
    const fetchlist = useMemo(() => {
        fetch(`http://127.0.0.1:8000/api/logistics/?page=${pagenumber.current}`)
            .then((res) => res.json())
            .then((res) => {
                next.correct = res.next
                setlist(res.results.map((item) => ({"value": item.id, "label": item.name, "key": item.id})))

            })

    }, [])
    const onSearch = (value) => {
        fetch(`http://127.0.0.1:8000/api/logistics/?search=${value}`)
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


    };
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

            {...props}

        />
    );
}

const App = () => {
    const [form] = Form.useForm();
    const onFinish = (values) => {
        const jsondata = {
            "name": values.name,
            "date_doc": values.date_doc.value,
            "CostType": values.CostType,
            "descr": values.descr,
            "F_conf": false,
            "ProgramId": "",
            "TopicId": "",
            "RowId": null,
        }
        // console.log(values)

        var request = fetch("http://127.0.0.1:8000/api/financial/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(jsondata),

        })

        request.then(
            response => {
                console.log()
                if (response.ok) {
                    response.json().then(
                        (response) => {

                            values.logistics.forEach((item) => {

                                    console.log({"Fdoc_key": response.id})
                                    fetch(`http://127.0.0.1:8000/api/logistics/${item.value}/`, {
                                        method: "PATCH",
                                        headers: {
                                            'Content-Type': 'application/json;charset=utf-8'
                                        },
                                        body: JSON.stringify({"Fdoc_key": response.id}),

                                    })
                                    //.then((response) => console.log(response.json()))
                                }
                            )


                        })
                    response.ok ? message.success("مدارک با موفقیت ثبت شد") : null

                    // form.resetFields();


                }
            }
        )
        // request.then((response, reject) => response.json().then((value) => console.log(value)))
    };

    return (<Form
        form={form}
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{
            date_doc: {value: new Date().toISOString()},

        }}
    >
        <Row gutter={50}>
            <Col span={8}>
                <Form.Item
                    name="name"
                    label="نام سند"
                    rules={[
                        {
                            // required: true,
                            message: "نام سند را وارد نمایید",
                        },
                    ]}
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
                        options={[{value: 'جاری',},
                            {value: 'عمرانی',},
                            {value: "متفرقه"},
                            {value: "تجهیزات"},
                            {value: "خارج از شمول"}
                        ]}
                    />
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


        <Row>
            <Col span={12}>
                <Form.Item
                    name="logistics"
                    label="انتخاب مدارک"

                >
                    <RezaSelect/>
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
                ایجاد سند
            </Button>
        </Form.Item>
    </Form>)
}


export default App;