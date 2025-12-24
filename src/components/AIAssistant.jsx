import React, { useState } from 'react';
import { Brain, Sparkles, Target, Clock, Play, CheckCircle2 } from 'lucide-react';
import { generateProjectPlan } from '../services/aiService'; // อย่าลืมเช็ค path นี้ให้ถูกนะครับ

const AIAssistant = ({ onDeployPlan }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateProjectPlan(aiPrompt);
      setGeneratedPlan(result);
    } catch (error) {
      console.error(error);
      alert("AI connection error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = () => {
    if (generatedPlan) {
      onDeployPlan(generatedPlan); // ส่งข้อมูลกลับไปที่ไฟล์แม่
      setGeneratedPlan(null);
      setAiPrompt('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50" />
        
        <div className="mb-8 relative z-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" /> Architect Your Vision
          </h2>
          <p className="text-slate-500 text-lg">Describe what you want to build.</p>
        </div>

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

        {generatedPlan && (
          <div className="mt-10 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                {generatedPlan.title} <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />
              </h3>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-200">
                {generatedPlan.complexity}
              </span>
            </div>

            <div className="space-y-3 mb-8">
              {generatedPlan.tasks.map((task, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-200/60">
                  <span className="font-medium text-slate-700">{task.title}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-600">{task.priority}</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {task.estimate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-sm text-slate-500">Ready to execute?</div>
              <button onClick={handleStart} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2">
                <Play className="w-4 h-4 fill-current" /> <span>Deploy Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;