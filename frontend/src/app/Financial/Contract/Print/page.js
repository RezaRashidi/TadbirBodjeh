"use client";
import arm from "@/images/Arm.jpg";
import {jalaliPlugin} from "@realmodule/antd-jalali";
import {Col, ConfigProvider, Row, Table, Typography} from "antd";
import fa_IR from "antd/lib/locale/fa_IR";
import dayjs from "dayjs";
import Image from "next/image";
import Num2persian from 'num2persian';
import React from "react";
import "@/styles/table.css";

export function numberWithCommas(x) {

    return x !== null ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
}

function convertToPersianNumber(number) {

    return number.toLocaleString('fa-IR');
}

function toPersianNumbers(str) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/[0-9]/g, function (w) {
        return persianNumbers[+w];
    });
}

// Then use it like this:


function Contract_print(props, ref) {
    // const [Log_list, set_Log_list] = useState([], (x) => convertToPersianNumber(x));
    // const [fin, set_fin] = useState({});
    // const username = props.record ? props.record.user_group == "logistics-other" ? "" : props.record.user : ''
    const Contractor_level = props.record ? props.record.Contractor_level : ''
    const Contractor_level_name =
        Contractor_level === "a" ? 'قرارداد' :
            Contractor_level === "b" ? 'طرح پژوهشی خارجی' :
                Contractor_level === "c" ? 'عمرانی' :
                    Contractor_level === "d" ? "سایر کارکردها" :
                        "نامشخص";
    const {Text} = Typography;
    // let id = props.record ? props.record.id : 41;
    // const Payment_type = props.record ? props.record.Payment_type : false
    // const user = props.record ? props.record.user : ''
    // console.log("props");
    // console.log(props.record.id);
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    dayjs.locale('fa');
    const record = props.record || {};
    console.log(record)

    //props.record.updated


    const columns1 = [

        {
            title: 'نام‌ و نام‌خانوادگی/شرکت',
            dataIndex: 'Contractor',
        },
        {
            title: 'شماره قرارداد/سند',
            dataIndex: 'contract_number',
        },
        {
            title: 'تاریخ قرارداد',
            dataIndex: 'document_date',
            render: (data) => toPersianNumbers(dayjs(data).format('YYYY/MM/DD')),
        },

        {
            title: 'شماره حساب',
            dataIndex: 'account_number',
        },
        ,
        {
            title: 'بانک',
            dataIndex: 'bank_name',
        },

        {
            title: 'مبلغ کارکرد',
            dataIndex: 'requested_performance_amount',
        },


        // {
        //     title: 'حسن انجام کار',
        //     dataIndex: 'performanceـwithholding',
        //     hidden: ['b', 'd'].includes(Contractor_level),
        // },
        // {
        //     title: 'درصد حسن انجام کار',
        //     dataIndex: 'performanceـwithholding_percentage',
        //
        //     hidden: ['b', 'd'].includes(Contractor_level),
        // },
        {
            title: 'مبلغ قابل پرداخت پس از کسورات',
            dataIndex: 'payable_amount_after_deductions',

            hidden: Contractor_level !== "b",
        },
        // {
        //     title: 'درصد مالیات',
        //     dataIndex: 'tax_percentage',
        // },
        // {
        //     title: 'مبلغ مالیات',
        //     dataIndex: 'tax_amount',
        // },
        {
            title: 'بیمه',
            dataIndex: 'insurance',
            hidden: Contractor_level !== "c",
        },
        {
            title: 'کسر پیش پرداخت',
            dataIndex: 'advance_payment_deductions',
            hidden: Contractor_level !== "c",
        },
        // {
        //     title: 'مالیات بر ارزش افزوده',
        //     dataIndex: 'vat',
        //     hidden: Contractor_level !== "c",
        // },
        {
            title: 'مبلغ نهایی قابل پرداخت',
            dataIndex: 'final_payable_amount',
        }

    ];


    const columns2 = [
        {
            title: 'کد و عنوان هزینه',
            dataIndex: 'budget_row',
        },
        {
            title: 'کد و عنوان برنامه',
            dataIndex: 'program',
        }, {
            title: 'محل هزینه',
            dataIndex: 'organization',
        }, {
            title: 'محل اعتبار',
            dataIndex: 'cost_type',
        }, {
            title: 'ارزش افزوده',
            dataIndex: 'vat',
        },
        {
            title: 'حسن انجام کار',
            dataIndex: 'performanceـwithholding',
            hidden: ['b', 'd'].includes(Contractor_level),
        },
        {
            title: 'کسر خزانه',
            dataIndex: 'treasury_deduction_percent',
            render: (value, record) => (
                ((record.requested_performance_amount / 100) * value).toFixed(2)
            ),
            hidden: ['c', 'a', 'd'].includes(Contractor_level),
        },
        {
            title: ' بالاسری',
            dataIndex: 'overhead_percentage',
            render: (value, record) => (
                ((record.requested_performance_amount / 100) * value).toFixed(2)
            ),
            hidden: ['c', 'a', 'd'].includes(Contractor_level),
        },
        {
            title: 'مبلغ کارکرد',
            dataIndex: 'requested_performance_amount',
        },

    ]

    return <ConfigProvider locale={fa_IR} direction="rtl" theme={{
        token: {
            fontFamily: "Yekan",
            Table: {
                cellFontSize: 12,
                padding: "2px",

                borderColor: "black"
                /* here is your component tokens */
            }

        }
    }}>

        <div ref={ref} className={" yekan block"} dir="rtl">.
            <div className="break-after-page pl-8 ">
                <div className="page-content">
                    <header>
                        <Row gutter={50}>
                            <Col span={6}>
                                <Image
                                    src={arm}
                                    height={100}
                                    alt="Picture of the author"
                                    className={""}
                                />
                            </Col>
                            <Col span={12}>
                                <p className={"text-center font-bold yekan text-2xl"}>دانشگاه هنر اسلامی تبریز </p>
                                <p className={"text-center font-bold yekan text-2xl"}> حواله پرداخت </p>
                                <p className={"text-center font-bold yekan text-2xl"}> {Contractor_level_name} </p>
                            </Col>
                            <Col span={6} className={"text-right"}>
                                <div className={"float-left"}>
                                    <h1> شماره سند: {(parseInt(props.record?.id)).toLocaleString('fa-IR')} </h1>
                                    <h1>تاریخ: {toPersianNumbers(dayjs().format('YYYY/MM/DD'))}</h1>
                                </div>
                            </Col>
                        </Row>
                    </header>

                    <article className={"pb-4  "}>
                        <Table className={"text-s pb-5"} columns={columns2} dataSource={[record]} bordered
                               pagination={false}
                               rowClassName={'row'}/>
                        <Table className={"text-s "} columns={columns1} dataSource={[record]} bordered
                               pagination={false}
                               rowClassName={'row'}
                        />
                        <p>شرح : {record.descr || ''}</p>
                    </article>
                    <footer className="nazanin" style={{width: "100%"}}>
                        <table style={{width: "100%"}}>
                            <tbody style={{width: "100%"}}>
                            <tr style={{width: "100%"}}>

                                <td className={"py-5"}>
                                    <p className={"text-center"}>تنظیم و رسیدگی</p>
                                    <p className={"text-center"}> فاطمه علیزاده </p>
                                </td>
                                <td className={"no-wrap py-5 "}>
                                    <p className={"text-center"}>صدور حواله</p>
                                    <p className={"text-center no-wrap"}>علیرضا پرتو </p>
                                </td>
                                <td className={"py-5"}>
                                    <p className={"text-center"}>مدیر امور مالی</p>
                                    <p className={"text-center"}>دکتر علیرضا خدادادی</p>
                                </td>
                                <td className={"py-5"}>
                                    <p className={"text-center"}>معاون اداری، عمرانی و مالی</p>
                                    <p className={"text-center"}>دکتر احد نژاد ابراهیمی</p>
                                </td>
                            </tr>


                            </tbody>
                        </table>


                    </footer>
                </div>
            </div>
            <div className=" pl-8 ">
                <div className="page-content">
                    <header>
                        <Row gutter={50}>
                            <Col span={6}>
                                <Image
                                    src={arm}
                                    height={100}
                                    alt="Picture of the author"
                                    className={""}
                                />
                            </Col>
                            <Col span={12}>
                                <p className={"text-center font-bold yekan text-2xl"}>دانشگاه هنر اسلامی تبریز </p>
                                <p className={"text-center font-bold yekan text-2xl"}> حواله پرداخت </p>
                                <p className={"text-center font-bold yekan text-2xl"}> {Contractor_level_name} </p>
                            </Col>
                            <Col span={6} className={"text-right"}>
                                <div className={"float-left"}>
                                    <h1> شماره سند: {(parseInt(props.record?.id)).toLocaleString('fa-IR')} </h1>
                                    <h1>تاریخ: {toPersianNumbers(dayjs().format('YYYY/MM/DD'))}</h1>
                                </div>
                            </Col>
                        </Row>
                    </header>
                    <article className={"pb-4 text-right pt-2 pb-0"}>
                        <p className={"font-bold"}>مدیر محترم امور مالی</p>
                        <p>به استناد مواد ۱۶ و ۱۷ آئین نامه مالی و معاملاتی دانشگاه
                            مبلغ {record?.final_payable_amount} به ریال</p>
                        <p> مبلغ به حروف : {Num2persian(record?.final_payable_amount || 0) + " "}
                            از محل اعتبارات ردیف ۱۲۲۹۰۰ بودجه
                            سال {record?.document_date && !isNaN(new Date(record?.document_date)) ? new Intl.DateTimeFormat('fa-IR', {
                                year: 'numeric'
                            }).format(new Date(record?.document_date)) : ''} کل کشور نسبت به پرداخت اقدام نمائید. </p>
                    </article>
                    <article className={"pb-4  "}>
                        <Table className={"text-s pb-5"} columns={columns2} dataSource={[record]} bordered
                               pagination={false}
                               rowClassName={'row'}/>
                        <Table className={"text-s "} columns={columns1} dataSource={[record]} bordered
                               pagination={false}
                               rowClassName={'row'}
                        />
                        <p>شرح : {record.descr || ''}</p>
                    </article>
                    <footer className="nazanin" style={{width: "100%"}}>
                        <table style={{width: "100%"}}>
                            <tbody style={{width: "100%"}}>
                            <tr style={{width: "100%"}}>
                                <td style={{width: "50%"}}></td>
                                <td className={"py-5 text-center text-2xl"}>
                                    <p className={""}>رئیس دانشگاه</p>
                                    <p className={""}> دکتر محمدتقی پیربابائی </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </footer>
                </div>
            </div>

        </div>
    </ConfigProvider>
}

const ForwardedFinPrint = React.forwardRef(Contract_print);
ForwardedFinPrint.displayName = 'Contract_print';

export default ForwardedFinPrint;