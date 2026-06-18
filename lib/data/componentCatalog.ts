import { ComponentOption } from '@/lib/core/types';

/**
 * Static catalog of electronic components.
 * Each key maps to an array of ComponentOption entries ranked by
 * recommendation priority (best/most common first).
 */
export const componentCatalog: Record<string, ComponentOption[]> = {
  // ===== Sensors =====
  'soil moisture': [
    { key: 'capacitive-soil-v12', name: 'Capacitive Soil Moisture Sensor v1.2', category: 'sensor', beginnerReason: 'أفضل من الحساس المقاوم لأنه أقل تعرضًا للصدأ.', pins: ['VCC', 'GND', 'AOUT'], voltage: '3.3V-5V', estimatedPriceSar: 12 },
    { key: 'resistive-soil', name: 'Resistive Soil Moisture Sensor', category: 'sensor', beginnerReason: 'خيار اقتصادي لقراءة رطوبة التربة.', pins: ['VCC', 'GND', 'AOUT'], voltage: '3.3V-5V', estimatedPriceSar: 5 },
  ],
  temperature: [
    { key: 'dht22', name: 'DHT22 Temperature/Humidity Sensor', category: 'sensor', beginnerReason: 'سهل للمبتدئين ويقيس الحرارة والرطوبة معًا.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 18 },
    { key: 'ds18b20', name: 'DS18B20 Waterproof Temperature Sensor', category: 'sensor', beginnerReason: 'مقاوم للماء ومناسب للاستخدام الخارجي.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 10 },
    { key: 'dht11', name: 'DHT11 Temperature/Humidity Sensor', category: 'sensor', beginnerReason: 'خيار اقتصادي لقياس الحرارة والرطوبة.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 5 },
  ],
  humidity: [
    { key: 'dht22', name: 'DHT22 Temperature/Humidity Sensor', category: 'sensor', beginnerReason: 'يعطي رطوبة وحرارة بكود بسيط.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 18 },
    { key: 'dht11', name: 'DHT11 Temperature/Humidity Sensor', category: 'sensor', beginnerReason: 'خيار اقتصادي لقياس الرطوبة.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 5 },
  ],
  light: [
    { key: 'ldr-module', name: 'LDR Light Sensor Module', category: 'sensor', beginnerReason: 'مناسب للتجارب التعليمية وقراءة الإضاءة.', pins: ['VCC', 'GND', 'AOUT'], voltage: '3.3V-5V', estimatedPriceSar: 7 },
    { key: 'bh1750', name: 'BH1750 Digital Light Sensor', category: 'sensor', beginnerReason: 'يعطي قراءة رقمية دقيقة للإضاءة.', pins: ['VCC', 'GND', 'SDA', 'SCL'], voltage: '3.3V-5V', estimatedPriceSar: 12 },
  ],
  motion: [
    { key: 'pir-hc-sr501', name: 'PIR Motion Sensor HC-SR501', category: 'sensor', beginnerReason: 'شائع وسهل لاكتشاف الحركة.', pins: ['VCC', 'OUT', 'GND'], voltage: '5V', estimatedPriceSar: 10 },
    { key: 'pir-mini', name: 'Mini PIR Motion Sensor', category: 'sensor', beginnerReason: 'صغير الحجم ومناسب للمشاريع المدمجة.', pins: ['VCC', 'OUT', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 8 },
  ],
  distance: [
    { key: 'hc-sr04', name: 'Ultrasonic Distance Sensor HC-SR04', category: 'sensor', beginnerReason: 'مناسب لفهم قياس المسافة.', pins: ['VCC', 'TRIG', 'ECHO', 'GND'], voltage: '5V', estimatedPriceSar: 9 },
    { key: 'vl53l0x', name: 'VL53L0X Laser Distance Sensor', category: 'sensor', beginnerReason: 'صغير جدًا ويعطي قراءة دقيقة بالليزر.', pins: ['VCC', 'GND', 'SDA', 'SCL'], voltage: '3.3V-5V', estimatedPriceSar: 15 },
  ],
  button: [
    { key: 'push-button', name: 'Momentary Push Button', category: 'input', beginnerReason: 'مدخل بسيط للتشغيل أو الإيقاف اليدوي.', pins: ['IN', 'GND'], voltage: 'logic', estimatedPriceSar: 2 },
    { key: 'tact-switch-4pin', name: '4-Pin Tactile Switch', category: 'input', beginnerReason: 'شائع في لوحات التحكم.', pins: ['IN1', 'IN2', 'GND'], voltage: 'logic', estimatedPriceSar: 1 },
  ],

  // ===== Actuators =====
  pump: [
    { key: 'dc-water-pump-5v', name: '5V DC Mini Water Pump', category: 'actuator', beginnerReason: 'مضخة صغيرة مناسبة للري التجريبي.', pins: ['+', '-'], voltage: '5V', estimatedPriceSar: 15 },
    { key: 'dc-water-pump-12v', name: '12V DC Water Pump', category: 'actuator', beginnerReason: 'أقوى ومناسبة للري الفعلي.', pins: ['+', '-'], voltage: '12V', estimatedPriceSar: 25 },
  ],
  relay: [
    { key: 'relay-1ch-5v', name: '1-Channel 5V Relay Module', category: 'driver', beginnerReason: 'يعزل المتحكم عن حمل المضخة أو المروحة.', pins: ['VCC', 'GND', 'IN', 'COM', 'NO', 'NC'], voltage: '5V', estimatedPriceSar: 8 },
    { key: 'relay-2ch-5v', name: '2-Channel 5V Relay Module', category: 'driver', beginnerReason: 'يتحكم بجهازين منفصلين.', pins: ['VCC', 'GND', 'IN1', 'IN2', 'COM', 'NO', 'NC'], voltage: '5V', estimatedPriceSar: 12 },
    { key: 'mosfet-irf520', name: 'MOSFET Driver IRF520', category: 'driver', beginnerReason: 'بديل الترحيل للتشغيل السريع.', pins: ['VCC', 'GND', 'SIG', 'V+', 'V-'], voltage: '3.3V-5V', estimatedPriceSar: 6 },
  ],
  fan: [
    { key: 'dc-fan-5v', name: '5V DC Fan', category: 'actuator', beginnerReason: 'خرج بسيط للتبريد.', pins: ['+', '-'], voltage: '5V', estimatedPriceSar: 10 },
    { key: 'dc-fan-12v', name: '12V DC Fan', category: 'actuator', beginnerReason: 'أكبر وأقوى للتبريد الفعال.', pins: ['+', '-'], voltage: '12V', estimatedPriceSar: 12 },
  ],
  motor: [
    { key: 'dc-motor-5v', name: '5V DC Motor', category: 'actuator', beginnerReason: 'محرك تعليمي شائع.', pins: ['+', '-'], voltage: '5V', estimatedPriceSar: 6 },
    { key: 'l298n-driver', name: 'L298N Motor Driver Module', category: 'driver', beginnerReason: 'للتحكم باتجاه وسرعة المحرك.', pins: ['VCC', 'GND', 'IN1', 'IN2', 'ENA', 'OUT1', 'OUT2'], voltage: '5V-12V', estimatedPriceSar: 12 },
    { key: 'servo-sg90', name: 'SG90 Micro Servo Motor', category: 'actuator', beginnerReason: 'للحركة الدقيقة بزاوية محددة.', pins: ['VCC', 'GND', 'SIG'], voltage: '5V', estimatedPriceSar: 8 },
    { key: 'stepper-28byj', name: '28BYJ-48 Stepper Motor', category: 'actuator', beginnerReason: 'محرك خطوي للحركة المتدرجة.', pins: ['IN1', 'IN2', 'IN3', 'IN4', 'VCC', 'GND'], voltage: '5V', estimatedPriceSar: 7 },
  ],
  LED: [
    { key: 'led-5mm', name: '5mm LED + 220Ω resistor', category: 'indicator', beginnerReason: 'يعطي مؤشر بصري بسيط.', pins: ['ANODE', 'CATHODE'], voltage: 'logic', estimatedPriceSar: 1 },
    { key: 'rgb-led', name: 'RGB LED Common Cathode', category: 'indicator', beginnerReason: 'يعطي ألوان متعددة بمكون واحد.', pins: ['R', 'G', 'B', 'GND'], voltage: 'logic', estimatedPriceSar: 2 },
    { key: 'led-strip-ws2812', name: 'WS2812B RGB LED Strip (1m)', category: 'indicator', beginnerReason: 'شريط led قابل للتحكم بكل لمبة.', pins: ['VCC', 'GND', 'DIN'], voltage: '5V', estimatedPriceSar: 20 },
  ],
  buzzer: [
    { key: 'active-buzzer', name: 'Active Buzzer Module', category: 'indicator', beginnerReason: 'تنبيه صوتي مباشر.', pins: ['VCC', 'GND', 'IN'], voltage: '3.3V-5V', estimatedPriceSar: 5 },
    { key: 'passive-buzzer', name: 'Passive Buzzer', category: 'indicator', beginnerReason: 'يمكن توليد نغمات مختلفة.', pins: ['+', '-'], voltage: 'logic', estimatedPriceSar: 3 },
  ],
  display: [
    { key: 'i2c-lcd-16x2', name: '16x2 I2C LCD Display', category: 'display', beginnerReason: 'يقلل عدد الأسلاك باستخدام I2C.', pins: ['VCC', 'GND', 'SDA', 'SCL'], voltage: '5V', estimatedPriceSar: 14 },
    { key: 'oled-128x64', name: '0.96" OLED Display 128x64', category: 'display', beginnerReason: 'صغير وواضح ويعمل بـ I2C.', pins: ['VCC', 'GND', 'SDA', 'SCL'], voltage: '3.3V-5V', estimatedPriceSar: 16 },
    { key: 'tm1637-4digit', name: 'TM1637 4-Digit Display Module', category: 'display', beginnerReason: 'عرض أرقام بأربع خانات.', pins: ['VCC', 'GND', 'CLK', 'DIO'], voltage: '3.3V-5V', estimatedPriceSar: 6 },
  ],

  // ===== Controllers =====
  'Arduino Uno': [
    { key: 'arduino-uno-r3', name: 'Arduino Uno R3', category: 'controller', beginnerReason: 'أسهل متحكم للمبتدئين وكثير الشروحات.', voltage: '5V', estimatedPriceSar: 35 },
    { key: 'arduino-uno-clone', name: 'Arduino Uno Clone (CH340)', category: 'controller', beginnerReason: 'نسخة اقتصادية من الأردوينو أونو.', voltage: '5V', estimatedPriceSar: 15 },
  ],
  'Arduino Nano': [
    { key: 'arduino-nano', name: 'Arduino Nano', category: 'controller', beginnerReason: 'صغير ومناسب للتركيب داخل مشروع.', voltage: '5V', estimatedPriceSar: 25 },
    { key: 'arduino-nano-clone', name: 'Arduino Nano Clone', category: 'controller', beginnerReason: 'نسخة اقتصادية وصغيرة.', voltage: '5V', estimatedPriceSar: 10 },
  ],
  ESP32: [
    { key: 'esp32-devkit', name: 'ESP32 DevKit', category: 'controller', beginnerReason: 'مناسب للمشاريع المتصلة WiFi/Bluetooth.', voltage: '3.3V logic', estimatedPriceSar: 28 },
    { key: 'esp32-wroom', name: 'ESP32-WROOM-32', category: 'controller', beginnerReason: 'وحدة ESP32 أساسية.', voltage: '3.3V logic', estimatedPriceSar: 20 },
    { key: 'esp32-cam', name: 'ESP32-CAM Module', category: 'controller', beginnerReason: 'ESP32 مع كاميرا مدمجة.', voltage: '3.3V logic', estimatedPriceSar: 35 },
  ],
  'Raspberry Pi Pico': [
    { key: 'rpi-pico', name: 'Raspberry Pi Pico', category: 'controller', beginnerReason: 'مناسب للمشاريع المتقدمة بمعالج RP2040.', voltage: '3.3V logic', estimatedPriceSar: 22 },
    { key: 'rpi-pico-w', name: 'Raspberry Pi Pico W (WiFi)', category: 'controller', beginnerReason: 'مع支持和اي فاي مدمج.', voltage: '3.3V logic', estimatedPriceSar: 30 },
  ],
};