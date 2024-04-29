"use client";
import {api} from "@/app/fetcher";
import Financial_docs from "@/app/Logistics/Financial_docs/page";
import Fin_print from "@/app/Logistics/Print/page";
import {PrinterOutlined} from "@ant-design/icons";
import {Button, Modal, Table} from "antd";
import React, {useEffect, useState} from "react";
import ReactToPrint from "react-to-print";

const App = (props) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedid, setselectedid] = useState(0);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [printRefs, setPrintRefs] = useState({});

    const handleModalChange = (newState) => {
        setIsModalOpen(newState);
    };


// Usage

    const showModal = (value) => {
        // console.log(  ...data.filter((item) => item.id === value.id).flat())
        setselectedid(value.id)
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const fetchData = () => {

        api().url(`/api/financial/?page=${tableParams.pagination.current}`).get().json().then((res) => {
            let newdata = res.results.map(
                (item) => ({"key": item.id, ...item})
            )
            newdata.map((item) => {
                printRefs[item.id] = React.createRef();
            });
            console.log(newdata);
            setData(newdata);
            setLoading(false);
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: res.count,
                },
            });
        });


        // setLoading(true);
        // fetch(`http://localhost:8000/api/financial/?page=${tableParams.pagination.current}`)
        //     .then((res) => res.json())
        //     .then((res) => {
        //         // console.log(res);
        //         let newdata = res.results.map(
        //             (item) => ({"key": item.id, ...item})
        //         )
        //         newdata.map((item) => {
        //             printRefs[item.id] = React.createRef();
        //         });
        //         console.log(newdata);
        //         setData(newdata);
        //         setLoading(false);
        //         setTableParams({
        //             ...tableParams,
        //             pagination: {
        //                 ...tableParams.pagination,
        //                 total: res.count,
        //             },
        //         });
        //     });
    };
        useEffect(() => {
            fetchData();
            // console.log("useEffect");
        }, [JSON.stringify(tableParams)]);
        const columns = [
            {
                title: 'شماره سند',
                dataIndex: 'id',
                key: 'id',

            },
            {
                title: 'نام سند',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) =>
                    <a onClick={() => showModal(record)}>{text}</a>
            },
            {
                title: 'نوع هزینه',
                dataIndex: 'CostType',
                key: 'type',
                render: (bool) => bool ? "کالا" : "خدمات",
            },
            {
                title: 'تاریخ',
                dataIndex: 'date_doc',
                key: 'date_doc',
                render: (date) => {
                    let today = new Date(date);
                    let dateq = new Intl.DateTimeFormat('fa-IR').format(today);
                    return dateq
                }
            },
            {
                title: 'وضعیت',
                dataIndex: 'F_conf',
                key: 'F_conf',
                // eslint-disable-next-line react/jsx-key
                render: (bool) => bool ? "تایید" : "تایید نشده",
            }, {
                title: "چاپ", key: 'print', render: (record) => {
                    // if (!printRefs[record.id]) {
                    //     setPrintRefs(prevRefs => ({...prevRefs, [record.id]: React.createRef()}));
                    // }
                    // console.log(`${record.id}-${record.updated}`);
                    return < >
                        <div style={{display: 'none'}}>
                            <Fin_print key={record.updated} ref={printRefs[record.id]} record={record}/>
                        </div>
                        <ReactToPrint
                            pageStyle="@media print {
                                          html, body {
                                            height: 100vh; /* Use 100% here to support printing more than a single page*/
                                            margin: 0 !important;
                                            padding: 0 !important;
                                            overflow: hidden;
                                          }

                                        }"
                            trigger={() => <Button icon={<PrinterOutlined/>}>پرینت</Button>}
                            content={() => printRefs[record.id].current}
                        /></>
                }
            }

        ];

        const handleTableChange = (pagination, filters, sorter) => {
            setTableParams({
                pagination,
                filters,
                ...sorter,
            })
        }
        return (

            <>


                <Modal title="ویرایش سند" style={{marginLeft: "-15%"}} centered open={isModalOpen}
                       onOk={handleOk} width={"75%"} onCancel={handleCancel} footer={null} zIndex={100}>

                    <Financial_docs Fdata={data} selectedid={selectedid} modal={handleModalChange}/>
                </Modal>


                <Table columns={columns} dataSource={data} loading={loading} pagination={tableParams.pagination}
                       onChange={handleTableChange}/>

            </>


        )
    }
;
export default App;