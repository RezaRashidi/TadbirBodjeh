"use client";
import Logistics_Doc from "@/app/Logistics/Docs/page";
import {Modal, Table} from "antd";
import React, {useEffect, useState} from "react";

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatedata, setupdatedata] = useState(false);
    const [data, setData] = useState([]);
    const [selectedid, setselectedid] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1, pageSize: 10,
        },
    });
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
            let today = new Date(date);
            let dateq = new Intl.DateTimeFormat('fa-IR').format(today);
            return dateq
        }
    }, {
        title: 'مدارک', dataIndex: 'uploads', key: 'uploads', // eslint-disable-next-line react/jsx-key
        render: (u) => u ? u.map((upload) => (
            <div key={upload.id}><a href={upload.file}>{upload.name}</a></div>)) : null,
    },];
    const handleTableChange = (pagination, filters, sorter) => {
        setupdatedata(!updatedata)
        setTableParams({
            pagination, filters, ...sorter,
        })
    }

    const fetchData = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/logistics/?page=${tableParams.pagination.current}`)
            .then((res) => res.json())
            .then((res) => {
                // console.log(res);

                let newdata = res.results.map((item) => ({"key": item.id, ...item}))
                // console.log(newdata);
                setData(newdata);
                setLoading(false);
                setTableParams({
                    ...tableParams, pagination: {
                        ...tableParams.pagination, total: res.count, // 200 is mock data, you should read it from server
                        // total: data.totalCount,
                    },
                });
            });
    };
    useEffect(() => {
        fetchData();
    }, [updatedata]);

    return (<>
        <Modal title="ویرایش مدارک" style={{marginLeft: "-15%"}} centered open={isModalOpen}
               onOk={handleOk} width={"75%"} onCancel={handleCancel} zIndex={100}>


            <Logistics_Doc Fdata={data} selectedid={selectedid}/>

        </Modal>
        <Table columns={columns} dataSource={data} pagination={tableParams.pagination}
               loading={loading} onChange={handleTableChange}/>
    </>)
};
export default App;