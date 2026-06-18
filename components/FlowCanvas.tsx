'use client';

import '@xyflow/react/dist/style.css';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import { FlowBlock, FlowEdge, BlockKind } from '@/lib/core/types';
import { useMemo } from 'react';

// =========================================================================
// COLOR PALETTE (Professional grade)
// =========================================================================

interface NodePalette {
  bg: string;       // card background
  border: string;   // card border + handles
  glow: string;     // shadow glow
  text: string;     // title text
  sub: string;      // subtitle text
  label: string;    // kind badge text
  badgeBg: string;  // kind badge background
}

const KIND_STYLES: Record<string, NodePalette> = {
  controller: {
    bg: 'linear-gradient(135deg, #1a1508 0%, #231b0e 100%)',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    text: '#fbbf24',
    sub: '#a68a3a',
    label: 'Controller',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
  },
  input: {
    bg: 'linear-gradient(135deg, #0c1825 0%, #0f2030 100%)',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.25)',
    text: '#60a5fa',
    sub: '#3b7090',
    label: 'Input',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
  },
  logic: {
    bg: 'linear-gradient(135deg, #140e1f 0%, #1a1230 100%)',
    border: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.25)',
    text: '#c4b5fd',
    sub: '#7c6a9a',
    label: 'Logic',
    badgeBg: 'rgba(167, 139, 250, 0.15)',
  },
  output: {
    bg: 'linear-gradient(135deg, #0a1a12 0%, #0f2618 100%)',
    border: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.25)',
    text: '#4ade80',
    sub: '#3a8a5a',
    label: 'Output',
    badgeBg: 'rgba(34, 197, 94, 0.15)',
  },
  connectivity: {
    bg: 'linear-gradient(135deg, #0a1a1a 0%, #0f2424 100%)',
    border: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.25)',
    text: '#67e8f9',
    sub: '#3a8a9a',
    label: 'Connectivity',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
  },
};

const DEFAULT_STYLE: NodePalette = {
  bg: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
  border: '#64748b',
  glow: 'rgba(100, 116, 139, 0.2)',
  text: '#cbd5e1',
  sub: '#64748b',
  label: 'Block',
  badgeBg: 'rgba(100, 116, 139, 0.15)',
};

function getStyle(kind: BlockKind): NodePalette {
  return KIND_STYLES[kind] ?? DEFAULT_STYLE;
}

// =========================================================================
// SVG ICONS per block kind
// =========================================================================

function ControllerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="8" width="20" height="12" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="rgba(245,158,11,0.08)" />
      <circle cx="14" cy="14" r="3" stroke="#f59e0b" strokeWidth="1.2" fill="rgba(245,158,11,0.12)" />
      <rect x="9" y="11" width="10" height="6" rx="1" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  );
}

function InputIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 14L12 8v12L6 14z" stroke="#3b82f6" strokeWidth="1.5" fill="rgba(59,130,246,0.12)" />
      <path d="M12 14h10" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="14" r="2" stroke="#3b82f6" strokeWidth="1" fill="rgba(59,130,246,0.15)" />
    </svg>
  );
}

function LogicIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 6l8 8-8 8-8-8 8-8z" stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.12)" />
      <path d="M14 10l4 4-4 4" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}

function OutputIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M22 14L16 8v12l6-6z" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.12)" />
      <path d="M16 14H6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="14" r="2" stroke="#22c55e" strokeWidth="1" fill="rgba(34,197,94,0.15)" />
    </svg>
  );
}

function ConnectivityIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M8 20a8 8 0 0112 0" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M11 17a5 5 0 016 0" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" stroke="#06b6d4" strokeWidth="1" fill="rgba(6,182,212,0.15)" />
    </svg>
  );
}

function DefaultIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="6" width="16" height="16" rx="3" stroke="#64748b" strokeWidth="1.5" fill="rgba(100,116,139,0.08)" />
    </svg>
  );
}

function getIcon(kind: BlockKind): React.ReactNode {
  switch (kind) {
    case 'controller': return <ControllerIcon />;
    case 'input': return <InputIcon />;
    case 'logic': return <LogicIcon />;
    case 'output': return <OutputIcon />;
    case 'connectivity': return <ConnectivityIcon />;
    default: return <DefaultIcon />;
  }
}

// =========================================================================
// CUSTOM PROFESSIONAL NODE
// =========================================================================

function ElectronicsNode({ data }: NodeProps) {
  const kind = data.kind as BlockKind;
  const style = getStyle(kind);

  return (
    <div
      className="group relative"
      style={{
        filter: `drop-shadow(0 4px 12px ${style.glow})`,
      }}
    >
      {/* Source handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: style.border,
          border: `3px solid #03110d`,
          right: -6,
          zIndex: 10,
        }}
      />

      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: style.border,
          border: `3px solid #03110d`,
          left: -6,
          zIndex: 10,
        }}
      />

      {/* Card */}
      <div
        className="flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl"
        style={{
          background: style.bg,
          borderColor: `${style.border}44`,
          borderWidth: 1,
          minWidth: 180,
          maxWidth: 260,
        }}
      >
        {/* Icon column */}
        <div
          className="flex-shrink-0 rounded-xl p-2"
          style={{
            backgroundColor: `${style.border}15`,
            border: `1px solid ${style.border}30`,
          }}
        >
          {getIcon(kind)}
        </div>

        {/* Text column */}
        <div className="flex flex-col gap-0.5 min-w-0">
          {/* Title */}
          <p
            className="text-sm font-bold leading-tight truncate"
            style={{ color: style.text }}
          >
            {data.label as string}
          </p>

          {/* Subtitle */}
          <p
            className="text-[11px] font-medium tracking-wide truncate"
            style={{ color: style.sub }}
          >
            {style.label}
          </p>

          {/* Kind badge */}
          <span
            className="mt-1 self-start inline-block rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: style.badgeBg,
              color: style.border,
            }}
          >
            {style.label}
          </span>
        </div>
      </div>

      {/* Description tooltip */}
      {(data.description as string) && (
        <div
          className="pointer-events-none absolute -top-2 left-1/2 z-50 max-w-64 -translate-x-1/2 -translate-y-full rounded-xl bg-gray-900 px-3.5 py-2.5 text-xs leading-relaxed text-gray-200 opacity-0 shadow-2xl transition-opacity duration-200 group-hover:opacity-100"
          style={{
            border: `1px solid ${style.border}40`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"
            style={{ borderRight: `1px solid ${style.border}20`, borderBottom: `1px solid ${style.border}20` }}
          />
          {data.description as string}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// NODE TYPES REGISTRATION
// =========================================================================

const nodeTypes = {
  default: ElectronicsNode,
  input: ElectronicsNode,
  output: ElectronicsNode,
  logic: ElectronicsNode,
  controller: ElectronicsNode,
  power: ElectronicsNode,
  connectivity: ElectronicsNode,
  storage: ElectronicsNode,
  cloud: ElectronicsNode,
};

// =========================================================================
// AUTO-LAYOUT: Inputs → Logic → Outputs
// =========================================================================

const COLUMN_MAP: Partial<Record<BlockKind, number>> = {
  power: 0,
  controller: 1,
  input: 0,
  logic: 2,
  output: 3,
  connectivity: 4,
};

function computeLayout(blocks: FlowBlock[]): Node[] {
  const counters: Record<number, number> = {};

  const powerCtrl = blocks.filter((b) => b.kind === 'power' || b.kind === 'controller');
  const rest = blocks.filter((b) => b.kind !== 'power' && b.kind !== 'controller');

  const result: Node[] = [];

  // Power + Controller at top center
  for (const b of powerCtrl) {
    const col = 1;
    const row = b.kind === 'power' ? 0 : 1;
    const x = col * 270 + 60;
    const y = row * 150 + 20;
    result.push({
      id: b.id,
      position: { x, y },
      data: { label: b.label, kind: b.kind, description: b.description },
      type: 'default',
    });
    counters[col] = Math.max(counters[col] ?? 0, row + 1);
  }

  // Rest in their columns
  for (const b of rest) {
    const col = COLUMN_MAP[b.kind] ?? 2;
    const row = counters[col] ?? 0;
    counters[col] = row + 1;
    const xOffset = b.kind === 'input' ? -40 : b.kind === 'output' ? 40 : 0;
    const x = col * 270 + 60 + xOffset;
    const y = row * 150 + 80;
    result.push({
      id: b.id,
      position: { x, y },
      data: { label: b.label, kind: b.kind, description: b.description },
      type: 'default',
    });
  }

  return result;
}

// =========================================================================
// EDGE STYLING: SmoothStep, animated
// =========================================================================

function buildEdges(edges: FlowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? '',
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#34d399',
      strokeWidth: 2.5,
    },
    labelStyle: {
      fill: '#6ee7b7',
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'ui-monospace, monospace',
    },
    labelBgStyle: {
      fill: '#0a1f18',
      fillOpacity: 0.9,
      rx: 6,
      ry: 6,
    },
    labelBgPadding: [10, 5] as [number, number],
    labelBgBorderRadius: 6,
  }));
}

// =========================================================================
// MAIN EXPORT — API unchanged
// =========================================================================

export default function FlowCanvas({
  blocks,
  edges,
}: {
  blocks: FlowBlock[];
  edges: FlowEdge[];
}) {
  const nodes = useMemo(() => computeLayout(blocks), [blocks]);
  const reactEdges = useMemo(() => buildEdges(edges), [edges]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-emerald-800/50 bg-[#050f0b] shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={reactEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.25}
        maxZoom={2.5}
        panOnDrag
        zoomOnScroll
        zoomOnDoubleClick
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#34d399', strokeWidth: 2.5 },
        }}
      >
        {/* Subtle dark grid */}
        <Background color="#1a3a2e" gap={28} size={1} />

        {/* Professional minimap */}
        <MiniMap
          style={{
            backgroundColor: '#07130f',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
          nodeColor={(node) => {
            const kind = (node.data as any)?.kind as BlockKind | undefined;
            return kind ? getStyle(kind).border : '#64748b';
          }}
          maskColor="rgba(3, 17, 13, 0.75)"
        />

        {/* Styled controls */}
        <Controls
          style={{
            backgroundColor: '#0a1f18',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            color: '#34d399',
          }}
        />
      </ReactFlow>
    </div>
  );
}