"use client";
import {ConfigProvider, DatePicker, Space} from "antd";
import locale from "antd/es/locale/fa_IR";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import updateLocale from "dayjs/plugin/updateLocale";
import React from "react";

dayjs.extend(updateLocale);
dayjs.updateLocale("fa-ir", {
    weekStart: 0
});

const App = () => (
    <ConfigProvider locale={locale}>
        <Space direction="vertical">
            <DatePicker/>
            <DatePicker picker="week"/>
            <DatePicker picker="month"/>
            <DatePicker picker="quarter"/>
            <DatePicker picker="year"/>
        </Space>
    </ConfigProvider>
);

export default App;