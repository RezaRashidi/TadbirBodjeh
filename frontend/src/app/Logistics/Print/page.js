"use client";
import {api} from "@/app/fetcher";
import arm from "@/images/Arm.jpg";
import {jalaliPlugin} from "@realmodule/antd-jalali";
import {Col, ConfigProvider, Row, Table, Typography} from "antd";
import fa_IR from "antd/lib/locale/fa_IR";
import dayjs from "dayjs";
import Image from "next/image";
import Num2persian from 'num2persian';
import React, {useEffect, useState} from "react";
import "@/styles/table.css";

export function numberWithCommas(x) {

    return x !== null ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
}

function convertToPersianNumber(number) {

    return number.toLocaleString('fa-IR');
}

export async function asyncFetchLogisticsData(id) {
    let nextURL = `/api/logistics/?Fdoc_key=${id}`;
    let url = false
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
function Fin_print(props, ref) {
    const [Log_list, set_Log_list] = useState([], (x) => convertToPersianNumber(x));
    const [fin, set_fin] = useState({});
    const username = props.record ? props.record.user_group == "logistics-other" ? "" : props.record.user : ''
    const {Text} = Typography;
    let id = props.record ? props.record.id : 41;
    // console.log("props");
    // console.log(props.record.id);
    let Price = 0;
    Log_list.forEach(({price,}) => {
        Price += price;
    });
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    dayjs.locale('fa');


    const farsinum = value => {
        if (value === null || value === undefined) {
            return 0
        }

        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let newValue = value;
        for (let i = 0; i < 10; i++) {
            newValue = newValue.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
        }
        return newValue;
    }
    let Price_ir = numberWithCommas(convertToPersianNumber(Price))
    useEffect(() => {


            asyncFetchLogisticsData(id).then(r => {
                set_Log_list(r)
                // console.log(r);
            });

            if (props.record) {
                set_fin(props.record);
            } else {
                api().url(`/api/financial/${id}`).get().json().then((res) => {
                    set_fin(res)
                })
            }
        }
        ,
        []
    )
    //props.record.updated
    const columns = [{
        title: '#',
        dataIndex: 'index',
        key: 'index',
        width: "5px",
        align: "center",
        render: (text, record, index) => index + 1
    }, {
        title: 'نام کالا/خدمات\n', dataIndex: 'name', key: 'name', align: "center"
    }, {
        title: 'نوع ارائه',
        dataIndex: 'type',
        key: 'type',
        render: (bool) => bool ? "کالا" : "خدمات",
        align: "center",
    }, {
        title: 'کدملی/شناسه', dataIndex: 'seller_id', key: 'seller_id', align: "center",
    }, {
        title: 'محل هزینه', dataIndex: 'Location', key: 'Location', align: "center", width: 100,
        render: (data) => data?.name
    }, {
        title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller', align: "center",
    },
        {
            title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {
                return new Intl.DateTimeFormat('fa-IR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(new Date(date));
            }, align: "center",
        },


        {
            title: 'قیمت',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className={"text-sm"}>{convertToPersianNumber(price)}</span>,
            align: "center",
        },


        {
            title: 'توضیحات', dataIndex: 'descr', key: 'descr', align: "center",
        },

    ];

    return <ConfigProvider locale={fa_IR} direction="rtl" theme={{
        token: {
            fontFamily: "Yekan",
            Table: {
                cellFontSize: 9,
                padding: "2px",

                borderColor: "black"
                /* here is your component tokens */
            }

        }
    }}>
        <div ref={ref} className={" yekan"} dir="rtl">

            <header>
                <Row gutter={50}>
                    <Col span={4}>
                        <Image
                            src={arm}
                            height={100}
                            alt="Picture of the author"
                            className={""}
                        />
                    </Col>
                    <Col span={16}>
                        <p className={"text-center font-bold yekan text-2xl"}>دانشگاه هنر اسلامی تبریز </p>
                        <p className={"text-center font-bold yekan text-2xl"}>صورت ریز
                            هزینه {fin.Payment_type && "(پرداخت مستقیم)"} </p>
                        <p className={"text-center text-xl"}> تدارکات </p>
                    </Col>

                </Row>
                <Row gutter={50}>
                    <Col span={6} className={"leading-8"}>

                        <h1> شماره سند: {(parseInt(fin.id)).toLocaleString('fa-IR')} </h1>

                    </Col>
                    <Col span={6} className={"leading-8"}>
                        <h1>نوع هزینه: {fin.CostType}</h1>


                    </Col>
                    <Col span={6} className={"leading-8"}>
                        <h1> کد مالیاتی: {fin.tax}</h1>
                    </Col>
                    <Col span={6} className={"leading-8"}>
                        <h1>تاریخ: {fin.date_doc && !isNaN(new Date(fin.date_doc)) ? new Intl.DateTimeFormat('fa-IR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).format(new Date(fin.date_doc)) : ''}</h1>
                    </Col>


                </Row>
            </header>

            <article className={"pb-4 "}>
                <Table className={"text-s "} columns={columns} dataSource={Log_list} bordered
                       pagination={false}
                       rowClassName={'row'}
                    // size="small"
                    // theme={{
                    //     token: {
                    //         fontFamily: "Yekan",
                    //         Table: {
                    //             cellFontSize: 1,
                    //             padding: "2px",
                    //             borderColor: "black"
                    //             /* here is your component tokens */
                    //         }
                    //     }
                    // }}
                       summary={(pageData) => {


                           return (<>
                               <Table.Summary.Row>
                                   <Table.Summary.Cell index={0} colSpan={2} align={'center'}>جمع
                                       کل</Table.Summary.Cell>
                                   <Table.Summary.Cell index={1} colSpan={5} align={"center"}>
                                       <Text type="">مبلغ کل به حروف : {Num2persian(Price)} ریال </Text>
                                   </Table.Summary.Cell>
                                   <Table.Summary.Cell index={2} colSpan={2} align={"center"}>
                                       <Text type="">{Price_ir} ریال</Text>
                                   </Table.Summary.Cell>

                               </Table.Summary.Row>

                           </>);
                       }}/>
            </article>
            <footer className={"nazanin"}>
                <table>
                    <tbody>
                    <tr>
                        <td>
                            <p>مدیر محترم منابع انسانی، اداری و پشتیبانی:</p>
                            <p> احتراماً ضمن تایید، ریز هزینه به مبلغ {Price_ir} ریال جهت صدور دستور پرداخت به حضور
                                ارسال می گردد.</p>
                        </td>
                        <td className={"py-5"}>
                            <p className={"text-center"}>{username}</p>
                            <p className={"text-center"}> کارپرداز </p>
                        </td>
                    </tr>

                    <tr className={""}>
                        <td>
                            <p>معاون محترم اداری، عمرانی و مالی:</p>
                            <p> احتراماً؛ خواهشمند است دستور
                                فرمایید اقدام لازم جهت دستور پرداخت مبذول گردد.</p>
                        </td>
                        <td className={"no-wrap py-5 "}>
                            <p className={"text-center"}> رضا بابائی</p>
                            <p className={"text-center no-wrap"}> مدیر منابع انسانی، اداری و پشتیبانی </p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>مدیر محترم امور مالی:</p>
                            <p> به استناد ماده ۳۱،۱۲و۳۲ آئين نامه مالی و معاملاتی دانشگاه هنر اسلامی تبریز، اسناد هزینه
                                پیوستی به مبلغ فوق از محل اعتبارات دانشگاه جهت پرداخت مطابق ضوابط و مقررات اقدام
                                گردد. </p>
                        </td>
                        <td className={"py-5"}>
                            <p className={"text-center"}> آزیتا بلالی اسکویی</p>
                            <p className={"text-center"}> معاون اداری، عمرانی و مالی </p>
                        </td>
                    </tr>
                    </tbody>
                </table>


            </footer>
        </div>
    </ConfigProvider>
}

const ForwardedFinPrint = React.forwardRef(Fin_print);
ForwardedFinPrint.displayName = 'FinPrint';

export default ForwardedFinPrint;