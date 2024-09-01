"use client"
import Menur from "@/app/components/menu/menu";
import {api, fetcher, getGroup} from "@/app/fetcher";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {ConfigProvider, message} from "antd";
import fa_IR from "antd/lib/locale/fa_IR";
import "@/styles/globals.css";
import Cookies from "js-cookie";
import localFont from 'next/font/local'
import Image from 'next/image'
import {usePathname, useRouter} from "next/navigation";
import React, {createContext, useContext, useEffect, useState} from "react";
import arm from '../images/Arm.jpg'

// const inter = Inter({subsets: ["latin"]});
const yekan = localFont({

    src: [
        {
            path: '../Fonts/Yekan.ttf',
            weight: '400',
            style: 'normal'
            , preload: "true"
        },
        {
            path: '../Fonts/Yekan.eot',
            weight: '400',
            style: 'normal'
            , preload: "true"
        },
        {
            path: '../Fonts/Yekan.woff',
            weight: '400',
            style: 'normal'
            , preload: "true"
        },
    ]

})
const Metadata = {
    title: "تدبیر بودجه", description: "پروژه تدبیر بودجه  دانشگاه هنر اسلامی تبریز",
};
const RefreshLayoutContext = createContext();
export const useRefreshLayout = () => useContext(RefreshLayoutContext);

export const RefreshLayoutProvider = ({children, value}) => (
    <RefreshLayoutContext.Provider value={value}>
        {children}
    </RefreshLayoutContext.Provider>
);

export default function RootLayout({children, metadata = Metadata}) {
    const nextRouter = usePathname();
    const [username, setUsername] = useState("");
    const [group, set_group] = useState("")
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [key, setKey] = useState(0);
    const router = useRouter();

    const refreshLayout = () => {
        setUsername(Cookies.get("username"));
        set_group(Cookies.get("group"));
        setIsLoggedIn(Cookies.get("login") === "1");
    };
    useEffect(() => {
        // console.log(nextRouter)
        // console.log(Cookies.get("username"))


        //بعدا حذف شود
        if (Cookies.get("login") === "1" && !Cookies.get("group")) {
            getGroup().then((value) => {
                Cookies.set("group", value.toString());
                set_group(Cookies.get("group"));
            })
        }
        //بعدا حذف شود
        if (Cookies.get("login") === "1" && !Cookies.get("admin")) {
            fetcher("/get_user_info").then((data) => {
                Cookies.set("username", data.name);

            })
        }
        if ((Cookies.get("login") === "1") && (Cookies.get("group") === "Logistics" || Cookies.get("group") === "Financial")) {
            api().url(`/api/pettycash/?get_nulls=true`).get().json().then(
            (res) => {
                console.log(res)
                if (res.count > 0) {
                    message.info("تنخواهی برای بررسی موجود است", 10)
                    router.push('/Logistics/Tankhah/list');
                }

            }
        )
        }
        setIsLoggedIn(Cookies.get("login") === "1");
        set_group(Cookies.get("group"));
        //////////
        setUsername(Cookies.get("username"));
    }, []);
    return (

        <html lang="en" dir="rtl">
        <ConfigProvider locale={fa_IR} direction="rtl" theme={{
            token: {
                fontFamily: "Yekan",

            }
        }}>
            <body className={` bg-slate-200 `}>
            <AntdRegistry>
                <RefreshLayoutProvider value={refreshLayout}> {/* Provide the context */}

                    <div className="flex bg-slate-200  flex-row pt-10 px-20 justify-between items-start	">
                        <div className="basis-2/12 pl-6">
                            <div className={"bg-white"}>
                                <p className={"text-center"}>{username || ''}</p>
                                <Image
                                    src={arm}
                                    alt="Picture of the author"
                                    className={"p-5"}
                                />
                            </div>

                            {isLoggedIn && <Menur className={"p-10"} group={group}/>}
                        </div>
                        <div className={`basis-10/12 bg-white py-10 px-16 yekan`}>{children}</div>
                    </div>

                </RefreshLayoutProvider>

            </AntdRegistry>
            </body>
        </ConfigProvider>
        </html>);
}