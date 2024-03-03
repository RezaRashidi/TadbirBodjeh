"use client";
import { ReactElement } from "react";
import React, { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import Rename from "@/components/rename";
const jsxChildren = <p>This is a child element.</p>;
const App = () => {

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const handleUpload = () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });
    setUploading(true);
    // You can use any AJAX library you like
    fetch("https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setFileList([]);
        message.success("upload successfully.");
      })
      .catch(() => {
        message.error("upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };
  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },

    beforeUpload: (file) => {
      // file.name("sddssd");
      setFileList([...fileList, file]);
      // console.log(fileList);
      // console.log(file);
      return false;
    },
    fileList,

    // itemRender: (originNode, file,actions) => {
    //   return <Rename file={file} actions={actions}  />;
    // },
    // openFileDialogOnClick : false
  };
  return (
    <>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{
          marginTop: 16,
        }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
    </>
  );
};
export default App;

// import React, { useState } from 'react';
// import { UploadOutlined } from '@ant-design/icons';
// import { Button, Upload } from 'antd';
// const App = () => {
//   const [fileList, setFileList] = useState([
//     {
//       uid: '-1',
//       name: 'xxx.png',
//       status: 'done',
//       url: 'http://www.baidu.com/xxx.png',
//     },
//   ]);
//   const handleChange = (info) => {
//     let newFileList = [...info.fileList];
//
//     // 1. Limit the number of uploaded files
//     // Only to show two recent uploaded files, and old ones will be replaced by the new
//     newFileList = newFileList.slice(-2);
//
//     // 2. Read from response and show file link
//     newFileList = newFileList.map((file) => {
//       if (file.response) {
//         // Component will show file.url as link
//         file.url = file.response.url;
//       }
//       return file;
//     });
//     setFileList(newFileList);
//   };
//   const props = {
//     action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
//     onChange: handleChange,
//     multiple: true,
//     itemRender: (originNode, file) => (
// originNode
//           )
//   };
//   return (
//     <Upload {...props} fileList={fileList}>
//       <Button icon={<UploadOutlined />}>Upload</Button>
//     </Upload>
//   );
// };
// export default App;