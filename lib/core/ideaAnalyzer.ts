/**
 * Tectronix Flow — AI Idea Analyzer
 * ===================================
 *
 * This module implements a deterministic, rule-based electronics intent parser.
 * It transforms a free-text idea (e.g. "smart irrigation system") into a
 * structured IdeaAnalysis object used by downstream generators.
 *
 * Sections:
 *   1. Keyword dictionaries  — sensor, actuator, connectivity, etc.
 *   2. Domain classifier      — maps idea to a project domain
 *   3. Power source parser    — extracts USB / battery / mains / solar hints
 *   4. Constraint detector    — low-cost, low-power, compact, etc.
 *   5. Logic extractor        — control patterns (threshold, timer, etc.)
 *   6. Controller selector    — picks Uno / Nano / ESP32
 *   7. Confidence calculator  — scores how well the idea was understood
 *   8. Clarification builder  — generates questions when the idea is vague
 *   9. Main export            — ideaAnalyzer(idea) → IdeaAnalysis
 */

import {
  Connectivity,
  Controller,
  IdeaAnalysis,
  PowerSourceHint,
  ProjectConstraints,
  ProjectDomain,
  SupportedInput,
  SupportedOutput,
} from './types';

// =========================================================================
// 1. KEYWORD DICTIONARIES
// =========================================================================

/**
 * Input (sensor) keywords per supported type.
 * Each entry maps a SupportedInput to a list of trigger words/phrases.
 * Includes Arabic keywords for bilingual support.
 */
const inputKeywords: Record<SupportedInput, string[]> = {
  temperature: [
    'temperature',
    'temp',
    'heat',
    'hot',
    'cold',
    'thermometer',
    'thermistor',
    'حرارة',
    'درجة الحرارة',
    'تبريد',
    'سخونة',
  ],
  humidity: [
    'humidity',
    'humid',
    'رطوبة',
    'الرطوبة',
  ],
  'soil moisture': [
    'soil',
    'moisture',
    'plant',
    'irrigation',
    'garden',
    'farm',
    'greenhouse',
    'تربة',
    'ري',
    'مزرعة',
    'نبات',
    'رطوبة التربة',
    'دفيئة',
  ],
  light: [
    'light',
    'dark',
    'ldr',
    'sun',
    'brightness',
    'photoresistor',
    'photodiode',
    'ضوء',
    'إضاءة',
    'ظلام',
    'شمس',
    'استشعار الضوء',
  ],
  motion: [
    'motion',
    'movement',
    'presence',
    'security',
    'alarm',
    'pir',
    'حركة',
    'أمان',
    'حساس حركة',
    'إنذار',
    'استشعار الحركة',
  ],
  distance: [
    'distance',
    'ultrasonic',
    'parking',
    'obstacle',
    'level',
    'range',
    'مسافة',
    'موقف',
    'عائق',
    'مستوى',
    'فوق صوتي',
  ],
  button: [
    'button',
    'switch',
    'manual',
    'push',
    'toggle',
    'keypad',
    'زر',
    'مفتاح',
    'تشغيل يدوي',
    'ضغط',
  ],
};

/**
 * Output (actuator) keywords per supported type.
 */
const outputKeywords: Record<SupportedOutput, string[]> = {
  LED: [
    'led',
    'indicator',
    'lamp',
    'light indicator',
    'blink',
    'signal light',
    'لمبة',
    'مؤشر',
    'ضوء led',
  ],
  buzzer: [
    'buzzer',
    'alarm',
    'sound',
    'alert',
    'beep',
    'siren',
    'جرس',
    'تنبيه',
    'صوت',
    'إنذار',
    'صفارة',
  ],
  relay: [
    'relay',
    'ريليه',
    'م relay',
  ],
  fan: [
    'fan',
    'cooling',
    'ventilation',
    'exhaust',
    'مروحة',
    'تبريد',
    'تهوية',
    'شفط',
  ],
  pump: [
    'pump',
    'water',
    'irrigation',
    'مضخة',
    'ماء',
    'ري',
    'ضخ',
  ],
  motor: [
    'motor',
    'robot',
    'wheel',
    'door',
    'gate',
    'servo',
    'stepper',
    'dc motor',
    'محرك',
    'روبوت',
    'باب',
    'بوابة',
    'سيرفو',
  ],
  display: [
    'display',
    'lcd',
    'screen',
    'monitor',
    'show',
    'oled',
    'tft',
    'شاشة',
    'عرض',
    'lcd display',
  ],
};

/**
 * Connectivity keywords ordered by specificity (MQTT → WiFi → Bluetooth).
 */
const connectivityPatterns: Array<{ type: Connectivity; keywords: string[] }> = [
  {
    type: 'MQTT',
    keywords: ['mqtt', 'message queue'],
  },
  {
    type: 'WiFi',
    keywords: [
      'wifi',
      'wi-fi',
      'internet',
      'cloud',
      'app',
      'iot',
      'web',
      'http',
      'api',
      'remote monitoring',
      'online',
      'تطبيق',
      'انترنت',
      'سحابة',
      'ويب',
    ],
  },
  {
    type: 'Bluetooth',
    keywords: [
      'bluetooth',
      'ble',
      'bt',
      'بلوتوث',
    ],
  },
];

// =========================================================================
// 2. DOMAIN CLASSIFIER
// =========================================================================

/**
 * Maps an idea to a ProjectDomain by matching domain-specific keywords.
 * The first matching domain wins (most-specific first).
 */
const domainPatterns: Array<{ domain: ProjectDomain; keywords: string[] }> = [
  {
    domain: 'agriculture / irrigation',
    keywords: [
      'irrigation', 'farm', 'farming', 'greenhouse', 'soil', 'crop',
      'plant', 'garden', 'agriculture', 'hydroponic', 'ري', 'مزرعة',
      'دفيئة', 'زراعة', 'نبات',
    ],
  },
  {
    domain: 'robotics / motion control',
    keywords: [
      'robot', 'robotic', 'arm', 'wheel', 'servo', 'stepper',
      'motor control', 'autonomous', 'روبوت', 'محرك', 'ذراع',
    ],
  },
  {
    domain: 'security / alarm',
    keywords: [
      'security', 'alarm', 'intrusion', 'lock', 'door', 'gate',
      'surveillance', 'camera', 'motion detector', 'أمان', 'إنذار',
      'باب', 'بوابة', 'مراقبة',
    ],
  },
  {
    domain: 'environmental monitoring',
    keywords: [
      'weather', 'environment', 'air quality', 'pollution', 'monitor',
      'sensor network', 'data logging', 'co2', 'pm2.5', 'بيئة',
      'طقس', 'مراقبة', 'تلوث',
    ],
  },
  {
    domain: 'health / medical',
    keywords: [
      'health', 'medical', 'heart', 'pulse', 'heartbeat', 'patient',
      'hospital', 'fitness', 'bpm', 'ecg', 'صحي', 'طبي', 'قلب',
      'مستشفى', 'لياقة',
    ],
  },
  {
    domain: 'smart home / automation',
    keywords: [
      'smart home', 'home automation', 'lighting', 'curtain', 'blind',
      'thermostat', 'ac control', 'smart', 'منزل ذكي', 'أتمتة',
      'إضاءة منزل', 'ستارة',
    ],
  },
  {
    domain: 'industrial / control',
    keywords: [
      'industrial', 'factory', 'plc', 'conveyor', 'manufacturing',
      'process control', 'automation', 'مصنع', 'صناعي', 'تحكم صناعي',
      'إنتاج',
    ],
  },
  {
    domain: 'education / learning',
    keywords: [
      'learning', 'education', 'school', 'classroom', 'tutorial',
      'beginner', 'student', 'teach', 'تعليم', 'مدرسة', 'مبتدئ',
      'طالب', 'تعلم',
    ],
  },
  {
    domain: 'consumer / gadget',
    keywords: [
      'gadget', 'toy', 'game', 'interactive', 'decoration',
      'wearable', 'personal', 'device', 'أداة', 'لعبة', 'إلكتروني',
    ],
  },
];

// =========================================================================
// 3. POWER SOURCE PARSER
// =========================================================================

/**
 * Detects power source hints from the idea text.
 * Priority: USB → battery → solar → mains AC → unknown.
 */
const powerPatterns: Array<{ source: PowerSourceHint; keywords: string[] }> = [
  {
    source: 'USB',
    keywords: ['usb', 'usb power', 'usb-c', 'micro usb'],
  },
  {
    source: 'battery',
    keywords: [
      'battery', 'batteries', 'battery powered', 'rechargeable',
      'li-ion', 'lipo', '18650', 'بطارية', 'بطاريات', 'قابلة للشحن',
    ],
  },
  {
    source: 'solar',
    keywords: ['solar', 'sun', 'photovoltaic', 'pv panel', 'طاقة شمسية', 'شمسي', 'لوح شمسي'],
  },
  {
    source: 'mains AC',
    keywords: ['wall plug', 'ac power', 'mains', '220v', '110v', 'power outlet', 'كهرباء منزل', 'فيشة'],
  },
];

// =========================================================================
// 4. CONSTRAINT DETECTOR
// =========================================================================

/**
 * Detects project constraints from keywords in the idea.
 */
const constraintPatterns: Array<{
  key: keyof ProjectConstraints;
  keywords: string[];
}> = [
  {
    key: 'lowCost',
    keywords: ['cheap', 'low cost', 'budget', 'inexpensive', 'affordable', 'رخيص', 'منخفض التكلفة', 'اقتصادي'],
  },
  {
    key: 'lowPower',
    keywords: ['low power', 'energy efficient', 'battery life', 'power saving', 'استهلاك منخفض', 'توفير طاقة'],
  },
  {
    key: 'compact',
    keywords: ['small', 'compact', 'tiny', 'miniature', 'wearable', 'صغير', 'مصغر', 'محمو'],
  },
  {
    key: 'beginnerFriendly',
    keywords: ['beginner', 'easy', 'simple', 'starter', '入门', 'مبتدئ', 'سهل', 'بسيط'],
  },
  {
    key: 'professional',
    keywords: ['professional', 'industrial grade', 'production', 'commercial', 'متقدم', 'احترافي', 'صناعي'],
  },
  {
    key: 'portable',
    keywords: ['portable', 'mobile', 'handheld', 'wearable', 'محمول', 'يدوي', 'متنقل'],
  },
];

// =========================================================================
// 5. HELPER FUNCTIONS
// =========================================================================

/** Lowercases a string and normalizes Arabic to aid matching. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[ًٌٍَُِّْٰٓٔ]/g, ''); // strip Arabic diacritics for matching
}

/** Find dictionary keys whose keywords appear in the text. */
function findMatches<T extends string>(
  idea: string,
  dict: Record<T, string[]>
): T[] {
  const text = normalize(idea);
  return Object.entries(dict)
    .filter(([, keys]) =>
      (keys as string[]).some((key) => text.includes(key.toLowerCase()))
    )
    .map(([key]) => key as T);
}

/** Deduplicate an array while preserving order. */
function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

/** Check if the idea contains any of the given keywords (case-insensitive). */
function hasAny(text: string, keywords: string[]): boolean {
  const lower = normalize(text);
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/** Return the first matching domain, defaulting to 'other'. */
function classifyDomain(idea: string): ProjectDomain {
  for (const pattern of domainPatterns) {
    if (hasAny(idea, pattern.keywords)) {
      return pattern.domain;
    }
  }
  return 'other';
}

/** Detect power source. */
function detectPowerSource(idea: string): PowerSourceHint {
  for (const pattern of powerPatterns) {
    if (hasAny(idea, pattern.keywords)) {
      return pattern.source;
    }
  }
  return 'unknown';
}

/** Detect project constraints. */
function detectConstraints(idea: string): ProjectConstraints {
  const constraints: ProjectConstraints = {};
  for (const pattern of constraintPatterns) {
    if (hasAny(idea, pattern.keywords)) {
      constraints[pattern.key] = true;
    }
  }
  return constraints;
}

/** Detect connectivity (MQTT > WiFi > Bluetooth > none). */
function detectConnectivity(idea: string): Connectivity {
  for (const pattern of connectivityPatterns) {
    if (hasAny(idea, pattern.keywords)) {
      return pattern.type;
    }
  }
  return 'none';
}

/** Select the best-fit controller based on connectivity and size hints. */
function selectController(idea: string, connectivity: Connectivity): Controller {
  if (connectivity !== 'none') return 'ESP32';

  // Check for size hints that suggest Nano
  const sizeHints = ['small', 'compact', 'tiny', 'mini', 'صغير', 'مصغر', 'محمو'];
  if (hasAny(idea, sizeHints)) return 'Arduino Nano';

  return 'Arduino Uno';
}

/** Extract control logic patterns from the idea. */
function extractLogic(idea: string): string[] {
  const logic: string[] = [];
  const lower = normalize(idea);

  // Threshold-based decisions
  if (
    /threshold|less than|greater than|below|above|dry|too hot|too cold|low|high|أقل|أعلى|جاف|مرتفع|منخفض/i.test(
      lower
    )
  ) {
    logic.push('threshold');
  }

  // Conditional logic
  if (/if|when|otherwise|else|إذا|عندما|لو|إلا/i.test(lower)) {
    logic.push('if/then');
  }

  // Time-based logic
  if (/timer|time|schedule|every|delay|duration|interval|وقت|مؤقت|جدولة|كل|مدة|فترة/i.test(lower)) {
    logic.push('timer');
  }

  // On/off control
  if (/turn on|turn off|start|stop|activate|deactivate|تشغيل|إيقاف|تفعيل/i.test(lower)) {
    logic.push('on/off control');
  }

  // Proportional / PID control
  if (/proportional|pid|gradual|smooth|variable|تدريجي|متغير|نسبة/i.test(lower)) {
    logic.push('proportional');
  }

  // Counter / pulse counting
  if (/count|counter|pulse|frequency|عدد|تردد/i.test(lower)) {
    logic.push('counter');
  }

  // Data logging
  if (/log|logging|record|data|save|store|تسجيل|بيانات|حفظ/i.test(lower)) {
    logic.push('data logging');
  }

  // Fallback: if nothing detected, assume basic control
  if (!logic.length) {
    logic.push('compare', 'on/off control');
  }

  return logic;
}

/** Detect custom sensor/actuator hints not in the standard list. */
function extractCustomHints(idea: string): { sensors: string[]; actuators: string[] } {
  const sensors: string[] = [];
  const actuators: string[] = [];
  const lower = normalize(idea);

  // Common non-standard sensor mentions
  const sensorPatterns: Array<{ name: string; keywords: string[] }> = [
    { name: 'gas sensor', keywords: ['gas sensor', 'mq-2', 'mq-135', 'co2 sensor'] },
    { name: 'rain sensor', keywords: ['rain sensor', 'rain drop'] },
    { name: 'flame sensor', keywords: ['flame sensor', 'fire sensor'] },
    { name: 'touch sensor', keywords: ['touch sensor', 'capacitive touch'] },
    { name: 'hall effect', keywords: ['hall effect', 'magnetic sensor'] },
    { name: 'sound sensor', keywords: ['sound sensor', 'microphone', 'audio sensor'] },
    { name: 'pressure sensor', keywords: ['pressure sensor', 'barometric', 'bmp180', 'bmp280'] },
    { name: 'current sensor', keywords: ['current sensor', 'acs712'] },
  ];

  for (const p of sensorPatterns) {
    if (hasAny(lower, p.keywords)) sensors.push(p.name);
  }

  // Common non-standard actuator mentions
  const actuatorPatterns: Array<{ name: string; keywords: string[] }> = [
    { name: 'solenoid valve', keywords: ['solenoid', 'valve'] },
    { name: 'heater', keywords: ['heater', 'heating element', 'heating'] },
    { name: 'vibration motor', keywords: ['vibration motor', 'vibrating'] },
    { name: 'speaker', keywords: ['speaker', 'audio output'] },
    { name: 'strip LED', keywords: ['strip led', 'neopixel', 'ws2812', 'rgb strip'] },
  ];

  for (const p of actuatorPatterns) {
    if (hasAny(lower, p.keywords)) actuators.push(p.name);
  }

  return { sensors, actuators };
}

// =========================================================================
// 6. CONFIDENCE CALCULATOR
// =========================================================================

/**
 * Calculates how well the idea was understood on a 0–1 scale.
 *
 * Factors:
 *   - Base confidence: 0.35 (default for any parseable idea)
 *   - +0.15 per detected input type (max +0.45)
 *   - +0.10 per detected output type (max +0.30)
 *   - +0.05 per detected logic type (max +0.15)
 *   - +0.10 if domain is not 'other'
 *   - +0.05 if power source is known
 *   - -0.05 per silent default (inputs/outputs filled in without evidence)
 *   - Clamped to [0.10, 0.98]
 */
function calculateConfidence(
  detectedInputs: number,
  detectedOutputs: number,
  logic: number,
  domain: ProjectDomain,
  powerSource: PowerSourceHint,
  silentDefaults: number
): number {
  let score = 0.35;

  score += Math.min(detectedInputs * 0.15, 0.45);
  score += Math.min(detectedOutputs * 0.10, 0.30);
  score += Math.min(logic * 0.05, 0.15);
  if (domain !== 'other') score += 0.10;
  if (powerSource !== 'unknown') score += 0.05;
  score -= silentDefaults * 0.05;

  return Math.max(0.10, Math.min(0.98, score));
}

// =========================================================================
// 7. CLARIFICATION QUESTION GENERATOR
// =========================================================================

/**
 * Generates a list of questions to ask the user when the idea is ambiguous.
 * Each question targets a missing or uncertain aspect of the project.
 */
function generateClarificationQuestions(
  idea: string,
  detectedInputs: SupportedInput[],
  detectedOutputs: SupportedOutput[],
  domain: ProjectDomain,
  powerSource: PowerSourceHint,
  connectivity: Connectivity,
  customSensors: string[],
  customActuators: string[]
): string[] {
  const questions: string[] = [];

  // --- Missing sensors ---
  if (detectedInputs.length === 0) {
    questions.push('ما الحساسات التي تريد استخدامها؟ (مثال: حرارة، رطوبة، ضوء، حركة)');
    questions.push('What sensors do you want to use? (e.g., temperature, humidity, light, motion)');
  }

  // --- Missing actuators ---
  if (detectedOutputs.length === 0) {
    questions.push('ما المخرجات التي تريد التحكم بها؟ (مثال: محرك، مضخة، لمبة LED، شاشة)');
    questions.push('What outputs do you want to control? (e.g., motor, pump, LED, display)');
  }

  // --- Unknown domain ---
  if (domain === 'other') {
    questions.push('ما هو مجال المشروع؟ (منزل ذكي، زراعة، روبوت، أمن، ...)');
    questions.push('What is the project domain? (smart home, agriculture, robotics, security, ...)');
  }

  // --- Unknown power source ---
  if (powerSource === 'unknown') {
    questions.push('كيف ستعمل تغذية المشروع؟ (USB، بطارية، طاقة شمسية، كهرباء منزل)');
    questions.push('How will the project be powered? (USB, battery, solar, mains AC)');
  }

  // --- Connectivity: keyword 'app' but no explicit WiFi/BT ---
  if (
    connectivity === 'none' &&
    (normalize(idea).includes('app') || normalize(idea).includes('تطبيق'))
  ) {
    questions.push('هل تريد الاتصال عبر WiFi أم Bluetooth؟');
    questions.push('Do you want WiFi or Bluetooth connectivity?');
  }

  // --- Custom sensor hints were detected but can't be fully resolved ---
  if (customSensors.length > 0) {
    questions.push(
      `لاحظت ذكر "${customSensors[0]}" — هل تحتاج مساعدة في اختيار النوع المناسب؟`
    );
    questions.push(
      `I noticed "${customSensors[0]}" — do you need help selecting the right model?`
    );
  }

  // --- Custom actuator hints ---
  if (customActuators.length > 0) {
    questions.push(
      `لاحظت ذكر "${customActuators[0]}" — هل تريد توصية بمشغل مناسب؟`
    );
    questions.push(
      `I noticed "${customActuators[0]}" — would you like a suitable driver recommendation?`
    );
  }

  // --- Only one input type detected (may be incomplete) ---
  if (detectedInputs.length === 1 && detectedOutputs.length === 0) {
    questions.push('هل هناك أي مشغلات تريد إضافتها بجانب هذا الحساس؟');
    questions.push('Are there any actuators you want to add alongside this sensor?');
  }

  // --- Only one output type detected ---
  if (detectedOutputs.length === 1 && detectedInputs.length === 0) {
    questions.push('هل هناك أي حساسات يجب قراءة بياناتها لتحديد متى يعمل هذا المشغل؟');
    questions.push('Are there any sensors that should trigger this output?');
  }

  return questions;
}

// =========================================================================
// 8. MAIN EXPORT
// =========================================================================

/**
 * Parses a free-text electronics project idea into a structured IdeaAnalysis.
 *
 * @param idea - The raw user input (English or Arabic).
 * @returns A fully populated IdeaAnalysis object.
 */
export function ideaAnalyzer(idea: string): IdeaAnalysis {
  // ---- Step 1: Basic keyword matching (preserved from v1) ----
  const detectedInputs = findMatches(idea, inputKeywords);
  const detectedOutputs = findMatches(idea, outputKeywords);

  // ---- Step 2: Detect connectivity ----
  const connectivity = detectConnectivity(idea);

  // ---- Step 3: Select controller ----
  const controller = selectController(idea, connectivity);

  // ---- Step 4: Detect logic patterns ----
  const logic = extractLogic(idea);

  // ---- Step 5: Classify domain ----
  const domain = classifyDomain(idea);

  // ---- Step 6: Detect power source ----
  const powerSource = detectPowerSource(idea);

  // ---- Step 7: Detect constraints ----
  const constraints = detectConstraints(idea);

  // ---- Step 8: Detect display usage ----
  const hasDisplay = detectedOutputs.includes('display') || hasAny(idea, displayKeywords());

  // ---- Step 9: Extract custom sensor/actuator hints ----
  const { sensors: customSensorHints, actuators: customActuatorHints } = extractCustomHints(idea);

  // ---- Step 10: Fill silent defaults and generate assumptions ----
  const assumptions: string[] = [];
  let silentDefaults = 0;

  if (!detectedInputs.length) {
    detectedInputs.push('button');
    assumptions.push('No clear sensor found; defaulted to button input.');
    silentDefaults++;
  }

  if (!detectedOutputs.length) {
    detectedOutputs.push('LED');
    assumptions.push('No clear output found; defaulted to LED indicator.');
    silentDefaults++;
  }

  // Auto-add relay for high-current actuators
  const needsDriver =
    detectedOutputs.includes('pump') ||
    detectedOutputs.includes('fan') ||
    detectedOutputs.includes('motor');

  if (needsDriver && !detectedOutputs.includes('relay')) {
    detectedOutputs.push('relay');
    assumptions.push('High-current output detected; relay/driver added.');
  }

  // Domain-based assumption
  if (domain === 'agriculture / irrigation' && !detectedInputs.includes('soil moisture')) {
    assumptions.push('Agriculture project detected; consider adding a soil moisture sensor.');
  }

  if (
    (domain === 'smart home / automation' || domain === 'security / alarm') &&
    connectivity === 'none'
  ) {
    assumptions.push(
      'Home/security project detected without connectivity — consider adding WiFi for remote access.'
    );
  }

  if (powerSource === 'battery' && constraints.lowPower === undefined) {
    constraints.lowPower = true;
    assumptions.push('Battery power detected; enabling low-power mode consideration.');
  }

  if (
    detectedOutputs.includes('display') &&
    !detectedOutputs.includes('LED')
  ) {
    assumptions.push('Display selected for user feedback.');
  }

  // ---- Step 11: Calculate improved confidence ----
  const confidence = calculateConfidence(
    detectedInputs.length,
    detectedOutputs.length,
    logic.length,
    domain,
    powerSource,
    silentDefaults
  );

  // ---- Step 12: Generate clarification questions ----
  const clarificationQuestions = generateClarificationQuestions(
    idea,
    unique(detectedInputs),
    unique(detectedOutputs),
    domain,
    powerSource,
    connectivity,
    customSensorHints,
    customActuatorHints
  );

  // ---- Step 13: Assemble and return ----
  return {
    originalIdea: idea,
    detectedInputs: unique(detectedInputs),
    detectedOutputs: unique(detectedOutputs),
    logic: unique(logic),
    connectivity,
    controller,
    confidence,
    assumptions,
    // New structured fields
    domain,
    powerSource,
    constraints,
    hasDisplay,
    customSensorHints,
    customActuatorHints,
    clarificationQuestions,
  };
}

// =========================================================================
// INTERNAL HELPERS (not exported)
// =========================================================================

/** Extra display-related keywords for hasDisplay detection. */
function displayKeywords(): string[] {
  return [
    'display', 'lcd', 'screen', 'monitor', 'show', 'oled', 'tft',
    'view', 'readout', 'output display', 'شاشة', 'عرض', 'lcd display',
  ];
}