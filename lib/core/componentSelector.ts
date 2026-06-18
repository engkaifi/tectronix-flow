/**
 * Tectronix Flow — Smart Component Intelligence Engine
 * ======================================================
 *
 * This module implements a deterministic rule-based component selector
 * that maps the parsed IdeaAnalysis to concrete electronic components.
 *
 * Sections:
 *   1. Controller selector  — picks the best board (Uno / Nano / ESP32 / Pico)
 *   2. Sensor selector      — matches detected inputs to catalog entries
 *   3. Actuator selector    — matches detected outputs to catalog entries
 *   4. Power compat check   — validates voltage compatibility
 *   5. Confidence scorer    — scores each selection
 *   6. Cost estimator       — totals estimated prices
 *   7. Main export          — componentSelector(analysis) → ComponentOption[]
 */

import { componentCatalog } from '@/lib/data/componentCatalog';
import { ComponentOption, Controller, IdeaAnalysis } from './types';

// =========================================================================
// HELPER CONSTANTS
// =========================================================================

/** Standard logic voltage levels per controller. */
const CONTROLLER_VOLTAGE: Record<Controller, '3.3V' | '5V'> = {
  'Arduino Uno': '5V',
  'Arduino Nano': '5V',
  ESP32: '3.3V',
  'Raspberry Pi Pico': '3.3V',
};

/**
 * Controller suitability ratings for different domains.
 * Higher score = better fit. Scale: 1 (poor) – 10 (excellent).
 */
const DOMAIN_CONTROLLER_FIT: Record<Controller, Record<string, number>> = {
  'Arduino Uno': {
    'smart home / automation': 6,
    'agriculture / irrigation': 8,
    'robotics / motion control': 7,
    'environmental monitoring': 7,
    'security / alarm': 6,
    'health / medical': 7,
    'education / learning': 10,
    'industrial / control': 5,
    'consumer / gadget': 7,
    other: 8,
  },
  'Arduino Nano': {
    'smart home / automation': 5,
    'agriculture / irrigation': 7,
    'robotics / motion control': 6,
    'environmental monitoring': 8,
    'security / alarm': 5,
    'health / medical': 6,
    'education / learning': 8,
    'industrial / control': 4,
    'consumer / gadget': 8,
    other: 7,
  },
  ESP32: {
    'smart home / automation': 10,
    'agriculture / irrigation': 7,
    'robotics / motion control': 6,
    'environmental monitoring': 9,
    'security / alarm': 10,
    'health / medical': 8,
    'education / learning': 6,
    'industrial / control': 8,
    'consumer / gadget': 9,
    other: 7,
  },
  'Raspberry Pi Pico': {
    'smart home / automation': 6,
    'agriculture / irrigation': 5,
    'robotics / motion control': 8,
    'environmental monitoring': 6,
    'security / alarm': 5,
    'health / medical': 7,
    'education / learning': 9,
    'industrial / control': 6,
    'consumer / gadget': 7,
    other: 6,
  },
};

/** Connectivity-to-controller preference mapping. */
const CONNECTIVITY_CONTROLLER_PREF: Record<string, Controller> = {
  WiFi: 'ESP32',
  Bluetooth: 'ESP32',
  MQTT: 'ESP32',
};

/** Extra hints in the analysis that may steer controller choice. */
const MOTOR_CONTROL_CONTROLLERS: Controller[] = ['Raspberry Pi Pico', 'Arduino Uno'];
const LOW_POWER_CONTROLLERS: Controller[] = ['Arduino Nano', 'Raspberry Pi Pico'];

// =========================================================================
// 1. CONTROLLER SELECTOR
// =========================================================================

/**
 * Scores all candidate controllers and returns the best match.
 */
function selectBestController(analysis: IdeaAnalysis): {
  selected: Controller;
  candidates: Array<{ controller: Controller; score: number; reason: string }>;
} {
  const allControllers: Controller[] = [
    'Arduino Uno',
    'Arduino Nano',
    'ESP32',
    'Raspberry Pi Pico',
  ];

  const scored = allControllers.map((ctrl) => {
    let score = 0;
    const reasons: string[] = [];

    // --- Connectivity match ---
    if (analysis.connectivity !== 'none' && CONNECTIVITY_CONTROLLER_PREF[analysis.connectivity] === ctrl) {
      score += 30;
      reasons.push(`native ${analysis.connectivity} support`);
    } else if (analysis.connectivity !== 'none' && ctrl === 'ESP32') {
      // ESP32 handles all connectivity types well
      score += 20;
      reasons.push('handles WiFi/Bluetooth/MQTT');
    }

    // --- Domain fit ---
    const domainFit = DOMAIN_CONTROLLER_FIT[ctrl][analysis.domain] ?? 8;
    score += domainFit;
    if (domainFit >= 9) reasons.push('excellent domain fit');

    // --- Size/compact preference ---
    if (analysis.constraints.compact && (ctrl === 'Arduino Nano' || ctrl === 'Raspberry Pi Pico')) {
      score += 15;
      reasons.push('compact form factor');
    }

    // --- Low power preference ---
    if (analysis.constraints.lowPower && LOW_POWER_CONTROLLERS.includes(ctrl)) {
      score += 10;
      reasons.push('low power suitable');
    }

    // --- Beginner friendly ---
    if (analysis.constraints.beginnerFriendly && ctrl === 'Arduino Uno') {
      score += 10;
      reasons.push('beginner-friendly ecosystem');
    }

    // --- Motor/robotics projects benefit from Pico or Uno ---
    if (
      (analysis.detectedOutputs.includes('motor') || analysis.domain === 'robotics / motion control') &&
      MOTOR_CONTROL_CONTROLLERS.includes(ctrl)
    ) {
      score += 5;
      reasons.push('good for motor control');
    }

    // --- Professional projects prefer ESP32 or Pico ---
    if (analysis.constraints.professional && (ctrl === 'ESP32' || ctrl === 'Raspberry Pi Pico')) {
      score += 5;
      reasons.push('professional-grade features');
    }

    // --- Low cost preference penalizes expensive controllers ---
    if (analysis.constraints.lowCost) {
      // Uno/ESP32/Pico ~22-35 SAR, Nano clones ~10 SAR
      if (ctrl === 'Arduino Nano') score += 5;
      else if (ctrl === 'Raspberry Pi Pico') score += 2;
    }

    // --- I2C display projects benefit from 5V logic (Uno/Nano) ---
    if (analysis.hasDisplay && (ctrl === 'Arduino Uno' || ctrl === 'Arduino Nano')) {
      score += 3;
      reasons.push('5V logic good for I2C LCD');
    }

    // --- Power source compatibility ---
    if (analysis.powerSource === 'battery' && (ctrl === 'Arduino Nano' || ctrl === 'Raspberry Pi Pico')) {
      score += 5;
      reasons.push('battery-friendly');
    }

    const reason = reasons.length > 0 ? reasons.join('; ') : 'default candidate';

    return { controller: ctrl, score, reason };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return {
    selected: scored[0].controller,
    candidates: scored,
  };
}

// =========================================================================
// 2. COMPONENT LOOKUP WITH FALLBACK
// =========================================================================

/**
 * Looks up a component key in the catalog and returns the candidate list.
 * Falls back to a generated entry if the key is not in the catalog.
 */
function lookupComponent(
  key: string,
  category: string,
  analysis: IdeaAnalysis
): ComponentOption[] {
  const catalogEntries = componentCatalog[key];
  if (catalogEntries && catalogEntries.length > 0) {
    return catalogEntries.map((entry) => ({ ...entry }));
  }

  // Fallback: generate a placeholder entry
  const fallback: ComponentOption = {
    key: `fallback-${key}`,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
    category,
    beginnerReason: 'Custom component — verify specifications before purchasing.',
    estimatedPriceSar: 0,
    selectionConfidence: 0.2,
    selectionReason: 'Fallback — not found in component catalog.',
  };

  return [fallback];
}

// =========================================================================
// 3. VOLTAGE COMPATIBILITY CHECK
// =========================================================================

/**
 * Determines if a component voltage is compatible with the controller's logic level.
 * Returns true if compatible, false if a level shifter or different part is needed.
 */
function isVoltageCompatible(componentVoltage: string | undefined, controllerLogic: string): boolean {
  if (!componentVoltage) return true;

  const ctrl = controllerLogic; // '3.3V' or '5V'
  const comp = componentVoltage.toLowerCase();

  // "logic" level components are always compatible (driven by GPIO)
  if (comp.includes('logic')) return true;

  // "3.3V-5V" or "3.3V/5V" works with any controller
  if (comp.includes('3.3v-5v') || comp.includes('3.3v/5v')) return true;

  // Exact match
  if (comp.includes(ctrl.toLowerCase())) return true;

  // 5V component on 3.3V controller → may need level shifting
  if (ctrl === '3.3V' && comp.includes('5v')) return false;

  // 3.3V component on 5V controller → usually safe (pins are 5V tolerant)
  if (ctrl === '5V' && comp.includes('3.3v')) return true;

  return true;
}

// =========================================================================
// 4. CONFIDENCE SCORING
// =========================================================================

/**
 * Computes a confidence score for selecting this component for the given purpose.
 *
 * Factors:
 *   - 0.7 base for any matched catalog entry
 *   - +0.1 if it's the primary (first) catalog entry for this key
 *   - +0.1 if voltage is compatible with controller
 *   - -0.2 if fallback (not in catalog)
 *   - Clamped to [0.2, 1.0]
 */
function computeSelectionConfidence(
  isPrimary: boolean,
  isFallback: boolean,
  voltageCompatible: boolean
): number {
  let score = 0.7;

  if (isPrimary) score += 0.1;
  if (voltageCompatible) score += 0.1;
  if (isFallback) score -= 0.5;

  return Math.max(0.2, Math.min(1.0, score));
}

// =========================================================================
// 5. MAIN EXPORT
// =========================================================================

/**
 * Selects electronic components based on the analyzed project idea.
 *
 * @param analysis - The structured IdeaAnalysis from the idea analyzer.
 * @returns An array of ComponentOption objects with selection metadata.
 *
 * Backward-compatible: all existing fields (key, name, category, etc.)
 * are preserved. New fields (selectionConfidence, selectionReason,
 * alternatives) are additive.
 */
export function componentSelector(analysis: IdeaAnalysis): ComponentOption[] {
  const selected: ComponentOption[] = [];
  const controllerLogic = CONTROLLER_VOLTAGE[analysis.controller];

  // ---- Step 1: Pick the best controller (may differ from analysis.controller) ----
  const controllerSelection = selectBestController(analysis);
  const bestController = controllerSelection.selected;

  // Build controller alternatives list
  const controllerAlternatives: ComponentOption[] = controllerSelection.candidates
    .filter((c) => c.controller !== bestController)
    .slice(0, 3) // top 3 alternatives
    .map((c) => {
      const entries = componentCatalog[c.controller];
      if (entries && entries.length > 0) {
        return {
          ...entries[0],
          selectionReason: `Score ${c.score}: ${c.reason}`,
          selectionConfidence: 0.5,
        };
      }
      return {
        key: `fallback-${c.controller}`,
        name: c.controller,
        category: 'controller',
        beginnerReason: 'Alternative controller option.',
        estimatedPriceSar: 0,
        selectionReason: `Score ${c.score}: ${c.reason}`,
        selectionConfidence: 0.3,
      };
    });

  // Select the primary controller entry from catalog
  const controllerEntry = lookupComponent(bestController, 'controller', analysis);
  const primaryController = controllerEntry[0];
  primaryController.selectionConfidence = computeSelectionConfidence(true, false, true);
  primaryController.selectionReason = `Best fit for ${analysis.domain} domain`;
  primaryController.alternatives = controllerAlternatives;
  selected.push(primaryController);

  // ---- Step 2: Select sensor components for each detected input ----
  let totalVoltageIssues = 0;
  let fallbackCount = 0;

  for (const input of analysis.detectedInputs) {
    const candidates = lookupComponent(input, 'sensor', analysis);
    const isFallback = candidates.length === 1 && candidates[0].key.startsWith('fallback-');
    if (isFallback) fallbackCount++;

    const primary = candidates[0];
    const voltageOk = isVoltageCompatible(primary.voltage, controllerLogic);
    if (!voltageOk) totalVoltageIssues++;

    // Attach selection metadata
    primary.selectionConfidence = computeSelectionConfidence(
      candidates.length > 1 || !isFallback,
      isFallback,
      voltageOk
    );
    primary.selectionReason = isFallback
      ? `Sensor "${input}" not in catalog — verify manually.`
      : `Detected input: ${input}. ${voltageOk ? 'Voltage-compatible.' : 'Check logic level compatibility.'}`;

    // Attach alternatives (remaining candidates beyond the first)
    if (candidates.length > 1) {
      primary.alternatives = candidates.slice(1).map((alt, i) => ({
        ...alt,
        selectionConfidence: 0.6 - i * 0.1,
        selectionReason: `Alternative ${input} sensor.`,
      }));
    }

    selected.push(primary);
  }

  // ---- Step 3: Select actuator/components for each detected output ----
  for (const output of analysis.detectedOutputs) {
    const candidates = lookupComponent(output, 'actuator', analysis);
    const isFallback = candidates.length === 1 && candidates[0].key.startsWith('fallback-');
    if (isFallback) fallbackCount++;

    const primary = candidates[0];
    const voltageOk = isVoltageCompatible(primary.voltage, controllerLogic);
    if (!voltageOk) totalVoltageIssues++;

    primary.selectionConfidence = computeSelectionConfidence(
      candidates.length > 1 || !isFallback,
      isFallback,
      voltageOk
    );
    primary.selectionReason = isFallback
      ? `Actuator "${output}" not in catalog — verify manually.`
      : `Detected output: ${output}. ${voltageOk ? 'Voltage-compatible.' : 'May require external power/driver.'}`;

    // Attach alternatives
    if (candidates.length > 1) {
      primary.alternatives = candidates.slice(1).map((alt, i) => ({
        ...alt,
        selectionConfidence: 0.6 - i * 0.1,
        selectionReason: `Alternative ${output} option.`,
      }));
    }

    selected.push(primary);
  }

  // ---- Step 4: Append required infrastructure components ----
  const hasJumperWires = selected.some((s) => s.key === 'jumper-wires');
  if (!hasJumperWires) {
    selected.push({
      key: 'jumper-wires',
      name: 'Jumper Wires (M-M, M-F)',
      category: 'wiring',
      beginnerReason: 'للتوصيل الأولي على Breadboard.',
      estimatedPriceSar: 5,
      selectionConfidence: 1.0,
      selectionReason: 'Required for breadboard prototyping.',
    });
  }

  const hasBreadboard = selected.some((s) => s.key === 'breadboard');
  if (!hasBreadboard) {
    selected.push({
      key: 'breadboard',
      name: 'Solderless Breadboard (830 point)',
      category: 'prototyping',
      beginnerReason: 'يسمح بالتجربة بدون لحام.',
      estimatedPriceSar: 10,
      selectionConfidence: 1.0,
      selectionReason: 'Required for breadboard prototyping.',
    });
  }

  // ---- Step 5: Add power supply if battery/mains detected ----
  if (analysis.powerSource === 'battery') {
    selected.push({
      key: 'battery-pack-4xAA',
      name: '4x AA Battery Holder with Switch',
      category: 'power',
      beginnerReason: 'يزود المشروع ببطارية AA قابلة للاستبدال.',
      estimatedPriceSar: 5,
      selectionConfidence: 0.9,
      selectionReason: 'Battery power source detected.',
    });
  } else if (analysis.powerSource === 'mains AC') {
    selected.push({
      key: 'power-adapter-5v',
      name: '5V 2A Power Adapter',
      category: 'power',
      beginnerReason: 'يزود المشروع بتيار ثابت من الكهرباء المنزلية.',
      estimatedPriceSar: 12,
      selectionConfidence: 0.9,
      selectionReason: 'Mains AC power source detected.',
    });
  } else if (analysis.powerSource === 'solar') {
    selected.push({
      key: 'solar-panel-5v',
      name: '5V 1W Solar Panel',
      category: 'power',
      beginnerReason: 'لوح شمسي صغير لتغذية المشروع بالطاقة الشمسية.',
      estimatedPriceSar: 20,
      selectionConfidence: 0.8,
      selectionReason: 'Solar power source detected.',
    });
  }

  // ---- Step 6: If display was detected and no display component selected yet, add one ----
  if (analysis.hasDisplay && !selected.some((s) => s.category === 'display')) {
    const displayDefault = lookupComponent('display', 'display', analysis);
    if (displayDefault.length > 0) {
      const disp = displayDefault[0];
      disp.selectionConfidence = 0.7;
      disp.selectionReason = 'Display feedback requested.';
      selected.push(disp);
    }
  }

  return selected;
}