'use client';
import '@xyflow/react/dist/style.css';
import { Background, Controls, MiniMap, ReactFlow, Node, Edge } from '@xyflow/react';
import { FlowBlock, FlowEdge } from '@/lib/core/types';
function layout(blocks: FlowBlock[]): Node[] {
  const groups: Record<string, number> = { power: 0, input: 1, controller: 2, logic: 3, output: 4, connectivity: 5 };
  const counters: Record<string, number> = {};
  return blocks.map((b) => {
    const col = groups[b.kind] ?? 0;
    const row = counters[b.kind] ?? 0;
    counters[b.kind] = row + 1;
    return { id: b.id, position: { x: col * 210, y: row * 115 + 40 }, data: { label: `${b.label}\n${b.kind}` }, type: 'default' };
  });
}
export default function FlowCanvas({ blocks, edges }: { blocks: FlowBlock[]; edges: FlowEdge[] }) {
  const nodes = layout(blocks);
  const reactEdges: Edge[] = edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label, animated: true }));
  return <div className="h-[520px] rounded-2xl overflow-hidden border border-emerald-900 bg-[#07130f]"><ReactFlow nodes={nodes} edges={reactEdges} fitView><Background /><MiniMap /><Controls /></ReactFlow></div>;
}
