import React, { useState, useEffect } from 'react'; // อย่าลืม useEffect
import { Calendar, Clock, AlertCircle, RefreshCw, CheckCircle2, Loader2, Sparkles, Lock } from 'lucide-react';

// --- Mock Data (ใช้ตอนเริ่มครั้งแรกสุด หรือ Reset) ---
const googleEventsMock = [
  { id: 'g1', day: 0, start: 9, duration: 2, title: 'Team Meeting', type: 'google' },
  { id: 'g2', day: 0, start: 12, duration: 1, title: 'Lunch', type: 'google' },
  { id: 'g3', day: 1, start: 10, duration: 3, title: 'Workshop', type: 'google' },
];

const initialTasksMock = [
  { id: 't1', title: 'Design Dashboard', duration: 3, status: 'pending', deadline: 2 }, 
  { id: 't2', title: 'Login API', duration: 4, status: 'pending', deadline: 3 },
];

const SmartCalendarView = () => {
  // --------------------------------------------------------
  // ✅ 1. ส่วนโหลดข้อมูลเก่า (Load Data)
  // --------------------------------------------------------
  
  // โหลด Tasks
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('my_tasks');
    return saved ? JSON.parse(saved) : initialTasksMock;
  });

  // โหลด Schedule (ตารางงาน)
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('my_schedule');
    return saved ? JSON.parse(saved) : [];
  });

  // โหลดสถานะ Login
  const [isGoogleSynced, setIsGoogleSynced] = useState(() => {
    return localStorage.getItem('is_google_synced') === 'true';
  });

  // State อื่นๆ (ไม่ต้องจำ)
  const [isSyncing, setIsSyncing] = useState(false);           
  const [isCalculated, setIsCalculated] = useState(schedule.length > 0); // ถ้ามีตารางงานเก่า ก็ถือว่าคำนวณแล้ว
  const [missedWorkMode, setMissedWorkMode] = useState(false); 

  // --------------------------------------------------------
  // ✅ 2. ส่วนบันทึกข้อมูล (Save Data)
  // --------------------------------------------------------
  useEffect(() => { localStorage.setItem('my_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('my_schedule', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem('is_google_synced', isGoogleSynced); }, [isGoogleSynced]);

  // --------------------------------------------------------
  // ฟังก์ชันเดิม (Logic)
  // --------------------------------------------------------

  const handleGoogleLogin = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsGoogleSynced(true);
      // ถ้ายังไม่มี Schedule ให้โหลด Google Mock เข้ามา
      if (schedule.length === 0) {
        setSchedule(googleEventsMock); 
      }
      alert("Synced with Google Calendar!");
    }, 1500);
  };

  const autoSchedule = () => {
    if (!isGoogleSynced) return alert("Please connect Google Calendar first.");
    
    // เริ่มต้นด้วย Event ของ Google (หรือของเดิมที่มีอยู่แล้วที่เป็น type google)
    let currentSchedule = schedule.filter(s => s.type === 'google');
    if (currentSchedule.length === 0) currentSchedule = [...googleEventsMock];

    let plannedTasks = [];
    const sortedTasks = [...tasks].sort((a, b) => a.deadline - b.deadline);

    sortedTasks.forEach(task => {
      let allocated = false;
      let day = 0;
      while (!allocated && day < 5) {
        for (let hour = 9; hour <= 18 - task.duration; hour++) {
          const isBusy = currentSchedule.some(ev => 
            ev.day === day && 
            ((hour >= ev.start && hour < ev.start + ev.duration) || 
             (ev.start >= hour && ev.start < hour + task.duration))
          );
          if (!isBusy) {
            const newEvent = {
              id: `plan-${task.id}`, day: day, start: hour, duration: task.duration,
              title: task.title, type: 'planned', taskId: task.id
            };
            currentSchedule.push(newEvent);
            plannedTasks.push(newEvent);
            allocated = true;
            break;
          }
        }
        day++;
      }
    });
    setSchedule(currentSchedule);
    setIsCalculated(true);
    setMissedWorkMode(false);
  };

  const simulateMissedWork = () => setMissedWorkMode(true);
  
  const fixSchedule = () => {
     setTimeout(() => { autoSchedule(); alert("Schedule Fixed!"); }, 500);
  };

  // ปุ่ม Reset ข้อมูล (เผื่อเล่นจนเละ)
  const clearData = () => {
      if(confirm('Reset all data?')) {
          localStorage.clear();
          window.location.reload();
      }
  }

  const renderDayColumn = (dayIndex, dayName) => {
    return (
      <div className="flex-1 min-w-[140px] border-r border-slate-200 bg-slate-50 relative h-[600px]">
        <div className="sticky top-0 z-10 bg-white p-2 border-b text-center font-bold text-slate-700">{dayName}</div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute w-full border-t border-slate-200 text-[10px] text-slate-400 pl-1" style={{ top: `${i * 60}px` }}>{9 + i}:00</div>
        ))}
        {!isGoogleSynced && dayIndex === 0 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">Locked</div>
        )}
        {schedule.filter(ev => ev.day === dayIndex).map((ev, idx) => {
           const top = (ev.start - 9) * 60; 
           const height = ev.duration * 60;
           const isMissed = missedWorkMode && ev.type === 'planned' && ev.day === 0;
           return (
             <div key={idx} className={`absolute inset-x-1 rounded p-1 text-xs font-bold border shadow-sm transition-all overflow-hidden
                 ${ev.type === 'google' ? 'bg-white border-blue-500 border-l-4 text-slate-600' : isMissed ? 'bg-red-100 border-red-300 text-red-700 animate-pulse' : 'bg-indigo-600 text-white'}`}
               style={{ top: `${top}px`, height: `${height}px` }}>
               {ev.title}
             </div>
           );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 p-4 font-sans">
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-indigo-600" /> Smart Planner</h1>
        <div className="flex gap-2">
          <button onClick={clearData} className="text-xs text-red-400 hover:text-red-600 underline px-2">Reset</button>
          {!isGoogleSynced ? (
            <button onClick={handleGoogleLogin} disabled={isSyncing} className="bg-white border px-3 py-1 rounded flex items-center gap-2">
              {isSyncing ? <Loader2 className="animate-spin w-4 h-4"/> : "Connect Google"}
            </button>
          ) : (
            <>
            {!isCalculated ? <button onClick={autoSchedule} className="bg-indigo-600 text-white px-3 py-1 rounded shadow">Auto-Plan</button>
            : <><button onClick={simulateMissedWork} className="border px-3 py-1 rounded">Demo Delay</button>
              {missedWorkMode && <button onClick={fixSchedule} className="bg-green-600 text-white px-3 py-1 rounded animate-bounce">Fix</button>}
            </>}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-64 bg-white rounded-lg p-3 border shadow-sm overflow-y-auto">
          <h2 className="font-bold mb-3">Tasks</h2>
          {tasks.map(t => (
            <div key={t.id} className={`p-3 mb-2 rounded border ${schedule.some(s => s.taskId === t.id) ? 'opacity-50 line-through bg-slate-100' : 'bg-white'}`}>
              <div className="font-semibold text-sm">{t.title}</div>
              <div className="text-xs text-slate-500 mt-1">{t.duration}h • Deadline: {t.deadline}d</div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-white rounded-lg border shadow-sm flex overflow-x-auto relative">
           <div className="w-12 border-r bg-white">{/* Time Axis Mock */}</div>
           {renderDayColumn(0, "Today")}{renderDayColumn(1, "Tomorrow")}{renderDayColumn(2, "Wed")}{renderDayColumn(3, "Thu")}
        </div>
      </div>
    </div>
  );
};

export default SmartCalendarView;