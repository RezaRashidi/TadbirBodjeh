"use client"
import Menur from "@/app/components/menu/menu";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {ConfigProvider} from "antd";
import fa_IR from "antd/lib/locale/fa_IR";
import "@/styles/globals.css";
import Cookies from "js-cookie";
import localFont from 'next/font/local'
import Image from 'next/image'
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
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

export default function RootLayout({children, metadata = Metadata}) {
    const nextRouter = usePathname();
    const [username, setUsername] = useState(null);

    useEffect(() => {
        // console.log(nextRouter)
        // console.log(Cookies.get("username"))
        setUsername(Cookies.get("username"));
    }, [nextRouter]);
    return (

        <html lang="en" dir="rtl">
        <ConfigProvider locale={fa_IR} direction="rtl" theme={{
            token: {
                fontFamily: "Yekan",

            }
        }}>
            <body className={` bg-slate-200 `}>
            <AntdRegistry>
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

                        <Menur className={"p-10"}/>
                    </div>
                    <div className={`basis-10/12 bg-white py-10 px-16 yekan`}>{children}</div>
                </div>


            </AntdRegistry>
            </body>
        </ConfigProvider>
        </html>);
}