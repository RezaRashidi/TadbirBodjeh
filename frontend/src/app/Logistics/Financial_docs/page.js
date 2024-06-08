"use client";
import {api} from "@/app/fetcher";
import {DatePicker as DatePickerJalali, jalaliPlugin, useJalaliLocaleListener} from "@realmodule/antd-jalali";
import {Button, Checkbox, Col, Form, Input, InputNumber, message, Row, Select} from "antd";
import dayjs from "dayjs";
import React, {useEffect, useRef, useState} from "react";

function RezaSelect(props) {
    const [list, setlist] = useState({});
    const next = useRef({});
    const pagenumber = useRef(1);
    useEffect(() => {
        api().url(`/api/logistics/?get_nulls=0&?page=${pagenumber.current}`).get().json().then((res) => {
            next.correct = res.next
            setlist(res.results.map((item) => ({
                "value": item.id,
                "label": item.id + " - " + item.name,
                "key": item.id + " - " + item.name
            })))
        })

    }, [props.data])
    const onSearch = (value) => {
        api().url(`/api/logistics/?get_nulls=0&search=${value}`).get().json().then((res) => {
            setlist(res.results.map((item) => ({
                "value": item.id,
                "label": item.id + " - " + item.name,
                "key": item.id + " - " + item.name
            })))
        })

        // fetch(`http://localhost:8000/api/logistics/?get_nulls=0?search=${value}`)
        //     .then((res) => res.json())
        //     .then((res) => {
        //         setlist(res.results.map((item) => ({"value": item.id, "label": item.name, "key": item.id})))
        //     })
    };
    const onPopupScroll = () => {
        if (next.correct !== null) {
            api(next.correct, true).json((res) => {
                next.correct = res.next
                let result = res.results.map((item) => ({"value": item.id, "label": item.name}))
                setlist([...list, ...result])
            })

            // fetch(next.correct)
            //     .then((res) => res.json())
            //     .then((res) => {
            //         next.correct = res.next
            //         console.log(res.next)
            //         let result = res.results.map((item) => ({"value": item.id, "label": item.name}))
            //         setlist([...list, ...result])
            //         // console.log(resplt)
            //         // console.log([...list, ...resplt])
            //     })


        }
    }
    const Deselect = ({value}) => {
            console.log(value)
            props.fin_state == 0 && api().url(`/api/logistics/${value}/`).patch({"Fdoc_key": null}).json().then((res) => {

            })
        }
        // fetch(`http://localhost:8000/api/logistics/${value}/`, {
        //         method: "PATCH", headers: {
        //             'Content-Type': 'application/json;charset=utf-8'
        //         }, body: JSON.stringify({"Fdoc_key": null}),
        //     })
        // }
    ;
    return (
        <Select
            labelInValue
            // allowClear={true}
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
    const [fin_state, set_fin_state] = useState(0)
    const [form_date, set_form_date] = useState(dayjs(new Date(), {jalali: true}))
    useEffect(() => {
        if (prop.Fdata) {
            prop.Fdata.filter((item) => {
                if (item.id === prop.selectedid) {
                    // console.log(item)
                    set_fin_state(item.fin_state)
                    let taxValue = isNaN(parseInt(item.tax)) ? 0 : parseInt(item.tax);
                    // console.log(item.Payment_type)
                    form.setFieldsValue({
                        name: item.name,
                        date_doc: dayjs(new Date(item.date_doc)),
                        CostType: item.CostType,
                        descr: item.descr,
                        Payment_type: item.Payment_type,
                        tax: taxValue,
                    })

                    let nextURL = `/api/logistics/?Fdoc_key=${item.id}`;
                    let url = false

                    async function fetchLogisticsData() {
                        let newdata = []
                        while (nextURL) {
                            const res = await api().url(nextURL, url).get().json();
                            if (res.next !== null) {
                                url = true
                            }
                            nextURL = res.next;
                            newdata.push(...res.results.map((item) => ({"key": item.id, ...item})));
                        }
                        return newdata
                    }

                    fetchLogisticsData().then(r => {

                        form.setFieldsValue({
                            logistics: r.map((item) => ({
                                "value": item.id,
                                "label": item.id + " - " + item.name,
                                "title": item.price
                            }))
                        })

                        // console.log(r);
                    });


                    // api().url(`/api/logistics/?Fdoc_key=${item.id}`).get().json().then((res) => {
                    //     form.setFieldsValue({
                    //         logistics: res.results.map((item) => ({"value": item.id, "label": item.name}))
                    //     })
                    // })
                    // fetch(`http://localhost:8000/api/logistics/?Fdoc_key=${item.id}`)
                    //     .then((res) => res.json())
                    //     .then((res) => {
                    //         // console.log(res)
                    //         form.setFieldsValue({
                    //             logistics: res.results.map((item) => ({"value": item.id, "label": item.name}))
                    //         })
                    //     })
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
                item.tax = parseInt(data.tax);
                item.updated = data.updated
                item.Payment_type = data.Payment_type
                item.total_logistics_price = data.total_logistics_price
            }
        })
    }

    const onFinish = (values) => {
        const jsondata = {
            "name": values.name,
            "date_doc": values.date_doc,
            "CostType": values.CostType,
            "descr": values.descr,
            "Payment_type": values.Payment_type,
            "F_conf": false,
            "ProgramId": "",
            "TopicId": "",
            "RowId": null,
            "tax": values.tax,
        }
        // console.log(values)
        // const request = prop.selectedid ? fetch(`http://localhost:8000/api/financial/${prop.selectedid}/`, {
        //     method: "PUT",
        //     headers: {
        //         'Content-Type': 'application/json;charset=utf-8'
        //     },
        //     body: JSON.stringify(jsondata),
        // }) : fetch("http://localhost:8000/api/financial/", {
        //     method: "POST", headers: {
        //         'Content-Type': 'application/json;charset=utf-8'
        //     }, body: JSON.stringify(jsondata),
        // });
        const request = prop.selectedid ? api().url(`/api/financial/${prop.selectedid}/`).put(jsondata).json() :
            api().url(`/api/financial/`).post(jsondata).json()

        request.catch((error) => {
            message.error("خطا در ثبت سند")
        })
        request.then(response => {
            values.logistics ? values.logistics.forEach((item) => {
                // console.log({"Fdoc_key": response.id})
                console.log(item)
                api().url(`/api/logistics/${item.value}/`).patch({"Fdoc_key": response.id}).json().then((res) => {
                })
            }) : null

        }).then(() => {
            //cheek  log_price nan?
            let logisticsValue = form.getFieldValue("logistics");
            let log_price = 0;
            if (logisticsValue) {
                log_price = logisticsValue.reduce((acc, item) => acc + item.title, 0);
            }
            // let log_price = form.getFieldValue("logistics").reduce((acc, item) => acc + item.title, 0)
            prop.selectedid && updateData({
                ...values,
                updated: dayjs(new Date()),
                total_logistics_price: (isNaN(log_price) ? 0 : log_price)
            })
            message.success("سند با موفقیت ثبت شد")
            prop.selectedid && prop.modal(false)
            !prop.selectedid && form.resetFields();
        })

    };

    return (<Form
        form={form}
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{
            date_doc: form_date,
            Payment_type: false,
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

                        type: "number",
                        min: 0,

                        // message: "کد رهگیری را وارد نمایید",
                    },]}
                >
                    <InputNumber
                        style={{width: "100%"}}
                        parser={value => {
                            const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                            const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                            let newValue = value;
                            for (let i = 0; i < 10; i++) {
                                newValue = newValue.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
                            }
                            return newValue;
                        }}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="logistics"
                    label="انتخاب مدارک"

                >
                    <RezaSelect data={prop.Fdata} fin_state={fin_state}/>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item
            wrapperCol={{
                // labelAlign: "left",
                offset: 8,
            }}
        >

            <Button disabled={fin_state > 0} type="primary" htmlType="submit">
                {prop.Fdata ? "ویرایش سند" : "ایجاد سند"}
            </Button>
        </Form.Item>
    </Form>)
}


export default Financial_docs;