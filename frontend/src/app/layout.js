import Menur from "@/components/menu/menu";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {Inter} from "next/font/google";
import "@/styles/globals.css";
import Image from 'next/image'
import arm from '../images/Arm.jpg'

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "تدبیر بودجه", description: "پروژه تدبیر بودجه  دانشگاه هنر اسلامی تبریز",
};

export default function RootLayout({children}) {
    return (

        <html lang="en" dir="rtl">
    <body className={`${inter.className} bg-slate-200`}>
    <AntdRegistry>
        <div className="flex bg-slate-200  flex-row pt-10 px-20 justify-between items-start	">
            <div className="basis-2/12 pl-6">
                <div className={"bg-white"}><Image
                    src={arm}
                    alt="Picture of the author"
                    className={"p-5"}
                />
                </div>
                
                <Menur className={"p-10"}/>
            </div>

            <div className="basis-10/12 bg-white py-10 px-16  ">{children}</div>


        </div>


    </AntdRegistry>
    </body>
    </html>);
}