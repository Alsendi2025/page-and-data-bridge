import type {
  BatteryType, SystemType, UsageType, DesignAssumptions,
} from '@/lib/designEngine';

export interface AdvancedSettings {
  batteryType: BatteryType;
  systemType: SystemType;
  autonomyHours: number;
}

export interface MethodOutput {
  city: string;
  psh: number;
  dailyEnergyWh: number;
  peakLoadW: number;
  usageType: UsageType;
  hourlyWeights?: number[];
  batteryType: BatteryType;
  systemType: SystemType;
  autonomyHours: number;
  assumptions: DesignAssumptions;
  methodLabel: string;
  ready: boolean;
}

export interface ManualAppliance {
  id: string;
  name: string;
  qty: number;
  powerW: number;
  unit: 'W' | 'kW';
  hours: number;
  period: 'day' | 'night' | '24h';
  /** القيم المقترحة حسب نوع الجهاز (تظهر كمرجع بجانب كل خانة) */
  suggested?: { qty: number; powerW: number; hours: number; period: 'day' | 'night' | '24h' } | undefined;
}
