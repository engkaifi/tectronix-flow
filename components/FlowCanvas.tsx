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
// COLOR PALETTE PER BLOCK KIND
// =========================================================================

const KIND_COLORS: Partial<Record<BlockKind, { bg: string; border: string; text: string; label: string }>> = {
  controller: {
    bg: 'rgba(251, 191, 36, 0.12)',
    border: '#f59e0b',
    text: '#fbbf24',
    label: 'Controller',
  },
  input: {
    bg: 'rgba(56, 189, 248, 0.10)',
    border: '#38bdf8',
    text: '#7dd3fc',
    label: 'Input',
  },
  logic: {
    bg: 'rgba(52, 211, 153, 0.10)',
    border: '#34d399',
    text: '#6ee7b7',
    label: 'Logic',
  },
  output: {
    bg: 'rgba(248, 113, 113, 0.10)',
    border: '#f87171',
    text: '#fca5a5',
    label: 'Output',
  },
  power: {
    bg: 'rgba(192, 132, 252, 0.10)',
    border: '#c084fc',
    text: '#d8b4fe',
    label: 'Power',
  },
  connectivity: {
    bg: 'rgba(45, 212, 191, 0.10)',
    border: '#2dd4bf',
    text: '#5eead4',
    label: 'Connectivity',
  },
};

const DEFAULT_COLOR = {
  bg: 'rgba(148, 163, 184, 0.08)',
  border: '#64748b',
  text: '#94a3b8',
  label: 'Block',
};

function getColor(kind: BlockKind) {
  return KIND_COLORS[kind] ?? DEFAULT_COLOR;
}

// =========================================================================
// CUSTOM NODE COMPONENTS
// =========================================================================

/** Shared node layout: colored left border, label, kind badge, description on hover. */
function BaseNode({ data }: NodeProps) {
  const color = getColor(data.kind as BlockKind);

  return (
    <div
      className="group relative rounded-xl border-l-4 px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-xl"
      style={{
        backgroundColor: color.bg,
        borderLeftColor: color.border,
        borderWidth: '1px 1px 1px 4px',
        borderStyle: 'solid',
        borderColor: `${color.border}33 ${color.border}22 ${color.border}22 ${color.border}`,
        minWidth: 160,
        maxWidth: 240,
      }}
      title={data.description as string}
    >
      {/* Source handle (right side — output) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          backgroundColor: color.border,
          border: '2px solid #03110d',
          right: -5,
        }}
      />

      {/* Target handle (left side — input) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          backgroundColor: color.border,
          border: '2px solid #03110d',
          left: -5,
        }}
      />

      {/* Block label */}
      <p
        className="text-sm font-bold leading-tight"
        style={{ color: color.text }}
      >
        {data.label as string}
      </p>

      {/* Kind badge */}
      <span
        className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{
          backgroundColor: `${color.border}22`,
          color: color.text,
        }}
      >
        {color.label}
      </span>

      {/* Description tooltip on hover */}
      {(data.description as string) && (
        <div
          className="pointer-events-none absolute -top-2 left-1/2 z-50 max-w-56 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-3 py-2 text-xs text-gray-200 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
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
  default: BaseNode,
  input: BaseNode,
  output: BaseNode,
  logic: BaseNode,
  controller: BaseNode,
  power: BaseNode,
  connectivity: BaseNode,
  storage: BaseNode,
  cloud: BaseNode,
};

// =========================================================================
// AUTO-LAYOUT ALGORITHM
// =========================================================================

/**
 * Improved flow-oriented layout:
 *
 *   Power (top center)
 *      │
 *   Controller (center)
 *     ╱ ╲
 *   Inputs (left)   Logic (center-right)
 *                      │
 *                  Outputs (right)
 *                      │
 *               Connectivity (bottom)
 *
 * Columns: power=0, controller=1, input=0, logic=2, output=3, connectivity=4
 * Rows are stacked vertically within each column.
 */
function computeLayout(blocks: FlowBlock[]): Node[] {
  // Define column order for a natural left-to-right flow
  const columnOrder: Partial<Record<BlockKind, number>> = {
    power: 0,
    controller: 1,
    input: 0,
    logic: 2,
    output: 3,
    connectivity: 4,
  };

  // Track how many nodes have been placed in each column
  const columnCounters: Record<number, number> = {};

  // Separate power and controller to place them at top center
  const specialBlocks: FlowBlock[] = [];
  const normalBlocks: FlowBlock[] = [];

  for (const b of blocks) {
    if (b.kind === 'power' || b.kind === 'controller') {
      specialBlocks.push(b);
    } else {
      normalBlocks.push(b);
    }
  }

  const result: Node[] = [];

  // Place power and controller at the top with specific positions
  for (const b of specialBlocks) {
    const col = b.kind === 'power' ? 1 : 1; // both in center column
    const row = b.kind === 'power' ? 0 : 1; // power above controller
    const x = col * 240 + 40;
    const y = row * 140 + 20;

    result.push({
      id: b.id,
      position: { x, y },
      data: {
        label: b.label,
        kind: b.kind,
        description: b.description,
      },
      type: 'default',
    });

    columnCounters[col] = Math.max(columnCounters[col] ?? 0, row + 1);
  }

  // Place remaining blocks in their columns
  for (const b of normalBlocks) {
    const col = columnOrder[b.kind] ?? 2;
    const row = columnCounters[col] ?? 0;
    columnCounters[col] = row + 1;

    // Offset inputs to the left, outputs to the right
    const xOffset = b.kind === 'input' ? -60 : b.kind === 'output' ? 60 : 0;
    const x = col * 240 + 40 + xOffset;
    const y = row * 140 + 60;

    result.push({
      id: b.id,
      position: { x, y },
      data: {
        label: b.label,
        kind: b.kind,
        description: b.description,
      },
      type: 'default',
    });
  }

  return result;
}

// =========================================================================
// EDGE STYLING
// =========================================================================

/**
 * Converts FlowEdges to React Flow Edge objects with styling.
 */
function buildEdges(edges: FlowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? '',
    animated: true,
    style: {
      stroke: '#34d399',
      strokeWidth: 2,
    },
    labelStyle: {
      fill: '#6ee7b7',
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'monospace',
    },
    labelBgStyle: {
      fill: '#0a1f18',
      fillOpacity: 0.85,
      rx: 4,
      ry: 4,
    },
    labelBgPadding: [8, 4] as [number, number],
    labelBgBorderRadius: 4,
  }));
}

// =========================================================================
// MAIN EXPORT
// =========================================================================

/**
 * Interactive electronics block diagram using React Flow.
 *
 * @param blocks - Array of FlowBlock from the core engine.
 * @param edges  - Array of FlowEdge from the core engine.
 *
 * Fully backward-compatible. Accepts the same data shape as before.
 */
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
    <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-emerald-900 bg-[#07130f]">
      <ReactFlow
        nodes={nodes}
        edges={reactEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#34d399', strokeWidth: 2 },
        }}
      >
        <Background color="#1a3a2e" gap={24} size={1} />
        <MiniMap
          style={{
            backgroundColor: '#07130f',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: 8,
          }}
          nodeColor={(node) => {
            const kind = (node.data as any)?.kind as BlockKind | undefined;
            return kind ? getColor(kind).border : '#64748b';
          }}
          maskColor="rgba(3, 17, 13, 0.7)"
        />
        <Controls
          style={{
            backgroundColor: '#0a1f18',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: 8,
            fill: '#34d399',
          }}
        />
      </ReactFlow>
    </div>
  );
}