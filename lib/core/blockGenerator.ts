/**
 * Tectronix Flow — Dynamic Graph Generator (v2)
 * ==============================================
 *
 * Generates a deterministic, dynamic FlowBlock + FlowEdge graph from
 * IdeaAnalysis. The graph follows a logical electronics architecture:
 *
 *   Power Supply
 *       │
 *   Controller ──→ Connectivity (optional)
 *       │
 *   Inputs ──→ Logic ──→ Outputs
 *
 * Each detected sensor/actuator/logic pattern produces dedicated blocks
 * and edges. IDs are predictable and stable for the same analysis.
 *
 * Output is fully compatible with FlowCanvas and preserves the existing
 * { blocks: FlowBlock[]; edges: FlowEdge[] } contract.
 */

import { FlowBlock, FlowEdge, IdeaAnalysis } from './types';

// =========================================================================
// CONSTANTS
// =========================================================================

/** Human-readable descriptions per BlockKind for auto-generated blocks. */
const KIND_DESCRIPTIONS: Record<string, string> = {
  controller: 'Main microcontroller that runs firmware and coordinates all subsystems.',
  power: 'Provides regulated voltage rails for the controller, sensors, and actuators.',
  input: 'Reads a physical quantity from the environment and converts it to an electrical signal.',
  logic: 'Evaluates sensor data against rules and decides when to activate outputs.',
  output: 'Acts on the physical world — turns devices on/off or modulates their intensity.',
  connectivity: 'Enables remote data exchange via wireless or wired communication protocols.',
};

/** Descriptive labels for logic patterns detected during analysis. */
const LOGIC_LABELS: Record<string, string> = {
  threshold: 'Threshold Compare',
  'if/then': 'Conditional Logic',
  timer: 'Timer Control',
  'on/off control': 'On/Off Control',
  proportional: 'Proportional (PID)',
  counter: 'Pulse Counter',
  'data logging': 'Data Logger',
  compare: 'Value Compare',
};

// =========================================================================
// HELPER: SAFE ID GENERATION
// =========================================================================

/**
 * Generates a deterministic, URL-safe block identifier.
 * Pattern: {kind}-{slugified-label-or-index}
 */
function blockId(kind: string, label: string, index?: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  const suffix = index !== undefined ? `-${index}` : '';
  return `${kind}-${slug}${suffix}`;
}

/**
 * Generates a deterministic edge identifier.
 * Pattern: e-{source-id}-to-{target-id}
 */
function edgeId(source: string, target: string): string {
  return `e-${source}-to-${target}`;
}

// =========================================================================
// GRAPH BUILDER
// =========================================================================

/**
 * Builds a dynamic electronics graph from the parsed idea analysis.
 *
 * Architecture:
 *   1. Power block (always present)
 *   2. Controller block (always present, named from analysis.controller)
 *   3. Input blocks (one per detectedInput)
 *   4. Logic blocks (one per detected logic pattern)
 *   5. Output blocks (one per detectedOutput)
 *   6. Connectivity block (if connectivity !== 'none')
 *
 * Edges connect: power→controller, controller→logic, inputs→logic,
 * logic→outputs, controller→connectivity.
 *
 * @param analysis - Structured analysis from ideaAnalyzer.
 * @returns Object with blocks[] and edges[] arrays.
 */
export function blockGenerator(analysis: IdeaAnalysis): {
  blocks: FlowBlock[];
  edges: FlowEdge[];
} {
  const blocks: FlowBlock[] = [];
  const edges: FlowEdge[] = [];

  // ---- Step 1: Power Supply (always present) ----
  blocks.push({
    id: 'power',
    label: 'Power Supply',
    kind: 'power',
    description: KIND_DESCRIPTIONS['power'],
    meta: { suggestedVoltage: '5V', suggestedCurrent: '1A' },
  });

  // ---- Step 2: Controller ----
  const controllerId = 'controller';
  blocks.push({
    id: controllerId,
    label: analysis.controller,
    kind: 'controller',
    description: KIND_DESCRIPTIONS['controller'],
    meta: { controllerType: analysis.controller },
  });

  // Edge: power → controller
  edges.push({
    id: edgeId('power', controllerId),
    source: 'power',
    target: controllerId,
    label: 'VCC / GND',
  });

  // ---- Step 3: Input (sensor) blocks ----
  const inputIds: string[] = [];
  const detectedInputs = analysis.detectedInputs;

  for (let i = 0; i < detectedInputs.length; i++) {
    const input = detectedInputs[i];
    // Generate a stable ID: e.g. input-soil-moisture-0
    const id = detectedInputs.length > 1
      ? blockId('input', input, i)
      : blockId('input', input);

    blocks.push({
      id,
      label: input,
      kind: 'input',
      description: `Reads ${input} from the environment.`,
      meta: { sensorType: input, index: i },
    });

    inputIds.push(id);
  }

  // ---- Step 4: Logic blocks ----
  const logicIds: string[] = [];
  const logicPatterns = analysis.logic;

  for (let i = 0; i < logicPatterns.length; i++) {
    const pattern = logicPatterns[i];
    const label = LOGIC_LABELS[pattern] ?? pattern;
    const id = logicPatterns.length > 1
      ? blockId('logic', pattern, i)
      : blockId('logic', pattern);

    blocks.push({
      id,
      label,
      kind: 'logic',
      description: KIND_DESCRIPTIONS['logic'],
      meta: { logicType: pattern, index: i },
    });

    logicIds.push(id);
  }

  // ---- Step 5: Output (actuator) blocks ----
  const outputIds: string[] = [];
  const detectedOutputs = analysis.detectedOutputs;

  for (let i = 0; i < detectedOutputs.length; i++) {
    const output = detectedOutputs[i];
    const id = detectedOutputs.length > 1
      ? blockId('output', output, i)
      : blockId('output', output);

    blocks.push({
      id,
      label: output,
      kind: 'output',
      description: `Controls ${output}.`,
      meta: { actuatorType: output, index: i },
    });

    outputIds.push(id);
  }

  // ---- Step 6: Connectivity block (optional) ----
  const hasConnectivity = analysis.connectivity !== 'none';
  if (hasConnectivity) {
    blocks.push({
      id: 'connectivity',
      label: analysis.connectivity,
      kind: 'connectivity',
      description: KIND_DESCRIPTIONS['connectivity'],
      meta: { protocol: analysis.connectivity },
    });
  }

  // =====================================================================
  // EDGE CONSTRUCTION
  // =====================================================================

  // --- Controller → first logic block (firmware execution) ---
  if (logicIds.length > 0) {
    edges.push({
      id: edgeId(controllerId, logicIds[0]),
      source: controllerId,
      target: logicIds[0],
      label: 'runs firmware',
    });
  }

  // --- Each input → first logic block (sensor data flow) ---
  if (logicIds.length > 0) {
    for (const inputId of inputIds) {
      edges.push({
        id: edgeId(inputId, logicIds[0]),
        source: inputId,
        target: logicIds[0],
        label: 'sensor data',
      });
    }
  }

  // --- Chained logic: logic-0 → logic-1 → logic-2 ... ---
  for (let i = 1; i < logicIds.length; i++) {
    edges.push({
      id: edgeId(logicIds[i - 1], logicIds[i]),
      source: logicIds[i - 1],
      target: logicIds[i],
      label: 'condition met',
    });
  }

  // --- Last logic block → each output (actuator control) ---
  const lastLogicId = logicIds.length > 0 ? logicIds[logicIds.length - 1] : null;
  if (lastLogicId) {
    for (const outputId of outputIds) {
      edges.push({
        id: edgeId(lastLogicId, outputId),
        source: lastLogicId,
        target: outputId,
        label: 'control signal',
      });
    }
  }

  // --- Fallback: if no logic blocks, connect controller directly to outputs ---
  if (!lastLogicId && outputIds.length > 0) {
    for (const outputId of outputIds) {
      edges.push({
        id: edgeId(controllerId, outputId),
        source: controllerId,
        target: outputId,
        label: 'direct control',
      });
    }
  }

  // --- Controller → connectivity (data uplink) ---
  if (hasConnectivity) {
    edges.push({
      id: edgeId(controllerId, 'connectivity'),
      source: controllerId,
      target: 'connectivity',
      label: 'telemetry / commands',
    });
  }

  return { blocks, edges };
}