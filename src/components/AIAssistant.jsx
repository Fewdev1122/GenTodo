import React, { useState } from 'react';
import { Brain, Sparkles, Clock, Play, CheckCircle2, Plus, CheckSquare, Square, Layers, AlertCircle } from 'lucide-react';
import { generateProjectPlan } from '../services/aiService';

const AIAssistant = ({ onDeployPlan }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [draftPlan, setDraftPlan] = useState(null);
  const [newTaskInputs, setNewTaskInputs] = useState({});

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setDraftPlan(null);

    try {
      const result = await generateProjectPlan(aiPrompt);
      
      console.log("UI Received:", result); // เช็ค data ใน console

      // 🛡️ 1. เตรียมข้อมูล Features ให้ชัวร์ว่าเป็น Array
      let safeFeatures = [];
      if (result.features && Array.isArray(result.features)) {
        safeFeatures = result.features;
      } else if (result.tasks && Array.isArray(result.tasks)) {
        // Fallback: ถ้า AI ส่ง tasks มาแบบเก่า ให้ยัดใส่ feature หลอกๆ 1 อัน
        safeFeatures = [{ name: "General Tasks", tasks: result.tasks }];
      }

      // 🛡️ 2. Format ข้อมูลให้พร้อมโชว์ (ใส่ ID และ isSelected)
      const formattedFeatures = safeFeatures.map((feature, fIndex) => ({
        ...feature,
        name: feature.name || "Untitled Feature",
        tasks: (feature.tasks || []).map((task, tIndex) => ({
          ...task,
          id: `task-${Date.now()}-${fIndex}-${tIndex}`,
          isSelected: true
        }))
      }));

      setDraftPlan({
        title: result.title || "Untitled Project",
        description: result.description || "",
        complexity: result.complexity || "Moderate",
        features: formattedFeatures
      });

    } catch (error) {
      console.error("Generate Error:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Logic การจัดการ Task ---

  const toggleTask = (fIndex, tIndex) => {
    if (!draftPlan?.features) return;
    const newFeatures = [...draftPlan.features];
    // เช็คกันเหนียวว่ามี task จริงไหม
    if (newFeatures[fIndex] && newFeatures[fIndex].tasks[tIndex]) {
        newFeatures[fIndex].tasks[tIndex].isSelected = !newFeatures[fIndex].tasks[tIndex].isSelected;
        setDraftPlan({ ...draftPlan, features: newFeatures });
    }
  };

  const updateEstimate = (fIndex, tIndex, val) => {
    if (!draftPlan?.features) return;
    const newFeatures = [...draftPlan.features];
    if (newFeatures[fIndex]?.tasks[tIndex]) {
        newFeatures[fIndex].tasks[tIndex].estimate = val;
        setDraftPlan({ ...draftPlan, features: newFeatures });
    }
  };

  const addTask = (fIndex) => {
    const text = newTaskInputs[fIndex]?.trim();
    if (!text) return;

    const newFeatures = [...draftPlan.features];
    if (newFeatures[fIndex]) {
        newFeatures[fIndex].tasks.push({
            id: `manual-${Date.now()}`,
            title: text,
            priority: 'medium',
            estimate: '1d',
            isSelected: true
        });
        setDraftPlan({ ...draftPlan, features: newFeatures });
        setNewTaskInputs({ ...newTaskInputs, [fIndex]: '' });
    }
  };

  const handleDeploy = () => {
    if (!draftPlan?.features) return;
    
    // ✅ 1. วนลูป Features
    const cleanFeatures = draftPlan.features.map(feature => ({
      ...feature,
      // ✅ 2. วนลูป Tasks เพื่อใส่ status: 'plan'
      tasks: (feature.tasks || [])
        .filter(task => task.isSelected) // เอาเฉพาะที่ติ๊กถูก
        .map(task => ({
          ...task,
          status: 'plan', // 👈 ใส่บรรทัดนี้ครับ! เพื่อบอกว่า "ให้ไปกองอยู่ที่ Plan ก่อนนะ อย่าเพิ่งไป Todo"
          isCompleted: false 
        }))
    })).filter(feature => feature.tasks.length > 0); // ตัด Feature ว่างทิ้ง

    // 3. รวมร่างส่งกลับไป
    const finalPlan = {
      ...draftPlan,
      features: cleanFeatures
    };

    // ส่งข้อมูลออกไป
    onDeployPlan(finalPlan);
    
    // Reset ค่า
    setDraftPlan(null);
    setAiPrompt('');
  };
  // --- RENDER ---

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
        
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50" />
        
        <div className="mb-8 relative z-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" /> Architect Your Vision
          </h2>
          <p className="text-slate-500 text-lg">Describe what you want to build.</p>
        </div>

        {/* Input Zone */}
        {!draftPlan && (
          <div className="relative z-10">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: I want a fitness tracking app..."
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 transition-all min-h-[150px] mb-6 outline-none resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all ${isGenerating ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}`}
            >
              {isGenerating ? <span>Processing...</span> : <><Sparkles className="w-5 h-5" /><span>Generate Project Plan</span></>}
            </button>
          </div>
        )}

        {/* Result Zone */}
        {draftPlan && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                {draftPlan.title} <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />
              </h3>
              <div className="flex items-center space-x-2">
                 <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-200">
                  {draftPlan.complexity}
                </span>
                <button onClick={() => setDraftPlan(null)} className="text-slate-400 hover:text-slate-600 text-xs underline">Reset</button>
              </div>
            </div>

            {/* ⚠️ จุดสำคัญ: ใช้ ?.map เพื่อป้องกัน Error undefined */}
            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {draftPlan.features && draftPlan.features.length > 0 ? (
                draftPlan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="space-y-2">
                    
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm uppercase tracking-wider pl-1">
                      <Layers className="w-4 h-4" />
                      <span>{feature.name}</span>
                    </div>

                    <div className="bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden">
                      {/* Tasks Loop */}
                      {feature.tasks && feature.tasks.map((task, tIndex) => (
                        <div 
                          key={task.id || tIndex} 
                          className={`p-3 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors ${task.isSelected ? 'bg-slate-50' : 'bg-slate-100/50 opacity-60'}`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <button onClick={() => toggleTask(fIndex, tIndex)} className={`${task.isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                               {task.isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </button>
                            
                            <span className={`font-medium text-sm ${task.isSelected ? 'text-slate-700' : 'text-slate-500 line-through'}`}>
                              {task.title}
                            </span>
                          </div>

                          {task.isSelected && (
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-white text-slate-500 hidden sm:inline-block">
                                {task.priority}
                              </span>
                              
                              <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 flex items-center w-16">
                                <Clock className="w-3 h-3 mr-1 flex-shrink-0" /> 
                                <input 
                                  className="w-full bg-transparent outline-none text-center"
                                  value={task.estimate}
                                  onChange={(e) => updateEstimate(fIndex, tIndex, e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Task Input */}
                      <div className="p-2 bg-white flex items-center border-t border-slate-200">
                         <Plus className="w-4 h-4 text-slate-400 ml-2 mr-2" />
                         <input 
                           className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-600"
                           placeholder="Add custom task..."
                           value={newTaskInputs[fIndex] || ''}
                           onChange={(e) => setNewTaskInputs({...newTaskInputs, [fIndex]: e.target.value})}
                           onKeyDown={(e) => e.key === 'Enter' && addTask(fIndex)}
                         />
                         <button 
                          onClick={() => addTask(fIndex)}
                          disabled={!newTaskInputs[fIndex]}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded font-medium disabled:opacity-50"
                         >
                           Add
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                   <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                   <p>No features generated. Please try again.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-sm text-slate-500">Ready to execute?</div>
              <button onClick={handleDeploy} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5">
                <Play className="w-4 h-4 fill-current" /> <span>Deploy Selected Tasks</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;