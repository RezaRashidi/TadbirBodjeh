"use client";
import arm from "@/images/Arm.jpg";
import {Col, Row, Table, Typography} from "antd";
import Image from "next/image";
import React, {useEffect, useState} from "react";

// print function that show financial report that include table of logistic document with header and footer
function Fin_print(props) {
    const [Log_list, set_Log_list] = useState([]);
    const [fin, set_fin] = useState({});
    const {Text} = Typography;
    let id = 40;
    useEffect(() => {
            fetch(`http://127.0.0.1:8000/api/logistics/?Fdoc_key=${id}`)
                .then((res) => res.json())
                .then((res) => {
                    console.log(res);
                    set_Log_list(res.results)
                })
            fetch(`http://127.0.0.1:8000/api/financial/${id}`)
                .then((res) => res.json())
                .then((res) => {
                    console.log(res);
                    set_fin(res)
                })

        }, []
    )
    const columns = [{
        title: 'نام کالا/خدمات\n', dataIndex: 'name', key: 'name', render: (text, record) => {
            // setselectedid(record.id)
            return <>
                <a onClick={() => showModal(record)}>{text}</a>
            </>
        }
    }, {
        title: 'نوع ارائه', dataIndex: 'type', key: 'type', render: (bool) => bool ? "کالا" : "خدمات",
    }, {
        title: 'نوع پرداخت', dataIndex: 'Payment_type', key: 'Payment_type', render: (bool) => bool ? "مستقیم" : "",
    }, {
        title: 'کد ملی/ شناسه\n', dataIndex: 'seller_id', key: 'seller_id',
    }, {
        title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller',
    }, , {
        title: 'قیمت', dataIndex: 'price', key: 'price',
    }, , {
        title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {

            return new Intl.DateTimeFormat('fa-IR').format(new Date(date));

        }
    },];

    return <>
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
                    <h1 className={"text-center"}>صورت ریز هزینه دانشگاه هنر اسلامی تبریز</h1>
                    <h1 className={"text-center"}>تدارکات</h1>
                </Col>
                <Col span={6}>
                    <h1>تاریخ: {fin.date_doc && !isNaN(new Date(fin.date_doc)) ? new Intl.DateTimeFormat('fa-IR').format(new Date(fin.date_doc)) : ''}</h1>
                    <h1> شماره سند: {fin.id} </h1>
                    <h1>نوع هزینه: {fin.CostType}</h1>
                </Col>
            </Row>
        </header>
        <Table columns={columns} dataSource={Log_list} bordered pagination={{position: ["none"]}}
               summary={(pageData) => {

                   let Price = 0;

                   pageData.forEach(({price,}) => {
                       Price += price;

                   });
                   return (
                       <>
                           <Table.Summary.Row>
                               <Table.Summary.Cell index={0}>جمع مبلغ</Table.Summary.Cell>
                               <Table.Summary.Cell index={1} colSpan={2}>
                                   <Text type="danger">{Price}</Text>
                               </Table.Summary.Cell>

                           </Table.Summary.Row>

                       </>
                   );
               }}/>
        <article>
        </article>
        <footer>
        </footer>
    </>
}

export default Fin_print;