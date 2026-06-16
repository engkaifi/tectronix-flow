# Tectronix Flow Beta — Core Engine v1

AI Electronics Operating System for beginners and innovators.

## What this beta does
User idea → functional blocks → recommended components → schematic-level connections → BOM → Arduino/ESP32 firmware draft → validation warnings → export project JSON.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- React Flow via `@xyflow/react`
- Local JSON/mock catalog first
- Clean core engine modules ready for future PostgreSQL and EDA integrations

## Core modules
- `lib/core/ideaAnalyzer.ts`
- `lib/core/blockGenerator.ts`
- `lib/core/componentSelector.ts`
- `lib/core/schematicPlanner.ts`
- `lib/core/bomGenerator.ts`
- `lib/core/firmwareGenerator.ts`
- `lib/core/validationEngine.ts`

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Future integration path
- tscircuit: generate circuit-like JSX/TS from `schematicPlanner`
- KiCad: export netlist + footprints after adding footprint catalog
- SKiDL: Python netlist generation layer
- ngspice: simulate simple analog/power subcircuits
- PlatformIO: compile/upload firmware after board profile selection
- PostgreSQL: store projects, BOMs, components, and generated revisions

## Important safety note
Firmware and wiring are beginner drafts. Any pump, motor, fan, relay, mains load, or external power must be validated by a qualified electronics engineer before physical use.
