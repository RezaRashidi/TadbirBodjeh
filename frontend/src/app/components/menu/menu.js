'use client'
import {AuthActions} from "@/app/auth/utils";
import {AppstoreOutlined, BookOutlined, CalculatorOutlined, DiffOutlined, SettingOutlined} from '@ant-design/icons';
import {Menu} from 'antd';
import {usePathname, useRouter} from "next/navigation";
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


const Menur = ({group}) => {
    const router = useRouter();
    const nextRouter = usePathname();


    // useEffect(() => {
    //
    // }, [nextRouter]);
    //


    const items = [
        // getItem('بودجه ریزی', 'sub3', <AppstoreOutlined/>, [
        //     getItem('فرم 5', '9'),
        //     getItem('مراکز هزینه', '12'),
        //     getItem('بودجه‌ریزی مبتنی برعملکرد', null, null, [getItem('برنامه ها', '10'),
        //         getItem('سنجه ها', '11'),
        //         getItem('فعالیت ها و ریز فعالیت ها', '13'),
        //         getItem('محرکه هزینه', '14')]),
        // ]),
        // {
        //     type: 'divider',
        // },
        getItem('حساب کاربری', 'grp',
            <SettingOutlined/>, [getItem('داشبورد', '17'),
                getItem('تغییر پسورد', '15'),
                // getItem('تنطیمات', '15'),
                getItem('خروچ', '16')]),
    ];
    const logistic = [

        getItem('تدارکات', 'sub1', <DiffOutlined/>, [
            getItem('ایجاد مدارک', 'l1'),
            getItem('لیست مدارک', 'l2'),
            getItem('ایجاد سند', 'l3'),
            getItem('لیست اسناد', 'l4'),
        ]),
        getItem('تنخواه گردان', null, <BookOutlined/>, [
                getItem('ثبت تنخواه', 'l6'),
                getItem('لیست تنخواه', 'l7'),
                getItem('گزارش تنخواه', 'l8')]),

        , {
            type: 'divider',
        },

    ]
    const financial = [
        getItem('امورمالی', 'sub2', <CalculatorOutlined/>, [
            // getItem('لیست اسناد تازه', 'l10'),
            // getItem('صدور اسناد مالی', 'l11'),
            getItem('لیست اسناد مالی', 'l12'),
        ]),
        {
            type: 'divider',
        },
        getItem('تنخواه گردان', null, <BookOutlined/>, [
            getItem('ثبت تنخواه', 'l6'),
            getItem('لیست تنخواه', 'l7'),
            getItem('گزارش تنخواه', 'l8')]),



    ]
    const budget = [
        getItem('بودجه ریزی', 'sub3', <AppstoreOutlined/>, [
            getItem('برنامه', 'l100'),
            getItem('فرم پنج', 'l101'),
            getItem('مراکز هزینه', 'l102'),

            // getItem('بودجه‌ریزی مبتنی برعملکرد', null, null, [getItem('برنامه ها', '10'),
            //     getItem('سنجه ها', '11'),
            //     getItem('فعالیت ها و ریز فعالیت ها','13'),
            // ])
        ])
    ]

    if (group && group.toString().startsWith("logistics")) {
        items.unshift(...logistic)
    } else if (group && group.toString().startsWith("financial")) {
        items.unshift(...financial)
    } else if (group && group.toString().startsWith("budget")) {
        items.unshift(...budget)
    }


    const onClick = (e) => {

        if (e.key === 'l1') router.push('/Logistics/Docs');
        if (e.key === 'l2') router.push('/Logistics/Docs_List');
        if (e.key === 'l3') router.push('/Logistics/Financial_docs');
        if (e.key === 'l4') router.push('/Logistics/Financial_List');
        if (e.key === 'l6') router.push('/Logistics/Tankhah/sabt');
        if (e.key === 'l7') router.push('/Logistics/Tankhah/list');
        if (e.key === 'l8') router.push('/Logistics/Tankhah/report');
        if (e.key === '17') router.push('/dashboard');
        if (e.key === 'l12') router.push('/Financial/Financial_List');
        if (e.key === '15') router.push('/password/reset-password');
        if (e.key === '16') handleLogout(router);
        if (e.key === 'l100') router.push('/budget/program');
        if (e.key === 'l101') router.push('/budget/form5');
        if (e.key === 'l102') router.push('/budget/costcenter');

        // console.log('click ', e);
    };


    return (
        <Menu
            onClick={onClick}
            style={{
                width: "100%",
                direction: "rtl"
            }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1', 'sub2', 'sub3']}
            mode="inline"
            items={items}
        />
    );


};
export default Menur;