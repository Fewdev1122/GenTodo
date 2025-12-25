import React, { useState, useEffect } from 'react';
import { Calendar, Brain, ListTodo, Plus, Sparkles, Trash2, Archive, CheckCircle, Network, LayoutList } from 'lucide-react'; // 👈 เพิ่ม Network, LayoutList

// Import Components
import TaskBoard from './components/TaskBoard';
import AIAssistant from './components/AIAssistant';
import PlansOverview from './components/PlansOverview';
import ConstellationView from './components/ConstellationView'; // 👈 Import ตัวใหม่

const AethraTaskManager = () => {
  // ================= STATE =================
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('aethra_activeTab') || 'plans');
  const [currentPlanId, setCurrentPlanId] = useState(() => localStorage.getItem('aethra_currentPlanId') || null);
  
  // 🔥 เพิ่ม State สลับโหมดมองเห็น (List หรือ Galaxy)
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'galaxy'

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('aethra_plans_data');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });
  const [tasks, setTasks] = useState([]);

  useEffect(() => { localStorage.setItem('aethra_plans_data', JSON.stringify(plans)); }, [plans]);

  // ================= RESTORE & LOGIC =================
  const getCurrentPlanData = () => {
      if (!currentPlanId) return null;
      return plans.find(p => p.id.toString() === currentPlanId.toString());
  };

  const restoreTasksFromPlan = (targetId) => {
    if (!targetId) return;
    const targetPlan = plans.find(p => p.id.toString() === targetId.toString());
    if (targetPlan) {
        if (targetPlan.status === 'completed') {
            setCurrentPlanId(null); setActiveTab('plans'); return;
        }
        if (targetPlan.features) {
            const boardTasks = targetPlan.features.flatMap(f => 
                (f.tasks || []).map(t => ({
                    ...t,
                    status: ['todo', 'in-progress', 'done'].includes((t.status||'').toLowerCase()) ? t.status.toLowerCase() : 'todo',
                    featureName: f.name
                }))
            );
            setTasks(boardTasks);
        }
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks' && currentPlanId && plans.length > 0) {
        restoreTasksFromPlan(currentPlanId);
    }
  }, [activeTab, currentPlanId]);

  const prepareTasksForBoard = (plan) => {
    if (!plan?.features) return;
    const updatedFeatures = plan.features.map((feature, fIdx) => ({
        ...feature,
        tasks: (feature.tasks || []).map((task, tIdx) => {
            if (!task.id) { return { ...task, id: `fixed-${plan.id}-${fIdx}-${tIdx}-${Date.now()}`, status: task.status || 'todo' }; }
            return task;
        })
    }));
    setPlans(prevPlans => prevPlans.map(p => p.id.toString() === plan.id.toString() ? { ...p, features: updatedFeatures } : p));
    setCurrentPlanId(plan.id);
    localStorage.setItem('aethra_currentPlanId', plan.id);
    setActiveTab('tasks');
    setViewMode('list'); // เริ่มต้นที่ List ทุกครั้ง
    localStorage.setItem('aethra_activeTab', 'tasks');
  };

  const handleTabChange = (tabId) => { setActiveTab(tabId); localStorage.setItem('aethra_activeTab', tabId); };

  const handleDeployPlan = async (aiPlan) => {
    if (!aiPlan) return;
    const featuresWithIds = (aiPlan.features || []).map((f, fIdx) => ({
        ...f, tasks: (f.tasks || []).map((t, tIdx) => ({ ...t, id: `task-${Date.now()}-${fIdx}-${tIdx}`, status: 'todo' }))
    }));
    const newProject = {
        id: Date.now(), created_at: new Date().toISOString(),
        title: aiPlan.title || "Untitled Project", description: aiPlan.description || "",
        complexity: aiPlan.complexity || "Moderate", features: featuresWithIds, user_id: "user-test-001", status: 'active'
    };
    setPlans(prev => [newProject, ...prev]);
    alert(`✅ Project Saved!`);
    setActiveTab('plans');
  };

  const handleUpdateTask = async (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (!currentPlanId) return;
    setPlans(prevPlans => prevPlans.map(p => {
            if (p.id.toString() === currentPlanId.toString()) {
                const newFeatures = p.features.map(feature => ({
                    ...feature,
                    tasks: feature.tasks.map(t => {
                        if (t.id && updatedTask.id && t.id.toString() === updatedTask.id.toString()) { return { ...t, ...updatedTask }; }
                        return t;
                    })
                }));
                return { ...p, features: newFeatures };
            }
            return p;
    }));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        if (currentPlanId) {
             setPlans(prevPlans => prevPlans.map(p => {
                if (p.id.toString() === currentPlanId.toString()) {
                    const newFeatures = p.features.map(f => ({ ...f, tasks: f.tasks.filter(t => t.id !== taskId) }));
                    return { ...p, features: newFeatures };
                }
                return p;
             }));
        }
    }
  };

  const handleArchivePlan = (planId) => {
     setPlans(prev => prev.map(p => {
        if (p.id.toString() === planId.toString()) return { ...p, status: 'completed' };
        return p;
     }));
     setTasks([]); setCurrentPlanId(null); localStorage.removeItem('aethra_currentPlanId'); setActiveTab('plans');
  };

  const handleRestartPlan = (oldPlanId) => {
    const oldPlan = plans.find(p => p.id.toString() === oldPlanId.toString());
    if (!oldPlan) return;
    if (!window.confirm(`Start "${oldPlan.title}" again?`)) return;
    const newFeatures = oldPlan.features.map((f, fIdx) => ({
        ...f, tasks: (f.tasks || []).map((t, tIdx) => ({ ...t, status: 'todo', isCompleted: false, id: `restart-${Date.now()}-${fIdx}-${tIdx}` }))
    }));
    const newPlan = { ...oldPlan, id: Date.now(), created_at: new Date().toISOString(), title: `${oldPlan.title} (Restarted)`, status: 'active', features: newFeatures };
    setPlans(prev => [newPlan, ...prev]); alert("✅ Plan Restarted!");
  };

  const handleClearCompleted = () => {
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const totalCount = tasks.length;
    if (doneCount === 0) return;
    if (doneCount === totalCount && totalCount > 0) {
        if (window.confirm(`🎉 All tasks completed! Move to History?`)) { handleArchivePlan(currentPlanId); return; }
    }
    if (window.confirm(`Clear ${doneCount} completed tasks?`)) {
        setTasks(prev => prev.filter(t => t.status !== 'done'));
        if (currentPlanId) {
            setPlans(prevPlans => prevPlans.map(p => {
                if (p.id.toString() === currentPlanId.toString()) {
                    const newFeatures = p.features.map(f => ({ ...f, tasks: (f.tasks || []).filter(t => t.status !== 'done') }));
                    return { ...p, features: newFeatures };
                }
                return p;
            }));
        }
    }
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm("⚠️ Delete this plan permanently?")) {
        setPlans(prev => prev.filter(p => p.id.toString() !== planId.toString()));
        if (currentPlanId && currentPlanId.toString() === planId.toString()) {
            setCurrentPlanId(null); setTasks([]); localStorage.removeItem('aethra_currentPlanId');
        }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 font-sans">
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
          <div className="flex items-center space-x-2">
            
            {/* 🔥 ปุ่มสลับโหมด View (List vs Galaxy) จะโชว์เฉพาะหน้า Tasks */}
            {activeTab === 'tasks' && currentPlanId && (
                <div className="flex bg-slate-100 p-1 rounded-lg mr-2 border border-slate-200">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('galaxy')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'galaxy' ? 'bg-slate-800 shadow-sm text-yellow-400' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Constellation View"
                    >
                        <Network className="w-4 h-4" />
                    </button>
                </div>
            )}

            {activeTab === 'tasks' && tasks.some(t => t.status === 'done') && (
                <button onClick={handleClearCompleted} className={`border px-3 py-2 rounded-lg transition-all flex items-center space-x-2 text-sm font-medium ${tasks.every(t => t.status === 'done') ? 'bg-green-600 text-white border-green-700 hover:bg-green-700' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                  {tasks.every(t => t.status === 'done') ? <CheckCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  <span>{tasks.every(t => t.status === 'done') ? 'Finish Project' : 'Clear Done'}</span>
                </button>
            )}
            {activeTab === 'tasks' && (
               <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all flex items-center space-x-2 text-sm font-medium"><Plus className="w-4 h-4" /><span>New Task</span></button>
            )}
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex space-x-2 bg-white/50 backdrop-blur-md rounded-xl p-1.5 border border-slate-200 w-fit">
          {[{ id: 'tasks', icon: ListTodo, label: 'Tasks' }, { id: 'ai', icon: Brain, label: 'AI Assistant' }, { id: 'plans', icon: Calendar, label: 'Plans' }].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
              <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'tasks' && (
          tasks.length > 0 ? (
            // 🔥 เงื่อนไขการสลับ View ตรงนี้
            viewMode === 'list' ? (
                <TaskBoard tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            ) : (
                <ConstellationView plan={getCurrentPlanData()} />
            )
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
               <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 text-lg">No active plan selected.</p>
               <button onClick={() => handleTabChange('plans')} className="mt-4 text-blue-600 hover:underline font-medium">Go to Plans</button>
            </div>
          )
        )}
        {activeTab === 'ai' && <AIAssistant onDeployPlan={handleDeployPlan} />}
        {activeTab === 'plans' && (
          <PlansOverview 
            plans={plans} 
            onSwitchToTasks={(plan) => prepareTasksForBoard(plan)}
            onNewPlan={() => handleTabChange('ai')}
            onRestartPlan={handleRestartPlan}
            onDeletePlan={handleDeletePlan}
          />
        )}
      </main>
    </div>
  );
};

export default AethraTaskManager;