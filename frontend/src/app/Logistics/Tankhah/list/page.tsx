"use client";

import {api} from "@/app/fetcher";
import {Modal, Table} from "antd";
import React, {useEffect, useState} from "react";
import Tankhah from "@/app/Logistics/Tankhah/sabt/page";

export default function List() {
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
    const handleModalChange = (newState) => {
        setIsModalOpen(newState);
    };
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        })
    }
    useEffect(() => {
        const request = api().url(`/api/pettycash/`).get().json();
        request.then((res: any) => {
            console.log(res)
            let newdata = res.results.map(
                (item) => ({"key": item.id, ...item})
            )
            setData(newdata);
            setLoading(false);
        });
    }, [JSON.stringify(tableParams)]);
    const columns = [
        {
            title: 'نام سند',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) =>
                <a onClick={() => showModal(record)}>{text}</a>

        },
        {
            title: 'شماره سند',
            dataIndex: 'doc_num',
            key: 'id',
        },
        {
            title: 'مبلغ',
            dataIndex: 'price',
            key: 'price',
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
            title: 'توضیحات',
            dataIndex: 'descr',
            key: 'descr',
        },

        {
            title: 'وضعیت',
            dataIndex: 'F_conf',
            key: 'F_conf',
            // eslint-disable-next-line react/jsx-key
            render: (bool) => bool ? "تایید" : "تایید نشده",
        },

    ]

    return (

        <>
            <Modal title="ویرایش تنخواه" style={{marginLeft: "-15%"}} centered open={isModalOpen}
                   onOk={handleOk} width={"75%"} onCancel={handleCancel} footer={null} zIndex={100}>
                <Tankhah Fdata={data} selectedid={selectedid} modal={handleModalChange}/>
            </Modal>
            <Table columns={columns} dataSource={data} loading={loading} pagination={tableParams.pagination}
                   onChange={handleTableChange}/>
        </>

    )
}