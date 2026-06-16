import { ComponentOption } from '@/lib/core/types';
export const componentCatalog: Record<string, ComponentOption[]> = {
  'soil moisture': [{ key: 'capacitive-soil-v12', name: 'Capacitive Soil Moisture Sensor v1.2', category: 'sensor', beginnerReason: 'أفضل من الحساس المقاوم لأنه أقل تعرضًا للصدأ.', pins: ['VCC', 'GND', 'AOUT'], voltage: '3.3V-5V', estimatedPriceSar: 12 }],
  temperature: [{ key: 'dht22', name: 'DHT22 Temperature/Humidity Sensor', category: 'sensor', beginnerReason: 'سهل للمبتدئين ويقيس الحرارة والرطوبة معًا.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 18 }],
  humidity: [{ key: 'dht22', name: 'DHT22 Temperature/Humidity Sensor', category: 'sensor', beginnerReason: 'يعطي رطوبة وحرارة بكود بسيط.', pins: ['VCC', 'DATA', 'GND'], voltage: '3.3V-5V', estimatedPriceSar: 18 }],
  light: [{ key: 'ldr-module', name: 'LDR Light Sensor Module', category: 'sensor', beginnerReason: 'مناسب للتجارب التعليمية وقراءة الإضاءة.', pins: ['VCC', 'GND', 'AOUT'], voltage: '3.3V-5V', estimatedPriceSar: 7 }],
  motion: [{ key: 'pir-hc-sr501', name: 'PIR Motion Sensor HC-SR501', category: 'sensor', beginnerReason: 'شائع وسهل لاكتشاف الحركة.', pins: ['VCC', 'OUT', 'GND'], voltage: '5V', estimatedPriceSar: 10 }],
  distance: [{ key: 'hc-sr04', name: 'Ultrasonic Distance Sensor HC-SR04', category: 'sensor', beginnerReason: 'مناسب لفهم قياس المسافة.', pins: ['VCC', 'TRIG', 'ECHO', 'GND'], voltage: '5V', estimatedPriceSar: 9 }],
  button: [{ key: 'push-button', name: 'Momentary Push Button', category: 'input', beginnerReason: 'مدخل بسيط للتشغيل أو الإيقاف اليدوي.', pins: ['IN', 'GND'], voltage: 'logic', estimatedPriceSar: 2 }],
  pump: [{ key: 'dc-water-pump-5v', name: '5V DC Mini Water Pump', category: 'actuator', beginnerReason: 'مضخة صغيرة مناسبة للري التجريبي.', pins: ['+', '-'], voltage: '5V', estimatedPriceSar: 15 }],
  relay: [{ key: 'relay-1ch-5v', name: '1-Channel 5V Relay Module', category: 'driver', beginnerReason: 'يعزل المتحكم عن حمل المضخة أو المروحة.', pins: ['VCC', 'GND', 'IN', 'COM', 'NO', 'NC'], voltage: '5V', estimatedPriceSar: 8 }],
  fan: [{ key: 'dc-fan-5v', name: '5V DC Fan', category: 'actuator', beginnerReason: 'خرج بسيط للتبريد.', pins: ['+', '-'], voltage: '5V', estimatedPriceSar: 10 }],
  motor: [{ key: 'dc-motor-5v', name: '5V DC Motor', category: 'actuator', beginnerReason: 'محرك تعليمي شائع.', pins: ['+', '-'], voltage: '5V', estimatedPriceSar: 6 }],
  LED: [{ key: 'led-5mm', name: '5mm LED + 220Ω resistor', category: 'indicator', beginnerReason: 'يعطي مؤشر بصري بسيط.', pins: ['ANODE', 'CATHODE'], voltage: 'logic', estimatedPriceSar: 1 }],
  buzzer: [{ key: 'active-buzzer', name: 'Active Buzzer Module', category: 'indicator', beginnerReason: 'تنبيه صوتي مباشر.', pins: ['VCC', 'GND', 'IN'], voltage: '3.3V-5V', estimatedPriceSar: 5 }],
  display: [{ key: 'i2c-lcd-16x2', name: '16x2 I2C LCD Display', category: 'display', beginnerReason: 'يقلل عدد الأسلاك باستخدام I2C.', pins: ['VCC', 'GND', 'SDA', 'SCL'], voltage: '5V', estimatedPriceSar: 14 }],
  'Arduino Uno': [{ key: 'arduino-uno-r3', name: 'Arduino Uno R3', category: 'controller', beginnerReason: 'أسهل متحكم للمبتدئين وكثير الشروحات.', voltage: '5V', estimatedPriceSar: 35 }],
  'Arduino Nano': [{ key: 'arduino-nano', name: 'Arduino Nano', category: 'controller', beginnerReason: 'صغير ومناسب للتركيب داخل مشروع.', voltage: '5V', estimatedPriceSar: 25 }],
  ESP32: [{ key: 'esp32-devkit', name: 'ESP32 DevKit', category: 'controller', beginnerReason: 'مناسب للمشاريع المتصلة WiFi/Bluetooth.', voltage: '3.3V logic', estimatedPriceSar: 28 }]
};
