import Image from "next/image";
import { Button } from "antd";
import { Table } from "antd";
import Link from "next/link";

const dataSource = [
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
];

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <Link href="/about">About</Link>
      </div>
      <Table dataSource={dataSource} columns={columns} />;
      <h1 style={{ color: "red" }}>REZA RASHIDI</h1>
    </main>
  );
}