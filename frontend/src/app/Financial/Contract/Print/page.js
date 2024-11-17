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
    console.log(newdata)
    return newdata
}

function Contract_print(props, ref) {
    const [Log_list, set_Log_list] = useState([], (x) => convertToPersianNumber(x));
    const [fin, set_fin] = useState({});
    const username = props.record ? props.record.user_group == "logistics-other" ? "" : props.record.user : ''

    const {Text} = Typography;
    let id = props.record ? props.record.id : 41;
    const Payment_type = props.record ? props.record.Payment_type : false
    const user = props.record ? props.record.user : ''
    // console.log("props");
    // console.log(props.record.id);
    let Price = 0;
    Log_list.forEach(({price,}) => {
        Price += price;
    });
    let Vat = 0
    Log_list.forEach(({vat,}) => {
        Vat += vat
    })
    dayjs.calendar('jalali');
    dayjs.extend(jalaliPlugin);
    dayjs.locale('fa');


    let bank_log_list = Log_list.reduce((acc, item) => {
        const existingItem = acc.find(i => i.account_number === item.account_number && i.account_name === item.account_name);
        if (existingItem) {
            existingItem.price += item.price;
            existingItem.vat += item.vat;
            const existingBudgetRow = existingItem.budget_rows.find(br => br.id === item.budget_row.id);
            if (existingBudgetRow) {
                existingBudgetRow.price += item.price;
            } else {
                existingItem.budget_rows.push({...item.budget_row, price: item.price});
            }
        } else {
            acc.push({
                ...item,
                budget_rows: [{...item.budget_row, price: item.price}]
            });
        }
        return acc;
    }, []);
    // console.log(bank_log_list)
    // After reduction, format the budget_row information
    // bank_log_list = bank_log_list.map(item => ({
    //     ...item,
    //     budget_row:  item.budget_rows.length>1? item.budget_rows.map(br => `${br.name} (${numberWithCommas(convertToPersianNumber(br.price))})`).join(' - '):item.budget_rows.map(br => br.name).join(', ')
    // }));
    // console.log(bank_log_list)


    let new_log_list = Log_list.reduce((acc, item) => {
        const existingItem = acc.find(i =>
            i.program.fin_code === item.program.fin_code &&
            i.budget_row.fin_code === item.budget_row.fin_code
        );
        if (existingItem) {
            existingItem.name = existingItem.name + " - " + item.name;
            existingItem.price += item.price;
            existingItem.vat += item.vat;
            if (existingItem.Location && item.Location) {
                if (existingItem.Location.organization_name !== item.Location.organization_name &&
                    !existingItem.Location.name.includes(item.Location.name)) {
                    existingItem.Location.organization_name = `${existingItem.Location.organization_name || ""}${existingItem.Location.organization_name ? " - " : ""}${item.Location.organization_name || ""}`.trim();
                }
            } else if (item.Location) {
                existingItem.Location = {...item.Location};
            }
        } else {
            acc.push({...item});
        }
        return acc;
    }, []);
    // const farsinum = value => {
    //     if (value === null || value === undefined) {
    //         return 0
    //     }
    //
    //     const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    //     const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    //     let newValue = value;
    //     for (let i = 0; i < 10; i++) {
    //         newValue = newValue.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    //     }
    //     return newValue;
    // }
    let Price_ir = numberWithCommas(convertToPersianNumber(Price))
    let Vat_ir = numberWithCommas(convertToPersianNumber(Vat))
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
    const columns1 = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: "5px",
            align: "center",
            render: (text, record, index) => index + 1
        },


        {
            title: 'نام کالا/خدمات', dataIndex: 'name', key: 'name', align: "center"
        },
        //     {
        //     title: 'نوع ارائه',
        //     dataIndex: 'type',
        //     key: 'type',
        //     render: (bool) => bool ? "کالا" : "خدمات",
        //     align: "center",
        // }
        // , {
        //     title: 'کدملی/شناسه', dataIndex: 'seller_id', key: 'seller_id', align: "center",
        // }
        , {
            title: 'کد و عنوان ردیف هزینه', dataIndex: 'budget_row', key: 'budget_row', align: "center", width: 200,
            render: (data) => data.fin_code + ":" + data.name
        },
        , {
            title: 'کد و عنوان برنامه', dataIndex: 'program', key: 'program', align: "center",
            render: (data) => data.fin_code + ":" + data.name
        },


        , {
            title: 'محل هزینه', dataIndex: 'Location', key: 'Location', align: "center",
            render: (data) => data?.organization_name
        },
        {
            title: 'نوع',
            dataIndex: 'cost_type',
            key: 'cost_type',
            render: (cost_type) => {
                switch (cost_type) {
                    case 0:
                        return "عمومی";
                    case 1:
                        return "اختصاصی";
                    case 2:
                        return "متفرقه و ابلاغی";
                    case 3:
                        return "تعمیر و تجهیز";
                    case 4:
                        return "تامین فضا";
                    default:
                        return "نامشخص";
                }
            },
            align: "center",
        },

        //     {
        //     title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller', align: "center",
        // },
        //     {
        //         title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {
        //             return new Intl.DateTimeFormat('fa-IR', {
        //                 year: 'numeric',
        //                 month: '2-digit',
        //                 day: '2-digit'
        //             }).format(new Date(date));
        //         }, align: "center",
        //     },


        {
            title: 'مبلغ',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className={"text-sm font-extrabold"}>{convertToPersianNumber(price)}</span>,
            align: "center",
        },

        //
        // {
        //     title: 'توضیحات', dataIndex: 'descr', key: 'descr', align: "center",
        // },
        {
            title: 'ارزش افزوده', dataIndex: 'vat', key: 'vat', align: "vat",
        },
    ];
    const columns2 = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: "5px",
            align: "center",
            render: (text, record, index) => index + 1
        },


        // {
        //     title: 'نام کالا/خدمات', dataIndex: 'name', key: 'name', align: "center"
        // },
        //     {
        //     title: 'نوع ارائه',
        //     dataIndex: 'type',
        //     key: 'type',
        //     render: (bool) => bool ? "کالا" : "خدمات",
        //     align: "center",
        // }
        // , {
        //     title: 'کدملی/شناسه', dataIndex: 'seller_id', key: 'seller_id', align: "center",
        // }
        , {
            title: 'کد و عنوان ردیف هزینه', dataIndex: 'budget_row', key: 'budget_row', align: "center", width: 200,
            render: (data) => data.fin_code + ":" + data.name
        },
        , {
            title: 'کد و عنوان برنامه', dataIndex: 'program', key: 'program', align: "center",
            render: (data) => data.fin_code + ":" + data.name
        },


        , {
            title: 'محل هزینه', dataIndex: 'Location', key: 'Location', align: "center",
            render: (data) => data?.organization_name
        },
        {
            title: 'نوع',
            dataIndex: 'cost_type',
            key: 'cost_type',
            render: (cost_type) => {
                switch (cost_type) {
                    case 0:
                        return "عمومی";
                    case 1:
                        return "اختصاصی";
                    case 2:
                        return "متفرقه و ابلاغی";
                    case 3:
                        return "تعمیر و تجهیز";
                    case 4:
                        return "تامین فضا";
                    default:
                        return "نامشخص";
                }
            },
            align: "center",
        },

        //     {
        //     title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller', align: "center",
        // },
        //     {
        //         title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {
        //             return new Intl.DateTimeFormat('fa-IR', {
        //                 year: 'numeric',
        //                 month: '2-digit',
        //                 day: '2-digit'
        //             }).format(new Date(date));
        //         }, align: "center",
        //     },


        {
            title: 'مبلغ',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className={"text-sm font-extrabold"}>{convertToPersianNumber(price)}</span>,
            align: "center",
        },

        //
        // {
        //     title: 'توضیحات', dataIndex: 'descr', key: 'descr', align: "center",
        // },
        // {
        //     title: 'ارزش افزوده', dataIndex: 'vat', key: 'vat', align: "vat",
        // },
    ];
    const columns_bank = [


        {
            title: 'نام و نام خانوادگی / شرکت', dataIndex: 'account_name', key: 'account_name', align: "center"
        },
        // {
        //     title: 'کد و عنوان ردیف هزینه', dataIndex: 'budget_row', key: 'budget_row', align: "center", width: 200,
        //     render: (data) => data
        // },
        {
            title: 'شماره حساب', dataIndex: 'account_number', key: 'account_number', align: "center",
            render: (account_number) => <span className={"text-sm font-extrabold"}>IR{account_number}</span>,
        },
        {
            title: 'نام بانک', dataIndex: 'bank_name', key: 'bank_name', align: "center"
        },

        {
            title: 'مبلغ',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className={"text-sm font-extrabold"}>{convertToPersianNumber(price)}</span>,
            align: "center",
        },
        // {
        //     title: 'ارزش افزوده', dataIndex: 'vat', key: 'vat', align: "vat",
        // },
    ];
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
                                <p className={"text-center  yekan text-xl"}> {!fin.Payment_type && "(کسر از تنخواه)"} </p>
                            </Col>
                            <Col span={6} className={"text-right"}>
                                <div className={"float-left"}>
                                    <h1> شماره سند: {(parseInt(fin.id)).toLocaleString('fa-IR')} </h1>
                                    <h1>تاریخ: {fin.date_doc && !isNaN(new Date(fin.date_doc)) ? new Intl.DateTimeFormat('fa-IR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    }).format(new Date(fin.date_doc)) : ''}</h1>
                                    <h1>
                                        پیوست: دارد
                                    </h1></div>
                            </Col>
                        </Row>
                    </header>

                    <article className={"pb-4  "}>
                        <Table className={"text-s "} columns={columns1} dataSource={new_log_list} bordered
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
                                           <Table.Summary.Cell index={1} colSpan={5} align={"center"}
                                                               className={"font-bold"}>
                                               {Payment_type ?
                                                   <Text type="">جمع کل به حروف : {Num2persian(Price)} ریال </Text> :
                                                   <p className={""}>کسر از تنخواه(شارژ تنخواه) {user} به
                                                       مبلغ {Num2persian(Price)} ریال </p>


                                               }

                                           </Table.Summary.Cell>
                                           <Table.Summary.Cell index={1} colSpan={2} align={"center"}>
                                               <Text className={"text-sm font-extrabold"}>{Price_ir}  </Text>
                                           </Table.Summary.Cell>
                                           <Table.Summary.Cell index={1} colSpan={1} align={"center"}>
                                               <Text className={"text-sm font-extrabold"}>{Vat_ir}  </Text>
                                           </Table.Summary.Cell>

                                       </Table.Summary.Row>

                                   </>);
                               }}/>
                    </article>
                    {Payment_type &&
                        <article className={"pb-4 "}>
                            <Table className={"text-s "} columns={columns_bank} dataSource={bank_log_list} bordered
                                   pagination={false}
                                   rowClassName={'row'}
                                   summary={(pageData) => {
                                       return (<>
                                           <Table.Summary.Row>

                                               <Table.Summary.Cell index={1} colSpan={3} align={"center"}
                                                                   className={"font-bold"}>
                                                   <Text type="">جمع کل به حروف : {Num2persian(Price)} ریال </Text>
                                               </Table.Summary.Cell>
                                               <Table.Summary.Cell index={1} colSpan={1} align={"center"}>
                                                   <Text className={"text-sm font-extrabold"}>{Price_ir}  </Text>
                                               </Table.Summary.Cell>
                                               {/*<Table.Summary.Cell index={1} colSpan={1} align={"center"}>*/}
                                               {/*    <Text className={"text-sm font-extrabold"}>{Vat_ir}  </Text>*/}
                                               {/*</Table.Summary.Cell>*/}
                                           </Table.Summary.Row>
                                       </>);
                                   }}/>
                        </article>}
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

        </div>
    </ConfigProvider>
}

const ForwardedFinPrint = React.forwardRef(Contract_print);
ForwardedFinPrint.displayName = 'Contract_print';

export default ForwardedFinPrint;