export type Sample = {
  source: string;            // "Generic" | ...
  timestamp: string;         // ISO
  cycles?: number;
  soh?: number;              // 0–110
  designCapacity_mAh?: number;
  fullChargeCapacity_mAh?: number;
  voltage_mV?: number;
  temperature_C?: number;
  flags?: Record<string, unknown>;
};

export type UDB = {
  device?: { platform?: string; model?: string; osVersion?: string };
  samples: Sample[];
  meta?: Record<string, unknown>;
};
