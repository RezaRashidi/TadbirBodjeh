'use client'
import React from 'react';
import { DatePicker } from "zaman";

const App = () => {
  return (
    <div>

    <DatePicker inputClass="border-2 rounded-md "round="x4"  onChange={(e) => console.log(e.value)} />

    </div>

  );
};
export default App;