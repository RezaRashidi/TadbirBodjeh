import Menur from "@/app/components/menu/menu";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {ConfigProvider} from "antd";
import fa_IR from "antd/lib/locale/fa_IR";
import "@/styles/globals.css";
import localFont from 'next/font/local'
import Image from 'next/image'
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
export const metadata = {
    title: "تدبیر بودجه", description: "پروژه تدبیر بودجه  دانشگاه هنر اسلامی تبریز",
};

export default function RootLayout({children}) {
    // console.log("myFont.classNames")
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