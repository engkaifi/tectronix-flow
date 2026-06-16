export type Controller = 'Arduino Uno' | 'Arduino Nano' | 'ESP32';
export type Connectivity = 'none' | 'WiFi' | 'Bluetooth' | 'MQTT';
export type BlockKind = 'input' | 'logic' | 'output' | 'connectivity' | 'controller' | 'power';
export type SupportedInput = 'temperature' | 'humidity' | 'soil moisture' | 'light' | 'motion' | 'distance' | 'button';
export type SupportedOutput = 'LED' | 'buzzer' | 'relay' | 'fan' | 'pump' | 'motor' | 'display';
export interface IdeaAnalysis { originalIdea: string; detectedInputs: SupportedInput[]; detectedOutputs: SupportedOutput[]; logic: string[]; connectivity: Connectivity; controller: Controller; confidence: number; assumptions: string[]; }
export interface FlowBlock { id: string; label: string; kind: BlockKind; description: string; meta?: Record<string, string | number | boolean>; }
export interface FlowEdge { id: string; source: string; target: string; label?: string; }
export interface ComponentOption { key: string; name: string; category: string; beginnerReason: string; pins?: string[]; voltage?: string; estimatedPriceSar?: number; }
export interface SchematicConnection { from: string; to: string; signal: string; notes: string; }
export interface BomItem { item: string; qty: number; role: string; estimatedPriceSar: number; alternatives?: string[]; }
export interface FirmwareDraft { language: 'Arduino C++'; target: Controller; code: string; notes: string[]; }
export interface ValidationWarning { severity: 'info' | 'warning' | 'critical'; message: string; fix: string; }
export interface GeneratedProject { analysis: IdeaAnalysis; blocks: FlowBlock[]; edges: FlowEdge[]; components: ComponentOption[]; schematic: SchematicConnection[]; bom: BomItem[]; firmware: FirmwareDraft; warnings: ValidationWarning[]; createdAt: string; version: 'core-engine-v1'; }
