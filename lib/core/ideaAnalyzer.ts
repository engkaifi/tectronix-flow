import {
  Connectivity,
  Controller,
  IdeaAnalysis,
  SupportedInput,
  SupportedOutput,
} from './types';

const inputKeywords: Record<SupportedInput, string[]> = {
  temperature: [
    'temperature',
    'temp',
    'heat',
    'hot',
    'cold',
    'حرارة',
    'درجة الحرارة',
    'تبريد',
  ],
  humidity: [
    'humidity',
    'humid',
    'رطوبة',
  ],
  'soil moisture': [
    'soil',
    'moisture',
    'plant',
    'irrigation',
    'garden',
    'farm',
    'تربة',
    'ري',
    'مزرعة',
    'نبات',
    'رطوبة التربة',
  ],
  light: [
    'light',
    'dark',
    'ldr',
    'sun',
    'brightness',
    'ضوء',
    'إضاءة',
    'ظلام',
    'شمس',
  ],
  motion: [
    'motion',
    'movement',
    'presence',
    'security',
    'alarm',
    'حركة',
    'أمان',
    'حساس حركة',
    'إنذار',
  ],
  distance: [
    'distance',
    'ultrasonic',
    'parking',
    'obstacle',
    'level',
    'مسافة',
    'موقف',
    'عائق',
    'مستوى',
  ],
  button: [
    'button',
    'switch',
    'manual',
    'زر',
    'مفتاح',
    'تشغيل يدوي',
  ],
};

const outputKeywords: Record<SupportedOutput, string[]> = {
  LED: [
    'led',
    'indicator',
    'lamp',
    'light indicator',
    'لمبة',
    'مؤشر',
  ],
  buzzer: [
    'buzzer',
    'alarm',
    'sound',
    'alert',
    'جرس',
    'تنبيه',
    'صوت',
    'إنذار',
  ],
  relay: [
    'relay',
    'ريليه',
  ],
  fan: [
    'fan',
    'cooling',
    'ventilation',
    'مروحة',
    'تبريد',
    'تهوية',
  ],
  pump: [
    'pump',
    'water',
    'irrigation',
    'مضخة',
    'ماء',
    'ري',
  ],
  motor: [
    'motor',
    'robot',
    'wheel',
    'door',
    'gate',
    'محرك',
    'روبوت',
    'باب',
    'بوابة',
  ],
  display: [
    'display',
    'lcd',
    'screen',
    'monitor',
    'show',
    'شاشة',
    'عرض',
  ],
};

function findMatches<T extends string>(
  idea: string,
  dict: Record<T, string[]>
): T[] {
  const text = idea.toLowerCase();

  return Object.entries(dict)
    .filter(([, keys]) =>
      (keys as string[]).some((key) => text.includes(key.toLowerCase()))
    )
    .map(([key]) => key as T);
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function ideaAnalyzer(idea: string): IdeaAnalysis {
  const lower = idea.toLowerCase();

  const detectedInputs = findMatches(idea, inputKeywords);
  const detectedOutputs = findMatches(idea, outputKeywords);

  let connectivity: Connectivity = 'none';

  if (lower.includes('mqtt')) {
    connectivity = 'MQTT';
  } else if (
    lower.includes('wifi') ||
    lower.includes('wi-fi') ||
    lower.includes('internet') ||
    lower.includes('cloud') ||
    lower.includes('app') ||
    lower.includes('iot') ||
    lower.includes('تطبيق') ||
    lower.includes('انترنت')
  ) {
    connectivity = 'WiFi';
  } else if (
    lower.includes('bluetooth') ||
    lower.includes('ble') ||
    lower.includes('بلوتوث')
  ) {
    connectivity = 'Bluetooth';
  }

  let controller: Controller = 'Arduino Uno';

  if (
    connectivity === 'WiFi' ||
    connectivity === 'Bluetooth' ||
    connectivity === 'MQTT'
  ) {
    controller = 'ESP32';
  } else if (
    lower.includes('small') ||
    lower.includes('compact') ||
    lower.includes('صغير')
  ) {
    controller = 'Arduino Nano';
  }

  const logic: string[] = [];

  if (
    /threshold|less than|greater than|below|above|dry|too hot|too cold|low|high|أقل|أعلى|جاف|مرتفع|منخفض/i.test(
      idea
    )
  ) {
    logic.push('threshold');
  }

  if (/if|when|إذا|عندما|لو/i.test(idea)) {
    logic.push('if/then');
  }

  if (/timer|time|schedule|every|delay|وقت|مؤقت|جدولة|كل/i.test(idea)) {
    logic.push('timer');
  }

  if (/turn on|turn off|start|stop|تشغيل|إيقاف/i.test(idea)) {
    logic.push('on/off control');
  }

  if (!logic.length) {
    logic.push('compare', 'on/off control');
  }

  const assumptions: string[] = [];

  if (!detectedInputs.length) {
    detectedInputs.push('button');
    assumptions.push('No clear sensor found; defaulted to button input.');
  }

  if (!detectedOutputs.length) {
    detectedOutputs.push('LED');
    assumptions.push('No clear output found; defaulted to LED indicator.');
  }

  const needsDriver =
    detectedOutputs.includes('pump') ||
    detectedOutputs.includes('fan') ||
    detectedOutputs.includes('motor');

  if (needsDriver && !detectedOutputs.includes('relay')) {
    detectedOutputs.push('relay');
    assumptions.push('High-current output detected; relay/driver added.');
  }

  if (
    detectedOutputs.includes('display') &&
    !detectedOutputs.includes('LED')
  ) {
    assumptions.push('Display selected for user feedback.');
  }

  return {
    originalIdea: idea,
    detectedInputs: unique(detectedInputs),
    detectedOutputs: unique(detectedOutputs),
    logic: unique(logic),
    connectivity,
    controller,
    confidence: Math.min(
      0.97,
      0.45 +
        detectedInputs.length * 0.14 +
        detectedOutputs.length * 0.1 +
        logic.length * 0.05
    ),
    assumptions,
  };
}