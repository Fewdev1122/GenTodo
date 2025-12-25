import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  Handle,           // ✅ ต้อง import Handle
  Position          // ✅ ต้อง import Position
} from 'reactflow';
import { Sparkles, CheckCircle2, Circle, Layers } from 'lucide-react'; 
import 'reactflow/dist/style.css';

// ==========================================
// 🎨 PART 1: Custom Nodes + Handles (แก้ตรงนี้)
// ==========================================

// สไตล์สำหรับ Handle (จุดเชื่อมต่อ) -> เราซ่อนไว้ (opacity: 0) และไว้ตรงกลาง
const handleStyle = { 
  width: 1, 
  height: 1, 
  opacity: 0, 
  top: '50%', 
  left: '50%',
  background: 'transparent'
};

const ProjectNode = ({ data }) => (
  <div className="relative group">
    {/* ✅ เพิ่ม Handle (Source) สำหรับปล่อยเส้นออกไป */}
    <Handle type="source" position={Position.Bottom} style={handleStyle} />
    
    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
    <div className="relative px-6 py-6 bg-slate-900 border-2 border-amber-500/50 rounded-full flex flex-col items-center justify-center w-[160px] h-[160px] text-center shadow-2xl">
      <Sparkles className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
      <div className="text-white font-bold text-sm uppercase tracking-widest text-opacity-80">Project</div>
      <div className="text-white font-bold text-lg leading-tight mt-1 px-2 line-clamp-2">{data.label}</div>
    </div>
  </div>
);

const FeatureNode = ({ data }) => (
  <div className="relative group w-[180px]">
     {/* ✅ เพิ่ม Handle (Target) รับเส้นจาก Project และ (Source) ส่งไป Task */}
     <Handle type="target" position={Position.Top} style={handleStyle} />
     <Handle type="source" position={Position.Bottom} style={handleStyle} />

     <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
     <div className="relative bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 p-3 rounded-xl flex items-center space-x-3 shadow-xl">
        <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
           <Layers className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Feature</p>
           <p className="text-white font-medium text-sm truncate">{data.label}</p>
        </div>
     </div>
  </div>
);

const TaskNode = ({ data }) => {
  const isDone = data.status === 'done';
  return (
    <div className={`relative group w-[200px] transition-all duration-300 ${isDone ? 'opacity-60 grayscale-[0.5]' : 'hover:scale-105'}`}>
       {/* ✅ เพิ่ม Handle (Target) รับเส้นจาก Feature */}
       <Handle type="target" position={Position.Top} style={handleStyle} />

       {!isDone && <div className="absolute -inset-[1px] bg-gradient-to-r from-white/20 to-white/0 rounded-lg blur-sm"></div>}
       <div className={`relative p-3 rounded-lg border backdrop-blur-md flex items-start space-x-3 shadow-lg 
          ${isDone 
            ? 'bg-emerald-900/40 border-emerald-500/30' 
            : 'bg-slate-800/80 border-slate-600 hover:border-slate-400'
          }`}>
          <div className={`mt-0.5 ${isDone ? 'text-emerald-400' : 'text-slate-400'}`}>
             {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          </div>
          <div className="flex-1">
             <p className={`text-xs font-medium leading-snug ${isDone ? 'text-emerald-100/70 line-through' : 'text-slate-200'}`}>
                {data.label}
             </p>
          </div>
       </div>
    </div>
  );
};

// Define nodeTypes outside
const nodeTypes = {
  projectNode: ProjectNode,
  featureNode: FeatureNode,
  taskNode: TaskNode,
};

// ==========================================
// 🚀 PART 2: Main Component Logic
// ==========================================

const ConstellationView = ({ plan }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!plan || !plan.features) return { initialNodes: [], initialEdges: [] };

    const nodes = [];
    const edges = [];
    const centerX = 0;
    const centerY = 0;

    // --- 1. CENTER NODE ---
    const centerId = `plan-${plan.id}`;
    nodes.push({
      id: centerId,
      type: 'projectNode',
      position: { x: centerX - 80, y: centerY - 80 },
      data: { label: plan.title },
    });

    const features = plan.features || [];
    const featureCount = features.length;
    const featureRadius = 350;

    features.forEach((feature, fIdx) => {
      const angle = (fIdx / featureCount) * 2 * Math.PI;
      const fX = centerX + featureRadius * Math.cos(angle);
      const fY = centerY + featureRadius * Math.sin(angle);
      const featureId = `feat-${fIdx}`;

      nodes.push({
        id: featureId,
        type: 'featureNode',
        position: { x: fX - 90, y: fY - 30 },
        data: { label: feature.name },
      });

      // Edge: Project -> Feature
      edges.push({
        id: `e-${centerId}-${featureId}`,
        source: centerId,
        target: featureId,
        animated: true,
        style: { 
            stroke: '#f59e0b', 
            strokeWidth: 2, 
            opacity: 0.6,
            strokeDasharray: '10, 10' 
        },
      });

      const tasks = feature.tasks || [];
      const taskCount = tasks.length;
      const taskRadius = 180; 

      tasks.forEach((task, tIdx) => {
         const spreadAngle = (Math.PI / 1.5);
         const startAngle = angle - (spreadAngle/2);
         const taskAngle = startAngle + (tIdx / (taskCount - 1 || 1)) * spreadAngle;

         const tX = fX + taskRadius * Math.cos(taskAngle);
         const tY = fY + taskRadius * Math.sin(taskAngle);

         const taskId = `task-${fIdx}-${tIdx}`;
         const isDone = (task.status || '').toLowerCase() === 'done';

         nodes.push({
            id: taskId,
            type: 'taskNode',
            position: { x: tX - 100, y: tY - 20 },
            data: { 
              label: task.task || task.title, 
              status: isDone ? 'done' : 'todo'
            },
         });

         // Edge: Feature -> Task
         edges.push({
            id: `e-${featureId}-${taskId}`,
            source: featureId,
            target: taskId,
            animated: !isDone,
            style: { 
               stroke: isDone ? '#10b981' : '#94a3b8',
               strokeWidth: isDone ? 1 : 1.5,
               opacity: isDone ? 0.3 : 0.5,
               strokeDasharray: isDone ? '0' : '5, 5'
            }
         });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [plan]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!plan) return <div className="text-white text-center p-10">No Data</div>;

  return (
    <div className="w-full h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative group">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black z-0"></div>
       
       <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center space-x-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Constellation View</span>
          </div>
       </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        className="z-10"
      >
        <Background color="#fff" gap={50} size={1} variant="dots" className="opacity-10" />
        <Controls className="bg-slate-800 text-white border-slate-700 fill-white" />
        <MiniMap 
            nodeColor={(node) => {
                if (node.type === 'projectNode') return '#f59e0b';
                if (node.type === 'featureNode') return '#3b82f6';
                return '#475569';
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg" 
            maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};

export default ConstellationView;