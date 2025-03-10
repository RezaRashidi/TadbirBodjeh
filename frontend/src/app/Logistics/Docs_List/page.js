"use client";
import {api} from "@/app/fetcher";
import Logistics_Doc from "@/app/Logistics/Docs/page";
import {numberWithCommas} from "@/app/Logistics/Print/page";
import {Modal, Radio, Table} from "antd";
import React, {useEffect, useState} from "react";

const App = ({}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatedata, setupdatedata] = useState(false);
    const [data, setData] = useState([]);
    const [location, setlocation] = useState([]);
    const [selectedid, setselectedid] = useState(0);
    const [loading, setLoading] = useState(false);
    const [doc_state, set_doc_state] = useState("?get_nulls=true");
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1, pageSize: 10,
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
    const remove_item = (id) => {
        setData(
            data.filter((item) => item.id !== id)
        )
    }
    const columns = [{
        title: 'شماره',
        dataIndex: 'id',
        key: 'id',
    }, {

        title: 'نام کالا/خدمات\n', dataIndex: 'name', key: 'name', render: (text, record) => {
            // setselectedid(record.id)
            return <>
                <a onClick={() => showModal(record)}>{text}</a>
            </>
        }
    }, {
        title: 'نوع ارائه', dataIndex: 'type', key: 'type',
        filters: [
            {
                text: 'کالا',
                value: true,
            },
            {
                text: "خدمات",
                value: false,
            },
        ],
        onFilter: (value, record) => record.type === value,
        render: (bool) => bool ? "کالا" : "خدمات",
    }, {
        title: 'کد ملی/ شناسه\n', dataIndex: 'seller_id', key: 'seller_id',
    }, {
        title: 'ارائه دهنده', dataIndex: 'seller', key: 'seller',
    }, , {
        title: 'قیمت', dataIndex: 'price', key: 'price',
        render: (price) => numberWithCommas(price.toLocaleString('fa-IR')),
        sorter: (a, b) => a.price - b.price,
    }, , {
        title: 'تاریخ', dataIndex: 'date_doc', key: 'date_doc', render: (date) => {
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date(date));
        }
    },

        {
            title: 'سازنده',
            dataIndex: 'user',
            key: 'user',
            // eslint-disable-next-line react/jsx-key
        },
        {
            title: 'سند',
            dataIndex: 'Fdoc_key',
            key: 'Fdoc_key',
            hidden: "?get_nulls=true" === doc_state,
            // eslint-disable-next-line react/jsx-key
        },
        {
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
        // let fdoc=doc_state ? "?get_nulls=1&" : "?get_nulls=0&" //doc_state && "?get_nulls=0&"
        console.log(
            `      ${doc_state}?page=${tableParams.pagination.current}`
        )
        api().url(`/api/logistics/${doc_state}&page=${tableParams.pagination.current}`).get().json().then((res) => {
            // console.log(res);
            let newdata = res.results.map((item) => ({"key": item.id, ...item}))
            setData(newdata);
            setlocation(res.sub_units)
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
        setTableParams({

            pagination: {
                current: 1,
            },
        });
        fetchData();
    }, [updatedata, doc_state]);

    return (<>
        <Modal title="ویرایش مدارک" style={{marginLeft: "-15%"}} centered open={isModalOpen}
               onOk={handleOk} width={"75%"} onCancel={handleCancel} footer={null} zIndex={100}>


            <Logistics_Doc Fdata={data} selectedid={selectedid} modal={handleModalChange} remove={remove_item}
                           location={location}/>

        </Modal>
        <Radio.Group onChange={(e) => {
            setTableParams({
                pagination: {
                    current: 1,
                    pageSize: 10,
                },
            });
            set_doc_state(e.target.value)
        }
        } defaultValue={doc_state}>
            <Radio.Button value={"?get_nulls=true"}>بدون سند</Radio.Button>
            <Radio.Button value={"?get_nulls=false"}>با سند</Radio.Button>


        </Radio.Group>
        <Table columns={columns} dataSource={data} pagination={tableParams.pagination}
               loading={loading} onChange={handleTableChange}/>
    </>)
};
export default App;