import React from 'react';
import { Calendar, ListTodo, Play, Plus } from 'lucide-react';

const PlansOverview = ({ plans = [], onSwitchToTasks, onNewPlan }) => { // ✅ ใส่ default [] กัน error

  console.log("Current Plans Data:", plans); // 🔍 ดูข้อมูลที่เข้ามาจริงใน Console (F12)

  const getPriorityColor = (complexity) => {
    const map = { 
      'High': 'text-red-600 bg-red-50', 
      'Complex': 'text-red-600 bg-red-50',
      'Moderate': 'text-yellow-600 bg-yellow-50', 
      'Medium': 'text-yellow-600 bg-yellow-50',
      'Low': 'text-green-600 bg-green-50',
      'Simple': 'text-green-600 bg-green-50'
    };
    return map[complexity] || 'text-slate-600 bg-slate-50';
  };

  // ✅ ถ้า plans ยังไม่มา หรือเป็น null ให้แสดง Loading หรือ return null ไปก่อน
  if (!plans) return <div>Loading plans...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your Plans</h2>
          <p className="text-slate-500">Active projects and their progress</p>
        </div>
        <button
          onClick={onNewPlan}
          className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plans.map(plan => {
          // 🔥 แก้ไขส่วนคำนวณให้รองรับกรณี features เป็น String หรือ JSON
          let features = plan.features || [];
          
          // 🛡️ ป้องกันกรณี Database ส่งมาเป็น String JSON
          if (typeof features === 'string') {
            try {
              features = JSON.parse(features);
            } catch (e) {
              console.error("Error parsing features:", e);
              features = [];
            }
          }

          // 1. รวม Task (ตรวจสอบว่าเป็น Array แน่ๆ ก่อน map)
          const allTasks = Array.isArray(features) 
            ? features.flatMap(f => f.tasks || []) 
            : [];
          
          // 2. นับจำนวน
          const totalTasks = allTasks.length;
          
          // 3. นับที่เสร็จ
          const completedTasks = allTasks.filter(t => t.isCompleted || t.status === 'done').length;
          
          // 4. คำนวณ %
          const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

          return (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-800">{plan.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(plan.complexity)}`}>
                      {plan.complexity || 'General'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <ListTodo className="w-4 h-4" />
                      <span>{completedTasks}/{totalTasks} tasks</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {plan.deadline 
                          ? `Due ${plan.deadline}` 
                          : `Created ${new Date(plan.created_at).toLocaleDateString()}`}
                      </span>
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onSwitchToTasks(plan)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
                >
                  <Play className="w-4 h-4" /> <span>Work on Tasks</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        {plans.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
            No active plans.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansOverview;