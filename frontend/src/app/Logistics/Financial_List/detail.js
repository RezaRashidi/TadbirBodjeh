"use client";
import {api} from "@/app/fetcher";
import {jalaliPlugin} from "@realmodule/antd-jalali";
import {ConfigProvider, Table, Typography} from "antd";
import fa_IR from "antd/lib/locale/fa_IR";
import dayjs from "dayjs";
import Num2persian from 'num2persian';
import React, {useEffect, useState} from "react";
import "@/styles/table.css";

export function numberWithCommas(x) {

    return x !== null ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
}

function convertToPersianNumber(number) {

    return number.toLocaleString('fa-IR');
}

// print function that show financial report that include table of logistic document with header and footer
export default function Fin_detail(props) {
    const [Log_list, set_Log_list] = useState([], (x) => convertToPersianNumber(x));
    const [fin, set_fin] = useState({});
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


            let nextURL = `/api/logistics/?Fdoc_key=${id}`;
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
        title: 'محل هزینه', dataIndex: 'Location', key: 'Location', align: "center",
        render: (data) => data.name
    }, {
        title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller', align: "center",
    }, {
        title: 'توضیحات', dataIndex: 'descr', key: 'descr', align: "center",
    }, {
        title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date(date));
        }, align: "center",
    }, {
        title: 'قیمت',
        dataIndex: 'price',
        key: 'price',
        render: (price) => convertToPersianNumber(price),
        align: "center",
    }


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
        <div className={" yekan"} dir="rtl">


            <article className={"pb-4 "}>
                <Table className={"text-s"} columns={columns} dataSource={Log_list} bordered
                       pagination={false}
                       rowClassName={'row'}
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

        </div>
    </ConfigProvider>
}