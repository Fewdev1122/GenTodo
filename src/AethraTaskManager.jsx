import React, { useState, useEffect } from 'react';
import { Calendar, Brain, ListTodo, Plus, Sparkles } from 'lucide-react';

// Import Components
import TaskBoard from './components/TaskBoard';
import AIAssistant from './components/AIAssistant';
import PlansOverview from './components/PlansOverview';
import { supabase } from './supabaseClient';

const AethraTaskManager = () => {
  // ==========================================
  // 1. STATE & MEMORY
  // ==========================================
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('aethra_activeTab') || 'plans');
  const [currentPlanId, setCurrentPlanId] = useState(() => localStorage.getItem('aethra_currentPlanId') || null);
  
  // Plans: โหลดจาก LocalStorage เสมอ
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('aethra_plans_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [tasks, setTasks] = useState([]);

  // Auto-Save Plans ลงเครื่อง
  useEffect(() => {
    localStorage.setItem('aethra_plans_data', JSON.stringify(plans));
  }, [plans]);

  // ปิด Cloud ชั่วคราว (ใช้ LocalStorage 100%)
  useEffect(() => {
    // fetchProjects(); 
  }, []);

  // ==========================================
  // 2. 🔥 SESSION RESTORE SYSTEM (หัวใจสำคัญ)
  // ==========================================
  
  // ฟังก์ชันช่วยดึงข้อมูล Plan มาใส่กระดาน Task
  const restoreTasksFromPlan = (targetId) => {
    const targetPlan = plans.find(p => p.id.toString() === targetId.toString());
    if (targetPlan && targetPlan.features) {
        console.log("🔄 Restoring Tasks for:", targetPlan.title);
        
        const boardTasks = targetPlan.features.flatMap(f => 
            (f.tasks || []).map(t => ({
                ...t,
                status: ['todo', 'in-progress', 'done'].includes((t.status||'').toLowerCase()) 
                        ? t.status.toLowerCase() 
                        : 'todo',
                featureName: f.name
            }))
        );
        setTasks(boardTasks);
    }
  };

  // Effect: ทำงานเมื่อ (1) เปิดแอพ (2) เปลี่ยนแท็บ (3) โหลด Plans เสร็จ
  useEffect(() => {
    // ถ้าอยู่หน้า Tasks และมี ID งานค้างอยู่ -> ให้ดึงข้อมูลมาแสดงทันที
    if (activeTab === 'tasks' && currentPlanId && plans.length > 0) {
        restoreTasksFromPlan(currentPlanId);
    }
  }, [activeTab, currentPlanId, plans.length]); 

  // ==========================================
  // 3. LOGIC & HANDLERS
  // ==========================================

  const prepareTasksForBoard = (plan) => {
    if (!plan?.features) return;

    // ซ่อม ID และเตรียมข้อมูล (เหมือนเดิม)
    const updatedFeatures = plan.features.map((feature, fIdx) => ({
        ...feature,
        tasks: (feature.tasks || []).map((task, tIdx) => {
            if (!task.id) {
                return { 
                    ...task, 
                    id: `fixed-${plan.id}-${fIdx}-${tIdx}-${Date.now()}`,
                    status: task.status || 'todo'
                };
            }
            return task;
        })
    }));

    // อัปเดต Plans ใน State หลัก
    setPlans(prevPlans => prevPlans.map(p => 
        p.id.toString() === plan.id.toString() ? { ...p, features: updatedFeatures } : p
    ));

    // ตั้งค่าตัวแปร Session
    setCurrentPlanId(plan.id);
    localStorage.setItem('aethra_currentPlanId', plan.id);
    
    // เปลี่ยนหน้าไป Tasks
    setActiveTab('tasks');
    localStorage.setItem('aethra_activeTab', 'tasks');
    
    // (useEffect ข้างบนจะทำงานต่อเองอัตโนมัติ เพื่อดึง tasks มาแสดง)
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('aethra_activeTab', tabId);
    
    // ❌ ลบโค้ดที่เคยสั่งล้างข้อมูลทิ้งออกไปแล้ว!
    // ตอนนี้สลับแท็บไปมาได้อิสระ ข้อมูลหน้า Task จะยังคงอยู่ (ถ้ามี currentPlanId)
  };

  const handleDeployPlan = async (aiPlan) => {
    if (!aiPlan) return;

    const featuresWithIds = (aiPlan.features || []).map((f, fIdx) => ({
        ...f,
        tasks: (f.tasks || []).map((t, tIdx) => ({
            ...t,
            id: `task-${Date.now()}-${fIdx}-${tIdx}`,
            status: 'todo'
        }))
    }));

    const newProject = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        title: aiPlan.title || "Untitled Project",
        description: aiPlan.description || "",
        complexity: aiPlan.complexity || "Moderate",
        features: featuresWithIds, 
        user_id: "user-test-001", 
        status: 'active'
    };

    // เซฟลงเครื่อง
    setPlans(prev => [newProject, ...prev]);
    alert(`✅ Project Saved!`);
    
    // กลับไปหน้า Plans
    setActiveTab('plans');
    localStorage.setItem('aethra_activeTab', 'plans');
    
    // ไม่ต้องล้าง currentPlanId (เผื่อ user อยากกดกลับไปดูงานเก่า)
  };

  const handleUpdateTask = async (updatedTask) => {
    // 1. อัปเดตหน้าจอทันที
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    if (!currentPlanId) return;

    // 2. อัปเดตข้อมูลลึกใน Plans State
    setPlans(prevPlans => {
        const targetPlan = prevPlans.find(p => p.id.toString() === currentPlanId.toString());
        if (!targetPlan) return prevPlans;

        const newFeatures = targetPlan.features.map(feature => ({
            ...feature,
            tasks: feature.tasks.map(t => {
                if (t.id && updatedTask.id && t.id.toString() === updatedTask.id.toString()) {
                    return { ...t, ...updatedTask };
                }
                return t;
            })
        }));

        return prevPlans.map(p => 
            p.id.toString() === currentPlanId.toString() ? { ...p, features: newFeatures } : p
        );
    });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        
        if (currentPlanId) {
             setPlans(prevPlans => prevPlans.map(p => {
                if (p.id.toString() === currentPlanId.toString()) {
                    const newFeatures = p.features.map(f => ({
                        ...f,
                        tasks: f.tasks.filter(t => t.id !== taskId)
                    }));
                    return { ...p, features: newFeatures };
                }
                return p;
             }));
        }
    }
  };

  // ==========================================
  // 4. UI RENDER
  // ==========================================
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
          {activeTab === 'tasks' && (
             <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all flex items-center space-x-2 text-sm font-medium">
               <Plus className="w-4 h-4" /><span>New Task</span>
             </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex space-x-2 bg-white/50 backdrop-blur-md rounded-xl p-1.5 border border-slate-200 w-fit">
          {[
            { id: 'tasks', icon: ListTodo, label: 'Tasks' },
            { id: 'ai', icon: Brain, label: 'AI Assistant' },
            { id: 'plans', icon: Calendar, label: 'Plans' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)} 
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'tasks' && (
          tasks.length > 0 ? (
            <TaskBoard 
              tasks={tasks} 
              onUpdateTask={handleUpdateTask} 
              onDeleteTask={handleDeleteTask} 
            />
          ) : (
            // แสดงข้อความเตือน ถ้าเข้ามาหน้า Task แต่ยังไม่ได้เลือกงาน
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
               <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 text-lg">No active plan selected.</p>
               <button 
                  onClick={() => handleTabChange('plans')}
                  className="mt-4 text-blue-600 hover:underline font-medium"
               >
                  Go to Plans to select a project
               </button>
            </div>
          )
        )}

        {activeTab === 'ai' && (
          <AIAssistant 
            onDeployPlan={handleDeployPlan} 
          />
        )}

        {activeTab === 'plans' && (
          <PlansOverview 
            plans={plans} 
            onSwitchToTasks={(plan) => prepareTasksForBoard(plan)}
            onNewPlan={() => handleTabChange('ai')}
          />
        )}
      </main>
    </div>
  );
};

export default AethraTaskManager;