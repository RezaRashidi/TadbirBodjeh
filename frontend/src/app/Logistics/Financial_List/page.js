"use client";
import Financial_docs from "@/app/Logistics/Financial_docs/page";
import {Modal, Table} from "antd";
import React, {useEffect, useState} from "react";


const App = () => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedid, setselectedid] = useState(0);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const handleModalChange = (newState) => {
        setIsModalOpen(newState);
    };
    const showModal = (value) => {
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
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/financial/?page=${tableParams.pagination.current}`)
            .then((res) => res.json())
            .then((res) => {
                // console.log(res);

                let newdata = res.results.map(
                    (item) => ({"key": item.id, ...item})
                )
                // console.log(newdata);
                setData(newdata);
                setLoading(false);
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.count,
                        // 200 is mock data, you should read it from server
                        // total: data.totalCount,
                    },
                });
            });
    };
    const columns = [
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
        },
    ];
    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)]);
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


            <Table columns={columns} dataSource={data} pagination={tableParams.pagination}
                   loading={loading} onChange={handleTableChange}/>

        </>


    )
};
export default App;