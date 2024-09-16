"use client";
import React from 'react';
import {Button, Space} from "antd";
import {PlusOutlined} from "@ant-design/icons";

export default function Program() {
    return (
        <div>
            <h1>فرم 5</h1>

            <Space>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}

                    // onClick={
                    // () => showModal({
                    //         name: "",
                    //         type: 0, id: null, title: "معاونت/دانشکده"
                    //     })
                    // }
                >
                    ایجاد سرفصل
                </Button>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}

                    //      onClick={
                    // () => showModal({
                    //         name: "",
                    //         type: 1, id: null, title: "واحد"
                    //     })
                    //}
                >
                    ایجاد موضوع
                </Button>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}

                    //onClick={
                    // () => showModal({
                    //     name: "",
                    //     type: 2, id: null, title: "واحد تابعه"
                    // })
                    //}
                >
                    ایجاد ردیف
                </Button>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}

                    //onClick={
                    // () => showModal({
                    //     name: "",
                    //     type: 2, id: null, title: "واحد تابعه"
                    // })
                    //}
                >
                    ایجاد زیرردیف
                </Button>
            </Space>
        </div>
    );
}