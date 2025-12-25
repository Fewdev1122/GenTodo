import React from 'react';
import { Calendar, Plus } from 'lucide-react';

// รับ props จากตัวแม่ (user, events, onLogin)
const RealCalendarView = ({ user, events, onLogin, onAddEvent }) => {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex gap-2 items-center text-slate-700">
          <Calendar className="text-blue-600"/> Google Calendar
        </h2>
        
        {/* ถ้ายังไม่ล็อกอิน ให้โชว์ปุ่ม */}
        {!user && (
          <button onClick={onLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md flex gap-2 items-center">
             Sign in with Google
          </button>
        )}
      </div>

      {user ? (
        <div className="space-y-3">
           {/* ปุ่มเพิ่ม Event แบบ Manual */}
           <button onClick={onAddEvent} className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 flex justify-center gap-2 items-center mb-4">
             <Plus size={18}/> Add Custom Event
           </button>

           {/* รายการ Events */}
           {events.length > 0 ? (
             events.map(ev => (
               <div key={ev.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-all">
                 <div className="w-1 bg-blue-500 rounded-full"></div>
                 <div className="overflow-hidden">
                   <div className="font-semibold text-slate-700 truncate">{ev.summary}</div>
                   <div className="text-xs text-slate-500">
                     {ev.start.dateTime ? new Date(ev.start.dateTime).toLocaleString() : 'All Day'}
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center text-slate-400 py-10">No upcoming events found.</div>
           )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
           <p className="text-slate-500">Please sign in to view your schedule.</p>
        </div>
      )}
    </div>
  );
};

export default RealCalendarView;