"use client";

import {fetcher} from "@/app/fetcher";
import {AuthActions} from "@/app/auth/utils";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useRefreshLayout} from "@/app/layout";


interface DashboardProps {
    refresh: () => void;
}

export default function Dashbord() {
    const router = useRouter();
    let [user, set_user] = useState<any>()
    const refreshLayout = useRefreshLayout(); // Use the context hook
    // const {data: user} = useSWR("/auth/users/me", fetcher);
    useEffect(() => {

        fetcher("/get_user_info").then((data) => {
            // Call the refreshLayout function
            //console.log(data)
            set_user(data)
            Cookies.set("username", data.name);
            refreshLayout();
        })

    }, [])


    const handleLogout = () => {
        const {logout, removeTokens} = AuthActions();
        logout()
            .res(() => {
                removeTokens();
                router.push("/");
            })
            .catch(() => {
                removeTokens();
                router.push("/");
            });
    };
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-center">
                <h1 className="text-2xl font-bold mb-4">درود, {user?.name}!</h1>
                <p className="mb-4"> مشخصات حساب کاربری:</p>
                <ul className="mb-4">
                    <li>username: {user?.username}</li>
                </ul>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                    Disconnect
                </button>
            </div>
        </div>
    );
}