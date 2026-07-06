import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SearchResult } from '../types';
import { Search, Loader2 } from 'lucide-react';

const ResultNode = ({ data, id }: any) => {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] text-zinc-900 dark:text-white p-5 rounded-3xl w-80 shadow-xl border border-zinc-200 dark:border-zinc-800 font-sans transition-colors group">
      <Handle type="target" position={Position.Left} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {data.domain && (
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
           <img src={`https://www.google.com/s2/favicons?domain=${data.domain}&sz=32`} alt="favicon" className="w-4 h-4 rounded-sm" />
           {data.domain}
        </div>
      )}
      
      <h3 className="font-bold text-lg mb-3 leading-tight">{data.title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 line-clamp-5 leading-relaxed">{data.snippet}</p>
      
      <div className="flex justify-center mt-2">
        <button 
          onClick={() => data.onAskFollowUp(id)}
          className="bg-zinc-100 dark:bg-white text-zinc-900 px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-colors shadow-sm"
        >
          Ask Follow Up
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const InputNode = ({ data, id }: any) => {
  const [val, setVal] = React.useState('');
  
  return (
    <div className="bg-white dark:bg-[#242424] text-zinc-900 dark:text-white p-4 rounded-2xl w-80 shadow-xl border border-zinc-200 dark:border-zinc-700 transition-colors group">
      <Handle type="target" position={Position.Left} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Type your follow-up question..."
        className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px] resize-none mb-3"
      />
      <div className="flex justify-between gap-3">
        <button 
          onClick={() => data.onCancel(id)}
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => data.onSubmit(id, val)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          Ask
        </button>
      </div>
      <Handle type="source" position={Position.Right} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const QueryNode = ({ data }: any) => {
  return (
    <div className="bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-xl font-bold border border-indigo-500 group flex items-center gap-3 max-w-[320px]">
      <Search className="w-5 h-5 opacity-70 flex-shrink-0" />
      <span className="truncate">{data.label}</span>
      <Handle type="target" position={Position.Left} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const nodeTypes = {
  result: ResultNode,
  input: InputNode,
  query: QueryNode
};

interface NodeGraphProps {
  query: string;
  results: SearchResult[];
}

export function NodeGraph({ query, results }: NodeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onAskFollowUp = useCallback((sourceId: string) => {
    const newNodeId = `input-${Date.now()}`;
    
    setNodes((nds) => {
      const sourceNode = nds.find(n => n.id === sourceId);
      if (!sourceNode) return nds;

      const newNode = {
        id: newNodeId,
        type: 'input',
        position: { x: sourceNode.position.x + 400, y: sourceNode.position.y },
        data: {
          onCancel: (id: string) => {
            setNodes(n => n.filter(x => x.id !== id));
            setEdges(e => e.filter(x => x.source !== id && x.target !== id));
          },
          onSubmit: async (id: string, val: string) => {
             // Turn into query node
             setNodes(n => n.map(node => {
               if (node.id === id) {
                 return {
                   ...node,
                   type: 'query',
                   data: { label: val }
                 };
               }
               return node;
             }));
          }
        }
      };
      return [...nds, newNode];
    });

    setEdges((eds) => {
      return [...eds, {
        id: `edge-${sourceId}-${newNodeId}`,
        source: sourceId,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#a1a1aa', strokeDasharray: '4 4' },
      }];
    });
  }, [setNodes, setEdges]);

  useEffect(() => {
    const initialNodes: any[] = [];
    const initialEdges: any[] = [];

    initialNodes.push({
      id: 'root',
      type: 'query',
      position: { x: 50, y: Math.max(results.length * 400, 600) / 2 - 100 },
      data: { label: query || 'Search Query' }
    });

    results.forEach((result, idx) => {
      const id = `res-${idx}`;
      
      let domain = '';
      try {
        domain = new URL(result.url).hostname;
      } catch(e) {}

      initialNodes.push({
        id,
        type: 'result',
        position: { x: 450, y: 50 + idx * 350 },
        data: {
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          domain,
          onAskFollowUp
        }
      });

      initialEdges.push({
        id: `e-root-${id}`,
        source: 'root',
        target: id,
        type: 'smoothstep',
        style: { stroke: '#71717a', strokeWidth: 2 }
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [query, results, onAskFollowUp, setNodes, setEdges]);

  return (
    <div className="w-full h-[700px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] shadow-sm relative">
      <div className="absolute top-4 left-4 z-10 text-xs font-mono text-zinc-500 uppercase tracking-widest bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 backdrop-blur shadow-sm pointer-events-none">
        Rabbit Hole Knowledge Graph
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="#71717a" gap={24} size={2} />
        <Controls className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 fill-zinc-600 dark:fill-zinc-300" />
      </ReactFlow>
    </div>
  );
}
