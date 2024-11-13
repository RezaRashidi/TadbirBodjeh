"use client";
import {api} from "@/app/fetcher";
import Contract_Doc from "@/app/Financial/Contract/page";
import {numberWithCommas} from "@/app/Logistics/Print/page";
import {Modal, Table} from "antd";
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

        title: 'عنوان', dataIndex: 'name', key: 'name', render: (text, record) => {
            // setselectedid(record.id)
            return <>
                <a onClick={() => showModal(record)}>{text}</a>
            </>
        }
    }, {
        title: 'نوع قرار داد', dataIndex: 'Contractor_level', key: 'Contractor_level',
        render: (level) => {
            switch (level) {
                case "a":
                    return "قرارداد";
                case "b":
                    return "طرح پژوهشی خارجی";
                case "c":
                    return "عمرانی";
                case "d":
                    return "سایر کارکردها";
                default:
                    return "قرارداد";

            }
        },
    }, {
        title: 'طرف قرارداد', dataIndex: 'Contractor', key: 'Contractor',
    }, {
        title: 'مبلغ کل قرارداد', dataIndex: 'total_contract_amount', key: 'total_contract_amount',
        render: (price) => numberWithCommas(price.toLocaleString('fa-IR')),
        sorter: (a, b) => a.price - b.price,
    }, {
        title: 'مبلغ پرداخت شده', dataIndex: 'paid_amount', key: 'paid_amount',
        render: (price) => numberWithCommas(price.toLocaleString('fa-IR')),
        sorter: (a, b) => a.price - b.price,
    }, {
        title: 'تاریخ', dataIndex: 'document_date', key: 'document_date',
        render: (date) => {
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

        api().url(`/api/contract/?page=${tableParams.pagination.current}`).get().json().then((res) => {
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


            <Contract_Doc Fdata={data} selectedid={selectedid} modal={handleModalChange} remove={remove_item}
                          location={location}/>

        </Modal>

        <Table columns={columns} dataSource={data} pagination={tableParams.pagination}
               loading={loading} onChange={handleTableChange}/>
    </>)
};
export default App;