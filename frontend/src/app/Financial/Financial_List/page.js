"use client";
import {api} from "@/app/fetcher";
import Financial_docs from "@/app/Logistics/Financial_docs/page";
import Fin_detail from "@/app/Logistics/Financial_List/detail";
import Fin_print, {numberWithCommas} from "@/app/Logistics/Print/page";
import {PrinterOutlined} from "@ant-design/icons";
import {Button, Modal, Radio, Table} from "antd";
import React, {useEffect, useState} from "react";
import ReactToPrint from "react-to-print";

// const fin_state = {
//     "در دست اقدام": 0,
//     "در حال بررسی": 1,
//     "تایید": 2,
//
// }


const App = (props) => {
        const [data, setData] = useState();
        const [loading, setLoading] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [selectedid, setselectedid] = useState(0);
        const [fin_state, set_fin_state] = useState(1);
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
        const onchangestate = (e, record) => {
            api().url(`/api/financial/${record.id}/`).patch({
                "fin_state": e.target.value
            }).json().then((res) => {
                console.log(res);
                fetchData();
            })
        }
        const fetchData = () => {
            //
            api().url(`/api/financial/?page=${tableParams.pagination.current}&fin_state=${fin_state}`).get().json().then((res) => {
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
        }, [JSON.stringify(tableParams), fin_state]);
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
                key: 'CostType',
                filters: [{value: 'جاری', text: 'جاری'}, {value: 'عمرانی', text: 'عمرانی'}, {
                    value: "متفرقه",
                    text: "متفرقه"
                }, {value: "تجهیزات", text: "تجهیزات"}, {value: "خارج از شمول", text: "خارج از شمول"}],
                onFilter: (value, record) => record.CostType == value,
                render: (text) => text,
            }, {
                title: 'نوع پرداخت',
                dataIndex: 'Payment_type',
                key: 'Payment_type',
                filters: [
                    {
                        text: 'مستقیم',
                        value: true,
                    },
                    {
                        text: "تنخواه",
                        value: false,
                    },
                ],
                onFilter: (value, record) => record.Payment_type === value,
                render: (bool) => bool ? "مستقیم" : "تنخواه",
            },
            {
                title: 'تاریخ',
                dataIndex: 'date_doc',
                key: 'date_doc',
                render: (date) => {

                    return new Intl.DateTimeFormat('fa-IR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).format(new Date(date));

                }
            },
            {
                title: 'مبلغ',
                sorter: (a, b) => a.total_logistics_price - b.total_logistics_price,
                dataIndex: 'total_logistics_price',
                key: 'total_logistics_price',
                align: 'center',
                render: (x) => {
                    return numberWithCommas(x)
                }
            },

            {
                title: 'سازنده',
                dataIndex: 'user',
                key: 'user',
                // eslint-disable-next-line react/jsx-key
            },
            {
                title: 'وضعیت',
                dataIndex: 'fin_state',
                hidden: fin_state === 2,
                key: 'fin_state',
                sorter: (a, b) => a.fin_state - b.fin_state,
                filters: [
                    {
                        text: 'در دست اقدام',
                        value: 0,
                    },
                    {
                        text: "در حال بررسی",
                        value: 1,
                    },
                    {
                        text: "تایید",
                        value: 2,
                    },
                ],
                onFilter: (value, record) => record.fin_state === value,
                // eslint-disable-next-line react/jsx-key
                // render: (fin_state) => bool ? "تایید" : "تایید نشده",
                render: (fin_state, record) => {
                    // console.log(state)
                    return <Radio.Group onChange={(e) => onchangestate(e, record)} defaultValue={fin_state}>
                        <Radio.Button value={2}>تایید</Radio.Button>
                        <Radio.Button value={0}>رد</Radio.Button>
                        {/*<Radio.Button value={1}>در حال بررسی</Radio.Button>*/}


                    </Radio.Group>
                    // console.log(state)
                    // if (state === 0) {
                    // return "در دست اقدام"
                    // } else if (state === 1) {
                    // return "در حال بررسی"
                    // } else if (state === 2) {
                    // return "تایید نهایی"
                    // }

                }
            },
            {
                title: "چاپ", key: 'print', align: 'center', render: (record) => {
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
                                             .no-wrap {
                                                white-space: nowrap;
                                            }

                                        }"
                            trigger={() => <Button icon={<PrinterOutlined/>}></Button>}
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
                <Radio.Group onChange={(e) => set_fin_state(e.target.value)} defaultValue={fin_state}>
                    <Radio.Button value={1}>در حال بررسی</Radio.Button>
                    <Radio.Button value={2}>تایید شده</Radio.Button>

                </Radio.Group>

                <Table columns={columns} dataSource={data} loading={loading} pagination={tableParams.pagination}
                       expandable={{
                           expandedRowRender: (record) => <Fin_detail key={record.updated} record={record}/>,

                       }}
                       onChange={handleTableChange}/>

            </>


        )
    }
;
export default App;