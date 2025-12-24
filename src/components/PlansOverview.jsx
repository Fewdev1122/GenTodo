import React from 'react';
import { Calendar, ListTodo, Play, Plus } from 'lucide-react';

const PlansOverview = ({ plans, onSwitchToTasks, onNewPlan }) => {
  
  const getPriorityColor = (p) => {
    const colors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-green-600 bg-green-50' };
    return colors[p] || 'text-gray-600 bg-gray-50';
  };

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
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-800">{plan.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(plan.priority)}`}>{plan.priority}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span className="flex items-center space-x-1"><ListTodo className="w-4 h-4" /><span>{plan.completed}/{plan.tasks} tasks</span></span>
                  <span className="flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>Due {plan.deadline}</span></span>
                </div>
              </div>
              <button
                onClick={onSwitchToTasks}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
              >
                <Play className="w-4 h-4" /> <span>Work on Tasks</span>
              </button>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(plan.completed / plan.tasks) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">No active plans.</div>
        )}
      </div>
    </div>
  );
};

export default PlansOverview;