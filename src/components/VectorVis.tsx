import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VectorPoint {
  x: number;
  y: number;
  text: string;
  type: 'document' | 'query';
  id: string;
}

interface VectorVisProps {
  data: VectorPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg text-xs max-w-[200px]">
        <p className="font-semibold text-slate-200 mb-1">{data.type === 'query' ? '🔍 Query' : '📄 Document'}</p>
        <p className="text-slate-400 italic">"{data.text}"</p>
        <div className="mt-2 text-slate-500 font-mono">
          x: {data.x.toFixed(3)}, y: {data.y.toFixed(3)}
        </div>
      </div>
    );
  }
  return null;
};

export function VectorVis({ data }: VectorVisProps) {
  // Determine domain for axes to keep the chart centered and scaled
  const allX = data.map(p => p.x);
  const allY = data.map(p => p.y);
  
  const minX = Math.min(...allX, -0.1);
  const maxX = Math.max(...allX, 0.1);
  const minY = Math.min(...allY, -0.1);
  const maxY = Math.max(...allY, 0.1);

  const padding = 0.2; // Add some padding around the points

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis 
            type="number" 
            dataKey="x" 
            name="dimension 1" 
            domain={[minX - padding, maxX + padding]} 
            hide 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="dimension 2" 
            domain={[minY - padding, maxY + padding]} 
            hide 
          />
          <ZAxis type="number" range={[100, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Vectors" data={data}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'query' ? '#F43F5E' : '#3B82F6'} 
                stroke={entry.type === 'query' ? '#fff' : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 right-4 flex gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-400">Document</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 border border-white"></div>
          <span className="text-slate-400">Query</span>
        </div>
      </div>
    </div>
  );
}
