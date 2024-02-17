import {Inter} from "next/font/google";
import "@/styles/globals.css";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import Menur from "@/app/com/menu/menu";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "تدبیر بودجه", description: "پروژه تدبیر بودجه  دانشگاه هنر اسلامی تبریز",
};

export default function RootLayout({children}) {
    return (<html lang="en">
    <body className={inter.className}>
    <AntdRegistry>
    <div>{children}</div>
    <div>  <Menur /></div>

    </AntdRegistry>
    </body>
    </html>);
}