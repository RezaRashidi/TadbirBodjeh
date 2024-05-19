'use client'
import {AuthActions} from "@/app/auth/utils";
import {AppstoreOutlined, CalculatorOutlined, DiffOutlined, SettingOutlined} from '@ant-design/icons';
import {Menu} from 'antd';
import {useRouter} from "next/navigation";
import React from 'react';

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

const handleLogout = (x) => {
    const {logout, removeTokens} = AuthActions();
    logout()
        .res(() => {
            removeTokens();
            x.push("/");
        })
        .catch(() => {
            removeTokens();
            x.push("/");
        });
};

const items = [
    getItem('تدارکات', 'sub1', <DiffOutlined/>, [
        getItem('ایجاد مدارک', 'l1'),
        getItem('لیست مدارک', 'l2'),
        getItem('ایجاد سند', 'l3'),
        getItem('لیست اسناد', 'l4'),
        getItem('تنخواه گردان', null, null, [
            getItem('ثبت تنخواه', 'l6'),
            getItem('لیست تنخواه', 'l7'),
            getItem('گزارش تنخواه', 'l8')]),

    ]), {
        type: 'divider',
    },
    getItem('امورمالی', 'sub2', <CalculatorOutlined/>, [
        getItem('لیست اسناد تازه', '5'),
        getItem('صدور اسناد مالی', '6'),
        getItem('لیست اسناد مالی', '7'),
    ]),
    {
        type: 'divider',
    },
    getItem('بودجه ریزی', 'sub4', <AppstoreOutlined/>, [
        getItem('فرم 5', '9'),
        getItem('مراکز هزینه', '12'),
        getItem('بودجه‌ریزی مبتنی برعملکرد', null, null, [getItem('برنامه ها', '10'),
            getItem('سنجه ها', '11'),
            getItem('فعالیت ها و ریز فعالیت ها', '13'),
            getItem('محرکه هزینه', '14')]),
    ]),
    {
        type: 'divider',
    },
    getItem('حساب کاربری', 'grp',
        <SettingOutlined/>, [getItem('داشبورد', '17'), getItem('تنطیمات', '15'), getItem('خروچ', '16')]),
];
const Menur = () => {
    const router = useRouter()
    const onClick = (e) => {

        if (e.key === 'l1') router.push('/Logistics/Docs');
        if (e.key === 'l2') router.push('/Logistics/Docs_List');
        if (e.key === 'l3') router.push('/Logistics/Financial_docs');
        if (e.key === 'l4') router.push('/Logistics/Financial_List');
        if (e.key === 'l6') router.push('/Logistics/Tankhah/sabt');
        if (e.key === 'l7') router.push('/Logistics/Tankhah/list');
        if (e.key === 'l8') router.push('/Logistics/Tankhah/report');
        if (e.key === '17') router.push('/dashboard');
        if (e.key === '16') handleLogout(router);

        console.log('click ', e);
    };
    return (
        <Menu
            onClick={onClick}
            style={{
                width: "100%",
                direction: "rtl"
            }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={items}
        />
    );
};
export default Menur;