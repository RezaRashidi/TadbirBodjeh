"use client";
import arm from "@/images/Arm.jpg";
import {Col, Row, Table, Typography} from "antd";
import Title from "antd/lib/typography/Title";
import Image from "next/image";
import Num2persian from 'num2persian';
import React, {useEffect, useState} from "react";

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function convertToPersianNumber(number) {
    return number.toLocaleString('fa-IR');
}

// print function that show financial report that include table of logistic document with header and footer
function Fin_print(props, ref) {
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
    let Price_ir = numberWithCommas(convertToPersianNumber(Price))
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/logistics/?Fdoc_key=${id}`)
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                let newdata = res.results.map(
                    (item) => ({"key": item.id, ...item})
                )
                set_Log_list([...newdata])
            })

        if (props.record) {

            set_fin(props.record);
        } else {
            fetch(`http://127.0.0.1:8000/api/financial/${id}`)
                .then((res) => res.json())
                .then((res) => {
                    // console.log(res);
                    set_fin(res)
                })
        }


    }, [props.record.updated])
    const columns = [{
        title: 'نام کالا/خدمات\n', dataIndex: 'name', key: 'name'
    }, {
        title: 'نوع ارائه', dataIndex: 'type', key: 'type', render: (bool) => bool ? "کالا" : "خدمات",
    }, {
        title: 'کدملی/شناسه', dataIndex: 'seller_id', key: 'seller_id',
    }, {
        title: 'محل هزینه', dataIndex: 'Location', key: 'Location',
    }, {
        title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller',
    }, {
        title: 'قیمت', dataIndex: 'price', key: 'price', render: (price) => convertToPersianNumber(price)
    }, {
        title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {

            return new Intl.DateTimeFormat('fa-IR').format(new Date(date));

        }

    }


    ];

    return <div ref={ref} className={"p-5"} dir="rtl">
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
                <Col span={10}>
                    <Title level={3} className={"text-center font-bold"}>صورت ریز هزینه دانشگاه هنر اسلامی تبریز</Title>
                    <Title level={4} className={"text-center"}>تدارکات</Title>
                </Col>
                <Col span={4} className={"leading-8"}>
                    <h1>نوع هزینه: {fin.CostType}</h1>
                    <h1> کد رهگیری مالیاتی: {fin.tax}</h1>

                </Col>
                <Col span={4} className={"leading-8"}>
                    <h1>تاریخ: {fin.date_doc && !isNaN(new Date(fin.date_doc)) ? new Intl.DateTimeFormat('fa-IR').format(new Date(fin.date_doc)) : ''}</h1>
                    <h1> شماره سند: {fin.id} </h1>

                </Col>
            </Row>
        </header>

        <article className={"py-8"}>
            <Table columns={columns} dataSource={Log_list} bordered pagination={{position: ["none"]}}
                   summary={(pageData) => {


                       return (<>
                           <Table.Summary.Row>
                               <Table.Summary.Cell index={0}>جمع مبلغ</Table.Summary.Cell>
                               <Table.Summary.Cell index={1} colSpan={2} align={"center"}>
                                   <Text type="">{Price_ir} ریال</Text>
                               </Table.Summary.Cell>
                               <Table.Summary.Cell index={1} colSpan={4} align={"center"}>
                                   <Text type="">مبلغ کل به حروف : {Num2persian(Price)} ریال </Text>
                               </Table.Summary.Cell>
                           </Table.Summary.Row>

                       </>);
                   }}/>
        </article>
        <footer>
            <div>
                <p>مدیر محترم منابع انسانی، اداری و پشتیبانی:</p>
                <p> احتراماً ریز هزینه به مبلغ {Price_ir} ریال جهت دستور پرداخت به حضور تقدیم می گردد.</p>
                <p className={"text-left"}>کارپرداز</p>
            </div>
            <div>
                <p>معاون محترم اداری، عمرانی و مالی:</p>
                <p> احتراماً ریز هزینه به مبلغ {Price_ir} ریال جهت مورد تایید می باشد خواهشنمد است دستور
                    فرمایید اقدام لازم جهت دستور پرداخت مبذول گردد.</p>
                <p className={"text-left"}>مدیر منابع انسانی، اداری و پشتیبانی</p>
            </div>
            <div>
                <p>مدیر محترم امور مالی:</p>
                <p> به استناد ماده ۱۲،۳۱و ۳۲ آئين نامه مالی و معاملاتی دانشگاه، مبلغ اسناد هزینه پیوستی از محل اعتبارات
                    پرداخت گردد </p>
                <p className={"text-left"}>معاون اداری، عمرانی و مالی</p>
            </div>
        </footer>
    </div>
}

const ForwardedFinPrint = React.forwardRef(Fin_print);
ForwardedFinPrint.displayName = 'FinPrint';

export default ForwardedFinPrint;