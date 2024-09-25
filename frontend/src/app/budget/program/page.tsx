"use client";
import React from 'react';
import {Button, Space} from "antd";
import {PlusOutlined} from "@ant-design/icons";

export default function Program() {
    return (
        <div>
            <h1>برنامه</h1>
            <Space>
                <Button type="primary" size="middle" icon={<PlusOutlined/>}
                    // onClick={
                    //     () => showModal({
                    //         name: "",
                    //         type: 0, id: null, title: "سرفصل"
                    //     })
                    // }
                >
                    ایجاد برنامه
                </Button>
            </Space>
        </div>
    );
}