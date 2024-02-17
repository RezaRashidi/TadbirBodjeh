'use client'
import React from 'react';
import {AppstoreOutlined, DiffOutlined, SettingOutlined} from '@ant-design/icons';
import {Menu} from 'antd';

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

const items = [
    getItem('تدارکات', 'sub1', <DiffOutlined/>, [
        getItem('ایجاد مدارک', 'l1'),
        getItem('لیست مدارک', 'l2'),
        getItem('ایجاد سند', 'l3'),
        getItem('لیست اسناد', 'l4'),
    ]),
    getItem('امورمالی', 'sub2', <AppstoreOutlined/>, [
        getItem('لیست اسناد تازه', '5'),
        getItem('صدور اسناد مالی', '6'),
        getItem('لیست اسناد مالی', '7'),
    ]),
    {
        type: 'divider',
    },
    getItem('بودجه ریزی', 'sub4', <SettingOutlined/>, [
        getItem('فرم 5', '9'),
        getItem('مراکز هزینه', '12'),
        getItem('بودجه‌ریزی مبتنی برعملکرد', null, null, [getItem('برنامه ها', '10'),
            getItem('سنجه ها', '11'),
            getItem('فعالیت ها و ریز فعالیت ها', '12'),
            getItem('محرکه هزینه', '12')]),

    ]),
    getItem('حساب کاربری', 'grp', null, [getItem('تنطیمات', '13')]),
];
const Menur = () => {
    const onClick = (e) => {
        console.log('click ', e);
    };
    return (
        <Menu
            onClick={onClick}
            style={{
                width: 256,
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