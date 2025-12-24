import React, { useState } from 'react';
import { Calendar, Brain, ListTodo, Plus, GripVertical, Play, Clock, Target, Sparkles, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { generateProjectPlan } from './services/aiService';

const AethraTaskManager = () => {
  // --- 1. States Management ---
  const [activeTab, setActiveTab] = useState('tasks');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // ข้อมูล Tasks (หน้าบอร์ด)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design login UI', status: 'todo', priority: 'high', estimate: '2h', completed: false },
    { id: 2, title: 'Setup authentication API', status: 'todo', priority: 'high', estimate: '4h', completed: false },
  ]);

  // ข้อมูล Plans (หน้าโครงการ)
  const [plans, setPlans] = useState([
    { id: 1, title: 'Auth System', tasks: 5, completed: 2, priority: 'high', deadline: '2025-01-15', complexity: 'complex' },
  ]);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-50' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  // --- 2. AI Logic ---
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateProjectPlan(aiPrompt);
      setGeneratedPlan(result);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ AI หรือ API Key ไม่ถูกต้อง");
    } finally {
      setIsGenerating(false);
    }
  };

  // ฟังก์ชันสำคัญ: ย้ายแผนงานจาก AI เข้าสู่ระบบจริง
  const handleStartPlan = () => {
    if (!generatedPlan) return;

    // 1. สร้างโครงการใหม่ในหน้า Plans
    const newPlan = {
      id: Date.now(),
      title: generatedPlan.title,
      tasks: generatedPlan.tasks.length,
      completed: 0,
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 วัน
      complexity: generatedPlan.complexity
    };

    // 2. แตก Task ย่อยๆ เข้าไปในบอร์ด Tasks
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
    
    // 3. Clear หน้า AI และย้ายไปหน้า Task Board
    setGeneratedPlan(null);
    setAiPrompt('');
    setActiveTab('tasks');
  };

  // --- 3. Drag & Drop Logic ---
  const handleDragStart = (e, task) => { setDraggedTask(task); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(tasks.map(task => task.id === draggedTask.id ? { ...task, status } : task));
      setDraggedTask(null);
    }
  };

  // --- 4. Helper Functions ---
  const getPriorityColor = (p) => {
    const colors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-green-600 bg-green-50' };
    return colors[p] || 'text-gray-600 bg-gray-50';
  };

  const getComplexityColor = (c) => {
    const colors = { complex: 'text-purple-600', moderate: 'text-blue-600', simple: 'text-green-600' };
    return colors[c] || 'text-gray-600';
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
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all flex items-center space-x-2 text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
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
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* VIEW: Tasks Board */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => (
              <div key={column.id} className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200/60 min-h-[600px]">
                <h3 className="font-bold text-slate-700 mb-4 px-2 flex justify-between">
                  {column.title}
                  <span className="bg-white px-2 py-0.5 rounded-md text-xs shadow-sm border border-slate-200">{tasks.filter(t => t.status === column.id).length}</span>
                </h3>
                <div className="space-y-3" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)}>
                  {tasks.filter(t => t.status === column.id).map(task => (
                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-slate-400 mt-4">
                        <Clock className="w-3 h-3 mr-1" /> {task.estimate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: AI Assistant */}
        {activeTab === 'ai' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Build your vision.</h2>
                <p className="text-slate-500">Describe what you want to build, AETHRA will handle the architecture.</p>
              </div>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your project (e.g., A real-time chat app with Next.js and Socket.io)"
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-0 transition-all min-h-[150px] mb-6 outline-none"
              />

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all ${isGenerating ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
              >
                {isGenerating ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{isGenerating ? 'Analyzing Requirements...' : 'Generate Intelligent Plan'}</span>
              </button>

              {generatedPlan && (
                <div className="mt-10 pt-10 border-t border-slate-100 animate-in fade-in zoom-in duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">✨ {generatedPlan.title}</h3>
                    <span className={`font-bold text-sm uppercase ${getComplexityColor(generatedPlan.complexity)}`}>{generatedPlan.complexity}</span>
                  </div>
                  <div className="space-y-3 mb-8">
                    {generatedPlan.tasks.map((t, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                        <span className="font-medium">{t.title}</span>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded shadow-sm">{t.estimate}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleStartPlan} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4 fill-current" />
                    <span>Deploy to Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: Plans */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{plan.title}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getPriorityColor(plan.priority)}`}>{plan.priority}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all" style={{ width: `${(plan.completed / plan.tasks) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-3 text-xs text-slate-400 font-medium">
                  <span>{plan.completed} / {plan.tasks} Tasks Completed</span>
                  <span>Due: {plan.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AethraTaskManager;