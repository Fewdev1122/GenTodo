import React from 'react';
import { Calendar, ListTodo, Play, Plus, History, RotateCcw, CheckCircle2, Trash2 } from 'lucide-react'; // 👈 เพิ่ม Trash2

const PlansOverview = ({ plans = [], onSwitchToTasks, onNewPlan, onRestartPlan, onDeletePlan }) => { // 👈 รับ onDeletePlan มาด้วย

  const activePlans = plans.filter(p => p.status !== 'completed');
  const historyPlans = plans.filter(p => p.status === 'completed');

  const getPriorityColor = (complexity) => {
    const map = { 
      'High': 'text-red-600 bg-red-50', 'Complex': 'text-red-600 bg-red-50',
      'Moderate': 'text-yellow-600 bg-yellow-50', 'Medium': 'text-yellow-600 bg-yellow-50',
      'Low': 'text-green-600 bg-green-50', 'Simple': 'text-green-600 bg-green-50'
    };
    return map[complexity] || 'text-slate-600 bg-slate-50';
  };

  const renderPlanCard = (plan, isHistory = false) => {
    let features = plan.features || [];
    if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch (e) { features = []; }
    }
    const allTasks = features.flatMap(f => f.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => (t.status || '').toLowerCase() === 'done').length;
    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    return (
      <div key={plan.id} className={`rounded-xl shadow-sm border p-6 transition-all relative group ${isHistory ? 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100' : 'bg-white border-slate-200 hover:shadow-md'}`}>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`text-xl font-semibold ${isHistory ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{plan.title}</h3>
              {!isHistory && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(plan.complexity)}`}>
                    {plan.complexity || 'General'}
                  </span>
              )}
              {isHistory && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                  </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1">
                <ListTodo className="w-4 h-4" />
                <span>{completedTasks}/{totalTasks} tasks</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 🔥 ปุ่มลบ (จะโชว์เมื่อเอาเมาส์ไปชี้ หรืออยู่บนมือถือ) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Plan"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            {isHistory ? (
                <button
                onClick={() => onRestartPlan(plan.id)}
                className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center space-x-2 font-medium shadow-sm"
                >
                <RotateCcw className="w-4 h-4" /> <span>Again</span>
                </button>
            ) : (
                <button
                onClick={() => onSwitchToTasks(plan)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
                >
                <Play className="w-4 h-4" /> <span>Work</span>
                </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${isHistory ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
              style={{ width: `${isHistory ? 100 : progress}%` }} 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Plans</h2>
            <p className="text-slate-500">Active projects</p>
          </div>
          <button onClick={onNewPlan} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>New Plan</span>
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {activePlans.length > 0 ? activePlans.map(p => renderPlanCard(p, false)) : (
             <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">No active plans.</div>
          )}
        </div>
      </div>

      {historyPlans.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
           <div className="flex items-center space-x-2 text-slate-800">
              <History className="w-5 h-5" />
              <h2 className="text-xl font-bold">History</h2>
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