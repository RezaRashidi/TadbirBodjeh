"use client";
import React, {useEffect, useState} from 'react';
import {api} from "@/app/fetcher";
import {Button, Modal, Space, Table} from "antd";
import Costcenter_doc from "@/app/budget/costcenter/costcenter";
import {PlusOutlined} from "@ant-design/icons";

// interface Pagination {
//     current: number;
//     pageSize: number;
//     total?: any; // Add the total property to resolve the type issue
// }

export  type cost_doc = {
    type: number,
    id: number,
    name: string,
    title: string,
    rel_id?: number
    // data?:
}
export default function Program() {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected_data, setselected_data] = useState<cost_doc>();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1, pageSize: 10, total: 10
        },
    });
    const [update, set_update] = useState(0);

    const fetchData = () => {
        setLoading(true);
        api().url(`/api/organization?page=${tableParams.pagination.current}`).get().json().then((res) => {
            console.log(res)
            setData(res["results"])
            setLoading(false);
            setTableParams({
                ...tableParams, pagination: {
                    ...tableParams.pagination, "total": res["count"],
                    // total: data.totalCount,
                },
            });
        });
    }
    useEffect(() => {


        fetchData();
        // console.log("useEffect");
    }, [update, JSON.stringify(tableParams)]);
    const handleModalChange = (newState) => {
        setIsModalOpen(newState);
    };
    const showModal = (data: cost_doc) => {
        console.log(data)
        setselected_data(data)
        setIsModalOpen(true);
    };
    const handleUpdate = () => {
        setIsModalOpen(!isModalOpen);
        set_update(update + 1)
        console.log(update + "fffffffffffffffffffffffffffffffffffffff")
    }
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        })
    }

    const columns = [
        {
            title: 'معاونت/دانشکده',
            dataIndex: 'name',
            key: 'name',
            render: (name, rec) => <a
                onClick={() => showModal({type: 0, id: rec.id, name: rec.name, title: 'معاونت/ دانشکده'})}>{name}</a>,
        },
        {
            title: 'واحد',
            dataIndex: 'unit',
            key: 'unit',
            render: (units) => (
                <ul>
                    {units.map((unit) => (

                        <li key={unit.id}>
                            <a onClick={() => showModal({
                                type: 1,
                                id: unit.id,
                                name: unit.name,
                                rel_id: unit.organization,
                                title: 'واحد'
                            })}>
                                {unit.name}
                            </a>
                        </li>))}
                </ul>
            ),
        },
        {
            title: 'واحد تابعه',
            dataIndex: 'unit',
            key: 'sub_unit',
            render: (units) => (
                <ul>
                    {units.map((unit) => (
                        unit.sub_unit.map((subUnit) => (
                            <li key={subUnit.id}>
                                <a onClick={() => showModal({
                                    type: 2,
                                    id: subUnit.id,
                                    name: subUnit.name,
                                    rel_id: subUnit.unit,
                                    title: 'واحد تابعه'
                                })}>{subUnit.name}</a>
                            </li>

                        ))

                    ))}
                </ul>
            ),
        },
    ];
    return (
        <div>
            <h1 style={{textAlign: 'center'}}>مراکز هزینه </h1>
            <Modal title={selected_data?.title} style={{marginLeft: "-15%"}} centered open={isModalOpen}
                   onOk={handleOk} onCancel={handleCancel} footer={null} zIndex={100} width={"75%"}>
                <Costcenter_doc data={selected_data} key={selected_data?.id + selected_data?.title} onOk={handleUpdate}
                                onCancel={handleCancel}/>

            </Modal>
            <Space>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}
                        style={{background: 'linear-gradient(to right, #6a11cb, #2575fc)', border: 'none'}}
                        onClick={() => showModal({
                            name: "",
                            type: 0, id: null, title: "معاونت/دانشکده"
                        })}>
                    ایجاد معاونت/دانشکده
                </Button>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}
                        style={{background: 'linear-gradient(to right, #43e97b, #38f9d7)', border: 'none'}}
                        onClick={() => showModal({
                            name: "",
                            type: 1, id: null, title: "واحد"
                        })}>
                    ایجاد واحد
                </Button>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}
                        style={{background: 'linear-gradient(to right, #ff7e5f, #feb47b)', border: 'none'}} onClick={
                    () => showModal({
                        name: "",
                        type: 2, id: null, title: "واحد تابعه"
                    })
                }>
                    ایجاد واحد تابعه
                </Button>
            </Space>

            <Table columns={columns} dataSource={data} rowKey="id" pagination={tableParams.pagination}
                   onChange={handleTableChange}/>

        </div>
    );
}