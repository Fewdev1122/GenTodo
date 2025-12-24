import React, { useState } from 'react';
import { Calendar, Brain, ListTodo, Plus, Sparkles } from 'lucide-react';

// Import Components ที่เราแยกไว้
import TaskBoard from './components/TaskBoard';
import AIAssistant from './components/AIAssistant';
import PlansOverview from './components/PlansOverview';

const AethraTaskManager = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);

  // --- Logic: สร้างแผนใหม่จาก AI ---
  const handleDeployPlan = (generatedPlan) => {
    const newPlan = {
      id: Date.now(),
      title: generatedPlan.title,
      tasks: generatedPlan.tasks.length,
      completed: 0,
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      complexity: generatedPlan.complexity
    };

    const newTasks = generatedPlan.tasks.map((task, index) => ({
      id: Date.now() + index,
      title: task.title,
      status: 'todo',
      priority: task.priority || 'medium',
      estimate: task.estimate || '1h',
      completed: false
    }));

    setPlans([newPlan, ...plans]);
    setTasks([...newTasks, ...tasks]);
    setActiveTab('plans'); // เด้งไปหน้า Plans
  };

  // --- Logic: ลบงาน ---
  const handleDeleteTask = (taskId) => {
    if (window.confirm("ต้องการลบงานนี้ใช่หรือไม่?")) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AETHRA</h1>
              <p className="text-xs text-slate-500 font-medium">AI-Powered Task Manager</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('tasks')}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all flex items-center space-x-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /><span>New Task</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex space-x-2 bg-white/50 backdrop-blur-md rounded-xl p-1.5 border border-slate-200 w-fit">
          {[
            { id: 'tasks', icon: ListTodo, label: 'Tasks' },
            { id: 'ai', icon: Brain, label: 'AI Assistant' },
            { id: 'plans', icon: Calendar, label: 'Plans' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area - เรียกใช้ Components ที่แยกไว้ */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'tasks' && (
          <TaskBoard 
            tasks={tasks} 
            setTasks={setTasks} 
            onDeleteTask={handleDeleteTask} 
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistant 
            onDeployPlan={handleDeployPlan} 
          />
        )}

        {activeTab === 'plans' && (
          <PlansOverview 
            plans={plans} 
            onSwitchToTasks={() => setActiveTab('tasks')}
            onNewPlan={() => setActiveTab('ai')}
          />
        )}
      </main>
    </div>
  );
};

export default AethraTaskManager;