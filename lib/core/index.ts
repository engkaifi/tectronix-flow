import { ideaAnalyzer } from './ideaAnalyzer';
import { blockGenerator } from './blockGenerator';
import { componentSelector } from './componentSelector';
import { schematicPlanner } from './schematicPlanner';
import { bomGenerator } from './bomGenerator';
import { firmwareGenerator } from './firmwareGenerator';
import { validationEngine } from './validationEngine';
import { GeneratedProject } from './types';
export function generateProject(idea: string): GeneratedProject { const analysis=ideaAnalyzer(idea); const {blocks,edges}=blockGenerator(analysis); const components=componentSelector(analysis); const schematic=schematicPlanner(analysis,components); const bom=bomGenerator(components); const firmware=firmwareGenerator(analysis); const base={analysis,blocks,edges,components,schematic,bom,firmware,createdAt:new Date().toISOString(),version:'core-engine-v1' as const}; return {...base,warnings:validationEngine(base)}; }
export * from './types';
