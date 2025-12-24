import React, { useState } from 'react';
import { Clock, Trash2, GripVertical, CheckCircle2, Circle, Play } from 'lucide-react';

const TaskBoard = ({ tasks, setTasks, onDeleteTask }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-50' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  const getPriorityColor = (p) => {
    const colors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-green-600 bg-green-50' };
    return colors[p] || 'text-gray-600 bg-gray-50';
  };

  const handleDragStart = (e, task) => setDraggedTask(task);
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(tasks.map(task => task.id === draggedTask.id ? { ...task, status } : task));
      setDraggedTask(null);
    }
  };

  // ฟังก์ชันจำลองการกด Check (ถ้าต้องการให้กดได้จริงต้องส่ง update function มาจากแม่)
  const toggleComplete = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(column => (
        <div key={column.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-full flex flex-col">
          
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-700 flex items-center space-x-2">
              <span>{column.title}</span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium border border-slate-200">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </h3>
          </div>

          {/* Drop Zone (พื้นที่สีๆ สำหรับวาง) */}
          <div
            className={`flex-1 space-y-3 min-h-[400px] ${column.color} rounded-xl p-3 transition-colors border border-transparent hover:border-slate-200/50`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {tasks.filter(task => task.status === column.id).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                className="group bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative"
              >
                {/* Header Card: Grip + Check + Title */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2.5 flex-1 pr-2">
                    {/* Grip Icon (โชว์เมื่อ Hover) */}
                    <GripVertical className="w-4 h-4 text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    
                    {/* Checkbox จำลอง */}
                    <button onClick={() => toggleComplete(task.id)} className="focus:outline-none">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 mt-0.5 hover:text-slate-400" />
                      )}
                    </button>

                    <p className={`font-medium text-slate-800 text-sm leading-snug flex-1 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </p>
                  </div>

                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Footer Card: Time + Actions */}
                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pl-7">
                  <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{task.estimate}</span>
                  </div>

                  <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 hover:underline">
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                    
                    {/* ปุ่มลบ (Trash) ที่เรารวมเข้ามาเพื่อให้ Logic สมบูรณ์ */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State Helper */}
            {tasks.filter(t => t.status === column.id).length === 0 && (
              <div className="h-full min-h-[100px] border-2 border-dashed border-slate-200/50 rounded-lg flex items-center justify-center text-slate-400/50 text-sm italic">
                Drop items here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;