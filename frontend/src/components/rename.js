"use client";
import React, {useState} from "react";
import {Upload} from "antd";

/**
 * @param {UploadFile} file
@param { download: function, preview: function, remove: function } actions
 */
export default function Rename({file,actions}) {

        return <>
                {file.name}
        </>


}