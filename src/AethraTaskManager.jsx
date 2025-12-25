import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import { 
  Calendar as CalIcon, Brain, ListTodo, Sparkles, Trash2, 
  Archive, Network, LayoutList, User, PlayCircle, CalendarDays,
  PauseCircle, Play, Plus, X, Clock, AlignLeft, Hourglass,
  Activity, AlertTriangle, ShieldCheck, Coffee, ArrowRight, HeartHandshake 
} from 'lucide-react';

import TaskBoard from './components/TaskBoard';
import AIAssistant from './components/AIAssistant';
import PlansOverview from './components/PlansOverview';
import ConstellationView from './components/ConstellationView';

const CLIENT_ID = "1080874707512-r4qeulmgdrb87ki1mpcndl958oompllc.apps.googleusercontent.com"; 
const API_KEY = "AIzaSyAtrigJKkKBnsfxTKcO24zGzJsUXnrbsRo"; 
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";

// 🔥 SUB-COMPONENT: BURNOUT METER (Mental Health Feature) 🔥
const BurnoutMeter = ({ tasks }) => {
  const totalHours = tasks.filter(t => t.status !== 'done').reduce((acc, task) => {
    const days = task.durationDays || 1; 
    return acc + (days * 8); // สมมติ 1 วัน = 8 work hours
  }, 0);

  const maxCapacity = 40; // 40 hours/week limit
  const percentage = Math.min((totalHours / maxCapacity) * 100, 100);

  let status = "Healthy";
  let color = "text-emerald-500";
  let message = "Your workload is balanced.";
  let Icon = ShieldCheck;

  if (percentage > 50 && percentage <= 80) {
    status = "Moderate";
    color = "text-amber-400";
    message = "You're getting busy. Pace yourself.";
    Icon = Activity;
  } else if (percentage > 80) {
    status = "Overload";
    color = "text-rose-500";
    message = "⚠️ Warning: Burnout risk detected!";
    Icon = AlertTriangle;
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
          <circle 
            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
            className={`${percentage > 80 ? 'text-rose-500' : percentage > 50 ? 'text-amber-400' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
            strokeDasharray={175}
            strokeDashoffset={175 - (175 * percentage) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600">
          {Math.round(percentage)}%
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
            <h4 className={`font-bold text-slate-800 flex items-center gap-2`}>
                <Icon size={18} className={color} />
                {percentage > 80 ? "Mental Load: HIGH" : "Mental Load"}
            </h4>
        </div>
        <p className={`text-sm ${percentage > 80 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
            {message}
        </p>
      </div>

      {percentage > 80 && (
          <button 
            className="px-4 py-2 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-200 transition-colors hidden sm:block"
            onClick={() => alert("AI Suggestion: Move 'Backend Setup' to next week to reduce stress.")}
          >
             Fix Schedule
          </button>
      )}
    </div>
  );
};

const AethraTaskManager = () => {
  // ================= STATE =================
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('aethra_activeTab') || 'plans');
  const [currentPlanId, setCurrentPlanId] = useState(() => localStorage.getItem('aethra_currentPlanId') || null);
  const [viewMode, setViewMode] = useState('list');
  const [tokenClient, setTokenClient] = useState(null);
  
  // New Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: '', description: '', duration: '' });

  // Auto-Reschedule State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleStep, setRescheduleStep] = useState('idle');

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('aethra_plans_data');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });
  
  const [tasks, setTasks] = useState([]);
  const [googleUser, setGoogleUser] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // ================= GOOGLE LOGIN =================
  useEffect(() => {
    const loadGapi = () => {
      gapi.load('client', () => {
        gapi.client.init({ apiKey: API_KEY, discoveryDocs: DISCOVERY_DOCS })
          .then(() => {
            const storedToken = localStorage.getItem('aethra_google_token');
            if (storedToken) { try { gapi.client.setToken(JSON.parse(storedToken)); } catch (e) {} }
          });
      });
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID, scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            gapi.client.setToken(tokenResponse);
            localStorage.setItem('aethra_google_token', JSON.stringify(tokenResponse));
            fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenResponse.access_token}`)
              .then(res => res.json()).then(data => {
                const u = { name: data.name, img: data.picture };
                setGoogleUser(u); localStorage.setItem('aethra_google_user', JSON.stringify(u));
              });
          }
        },
      });
      setTokenClient(client);
    };
    
    document.body.appendChild(script);
    loadGapi();
    const storedUser = localStorage.getItem('aethra_google_user');
    if (storedUser) setGoogleUser(JSON.parse(storedUser));
    return () => { document.body.removeChild(script); }
  }, []);

  const handleGoogleLogin = () => tokenClient && tokenClient.requestAccessToken();
  const handleGoogleLogout = () => {
    const token = gapi.client.getToken();
    if (token) window.google.accounts.oauth2.revoke(token.access_token, () => {});
    gapi.client.setToken(''); setGoogleUser(null);
    localStorage.removeItem('aethra_google_token'); localStorage.removeItem('aethra_google_user');
  };

  // 🔥🔥🔥 NUCLEAR CLEAR 🔥🔥🔥
  const clearAllAppEvents = async () => {
    if (!gapi.client.getToken()) { alert("Please login first"); return; }
    if (!window.confirm("⚠️ Confirm DELETE ALL events created by Aethra?")) return;

    setIsClearing(true);
    try {
      const now = new Date();
      const minDate = new Date(); minDate.setMonth(now.getMonth() - 2); 
      const maxDate = new Date(); maxDate.setMonth(now.getMonth() + 6); 

      const response = await gapi.client.calendar.events.list({
        'calendarId': 'primary', 'timeMin': minDate.toISOString(), 'timeMax': maxDate.toISOString(),
        'singleEvents': true, 'maxResults': 500
      });

      const events = response.result.items || [];
      const appEvents = events.filter(evt => {
        const hasMetadata = evt.extendedProperties?.private?.appName === 'Aethra';
        const hasKeyword = (evt.summary && (evt.summary.includes("🚀") || evt.summary.includes("Aethra"))) || 
                           (evt.description && evt.description.includes("Created by Aethra"));
        return hasMetadata || hasKeyword;
      });

      if (appEvents.length === 0) { alert("No Aethra events found."); setIsClearing(false); return; }

      let count = 0;
      const batchSize = 5;
      for (let i = 0; i < appEvents.length; i += batchSize) {
          const batch = appEvents.slice(i, i + batchSize);
          await Promise.all(batch.map(evt => gapi.client.calendar.events.delete({ 'calendarId': 'primary', 'eventId': evt.id })));
          count += batch.length;
          await new Promise(r => setTimeout(r, 100));
      }
      alert(`🧹 Cleaned up! Deleted ${count} events.`);
    } catch (error) { console.error("Clear Error", error); alert("Error: " + error.message); } finally { setIsClearing(false); }
  };

  // 🔥🔥🔥 SMART TIMELINE SCHEDULER 🔥🔥🔥
  const scheduleEntirePlanToCalendar = async (plan) => {
    if (!gapi.client.getToken()) { alert("Please login again."); handleGoogleLogin(); return; }
    setIsScheduling(true);
    try {
      const taskQueue = [];
      plan.features.forEach(feature => {
        feature.tasks.filter(t => t.status !== 'done').forEach(task => {
            const aiDays = analyzeTaskComplexity(task.title, task.description);
            const finalDuration = task.durationDays ? parseInt(task.durationDays) : aiDays;
            taskQueue.push({ ...task, featureName: feature.name, durationDays: finalDuration });
        });
      });

      if (taskQueue.length === 0) { alert("No tasks!"); setIsScheduling(false); return; }

      const now = new Date();
      const next90Days = new Date(); next90Days.setDate(now.getDate() + 90);
      const calendarResponse = await gapi.client.calendar.events.list({
        'calendarId': 'primary', 'timeMin': now.toISOString(), 'timeMax': next90Days.toISOString(),
        'singleEvents': true, 'orderBy': 'startTime'
      });
      const busyEvents = calendarResponse.result.items || [];

      let timelineCursor = new Date(); timelineCursor.setDate(timelineCursor.getDate() + 1); timelineCursor.setHours(9, 0, 0, 0);

      let scheduledCount = 0;
      for (let task of taskQueue) {
        const { startDate, endDate } = findConsecutiveAvailableDays(timelineCursor, task.durationDays, busyEvents);
        
        const event = {
          'summary': `🚀 ${task.title}`,
          'description': `[Project: ${plan.title}]\nFeature: ${task.featureName}\nEst. Duration: ${task.durationDays} days\n\n${task.description || ''}\n(Created by Aethra)`,
          'start': { 'date': formatDate(startDate) }, 
          'end': { 'date': formatDate(endDate) },
          'transparency': 'transparent',
          'extendedProperties': { 'private': { 'appName': 'Aethra', 'planId': plan.id.toString() } }
        };
        await gapi.client.calendar.events.insert({ 'calendarId': 'primary', 'resource': event });
        
        timelineCursor = new Date(endDate); 
        scheduledCount++;
        await new Promise(r => setTimeout(r, 200)); 
      }
      alert(`✅ Timeline Built! Scheduled ${scheduledCount} tasks.`);
    } catch (error) { console.error(error); alert("Error: " + error.message); } finally { setIsScheduling(false); }
  };

  const analyzeTaskComplexity = (title, desc) => {
    const text = (title + " " + (desc || "")).toLowerCase();
    const explicitDay = text.match(/(\d+)\s*(days|day|วัน)/);
    if (explicitDay) return parseInt(explicitDay[1]);
    if (text.match(/database|schema|architecture|structure|auth|security|payment|api|backend/)) return Math.floor(Math.random() * 3) + 4;
    if (text.match(/dashboard|profile|setting|page|screen|view|implement|develop/)) return Math.floor(Math.random() * 3) + 3;
    if (text.match(/design|ui|ux|style|css|layout|mockup|prototype/)) return Math.floor(Math.random() * 2) + 2;
    return Math.floor(Math.random() * 2) + 1;
  };

  const findConsecutiveAvailableDays = (startDate, daysNeeded, busyEvents) => {
    let current = new Date(startDate);
    let attempts = 0;
    while (attempts < 365) { 
        let validStart = new Date(current);
        let tempCursor = new Date(current);
        let daysFound = 0;
        let isSequenceValid = true;
        for (let i = 0; i < daysNeeded; i++) {
            while (tempCursor.getDay() === 0 || tempCursor.getDay() === 6) tempCursor.setDate(tempCursor.getDate() + 1);
            const isBlocked = busyEvents.some(evt => {
                if (evt.start.date) { const checkStr = formatDate(tempCursor); return evt.start.date <= checkStr && evt.end.date > checkStr; }
                return false;
            });
            if (isBlocked) { isSequenceValid = false; break; }
            daysFound++; tempCursor.setDate(tempCursor.getDate() + 1);
        }
        if (isSequenceValid) return { startDate: validStart, endDate: tempCursor };
        else { current.setDate(current.getDate() + 1); while (current.getDay() === 0 || current.getDay() === 6) current.setDate(current.getDate() + 1); }
        attempts++;
    }
    let end = new Date(startDate); end.setDate(end.getDate() + daysNeeded);
    return { startDate: startDate, endDate: end };
  };
  const formatDate = (date) => date.toISOString().split('T')[0];

  // ================= REACT LOGIC =================
  useEffect(() => { if (plans.length > 0) localStorage.setItem('aethra_plans_data', JSON.stringify(plans)); }, [plans]);
  useEffect(() => { if (currentPlanId) localStorage.setItem('aethra_currentPlanId', currentPlanId); }, [currentPlanId]);

  const restoreTasksFromPlan = (targetId) => {
    if (!targetId) return;
    const targetPlan = plans.find(p => p.id.toString() === targetId.toString());
    if (targetPlan && targetPlan.features) {
        setTasks(targetPlan.features.flatMap(f => (f.tasks || []).map(t => ({...t, featureName: f.name, status: t.status || 'todo'}))));
    }
  };
  useEffect(() => { if (activeTab === 'tasks' && currentPlanId) restoreTasksFromPlan(currentPlanId); }, [activeTab, currentPlanId, plans]); 

  // 🔥 FIX NULL ERROR HERE 🔥
  const getCurrentPlanData = () => {
    if (!currentPlanId) return null; // Safety Check
    return plans.find(p => String(p.id) === String(currentPlanId));
  };

  const prepareTasksForBoard = (plan) => {
    if (plan.status === 'paused') { alert("This plan is currently paused. Please resume it first."); return; }
    if (!plan?.features) return;
    const updatedFeatures = plan.features.map((f, i) => ({...f, tasks: (f.tasks || []).map((t, j) => (!t.id ? { ...t, id: `fix-${plan.id}-${i}-${j}-${Date.now()}`, status: 'todo' } : t)) }));
    setPlans(prev => prev.map(p => p.id.toString() === plan.id.toString() ? { ...p, features: updatedFeatures } : p));
    setCurrentPlanId(plan.id); setActiveTab('tasks'); setViewMode('list');
  };

  // --- Modal & Task Logic ---
  const handleOpenCreateTaskModal = () => { setNewTaskData({ title: '', description: '', duration: '' }); setIsTaskModalOpen(true); };
  
  const handleSaveNewTask = () => {
    if (!currentPlanId) return;
    if (!newTaskData.title.trim()) { alert("Please enter a task name."); return; }
    const newTask = {
        id: `manual-${Date.now()}`,
        title: newTaskData.title,
        description: newTaskData.description || "No description provided.",
        durationDays: newTaskData.duration ? parseInt(newTaskData.duration) : null,
        status: "todo", featureName: "General" 
    };
    setPlans(prev => prev.map(p => {
        if (String(p.id) === String(currentPlanId)) {
            const newFeatures = p.features ? [...p.features] : [];
            if (newFeatures.length === 0) newFeatures.push({ name: "General", tasks: [] });
            newFeatures[0] = { ...newFeatures[0], tasks: [newTask, ...(newFeatures[0].tasks || [])] };
            return { ...p, features: newFeatures };
        }
        return p;
    }));
    setIsTaskModalOpen(false); 
    // Wait for state update then restore
    setTimeout(() => restoreTasksFromPlan(currentPlanId), 50);
  };

  // 🔥 AUTO RESCHEDULE LOGIC 🔥
  const handleAutoReschedule = () => {
    setShowRescheduleModal(true);
    setRescheduleStep('analyzing');
    setTimeout(() => {
        setRescheduleStep('moving');
        setTimeout(() => {
            setPlans(prevPlans => prevPlans.map(p => {
                if(String(p.id) !== String(currentPlanId)) return p;
                // Deep update tasks in plan
                const newFeatures = p.features.map(f => ({
                    ...f,
                    tasks: f.tasks.map(t => {
                        if (t.status === 'todo') {
                            return { ...t, title: t.title.startsWith('(Rescheduled)') ? t.title : `(Rescheduled) ${t.title}`, isRescheduled: true };
                        }
                        return t;
                    })
                }));
                return { ...p, features: newFeatures };
            }));
            
            // Also update local task state to show immediate effect
            setTasks(prev => prev.map(t => {
                if (t.status === 'todo') {
                    return { ...t, title: t.title.startsWith('(Rescheduled)') ? t.title : `(Rescheduled) ${t.title}`, isRescheduled: true };
                }
                return t;
            }));

            setRescheduleStep('done');
        }, 2000);
    }, 1500);
  };

  const handleUpdateTask = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (currentPlanId) setPlans(prev => prev.map(p => String(p.id) === String(currentPlanId) ? { ...p, features: p.features.map(f => ({...f, tasks: f.tasks.map(t => t.id === updated.id ? {...t, ...updated} : t)})) } : p));
  };
  const handleDeployPlan = (p) => { setPlans(prev => [{ ...p, id: Date.now(), createdAt: new Date().toISOString(), status: 'active', features: p.features.map(f => ({ ...f, tasks: f.tasks.map(t => ({ ...t, status: 'todo' })) })) }, ...prev]); setActiveTab('plans'); };
  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (currentPlanId) setPlans(prev => prev.map(p => String(p.id) === String(currentPlanId) ? { ...p, features: p.features.map(f => ({...f, tasks: f.tasks.filter(t => t.id !== id)})) } : p));
  };
  const handleRestartPlan = (id) => setPlans(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
  const handleDeletePlan = (id) => { if(window.confirm("Sure?")) { setPlans(prev => prev.filter(p => p.id !== id)); if(currentPlanId === id) { setCurrentPlanId(null); setTasks([]); } } };
  const handleTabChange = (id) => { setActiveTab(id); localStorage.setItem('aethra_activeTab', id); };
  const handleTogglePausePlan = (id) => { setPlans(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'paused' ? 'active' : 'paused' } : p)); };

  const currentPlan = getCurrentPlanData();
  const isCurrentPlanPaused = currentPlan?.status === 'paused';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 font-sans relative">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md"><Sparkles className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-2xl font-bold tracking-tight">AETHRA</h1><p className="text-xs text-slate-500 font-medium">Neuro-Inclusive Workspace</p></div>
          </div>
          <div className="flex items-center space-x-4">
            {googleUser ? (
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                <img src={googleUser.img} alt="User" className="w-6 h-6 rounded-full border border-white" />
                <button onClick={handleGoogleLogout} className="text-xs text-red-400 hover:text-red-600 ml-2">Logout</button>
              </div>
            ) : (<button onClick={handleGoogleLogin} className="text-sm bg-white border px-3 py-1.5 rounded-full hover:bg-slate-50 flex gap-2 shadow-sm"><User size={16}/> Sync Google</button>)}
            {activeTab === 'tasks' && currentPlanId && !isCurrentPlanPaused && (
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}><LayoutList className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('galaxy')} className={`p-2 rounded-md ${viewMode === 'galaxy' ? 'bg-slate-800 shadow text-yellow-400' : 'text-slate-400'}`}><Network className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex space-x-2 bg-white/50 backdrop-blur-md rounded-xl p-1.5 border border-slate-200 w-fit">
          {[{ id: 'tasks', icon: ListTodo, label: 'Tasks' }, { id: 'ai', icon: Brain, label: 'AI Assistant' }, { id: 'plans', icon: Archive, label: 'Plans' }].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
              <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 pb-20">
        {activeTab === 'tasks' && (
           isCurrentPlanPaused ? (
             <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-amber-200 shadow-sm text-center">
                 <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <PauseCircle className="w-10 h-10 text-amber-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Paused</h2>
                 <p className="text-slate-500 max-w-md mb-8">This plan <strong>"{currentPlan.title}"</strong> is currently stopped.<br/>Tasks are hidden until you resume.</p>
                 <button onClick={() => handleTogglePausePlan(currentPlan.id)} className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 hover:shadow-lg transition-all">
                    <Play size={20} fill="currentColor"/> Resume Plan
                 </button>
             </div>
           ) : (
              tasks.length > 0 ? (
                <div>
                  {/* 🔥 Burnout Meter */}
                  <BurnoutMeter tasks={tasks} />

                  <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm gap-4">
                    <div className='flex items-center gap-4'>
                        <div className="bg-indigo-100 p-3 rounded-lg"><CalendarDays className='text-indigo-600 w-6 h-6'/></div>
                        <div>
                          <h3 className='font-bold text-indigo-900 text-lg'>Smart Timeline Builder</h3>
                          <p className='text-sm text-indigo-600'>AI analyzes tasks to create a balanced schedule.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* 🔥 Reschedule Button */}
                      <button onClick={handleAutoReschedule} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 hover:shadow-md transition-all mr-2" title="Feeling overwhelmed?">
                         <Coffee size={18} /> I missed tasks...
                      </button>

                      {/* New Task Button */}
                      <button onClick={handleOpenCreateTaskModal} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                         <Plus size={18} /> New Task
                      </button>

                      <button onClick={clearAllAppEvents} disabled={isClearing} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-all ${isClearing ? 'opacity-50' : ''}`}>
                        {isClearing ? '...' : <><Trash2 size={18}/></>}
                      </button>
                      <button onClick={() => scheduleEntirePlanToCalendar(getCurrentPlanData())} disabled={isScheduling} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all ${isScheduling ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5'}`}>
                        {isScheduling ? 'Working...' : <><PlayCircle size={20}/> Build Timeline</>}
                      </button>
                    </div>
                  </div>
                  {viewMode === 'list' ? <TaskBoard tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} /> : <ConstellationView plan={getCurrentPlanData()} />}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                  <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500 text-lg">No active plan selected.</p>
                  <button onClick={() => handleTabChange('plans')} className="mt-4 text-blue-600 hover:underline font-medium">Go to Plans</button>
                </div>
              )
           )
        )}
        {activeTab === 'ai' && <AIAssistant onDeployPlan={handleDeployPlan} />}
        {activeTab === 'plans' && <PlansOverview plans={plans} onSwitchToTasks={prepareTasksForBoard} onNewPlan={() => handleTabChange('ai')} onRestartPlan={handleRestartPlan} onDeletePlan={handleDeletePlan} onTogglePausePlan={handleTogglePausePlan} />}
      </main>

      {/* --- MODAL 1: NEW TASK --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex justify-between items-center">
              <h3 className="text-white text-xl font-bold flex items-center gap-2"><Plus className="w-6 h-6" /> Create New Task</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Task Name</label><input type="text" autoFocus placeholder="e.g., Design Landing Page" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={newTaskData.title} onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><AlignLeft size={16}/> Description</label><textarea rows="3" placeholder="Add details..." className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" value={newTaskData.description} onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><Clock size={16}/> Duration (Days)</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hourglass className="h-5 w-5 text-indigo-500" /></div><input type="number" min="1" placeholder="e.g. 3" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newTaskData.duration} onChange={(e) => setNewTaskData({ ...newTaskData, duration: e.target.value })} /></div></div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setIsTaskModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all">Cancel</button><button onClick={handleSaveNewTask} className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all">Create Task</button></div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: COMPASSIONATE RESCHEDULE --- */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400" />
            <div className="p-8 text-center">
              {rescheduleStep === 'analyzing' && (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto animate-pulse"><Brain className="w-10 h-10 text-blue-500" /></div>
                  <div><h3 className="text-xl font-bold text-slate-800">Assessing Workload...</h3><p className="text-slate-500 mt-2">Checking open slots for you.</p></div>
                </div>
              )}
              {rescheduleStep === 'moving' && (
                <div className="space-y-6">
                   <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto relative overflow-hidden"><div className="absolute inset-0 flex items-center justify-center animate-[spin_3s_linear_infinite] opacity-20"><div className="w-full h-1 bg-teal-400 absolute top-1/2" /><div className="h-full w-1 bg-teal-400 absolute left-1/2" /></div><ArrowRight className="w-10 h-10 text-teal-600 animate-[bounce_1s_infinite]" /></div>
                   <div><h3 className="text-xl font-bold text-slate-800">Rebalancing...</h3><p className="text-slate-500 mt-2">Moving unfinished tasks to lighter days.</p></div>
                </div>
              )}
              {rescheduleStep === 'done' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto shadow-inner"><HeartHandshake className="w-12 h-12 text-teal-600" /></div>
                   <div className="space-y-3"><h3 className="text-2xl font-black text-slate-800">It's okay to rest.</h3><p className="text-slate-600 leading-relaxed">Productivity isn't everything. I've moved pending tasks to later this week.</p><p className="text-teal-700 font-medium bg-teal-50 py-2 px-4 rounded-lg inline-block">🌱 Please take the evening off.</p></div>
                  <button onClick={() => setShowRescheduleModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl translate-y-2">Thank you, Aethra.</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AethraTaskManager;