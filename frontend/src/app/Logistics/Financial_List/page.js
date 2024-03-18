"use client";
import {Table} from "antd";
import React, {useEffect, useState} from "react";

const columns = [
    {
        title: 'نام سند',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a>{text}</a>,
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

const App = () => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
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
    return (<Table columns={columns} dataSource={data} pagination={tableParams.pagination}
                   loading={loading} onChange={handleTableChange}/>)
};
export default App;