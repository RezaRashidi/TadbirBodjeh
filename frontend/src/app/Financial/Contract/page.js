"use client";
import {AuthActions} from "@/app/auth/utils";
import {api} from "@/app/fetcher";
import {url} from "@/app/Server";
import {UploadOutlined} from "@ant-design/icons";
import {DatePicker as DatePickerJalali, jalaliPlugin, useJalaliLocaleListener} from "@realmodule/antd-jalali";
import {Button, Col, Form, Input, InputNumber, message, Radio, Row, Select, Upload,} from "antd";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import React, {useEffect, useState} from "react";


const Logistics_Doc = (prop) => {
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState([])
    const [Fdoc_key, set_Fdoc_key] = useState(null)
    const {handleJWTRefresh, storeToken, getToken} = AuthActions();
    const [location, setlocation] = useState([]);
    const [selected_location, set_selected_location] = useState([]);
    const [selected_organization, set_selected_organization] = useState([]);

    const [id, set_id] = useState(0)
    useJalaliLocaleListener();
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    const [form_date, set_form_date] = useState(dayjs(new Date(), {jalali: true}))
    const is_fin = Cookies.get("group") == "financial"
    const [relation, set_relation] = useState([])
    const [selected_relation, set_selected_relation] = useState(0)
    const [list_contract_types, set_list_contract_types] = useState([])


    let cheekbuttom = true
    if (Fdoc_key !== null) {
        if (prop.fin_state !== undefined) {
            // console.log(prop.fin_state)
            cheekbuttom = prop.fin_state > 0
            if (prop.fin_state == 1 && is_fin) {
                cheekbuttom = false
            }

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
                    console.log(item)
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
                    set_selected_relation(item.budget_row.id)
                    form.setFieldsValue({
                        name: item.name,
                        type: item.type,
                        price: item.price,
                        Contractor_id: item.Contractor_id,
                        Contractor: item.Contractor,
                        document_date: dayjs(new Date(item.document_date)),
                        contract_number: item.contract_number,
                        Contractor_type: item.Contractor_type,
                        Location: item.Location == null ? "" : item.Location.id,
                        budget_row: item.budget_row.id,
                        program: item.program.id,
                        cost_type: item.cost_type,
                        account_name: item.account_name,
                        bank_name: item.bank_name,
                        account_number: item.account_number,
                        total_contract_amount: item.total_contract_amount,
                        paid_amount: item.paid_amount,
                        requested_performance_amount: item.requested_performance_amount,
                        treasury_deduction_percent: item.treasury_deduction_percent,
                        overhead_percentage: item.overhead_percentage,
                        payable_amount_after_deductions: item.payable_amount_after_deductions,
                        tax_percentage: item.tax_percentage,
                        final_payable_amount: item.final_payable_amount,
                        descr: item.descr,
                        performance_withholding_percentage: item.performance_withholding_percentage,
                        files: item.uploads,
                    });
                    item.Location !== null ? set_selected_location(item.Location.id) && set_selected_organization(location.find(item => item.id === selected_location).organization_id) : ""

                    let Year = dayjs(item.document_date).format("YYYY");
                    api().url("/api/subUnit?no_pagination=true" + `&year=${Year}`).get().json().then(r => {
                        // console.log(r)
                        setlocation(r)
                    })


                    // setlocation(prop.location)

                    setFileList(x)
                    // set_form_date(new Date(item.document_date).toISOString())
                    // console.log(form.getFieldsValue().document_date)
                    // form.setFieldValue("document_date", {value: new Date(item.document_date)})
                    // console.log(form.getFieldsValue().document_date)

                }
            })
        } else {
            let Year = form_date.format("YYYY");
            api().url("/api/subUnit?no_pagination=true" + `&year=${Year}`).get().json().then(r => {
                // console.log(r)
                setlocation(r)
            })

        }
    }, [prop.Fdata, prop.selectedid]);

    useEffect(() => {

        let Year = form_date.format("YYYY");
        api().url("/api/subUnit?no_pagination=true" + `&year=${Year}`).get().json().then(r => {
            // console.log(r)
            setlocation(r)
        })

    }, [form_date])

    function loadRelation() {
        if (selected_organization !== null) {
            console.log(selected_organization)
            api().url("/api/relation?no_pagination=true&organization=" + selected_organization).get().json().then(r => {
                set_relation(r);
                console.log(r)
                // set_budget_row(r)
            })
            // console.log(relation)
        }
    }

    function load_contract_types() {
        api().url("/api/contractor_type?no_pagination=true").get().json().then(r => {
            // console.log(r)
            set_list_contract_types(r);
            // set_budget_row(r)
        })
    }

    useEffect(() => {
        // if (is_fin && selected_organization) {
        loadRelation()
        load_contract_types()

    }, [selected_organization])
    const delete_doc = () => {

        api().url("/api/contract/" + id).delete().res(r => {

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
                item.Contractor_id = data.Contractor_id
                item.Contractor = data.Contractor
                item.document_date = data.document_date
                item.Location = data.Location
                item.descr = data.descr
                item.uploads = data.uploads
                item.vat = data.vat
                item.bank_name = data.bank_name
                item.account_number = data.account_number
                item.account_name = data.account_name
                item.contract_number = data.contract_number;
                item.Contractor_type = data.Contractor_type;
                item.budget_row = data.budget_row;
                item.program = data.program;
                item.cost_type = data.cost_type;
                item.total_contract_amount = data.total_contract_amount;
                item.paid_amount = data.paid_amount;
                item.requested_performance_amount = data.requested_performance_amount;
                item.treasury_deduction_percent = data.treasury_deduction_percent;
                item.overhead_percentage = data.overhead_percentage;
                item.payable_amount_after_deductions = data.payable_amount_after_deductions;
                item.tax_percentage = data.tax_percentage;
                item.final_payable_amount = data.final_payable_amount;
                item.performanceـwithholding_percentage = data.performanceـwithholding_percentage;
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

        console.log(values);
        let jsondata = {
            "name": values.name,
            "type": values.type,
            "price": typeof values.price !== 'undefined' ? values.price : 0,
            "Contractor_id": values.Contractor_id,
            "Contractor": values.Contractor,
            "document_date": values.document_date,
            "Location": values.Location,
            "descr": values.descr,
            "uploads": fileList.map((file) => {
                return file.response.id
            })
            ,
            "vat": values.vat,
            "bank_name": values.bank_name,
            "account_number": values.account_number,
            "account_name": values.account_name,
            "contract_number": values.contract_number,
            "Contractor_type": values.Contractor_type,
            "budget_row": values.budget_row,
            "program": values.program,
            "cost_type": values.cost_type,
            "total_contract_amount": values.total_contract_amount,
            "paid_amount": values.paid_amount,
            "requested_performance_amount": values.requested_performance_amount,
            "treasury_deduction_percent": values.treasury_deduction_percent,
            "overhead_percentage": values.overhead_percentage,
            "payable_amount_after_deductions": values.payable_amount_after_deductions,
            "tax_percentage": values.tax_percentage,
            "final_payable_amount": values.final_payable_amount,
            "performanceـwithholding_percentage": values.performanceـwithholding_percentage
        }
        // }
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
        const request = prop.selectedid ? api().url(`/api/contract/${prop.selectedid}/`).put(jsondata).json() :
            api().url(`/api/contract/`).post(jsondata).json()

        request.then(data => {
            // update_fin()
            // console.log(prop.update_fin.updated)
            message.success("مدارک با موفقیت ثبت شد")
            prop.selectedid && updateData(data)
            prop.selectedid && prop.modal(false)
            !prop.selectedid && form.resetFields() || setFileList([]);
        })
            .catch(error => {
                message.error("خطا در ثبت مدارک")
                console.log(error)
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
                document_date: form_date,

            }}
            validateMessages={validateMessages}
            // onFinishFailed={onFinishFailed}
            autoComplete="on"

        >
            <Row gutter={0} className={"pb-6"}>
                <Radio.Group defaultValue="1" size="large" className={"my-4"}>
                    <Radio.Button value="1">سایر قرارداد</Radio.Button>
                    <Radio.Button value="2">قرارداد</Radio.Button>
                    <Radio.Button value="3">طرح پژوهشی خارجی</Radio.Button>
                    <Radio.Button value="4">عمرانی</Radio.Button>

                </Radio.Group>
            </Row>
            <Row gutter={50}>
                <Col span={6}>
                    <Form.Item
                        name="name"
                        label="نام قرارداد"
                        rules={[
                            {
                                required: true,
                                message: "نام قرارداد را وارد نمایید",
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                </Col>

                <Col span={4}>
                    <Form.Item name="document_date" label="تاریخ قرارداد">
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
                <Col span={6}>
                    <Form.Item name="contract_number" label="شماره قرارداد">
                        <Input/>

                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="Contractor_type" label="نوع خدمات" rules={[
                        {
                            required: true
                        },
                    ]}>
                        <Select
                            showSearch
                            filterOption={filterOption}
                            placeholder=" انتخاب  خدمات"
                            // optionFilterProp="children"
                            // onChange={}

                            // onSearch={onSearch}
                            // filterOption={filterOption}
                            options={
                                list_contract_types.map((item) => {
                                    return {label: item.name, value: item.id}
                                })}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={50}>
                <Col span={6}>
                    <Form.Item
                        name="Contractor"
                        label="نام و نام خانوادگی/ شخص حقوقی"
                        rules={[
                            {
                                type: "text",
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        colon={false}
                        name="Contractor_id"
                        // label="ارائه دهنده"
                        label={<p style={{}}>کد ملی/شناسه ملی/کد اقتصادی:</p>}
                        //   labelCol={{span: 4}}
                        // style={{paddingLeft: '1.5rem'}}
                        rules={[
                            {
                                type: "text",
                            },
                        ]}
                    >
                        <Input/>
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
                            onChange={value => {
                                set_selected_location(value)
                                form.setFieldsValue({
                                    budget_row: undefined,
                                    program: undefined
                                });
                                set_selected_organization(location.find(item => item.id === value).organization_id)
                            }
                            }
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


                <Col span={8}>
                    <Form.Item name="budget_row" label="ردیف">
                        <Select
                            showSearch
                            filterOption={filterOption}
                            placeholder=" انتخاب ردیف"
                            // optionFilterProp="children"
                            onChange={
                                value => {
                                    set_selected_relation(value)
                                    form.setFieldsValue({
                                        program: undefined
                                    });
                                }
                            }
                            // onSearch={onSearch}
                            // filterOption={filterOption}
                            options={
                                relation
                                    .filter(item => item.budget_row) // Ensure budget_row exists
                                    .map(item => ({
                                        label: item.budget_row.name,
                                        value: item.budget_row.id
                                    }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="program" label="برنامه"
                    >
                        <Select
                            showSearch
                            filterOption={filterOption}
                            placeholder=" انتخاب برنامه"
                            // optionFilterProp="children"
                            // onChange={onChange}
                            // onSearch={onSearch}
                            // filterOption={filterOption}
                            options={
                                relation
                                    .filter(item => item.budget_row.id === selected_relation)
                                    .flatMap(item =>
                                        item.programs.map(program => ({
                                            label: program.name,
                                            value: program.id
                                        }))
                                    )
                            }
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="نوع هزینه"
                        name="cost_type"

                        // rules={[{required: true, message: 'Please input your username!'}]}
                    >
                        <Select
                            showSearch
                            filterOption={filterOption}
                            placeholder={" انتخاب نوع هزینه"}
                            // optionFilterProp="children"
                            // onChange={onChange}
                            // onSearch={onSearch}
                            options={
                                [
                                    {label: "عمومی", value: 0},
                                    {label: "اختصاصی", value: 1},
                                    {label: "متفرقه و ابلاغی", value: 2},
                                    {label: "تعمیر و تجهیز", value: 3},
                                    {label: "تامین فضا", value: 4}
                                ]
                            }
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
                        label="شماره شبا"
                        rules={[
                            {
                                type: "text",
                            },
                        ]}
                    >
                        <Input
                            addonAfter={"IR"}
                            placeholder=""/>
                    </Form.Item>
                </Col>


            </Row>
            <Row gutter={50}>
                <Col span={6}>
                    <Form.Item
                        name="total_contract_amount"
                        label="مبلغ کل قرارداد/ کل کارکرد"
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
                <Col span={6}>
                    <Form.Item
                        name="paid_amount"
                        label="مبلغ پرداخت شده"
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
                <Col span={6}>
                    <Form.Item
                        name="requested_performance_amount"
                        label="مبلغ کارکرد درخواستی"
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
                <Col span={6}>
                    <Form.Item
                        name="performanceـwithholding_percentage"
                        label="درصد حسن انجام کار"
                    >
                        <InputNumber
                            addonAfter={"%"}
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
                            min={0}
                            max={100}
                            // defaultValue={3}
                            style={{width: "100%"}}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={50}>

                <Col span={4}>
                    <Form.Item
                        name="treasury_deduction_percent"
                        label="درصد خزانه"
                    >
                        <InputNumber
                            addonAfter={"%"}
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
                            min={0}
                            max={100}
                            // defaultValue={3}
                            style={{width: "100%"}}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item
                        name="overhead_percentage"
                        label="درصد بالاسری"
                    >
                        <InputNumber
                            addonAfter={"%"}
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
                            min={0}
                            max={100}
                            // defaultValue={5}
                            style={{width: "100%"}}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="payable_amount_after_deductions"
                        label="مبلغ قابل پرداخت بعد از کسورات"
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

                <Col span={4}>
                    <Form.Item
                        name="tax_percentage"
                        label="درصد مالیات"
                    >
                        <InputNumber
                            addonAfter={"%"}
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
                            min={0}
                            max={100}
                            // defaultValue={0}
                            style={{width: "100%"}}
                        />
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item
                        name="final_payable_amount"
                        label="مبلغ نهایی قابل پرداخت"
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
                    {prop.Fdata ? "ویرایش قرارداد" : "ایجاد قرارداد"}
                </Button>
                {prop.Fdata &&
                    <Button disabled={Fdoc_key !== null} type="primary" danger
                        // className={"!mr-20"}
                            onClick={delete_doc}>
                        حذف مدرک
                    </Button>}
            </Form.Item>
        </Form>
    )
        ;
};
export default Logistics_Doc;