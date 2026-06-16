import { BomItem, ComponentOption } from './types';
export function bomGenerator(components: ComponentOption[]): BomItem[] { return components.map(c=>({item:c.name,qty:1,role:c.category,estimatedPriceSar:c.estimatedPriceSar ?? 0,alternatives:c.category==='controller'?['Use ESP32 if connectivity is required.']:undefined})); }
