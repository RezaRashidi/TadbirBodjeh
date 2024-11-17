"use client";
import {AuthActions} from "@/app/auth/utils";
import {api} from "@/app/fetcher";
import Contract_print from "@/app/Financial/Contract/Print/page";
import {url} from "@/app/Server";
import {PrinterOutlined, UploadOutlined} from "@ant-design/icons";
import {DatePicker as DatePickerJalali, jalaliPlugin, useJalaliLocaleListener} from "@realmodule/antd-jalali";
import {Button, Col, Form, Input, InputNumber, message, Popconfirm, Radio, Row, Select, Table, Upload,} from "antd";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import ReactToPrint from "react-to-print";

const Contract_Doc = (prop) => {
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState([])
    const [Fdoc_key, set_Fdoc_key] = useState(null)
    const {handleJWTRefresh, storeToken, getToken} = AuthActions();
    const [location, setlocation] = useState([]);
    const [selected_location, set_selected_location] = useState([]);
    const [selected_organization, set_selected_organization] = useState([]);
    const [id, set_id] = useState(0)
    const [form_date, set_form_date] = useState(dayjs(new Date(), {jalali: true}))
    // const is_fin = Cookies.get("group") == "financial"
    const [relation, set_relation] = useState([])
    const [selected_relation, set_selected_relation] = useState(0)
    const [list_contract_types, set_list_contract_types] = useState([])
    const [Contractor_level, set_Contractor_level] = useState("a")
    const [Contract_record, set_Contract_record] = useState([]);
    const [printRefs, setPrintRefs] = useState({});
    useJalaliLocaleListener();
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    useEffect(() => {
        // Fetch initial data from the API
        // api().url('/api/contract-record/').get().json()
        //     .then(data => {
        //         set_Contract_record(data.map((item, index) => ({...item, key: index})));
        //     })
        //     .catch(() => {
        //         message.error('Failed to fetch data');
        //     });
    }, []);
    const handleAdd = () => {
        const newData = {
            key: Contract_record.length + 1,
            descr: "",
            requested_performance_amount: 0,
            treasury_deduction_percent: 0,
            overhead_percentage: 0,
            performanceـwithholding: 0,
            performanceـwithholding_percentage: 0,
            payable_amount_after_deductions: 0,
            tax_percentage: 0,
            tax_amount: 0,
            final_payable_amount: 0,
            insurance: 0,
            advance_payment_deductions: 0,
            vat: 0,
            mode: "new",
        };
        set_Contract_record([...Contract_record, newData]);
    };
    const handleDelete = (key) => {
        const newData = Contract_record.filter((item) => {
            console.log(item.key === key)
            console.log(item.mode !== "new")
            if (item.key === key && item.mode !== "new") {

                item.mode = "delete";

                return true
            }

            return item.key !== key;
        });
        console.log(newData)
        set_Contract_record(newData);
    };

    const calculateFinalPayableAmount = (record) => {
        const {
            requested_performance_amount,
            treasury_deduction_percent,
            overhead_percentage,
            performanceـwithholding,
            performanceـwithholding_percentage,
            payable_amount_after_deductions,
            tax_percentage,
            tax_amount,
            insurance,
            advance_payment_deductions,
            vat
        } = record;
        const treasuryDeduction = (requested_performance_amount * treasury_deduction_percent) / 100;
        const overheadDeduction = (requested_performance_amount * overhead_percentage) / 100;

        let performanceWithholding = performanceـwithholding || 0;
        if (performanceـwithholding_percentage) {
            performanceWithholding = (requested_performance_amount * performanceـwithholding_percentage) / 100;
        }
        let taxDeduction = tax_amount || 0;
        if (tax_percentage) {
            taxDeduction = (requested_performance_amount * tax_percentage) / 100;
        }
        let totalDeductions = 0
        if (Contractor_level === "d") {
            totalDeductions = taxDeduction
        }
        if (Contractor_level === "c") {

            totalDeductions = treasuryDeduction +
                overheadDeduction +
                performanceWithholding +
                taxDeduction +
                (insurance || 0) +
                (advance_payment_deductions || 0) +
                (vat || 0);
        }
        if (Contractor_level === "a") {
            totalDeductions = treasuryDeduction +
                overheadDeduction +
                performanceWithholding +
                taxDeduction
        }

        // return Math.max(requested_performance_amount - totalDeductions, 0);
        return requested_performance_amount - totalDeductions
    };

    useEffect(() => {
        // Recalculate all items when Contractor_level changes
        const updatedDataSource = Contract_record.map(item => {
            return recalculateItem(item, Contractor_level);
        });
        set_Contract_record(updatedDataSource);
        load_contract_types()

    }, [Contractor_level]);

    const recalculateItem = (item, level) => {
        const newItem = {...item};
        if (newItem.requested_performance_amount !== 0) {
            if (level === "b") {
                let deductionPercentage = newItem.overhead_percentage + newItem.treasury_deduction_percent;
                let deductionAmount = (newItem.requested_performance_amount * deductionPercentage) / 100;
                newItem.payable_amount_after_deductions = Number((newItem.requested_performance_amount - deductionAmount).toFixed(4));
                newItem.tax_amount = Number((newItem.payable_amount_after_deductions * newItem.tax_percentage / 100).toFixed(2));
                newItem.final_payable_amount = Number((newItem.payable_amount_after_deductions - newItem.tax_amount).toFixed(2));
            } else {
                newItem.tax_amount = Number((newItem.requested_performance_amount * newItem.tax_percentage / 100).toFixed(2));
                newItem.final_payable_amount = calculateFinalPayableAmount(newItem);
            }
        }
        return newItem;
    };
    const handleInputChange = (value, record, dataIndex) => {
        const newData = Contract_record.map(item => {
            if (item.key === record.key) {
                if (item.mode === "new") {
                    return item;
                } else {
                    return {...item, mode: "edit"};
                }
            }
            return item;
        });
        const index = newData.findIndex((item) => record.key === item.key);
        if (index > -1) {
            const item = {...newData[index], [dataIndex]: value};

            // Handle string input for 'descr'
            if (dataIndex === 'descr') {
                item.descr = value;
            } else if (item.requested_performance_amount !== 0) {
                // Update related fields for numeric inputs
                switch (dataIndex) {
                    case 'performanceـwithholding':
                        item.performanceـwithholding_percentage = Number(((value / item.requested_performance_amount) * 100).toFixed(4));
                        break;
                    case 'performanceـwithholding_percentage':
                        item.performanceـwithholding = Number((item.requested_performance_amount * value / 100).toFixed(2));
                        break;
                    case 'tax_amount':
                        item.tax_percentage = Contractor_level === "b"
                            ? Number(((value / item.payable_amount_after_deductions) * 100).toFixed(4))
                            : Number(((value / item.requested_performance_amount) * 100).toFixed(4));
                        break;
                    case 'tax_percentage':
                        item.tax_amount = Contractor_level === "b"
                            ? Number((item.payable_amount_after_deductions * value / 100).toFixed(2))
                            : Number((item.requested_performance_amount * value / 100).toFixed(2));
                        break;
                }
            } else {
                // Reset related fields if requested_performance_amount is 0
                item.performanceـwithholding_percentage = 0;
                item.performanceـwithholding = 0;
                item.tax_percentage = 0;
                item.tax_amount = 0;
            }
            console.log(value)
            // Recalculate the item
            const recalculatedItem = recalculateItem(item, Contractor_level);
            newData.splice(index, 1, recalculatedItem);
            set_Contract_record(newData);
        }
    };


    //
    // let cheekbuttom = true
    // if (Fdoc_key !== null) {
    //     if (prop.fin_state !== undefined) {
    //         // console.log(prop.fin_state)
    //         cheekbuttom = prop.fin_state > 0
    //         if (prop.fin_state == 1 && is_fin) {
    //             cheekbuttom = false
    //         }
    //     }
    //
    // } else {
    //     cheekbuttom = false
    // }
    //

    // console.log(prop)
    //UPDATE
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
                    set_Contractor_level(item.Contractor_level)
                    set_selected_relation(item.budget_row)
                    form.setFieldsValue({
                        name: item.name,
                        type: item.type,
                        price: item.price,
                        Contractor_id: item.Contractor_id,
                        Contractor: item.Contractor,
                        document_date: dayjs(new Date(item.document_date)),
                        contract_number: item.contract_number,
                        Contractor_type: item.Contractor_type,
                        Location: item.Location == null ? "" : item.Location,
                        budget_row: item.budget_row || "",
                        program: item.program || "",
                        cost_type: item.cost_type,
                        account_name: item.account_name,
                        bank_name: item.bank_name,
                        account_number: item.account_number,
                        total_contract_amount: item.total_contract_amount,
                        paid_amount: item.paid_amount,
                        final_payable_amount: item.final_payable_amount,
                        descr: item.descr,
                        files: item.uploads,

                    });
                    item.Location !== null ? set_selected_location(item.Location.id) && set_selected_organization(location.find(item => item.id === selected_location).organization_id) : ""

                    let Year = dayjs(item.document_date).format("YYYY");
                    api().url("/api/subUnit?no_pagination=true" + `&year=${Year}`).get().json().then(r => {
                        // console.log(r)
                        setlocation(r)
                    })

                    load_Contract_record(item.id)
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

    function load_Contract_record(id) {

        api().url("/api/contract_record?no_pagination=true&contract=" + id).get().json().then(r => {
            set_Contract_record(r.map(item => {
                return {...item, key: item.id}
            }))
            r.map((item) => {
                printRefs[item.id] = React.createRef();
            });
            console.log(r)
        })

    }

    useEffect(() => {

        let Year = form_date.format("YYYY");
        api().url("/api/subUnit?no_pagination=true" + `&year=${Year}`).get().json().then(r => {
            // console.log(r)
            setlocation(r)
        })

    }, [form_date])
    useEffect(() => {
        // if (is_fin && selected_organization) {
        loadRelation()


    }, [selected_organization])

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
        api().url("/api/contractor_type?no_pagination=true&contractor_level=" + Contractor_level).get().json().then(r => {
            // console.log(r)
            set_list_contract_types(r);
            if (r.length === 1) {
                form.setFieldsValue({Contractor_type: r[0].id});
            }
            // else {
            //     form.setFieldsValue({Contractor_type: ""});
            // }
            // set_budget_row(r)
        })
    }


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

        // prop.Fdata.filter((item) => {
        //     if (item.id === prop.selectedid) {
        //         item.name = data.name
        //         item.type = data.type
        //         item.price = data.price
        //         item.Contractor_id = data.Contractor_id
        //         item.Contractor = data.Contractor
        //         item.document_date = data.document_date
        //         item.Location = data.Location
        //         item.descr = data.descr
        //         item.uploads = data.uploads
        //         item.vat = data.vat
        //         item.bank_name = data.bank_name
        //         item.account_number = data.account_number
        //         item.account_name = data.account_name
        //         item.contract_number = data.contract_number;
        //         item.Contractor_type = data.Contractor_type;
        //         item.budget_row = data.budget_row;
        //         item.program = data.program;
        //         item.cost_type = data.cost_type;
        //         item.total_contract_amount = data.total_contract_amount;
        //         item.paid_amount = data.paid_amount;
        //         item.requested_performance_amount = data.requested_performance_amount;
        //         item.treasury_deduction_percent = data.treasury_deduction_percent;
        //         item.overhead_percentage = data.overhead_percentage;
        //         item.payable_amount_after_deductions = data.payable_amount_after_deductions;
        //         item.tax_percentage = data.tax_percentage;
        //         item.final_payable_amount = data.final_payable_amount;
        //         item.performanceـwithholding_percentage = data.performanceـwithholding_percentage;
        //     }
        // })
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
            "bank_name": values.bank_name,
            "account_number": values.account_number,
            "account_name": values.account_name,
            "contract_number": values.contract_number,
            "Contractor_type": values.Contractor_type,
            "budget_row": values.budget_row,

            "program": values.program,
            "cost_type": values.cost_type,
            "total_contract_amount": values.total_contract_amount,
            "Contractor_level": Contractor_level,
        }
        let new_jasondata = {...jsondata}

        new_jasondata.uploads = fileList.map((file) => {
            return {
                name: file.name,
                file: file.url,
                id: file.response.id
            }
        })


        let newContract_record = Contract_record.map((item) => {
            let newItem = {...item};
            columns.forEach((column) => {
                if (column.hidden) {
                    if (typeof column.hidden === 'boolean' && column.hidden) {
                        newItem[column.dataIndex] = null;
                    } else if (Array.isArray(column.hidden) && column.hidden.includes(Contractor_level)) {
                        newItem[column.dataIndex] = null;
                    }
                }
            });
            return newItem;
        });
        // console.log(newContract_record)

        prop.selectedid && updateData(new_jasondata)
        // console.log(new_jasondata);
        const request = prop.selectedid ? api().url(`/api/contract/${prop.selectedid}/`).put(jsondata).json() :
            api().url(`/api/contract/`).post(jsondata).json()

        request.then(data => {
            // update_fin()
            // console.log(prop.update_fin.updated)
            console.log(data)
            newContract_record.map((item) => {

                if (item.mode === "new") {
                    api().url(`/api/contract_record/`).post({
                        ...item,
                        Contract: data.id,
                        Contractor_level: Contractor_level
                    }).json()

                } else if (item.mode === "edit") {

                    api().url(`/api/contract_record/${item.id}/`).put({
                        ...item,
                        Contractor_level: Contractor_level
                    }).json()
                } else if (item.mode === "delete") {
                    api().url(`/api/contract_record/${item.id}/`).delete().json()
                }

            })
            set_Contract_record([])

            message.success("قرارداد با موفقیت ثبت شد")
            prop.selectedid && prop.update() //updateData(data)
            prop.selectedid && prop.modal(false)
            !prop.selectedid && form.resetFields() || setFileList([]);
        })
            .catch(error => {
                message.error("خطا در ثبت قرارداد")
                console.log(error)
            })


    };

    const columns = [
        {
            title: 'مبلغ درخواستی',
            dataIndex: 'requested_performance_amount',
            editable: true,
            render: (text, record) => <InputNumber defaultValue={text} variant="borderless" min={0} changeOnWheel
                                                   onChange={(value) => handleInputChange(value, record, 'requested_performance_amount')}
            />,
        },
        {
            title: 'شرح',
            dataIndex: 'descr',
            editable: true,
            render: (text, record) => <Input defaultValue={text} variant="borderless"
                                             onChange={(value) => handleInputChange(value.target.value, record, 'descr')}
            />,
        },
        {
            title: 'درصد کسر خزانه',
            dataIndex: 'treasury_deduction_percent',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    defaultValue={text}
                    variant="borderless"
                    min={0}
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'treasury_deduction_percent')}
                />
            ),
            hidden: ['c', 'a', 'd'].includes(Contractor_level),
        },
        {
            title: 'درصد بالاسری',
            dataIndex: 'overhead_percentage',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'overhead_percentage')}
                />
            ),
            hidden: ['c', 'a', 'd'].includes(Contractor_level),
        },
        {
            title: 'حسن انجام کار',
            dataIndex: 'performanceـwithholding',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'performanceـwithholding')}
                />
            ),
            hidden: ['b', 'd'].includes(Contractor_level),
        },
        {
            title: 'درصد حسن انجام کار',
            dataIndex: 'performanceـwithholding_percentage',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'performanceـwithholding_percentage')}
                />
            ),
            hidden: ['b', 'd'].includes(Contractor_level),
        },
        {
            title: 'مبلغ قابل پرداخت پس از کسورات',
            dataIndex: 'payable_amount_after_deductions',
            // editable: true,
            // render: (text, record) => (
            //     <InputNumber
            //         value={text}
            //         variant="borderless"
            //         changeOnWheel
            //         onChange={(value) => handleInputChange(value, record, 'payable_amount_after_deductions')}
            //     />
            // ),
            hidden: Contractor_level !== "b",
        },
        {
            title: 'درصد مالیات',
            dataIndex: 'tax_percentage',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'tax_percentage')}
                />
            ),
        },
        {
            title: 'مبلغ مالیات',
            dataIndex: 'tax_amount',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'tax_amount')}
                />
            ),
        },
        {
            title: 'بیمه',
            dataIndex: 'insurance',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'insurance')}
                />
            ),
            hidden: Contractor_level !== "c",
        },
        {
            title: 'کسر پیش پرداخت',
            dataIndex: 'advance_payment_deductions',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'advance_payment_deductions')}
                />
            ),
            hidden: Contractor_level !== "c",
        },
        {
            title: 'مالیات بر ارزش افزوده',
            dataIndex: 'vat',
            editable: true,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    variant="borderless"
                    changeOnWheel
                    onChange={(value) => handleInputChange(value, record, 'vat')}
                />
            ),
            hidden: Contractor_level !== "c",
        },
        {
            title: 'مبلغ نهایی قابل پرداخت',
            dataIndex: 'final_payable_amount',
            // editable: true,
            // render: (text, record) => (
            //     <InputNumber
            //         value={text}
            //         variant="borderless"
            //         changeOnWheel
            //         onChange={(value) => handleInputChange(value, record, 'final_payable_amount')}
            //     />
            // ),
        },
        {
            title: 'عملیات',
            dataIndex: 'operation',
            render: (_, record) => {


                return <>
                    <p></p>
                    <Popconfirm title="آیا مطمئن هستید که می‌خواهید حذف کنید؟"
                                onConfirm={() => handleDelete(record.key)}>
                        <a>حذف</a>
                    </Popconfirm>


                </>

            }

        },
        {
            title: "چاپ", key: 'print', align: 'center', render: (record) => {
                // if (!printRefs[record.id]) {
                //     setPrintRefs(prevRefs => ({...prevRefs, [record.id]: React.createRef()}));
                // }
                // console.log(`${record.id}-${record.updated}`);
                return <>
                    <div style={{display: 'none'}}>
                        <Contract_print key={record.updated} ref={printRefs[record.id]} record={record}
                                        form={form.getFieldsValue()}/>
                    </div>
                    <ReactToPrint
                        pageStyle="@media print {
                                          html, body {
                                            height: 100vh; /* Use 100% here to support printing more than a single page*/
                                            margin: 0 !important;
                                            padding: 0 !important;
                                          }
                                             .no-wrap {
                                                white-space: nowrap;
                                            }
                                        }"
                        trigger={() => <Button icon={<PrinterOutlined/>}></Button>}
                        content={() => printRefs[record.id].current}
                    />
                </>
            }
        }
    ];

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
                <Radio.Group value={Contractor_level} size="large" className={"my-4"} onChange={
                    (e) => {
                        set_Contractor_level(e.target.value)
                    }
                }>
                    <Radio.Button value="a">قرارداد</Radio.Button>
                    <Radio.Button value="b">طرح پژوهشی خارجی</Radio.Button>
                    <Radio.Button value="c">عمرانی</Radio.Button>
                    <Radio.Button value="d">سایر کارکردها</Radio.Button>
                </Radio.Group>
            </Row>
            <Row gutter={50}>
                <Col span={6}>
                    <Form.Item
                        name="name"
                        label="عنوان"
                        rules={[
                            {
                                required: true,
                                message: "عنوان را وارد نمایید",
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
                <Col span={8}>
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
                <Col span={10}>
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
                <Col span={12}>
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
                <Col span={12}>
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


            <Button
                onClick={handleAdd}
                type="primary"
                style={{
                    marginBottom: 16,
                }}
            >
                افزودن کارکرد
            </Button>
            <Table
                className={"p-0-cell "}

                dataSource={Contract_record.filter(item => item.mode !== "delete")}
                columns={columns}
                rowClassName="editable-row"
                pagination={false}

            />


            <Upload {...propsUpload}>
                <Button icon={<UploadOutlined/>}>ضمیمه فایل</Button>
            </Upload>


            <Form.Item
                wrapperCol={{

                    offset: 8,
                }}
            >
                <Button //disabled={cheekbuttom}
                    type="primary"
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
export default Contract_Doc;