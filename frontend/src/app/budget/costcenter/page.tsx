"use client";
import React, {useEffect} from 'react';
import {api} from "@/app/fetcher";

export default function Program() {
    api().url(`/api/organization`).get().json().then((res) => {

    });
    useEffect(() => {
        // fetchData();
        // console.log("useEffect");
    }, []);
    return (
        <div>
            <h1>مرکز هزینه</h1>
        </div>
    );
}