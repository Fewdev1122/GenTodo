import React from 'react';
import { 
  ListTodo, Plus, History, RotateCcw, 
  CheckCircle2, Trash2, Pause, Play, ArrowRight 
} from 'lucide-react'; 

const PlansOverview = ({ plans = [], onSwitchToTasks, onNewPlan, onRestartPlan, onDeletePlan, onTogglePausePlan }) => {

  const activePlans = plans.filter(p => p.status !== 'completed');
  const historyPlans = plans.filter(p => p.status === 'completed');

  // Helper สำหรับสีความยากง่าย
  const getPriorityColor = (complexity) => {
    const map = { 
      'High': 'text-red-600 bg-red-50', 'Complex': 'text-red-600 bg-red-50',
      'Moderate': 'text-yellow-600 bg-yellow-50', 'Medium': 'text-yellow-600 bg-yellow-50',
      'Low': 'text-green-600 bg-green-50', 'Simple': 'text-green-600 bg-green-50'
    };
    return map[complexity] || 'text-slate-600 bg-slate-50';
  };

  const renderPlanCard = (plan, isHistory = false) => {
    // คำนวณ Progress
    let features = plan.features || [];
    if (typeof features === 'string') { try { features = JSON.parse(features); } catch (e) { features = []; } }
    const allTasks = features.flatMap(f => f.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => (t.status || '').toLowerCase() === 'done').length;
    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    const isPaused = plan.status === 'paused';

    return (
      <div 
        key={plan.id} 
        className={`rounded-xl shadow-sm border p-6 transition-all group relative overflow-hidden
          ${isHistory ? 'bg-slate-50 border-slate-200 opacity-80' : 
            isPaused ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:shadow-md'}
        `}
      >
        {/* แถบสีด้านซ้ายบ่งบอกสถานะ */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 
            ${isHistory ? 'bg-slate-300' : isPaused ? 'bg-amber-300' : 'bg-blue-500'}`} 
        />

        <div className="flex items-start justify-between mb-4 pl-2">
          {/* ข้อมูล Plan */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`text-xl font-bold tracking-tight ${isHistory || isPaused ? 'text-slate-500' : 'text-slate-800'}`}>
                {plan.title}
              </h3>
              
              {!isHistory && (
                 // ถ้า Pause อยู่ ให้ขึ้นป้าย PAUSED ชัดๆ
                 isPaused ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center shadow-sm">
                        ⏸ PAUSED
                    </span>
                 ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(plan.complexity)} border-opacity-20`}>
                        {plan.complexity || 'General'}
                    </span>
                 )
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <ListTodo className="w-4 h-4" />
                <span>{completedTasks} / {totalTasks} Tasks</span>
              </span>
            </div>
          </div>
          
          {/* Action Buttons Zone */}
          <div className="flex items-center gap-3">
            
            {!isHistory && (
                <>
                {/* 🔥 Toggle Button: Pause <-> Resume */}
                <button
                    onClick={(e) => { e.stopPropagation(); onTogglePausePlan(plan.id); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border
                        ${isPaused 
                            ? 'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300' // ปุ่ม Resume
                            : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300' // ปุ่ม Pause
                        }`}
                >
                    {isPaused ? (
                        <> <Play size={18} fill="currentColor" /> Resume </>
                    ) : (
                        <> <Pause size={18} fill="currentColor" /> Pause </>
                    )}
                </button>

                {/* ปุ่ม View / Enter */}
                <button
                    onClick={() => onSwitchToTasks(plan)}
                    disabled={isPaused} // ถ้าหยุดอยู่ ห้ามกดเข้า (หรือจะให้เข้าก็ได้แล้วแต่พี่)
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white shadow-md transition-all
                        ${isPaused 
                            ? 'bg-slate-300 cursor-not-allowed text-slate-100 shadow-none' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:translate-y-px hover:shadow-lg'
                        }`}
                >
                    View <ArrowRight size={18} />
                </button>
                </>
            )}

            {isHistory && (
                <button
                onClick={() => onRestartPlan(plan.id)}
                className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-medium shadow-sm flex items-center gap-2"
                >
                <RotateCcw size={16} /> Restart
                </button>
            )}

            {/* ปุ่มลบ (ถังขยะ) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Plan"
            >
                <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pl-2">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out 
                ${isHistory ? 'bg-green-500' : isPaused ? 'bg-amber-300' : 'bg-blue-500'}`}
              style={{ width: `${isHistory ? 100 : progress}%` }} 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Projects</h2>
            <p className="text-slate-500">Manage your ongoing development plans.</p>
          </div>
          <button onClick={onNewPlan} className="bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center space-x-2 font-semibold shadow-sm">
            <Plus className="w-5 h-5" /> <span>New Plan</span>
          </button>
        </div>

        {/* List of Plans */}
        <div className="grid grid-cols-1 gap-5">
          {activePlans.length > 0 ? activePlans.map(p => renderPlanCard(p, false)) : (
             <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                No active plans found.
             </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {historyPlans.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4 opacity-75 hover:opacity-100 transition-opacity">
           <div className="flex items-center space-x-2 text-slate-700 px-2">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-bold">Completed History</h2>
           </div>
           <div className="grid grid-cols-1 gap-4">
              {historyPlans.map(p => renderPlanCard(p, true))}
           </div>
        </div>
      )}
    </div>
  );
};

export default PlansOverview;