export type Controller = 'Arduino Uno' | 'Arduino Nano' | 'ESP32';
export type Connectivity = 'none' | 'WiFi' | 'Bluetooth' | 'MQTT';
export type BlockKind = 'input' | 'logic' | 'output' | 'connectivity' | 'controller' | 'power';
export type SupportedInput = 'temperature' | 'humidity' | 'soil moisture' | 'light' | 'motion' | 'distance' | 'button';
export type SupportedOutput = 'LED' | 'buzzer' | 'relay' | 'fan' | 'pump' | 'motor' | 'display';

/** Domain category detected from the idea description. */
export type ProjectDomain =
  | 'smart home / automation'
  | 'agriculture / irrigation'
  | 'robotics / motion control'
  | 'environmental monitoring'
  | 'security / alarm'
  | 'health / medical'
  | 'education / learning'
  | 'industrial / control'
  | 'consumer / gadget'
  | 'other';

/** Power source hints extracted from the idea. */
export type PowerSourceHint = 'USB' | 'battery' | 'mains AC' | 'solar' | 'unknown';

/** Constraints or preferences mentioned in the idea. */
export interface ProjectConstraints {
  lowCost?: boolean;
  lowPower?: boolean;
  compact?: boolean;
  beginnerFriendly?: boolean;
  professional?: boolean;
  portable?: boolean;
}

export interface IdeaAnalysis {
  originalIdea: string;

  // --- Core electronics intent (preserved for backward compatibility) ---
  detectedInputs: SupportedInput[];
  detectedOutputs: SupportedOutput[];
  logic: string[];
  connectivity: Connectivity;
  controller: Controller;
  confidence: number;
  assumptions: string[];

  // --- New structured parser fields ---
  /** The domain/application area of the project. */
  domain: ProjectDomain;

  /** Power source hints extracted from the idea. */
  powerSource: PowerSourceHint;

  /** Constraints or preferences mentioned. */
  constraints: ProjectConstraints;

  /** Whether a visual display/feedback was requested. */
  hasDisplay: boolean;

  /** Whether the idea explicitly mentions a specific sensor not in the standard list. */
  customSensorHints: string[];

  /** Whether the idea explicitly mentions a specific actuator not in the standard list. */
  customActuatorHints: string[];

  /** Questions to ask the user when the idea is ambiguous. */
  clarificationQuestions: string[];
}

export interface FlowBlock { id: string; label: string; kind: BlockKind; description: string; meta?: Record<string, string | number | boolean>; }
export interface FlowEdge { id: string; source: string; target: string; label?: string; }
export interface ComponentOption { key: string; name: string; category: string; beginnerReason: string; pins?: string[]; voltage?: string; estimatedPriceSar?: number; }
export interface SchematicConnection { from: string; to: string; signal: string; notes: string; }
export interface BomItem { item: string; qty: number; role: string; estimatedPriceSar: number; alternatives?: string[]; }
export interface FirmwareDraft { language: 'Arduino C++'; target: Controller; code: string; notes: string[]; }
export interface ValidationWarning { severity: 'info' | 'warning' | 'critical'; message: string; fix: string; }
export interface GeneratedProject { analysis: IdeaAnalysis; blocks: FlowBlock[]; edges: FlowEdge[]; components: ComponentOption[]; schematic: SchematicConnection[]; bom: BomItem[]; firmware: FirmwareDraft; warnings: ValidationWarning[]; createdAt: string; version: 'core-engine-v1'; }