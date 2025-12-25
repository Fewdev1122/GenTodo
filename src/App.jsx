import React from 'react';
// 👇 เปลี่ยนจาก SmartCalendarView เป็น RealCalendarView (ไฟล์ใหม่ที่เราเพิ่งใส่ Key)
import RealCalendarView from './RealCalendarView'; 

function App() {
  return (
    <div className="App">
      {/* 👇 เรียกใช้ตัวใหม่ */}
      <RealCalendarView /> 
    </div>
  );
}

export default App;