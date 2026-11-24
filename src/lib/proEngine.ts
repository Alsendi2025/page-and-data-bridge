/**
 * محرك التصميم الهندسي الاحترافي — منظومات تجارية / صناعية / زراعية
 *
 * الأسس المعتمدة (IEC / NEC):
 *  - تحجيم المصفوفة: P_pv = E_pv / (PSH × PR × η_MPPT × معامل التوجيه)، مع تصحيح الحرارة γP.
 *  - تصميم السلاسل: Voc عند أبرد درجة (IEC 62548 / NEC 690.7) ≤ أقصى جهد دخل للانفرتر،
 *    و Vmp عند أعلى حرارة للخلية ≥ الحد الأدنى لنطاق MPPT.
 *  - الحمايات: تيار المصفوفة 1.56 × Isc (NEC 690.8/690.9)، القواطع ≥ 1.25 × تيار التشغيل.
 *  - هبوط الجهد: ≤ 1.5% للتيار المستمر و ≤ 2% للتيار المتردد (ρ نحاس = 0.0225 Ω·mm²/m عند حرارة التشغيل).
 *  - البطاريات: C = E_استقلالية × معامل الشيخوخة / (DoD × η_تفريغ × η_انفرتر)، مع تحقق معدل C.
 *  - الميل والتباعد: الميل الأمثل ≈ 0.87 × خط العرض، والتباعد بين الصفوف لتجنب التظليل
 *    بين 9:00 و15:00 في الانقلاب الشتوي (21 ديسمبر).
 *
 * القيم المناخية تقديرية مجمّعة — يجب التحقق منها لكل موقع قبل الاعتماد التنفيذي.
 */
import { BATTERY_TYPES, PANEL_SPECS, type BatteryType } from './designEngine';

export type ProSystemType = 'off-grid' | 'hybrid-generator' | 'grid-interactive';
export type FacilityType = 'factory' | 'institution' | 'company' | 'hotel' | 'farm' | 'other';
export type RoofType = 'concrete' | 'hangar' | 'ground';
export type Orientation = 'south' | 'east' | 'west' | 'east-west';
export type LoadPeriod = 'day' | 'night' | '24h';
export type PhasePref = 'auto' | 'single' | 'three';
export type Operation = 'simultaneous' | 'alternating';

export const FACILITY_TYPES: Record<FacilityType, string> = {
  factory: 'مصنع', institution: 'مؤسسة', company: 'شركة', hotel: 'فندق', farm: 'مزرعة', other: 'أخرى',
};

export const PRO_SYSTEM_TYPES: Record<ProSystemType, { label: string; en: string; points: string[] }> = {
  'off-grid': {
    label: 'شمسي مع بطاريات فقط', en: 'Off-Grid',
    points: ['استقلال تام عن الشبكة', 'البطاريات تغطي الليل وغياب الشمس', 'الأعلى في سعة التخزين'],
  },
  'hybrid-generator': {
    label: 'هجين مع مولد كهربائي', en: 'Hybrid + Generator',
    points: ['المولد احتياطي عند نقص الشمس أو البطارية', 'يشحن البطاريات ويغذي الأحمال', 'تشغيل تلقائي عبر إشارة الانفرتر'],
  },
  'grid-interactive': {
    label: 'متصل بالشبكة / يستفيد من الكهرباء العامة والتجارية', en: 'On-Grid / Hybrid Grid-Interactive',
    points: ['يستفيد من الشبكة عند توفرها', 'بطاريات اختيارية (اجعل الاستقلالية 0 لنظام بلا بطاريات)', 'يتطلب حماية عدم التغذية العكسية'],
  },
};

export const ROOF_TYPES: Record<RoofType, string> = {
  concrete: 'سقف خرساني', hangar: 'هنجر معدني', ground: 'أرض مفتوحة',
};

export const ORIENTATIONS: Record<Orientation, string> = {
  south: 'جنوب', east: 'شرق', west: 'غرب', 'east-west': 'شرق - غرب',
};

export interface Governorate {
  name: string;
  lat: number;
  psh: number;
  /** أدنى درجة حرارة تصميمية °C (لحساب Voc الأقصى) */
  tMin: number;
  /** أعلى درجة حرارة محيطة تصميمية °C */
  tMax: number;
  coastal: boolean;
}

/** المحافظات اليمنية — قيم مناخية تقديرية (PSH على سطح مائل بالزاوية المثلى) */
export const GOVERNORATES: Governorate[] = [
  { name: 'أمانة العاصمة / صنعاء', lat: 15.35, psh: 5.9, tMin: -2, tMax: 32, coastal: false },
  { name: 'عدن', lat: 12.79, psh: 6.1, tMin: 18, tMax: 42, coastal: true },
  { name: 'تعز', lat: 13.58, psh: 5.6, tMin: 8, tMax: 36, coastal: false },
  { name: 'الحديدة', lat: 14.8, psh: 5.6, tMin: 18, tMax: 44, coastal: true },
  { name: 'إب', lat: 13.97, psh: 5.2, tMin: 4, tMax: 32, coastal: false },
  { name: 'ذمار', lat: 14.55, psh: 5.7, tMin: -4, tMax: 30, coastal: false },
  { name: 'حضرموت — المكلا', lat: 14.54, psh: 6.0, tMin: 15, tMax: 40, coastal: true },
  { name: 'حضرموت — الوادي (سيئون)', lat: 15.94, psh: 6.3, tMin: 7, tMax: 45, coastal: false },
  { name: 'مأرب', lat: 15.46, psh: 6.2, tMin: 4, tMax: 44, coastal: false },
  { name: 'الجوف', lat: 16.17, psh: 6.2, tMin: 3, tMax: 44, coastal: false },
  { name: 'شبوة — عتق', lat: 14.53, psh: 6.2, tMin: 7, tMax: 44, coastal: false },
  { name: 'صعدة', lat: 16.94, psh: 6.0, tMin: 0, tMax: 35, coastal: false },
  { name: 'عمران', lat: 15.66, psh: 5.9, tMin: -2, tMax: 32, coastal: false },
  { name: 'حجة', lat: 15.69, psh: 5.5, tMin: 8, tMax: 36, coastal: false },
  { name: 'المحويت', lat: 15.47, psh: 5.4, tMin: 8, tMax: 33, coastal: false },
  { name: 'ريمة', lat: 14.63, psh: 5.3, tMin: 8, tMax: 33, coastal: false },
  { name: 'البيضاء', lat: 13.99, psh: 5.9, tMin: -1, tMax: 32, coastal: false },
  { name: 'الضالع', lat: 13.7, psh: 5.8, tMin: 3, tMax: 33, coastal: false },
  { name: 'لحج', lat: 13.05, psh: 6.0, tMin: 15, tMax: 43, coastal: false },
  { name: 'أبين', lat: 13.13, psh: 6.0, tMin: 17, tMax: 42, coastal: true },
  { name: 'المهرة — الغيضة', lat: 16.2, psh: 6.0, tMin: 15, tMax: 40, coastal: true },
  { name: 'سقطرى', lat: 12.5, psh: 6.0, tMin: 20, tMax: 38, coastal: true },
];

export function findGovernorate(name: string): Governorate {
  return GOVERNORATES.find((g) => g.name === name) ?? GOVERNORATES[0]!;
}

export interface ProPanel {
  wattage: number; vmp: number; imp: number; voc: number; isc: number;
  /** أبعاد اللوح بالمتر */
  length: number; width: number;
  efficiency: number;
}

const PANEL_DIMS: Record<number, [number, number]> = {
  100: [1.02, 0.67], 150: [1.48, 0.67], 300: [1.64, 0.99], 410: [1.722, 1.134],
  550: [2.279, 1.134], 580: [2.278, 1.134], 700: [2.384, 1.303],
};

export const PRO_PANELS: Record<number, ProPanel> = Object.fromEntries(
  Object.entries(PANEL_SPECS).map(([w, s]) => {
    const wattage = Number(w);
    const [length, width] = PANEL_DIMS[wattage] ?? [2.279, 1.134];
    return [wattage, { wattage, ...s, length, width, efficiency: wattage / (length * width * 1000) }];
  })
);

export const PRO_PANEL_WATTAGES = [300, 410, 550, 580, 700];

/** معاملات الحرارة النموذجية لألواح أحادية البلورة (ورقة بيانات المصنّع هي المرجع) */
export const PANEL_TEMP = { gammaP: -0.0035, betaVoc: -0.0027, betaVmp: -0.0035 };

export interface ProLoad {
  id: string;
  name: string;
  qty: number;
  /** القدرة الفعلية للوحدة الواحدة بالواط */
  powerW: number;
  unit: 'W' | 'kW';
  /** معامل القدرة 0.3..1 */
  pf: number;
  /** نسبة تيار البدء إلى تيار التشغيل (1 = حمل مقاومي، 6 = محرك تشغيل مباشر DOL) */
  startFactor: number;
  hours: number;
  period: LoadPeriod;
  suggested?: { qty: number; powerW: number; pf: number; startFactor: number; hours: number; period: LoadPeriod } | undefined;
}

export interface ProInput {
  governorate: string;
  facility: FacilityType;
  loads: ProLoad[];
  operation: Operation;
  /** معامل التزامن عند التشغيل بالتناوب 0.2..1 */
  diversity: number;
  batteryType: BatteryType;
  autonomyHours: number;
  systemType: ProSystemType;
  phase: PhasePref;
  roofType: RoofType;
  orientation: Orientation;
  /** ميل سقف الهنجر بالدرجات (تركيب موازٍ للسطح) */
  roofPitch: number;
  distances: { dc: number; battery: number; ac: number };
  panelWattage?: number | null | undefined;
}

// ------------------------------------------------------------------ helpers
const RHO_CU = 0.0225; // Ω·mm²/m — نحاس عند حرارة التشغيل
const V_PH = 230;
const V_LL = 400;
const ETA_MPPT = 0.98;
const BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600];
const GEN_SIZES_KVA = [5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 150, 200, 250, 300, 400, 500];
const DC_VOLT_RATINGS = [500, 600, 800, 1000, 1200, 1500];

/** كابل شمسي H1Z2Z2-K (EN 50618) — تيار مسموح بعد معاملات التجميع والحرارة */
const PV_CABLES: [number, number][] = [[4, 38], [6, 49], [10, 68], [16, 92]];
/** كابل نحاس مرن للبطاريات — تيار مسموح في الهواء عند 40°C */
const BAT_CABLES: [number, number][] = [[16, 85], [25, 110], [35, 140], [50, 175], [70, 220], [95, 270], [120, 315], [150, 360], [185, 410], [240, 480]];
/** كابل نحاس XLPE متعدد الأقطاب (IEC 60364-5-52) — مصحح لحرارة 40°C */
const AC_CABLES: [number, number][] = [[2.5, 24], [4, 32], [6, 41], [10, 57], [16, 76], [25, 96], [35, 119], [50, 144], [70, 184], [95, 223], [120, 259], [150, 299], [185, 341], [240, 403]];

export const round = (v: number, d = 2) => { const f = 10 ** d; return Math.round(v * f) / f; };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const nextStd = (v: number, list: number[]) => list.find((x) => x >= v - 1e-9) ?? list[list.length - 1]!;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function periodHours(p: LoadPeriod): number[] {
  if (p === 'day') return [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  if (p === 'night') return [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
  return Array.from({ length: 24 }, (_, i) => i);
}

/** هبوط الجهد كنسبة مئوية */
export function voltageDropPct(opts: { lengthM: number; currentA: number; areaMm2: number; voltage: number; threePhase?: boolean; runs?: number }) {
  const runs = opts.runs ?? 1;
  const factor = opts.threePhase ? Math.sqrt(3) : 2;
  const dv = (factor * opts.lengthM * (opts.currentA / runs) * RHO_CU) / opts.areaMm2;
  return (dv / opts.voltage) * 100;
}

export interface CableSel {
  size: number; runs: number; ampacity: number; dropPct: number; maxLengthM: number; ok: boolean;
}

function pickCable(table: [number, number][], need: { iz: number; currentA: number; lengthM: number; voltage: number; maxDrop: number; threePhase?: boolean; minSize?: number }): CableSel {
  for (let runs = 1; runs <= 6; runs++) {
    for (const [size, amp] of table) {
      if (need.minSize && size < need.minSize) continue;
      if (amp * runs < need.iz) continue;
      const drop = voltageDropPct({ lengthM: need.lengthM, currentA: need.currentA, areaMm2: size, voltage: need.voltage, threePhase: !!need.threePhase, runs });
      if (drop <= need.maxDrop) {
        const factor = need.threePhase ? Math.sqrt(3) : 2;
        const maxLengthM = (need.maxDrop / 100) * need.voltage * size * runs / (factor * need.currentA * RHO_CU);
        return { size, runs, ampacity: amp * runs, dropPct: round(drop, 2), maxLengthM: round(maxLengthM, 1), ok: true };
      }
    }
  }
  const [size, amp] = table[table.length - 1]!;
  const drop = voltageDropPct({ lengthM: need.lengthM, currentA: need.currentA, areaMm2: size, voltage: need.voltage, threePhase: !!need.threePhase, runs: 6 });
  return { size, runs: 6, ampacity: amp * 6, dropPct: round(drop, 2), maxLengthM: 0, ok: false };
}

/** موضع الشمس في الانقلاب الشتوي عند 9:00 و15:00 بالتوقيت الشمسي */
export function winterSun(lat: number) {
  const phi = rad(lat);
  const delta = rad(-23.44);
  return [-45, 45].map((omegaDeg) => {
    const omega = rad(omegaDeg);
    const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(omega);
    const alt = Math.asin(sinAlt);
    const cosAz = (Math.sin(delta) - sinAlt * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi));
    const azN = deg(Math.acos(clamp(cosAz, -1, 1)));
    return { altitude: deg(alt), azimuth: omegaDeg < 0 ? azN : 360 - azN };
  });
}

export function tiltAngles(lat: number) {
  return {
    fixed: clamp(Math.round(0.87 * lat), 10, 35),
    summer: Math.max(5, Math.round(lat - 15)),
    winter: Math.round(lat + 15),
  };
}

export function facingAzimuth(o: Orientation): number {
  return o === 'east' || o === 'east-west' ? 90 : o === 'west' ? 270 : 180;
}

/** معامل الإنتاج حسب التوجيه مقارنة بالجنوب بالميل الأمثل (خطوط عرض 12-17°) */
const ORIENT_FACTOR: Record<Orientation, number> = { south: 1, east: 0.88, west: 0.88, 'east-west': 0.92 };

// ------------------------------------------------------------------ inverter classes
type InvClassKey = 'HF_1P_24' | 'HF_1P_48' | 'HF_3P_48' | 'HF_3P_HV' | 'LF_1P_48' | 'LF_3P_HV' | 'GT_1P' | 'GT_3P';
interface InvClass {
  key: InvClassKey;
  phase: 1 | 3;
  freq: 'HF' | 'LF';
  gridTie: boolean;
  /** جهد البطارية الاسمي؛ 0 = بلا بطارية */
  batteryV: (unitW: number) => number;
  hv: boolean;
  sizes: number[];
  vMppMin: number; vMppMax: number; vPvMax: number;
  iMppt: (unitW: number) => number;
  mppts: (unitW: number) => number;
  surge: number;
  eff: number;
  pvRatioMax: number;
}

const INV: Record<InvClassKey, InvClass> = {
  HF_1P_24: { key: 'HF_1P_24', phase: 1, freq: 'HF', gridTie: false, batteryV: () => 24, hv: false, sizes: [1000, 1500, 2000, 3000], vMppMin: 120, vMppMax: 450, vPvMax: 500, iMppt: () => 18, mppts: () => 1, surge: 2, eff: 0.93, pvRatioMax: 1.3 },
  HF_1P_48: { key: 'HF_1P_48', phase: 1, freq: 'HF', gridTie: false, batteryV: () => 48, hv: false, sizes: [4000, 5000, 6000, 8000, 10000, 12000], vMppMin: 125, vMppMax: 425, vPvMax: 500, iMppt: (w) => (w <= 5000 ? 18 : 27), mppts: (w) => (w <= 5000 ? 1 : 2), surge: 2, eff: 0.95, pvRatioMax: 1.3 },
  HF_3P_48: { key: 'HF_3P_48', phase: 3, freq: 'HF', gridTie: false, batteryV: () => 48, hv: false, sizes: [8000, 10000, 12000, 15000, 20000, 25000], vMppMin: 200, vMppMax: 650, vPvMax: 800, iMppt: () => 27, mppts: () => 2, surge: 2, eff: 0.96, pvRatioMax: 1.3 },
  HF_3P_HV: { key: 'HF_3P_HV', phase: 3, freq: 'HF', gridTie: false, batteryV: () => 400, hv: true, sizes: [20000, 25000, 30000, 40000, 50000], vMppMin: 200, vMppMax: 850, vPvMax: 1000, iMppt: () => 36, mppts: (w) => (w <= 25000 ? 2 : w <= 30000 ? 3 : 4), surge: 2, eff: 0.97, pvRatioMax: 1.3 },
  LF_1P_48: { key: 'LF_1P_48', phase: 1, freq: 'LF', gridTie: false, batteryV: () => 48, hv: false, sizes: [3000, 4000, 5000, 6000, 8000, 10000, 12000], vMppMin: 120, vMppMax: 450, vPvMax: 500, iMppt: (w) => (w <= 6000 ? 22 : 27), mppts: (w) => (w <= 6000 ? 1 : 2), surge: 3, eff: 0.9, pvRatioMax: 1.3 },
  LF_3P_HV: { key: 'LF_3P_HV', phase: 3, freq: 'LF', gridTie: false, batteryV: (w) => (w <= 20000 ? 192 : 384), hv: true, sizes: [10000, 15000, 20000, 30000, 40000, 60000], vMppMin: 200, vMppMax: 800, vPvMax: 1000, iMppt: () => 30, mppts: (w) => (w <= 15000 ? 2 : w <= 30000 ? 3 : 4), surge: 3, eff: 0.92, pvRatioMax: 1.3 },
  GT_1P: { key: 'GT_1P', phase: 1, freq: 'HF', gridTie: true, batteryV: () => 0, hv: false, sizes: [3000, 5000, 6000, 8000, 10000], vMppMin: 90, vMppMax: 520, vPvMax: 600, iMppt: () => 16, mppts: () => 2, surge: 1, eff: 0.97, pvRatioMax: 1.3 },
  GT_3P: { key: 'GT_3P', phase: 3, freq: 'HF', gridTie: true, batteryV: () => 0, hv: false, sizes: [8000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 100000], vMppMin: 180, vMppMax: 1000, vPvMax: 1100, iMppt: () => 32, mppts: (w) => (w <= 10000 ? 2 : w <= 30000 ? 3 : w <= 60000 ? 4 : 8), surge: 1, eff: 0.98, pvRatioMax: 1.4 },
};

// ------------------------------------------------------------------ result types
export interface LoadAnalysis {
  count: number;
  connectedW: number;
  connectedVA: number;
  dailyWh: number;
  dayWh: number;
  nightWh: number;
  diversity: number;
  peakW: number;
  peakVA: number;
  surgeVA: number;
  avgPf: number;
  motorShare: number;
  largestMotor: { name: string; powerW: number; startFactor: number } | null;
  hourly: number[];
  breakdown: { name: string; wh: number }[];
}

export interface ProResult {
  site: Governorate & { pr: number; tempFactor: number; orientFactor: number; tCellHot: number };
  loads: LoadAnalysis;
  systemLabel: string;
  pv: {
    requiredW: number; arrayW: number; kWp: number; numPanels: number; panel: ProPanel;
    panelAuto: boolean; recommendedWattage: number; minEfficiency: number;
    series: number; strings: number; minSeries: number; maxSeries: number; compatible: boolean;
    stringVmp: number; stringVmpHot: number; stringVoc: number; stringVocCold: number;
    stringImp: number; stringIsc: number; arrayImp: number; arrayIsc: number;
    dailyYieldWh: number; dcAcRatio: number;
    mpptMap: { inverter: number; mppt: number; strings: number }[];
    stringsPerMpptMax: number;
  };
  orientation: { label: string; azimuth: number; tilt: { fixed: number; summer: number; winter: number; used: number }; note: string };
  inverter: {
    typeLabel: string; freq: 'HF' | 'LF'; freqReason: string; phase: 1 | 3; gridTie: boolean;
    unitW: number; units: number; totalW: number; requiredW: number;
    batteryV: number; hv: boolean; mpptPerUnit: number; mpptTotal: number; mpptUsed: number;
    vMppMin: number; vMppMax: number; vPvMax: number; iMppt: number;
    surgeFactor: number; surgeCapacityVA: number; requiredSurgeVA: number; surgeOk: boolean;
    efficiency: number; pvMaxW: number;
    connection: string; sync: string[];
  };
  battery: {
    required: boolean; type: BatteryType; typeLabel: string;
    autonomyWh: number; nominalWh: number; usableWh: number; requiredNominalWh: number;
    voltage: number; nominalVoltage: number; ah: number; dod: number; agingFactor: number;
    unitLabel: string; unitV: number; unitAh: number; series: number; parallel: number; units: number;
    maxDischargeW: number; maxDischargeA: number; maxChargeW: number; maxChargeA: number;
    cRateDischarge: number; cRateCharge: number; chargeLimitA: number; chargeLimited: boolean;
    bms: string[];
  };
  generator: { kva: number; note: string } | null;
  cables: {
    pv: CableSel & { totalLengthM: number; currentA: number; lengthM: number };
    battery: (CableSel & { totalLengthM: number; currentA: number; lengthM: number }) | null;
    acOut: CableSel & { totalLengthM: number; currentA: number; lengthM: number; cores: string };
    acIn: (CableSel & { totalLengthM: number; currentA: number; lengthM: number; cores: string }) | null;
    pe: number;
  };
  protection: {
    dcBreaker: { amps: number; volts: number; poles: string; qty: number };
    stringFuse: { amps: number; volts: number; qty: number } | null;
    dcSpd: { ucpv: number; qty: number };
    batteryBreaker: { amps: number; volts: string; qty: number } | null;
    acOutBreaker: { amps: number; poles: string; qty: number };
    acMainBreaker: { amps: number; poles: string } | null;
    acInBreaker: { amps: number; poles: string; qty: number } | null;
    rcd: { amps: number; poles: string; type: string };
    acSpd: { poles: string; uc: number };
    earthing: { rods: number; mainMm2: number; bondingMm2: number; targetOhm: number; notes: string[] };
  };
  curves: { generation: number[]; consumption: number[]; soc: number[]; unmetWh: number; surplusWh: number };
  mounting: string[];
  warnings: string[];
  assumptions: string[];
}

// ------------------------------------------------------------------ load analysis
export function analyzeLoads(loads: ProLoad[], operation: Operation, diversity: number): LoadAnalysis {
  const items = loads.filter((l) => l.qty > 0 && l.powerW > 0);
  const hourly = new Array<number>(24).fill(0);
  let connectedW = 0, connectedVA = 0, dailyWh = 0, motorW = 0, maxUnitW = 0, maxUnitVA = 0, extraSurge = 0;
  let largestMotor: LoadAnalysis['largestMotor'] = null;
  const breakdown: { name: string; wh: number }[] = [];
  for (const l of items) {
    const pf = clamp(l.pf || 1, 0.3, 1);
    const runW = l.qty * l.powerW;
    const unitVA = l.powerW / pf;
    const wh = runW * clamp(l.hours, 0, 24);
    connectedW += runW;
    connectedVA += runW / pf;
    dailyWh += wh;
    maxUnitW = Math.max(maxUnitW, l.powerW);
    maxUnitVA = Math.max(maxUnitVA, unitVA);
    const sf = Math.max(1, l.startFactor || 1);
    extraSurge = Math.max(extraSurge, (sf - 1) * unitVA);
    if (sf >= 2) {
      motorW += runW;
      if (!largestMotor || l.powerW > largestMotor.powerW) largestMotor = { name: l.name, powerW: l.powerW, startFactor: sf };
    }
    breakdown.push({ name: l.name || 'جهاز', wh });
    if (wh > 0) {
      const hrs = periodHours(l.period);
      for (const h of hrs) hourly[h]! += wh / hrs.length;
    }
  }
  const df = operation === 'simultaneous' ? 1 : clamp(diversity, 0.2, 1);
  const peakW = Math.max(connectedW * df, maxUnitW);
  const peakVA = Math.max(connectedVA * df, maxUnitVA);
  const dayHours = new Set(periodHours('day'));
  const dayWh = hourly.reduce((s, v, h) => (dayHours.has(h) ? s + v : s), 0);
  return {
    count: items.length,
    connectedW, connectedVA, dailyWh, dayWh, nightWh: dailyWh - dayWh,
    diversity: df, peakW, peakVA, surgeVA: peakVA + extraSurge,
    avgPf: connectedVA > 0 ? connectedW / connectedVA : 1,
    motorShare: connectedW > 0 ? motorW / connectedW : 0,
    largestMotor,
    hourly,
    breakdown: breakdown.sort((a, b) => b.wh - a.wh),
  };
}

/** يُفرض انفرتر منخفض التردد عند وجود أحمال حثية كبيرة أو مضخات بتيار بدء مرتفع */
export function needsLowFrequency(a: LoadAnalysis): { lf: boolean; reason: string } {
  const m = a.largestMotor;
  if (m && m.powerW >= 1500 && m.startFactor >= 3) {
    return { lf: true, reason: `يوجد محرك/مضخة بقدرة ${round(m.powerW / 1000, 2)} kW وتيار بدء ${m.startFactor}× — يُفرض انفرتر منخفض التردد (محول حلقي) لتحمّل تيار البدء.` };
  }
  if (a.motorShare >= 0.4 && m) {
    return { lf: true, reason: `الأحمال الحثية تشكل ${Math.round(a.motorShare * 100)}% من الحمل المتصل — يُفرض انفرتر منخفض التردد.` };
  }
  return { lf: false, reason: 'لا توجد أحمال حثية كبيرة بتيار بدء مرتفع — انفرتر عالي التردد مناسب وأعلى كفاءة.' };
}

// ------------------------------------------------------------------ main
export function designPro(input: ProInput): ProResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];
  const site = findGovernorate(input.governorate);
  const loads = analyzeLoads(input.loads, input.operation, input.diversity);
  const battDef = BATTERY_TYPES[input.batteryType];
  const hasBattery = input.autonomyHours > 0;
  const pureGrid = input.systemType === 'grid-interactive' && !hasBattery;

  // ---- PR / الحرارة ----
  const tCellHot = site.tMax + 20;
  const tempFactor = 1 + PANEL_TEMP.gammaP * (tCellHot - 25);
  const soiling = 0.96, mismatch = 0.98, dcWiring = 0.985, aging = 0.98;
  const pr = tempFactor * soiling * mismatch * dcWiring * aging;
  const orientFactor = ORIENT_FACTOR[input.orientation];
  assumptions.push(`معامل الأداء PR = ${(pr * 100).toFixed(1)}%: تصحيح حرارة ${(tempFactor * 100).toFixed(1)}% (خلية ${tCellHot}°C، γP = −0.35%/°C) × أتربة 96% × عدم تطابق 98% × فقد كابلات DC 98.5% × تقادم 98%.`);

  // ---- اختيار فئة الانفرتر ----
  const lfCheck = needsLowFrequency(loads);
  const continuousVA = loads.peakVA * 1.25;
  const threePhase = input.phase === 'three' || (input.phase === 'auto' && continuousVA > 12000);
  let cls: InvClass;
  if (pureGrid) cls = threePhase ? INV.GT_3P : INV.GT_1P;
  else if (lfCheck.lf) cls = threePhase ? INV.LF_3P_HV : INV.LF_1P_48;
  else if (!threePhase) cls = continuousVA <= 3000 ? INV.HF_1P_24 : INV.HF_1P_48;
  else cls = continuousVA > 30000 ? INV.HF_3P_HV : INV.HF_3P_48;

  // ---- الطاقة المطلوبة من المصفوفة ----
  const etaRt = battDef.efficiency;
  const pvEnergyWh = pureGrid || !hasBattery
    ? loads.dailyWh / cls.eff
    : loads.dayWh / cls.eff + loads.nightWh / (cls.eff * etaRt);
  const requiredW = pvEnergyWh / (site.psh * pr * ETA_MPPT * orientFactor);
  assumptions.push(`طاقة المصفوفة اليومية ${round(pvEnergyWh / 1000, 2)} kWh = أحمال النهار ÷ كفاءة الانفرتر ${Math.round(cls.eff * 100)}%${hasBattery && !pureGrid ? ` + أحمال الليل ÷ (كفاءة الانفرتر × كفاءة البطارية ${Math.round(etaRt * 100)}%)` : ''}.`);

  // ---- قدرة الانفرتر بالأحمال ----
  const surgeNeedRating = loads.surgeVA / cls.surge;
  const ratingByLoad = pureGrid ? requiredW / 1.15 : Math.max(continuousVA, surgeNeedRating, 500);

  const temps = {
    vocCold: (p: ProPanel) => p.voc * (1 + PANEL_TEMP.betaVoc * (site.tMin - 25)),
    vmpHot: (p: ProPanel) => p.vmp * (1 + PANEL_TEMP.betaVmp * (site.tMax + 30 - 25)),
    vmpCold: (p: ProPanel) => p.vmp * (1 + PANEL_TEMP.betaVmp * (site.tMin + 15 - 25)),
  };

  const strings = (p: ProPanel, reqW: number) => {
    const maxS = Math.max(1, Math.min(Math.floor(cls.vPvMax / temps.vocCold(p)), Math.floor(cls.vMppMax / temps.vmpCold(p))));
    const minS = Math.max(1, Math.ceil(cls.vMppMin / temps.vmpHot(p)));
    const n = Math.max(1, Math.ceil(reqW / p.wattage));
    const compatible = minS <= maxS;
    let bestS = maxS, bestTotal = Infinity;
    const lo = compatible ? minS : maxS;
    for (let s = maxS; s >= lo; s--) {
      const total = s * Math.ceil(n / s);
      if (total < bestTotal) { bestTotal = total; bestS = s; }
    }
    const p2 = Math.ceil(n / bestS);
    return { series: bestS, strings: p2, numPanels: bestS * p2, minS, maxS, compatible };
  };

  // اختيار القدرة المثالية للوح
  const prefs = requiredW > 30000 ? [580, 550, 700, 410, 300] : [550, 580, 410, 700, 300];
  let recommended = prefs[0]!;
  {
    let bestOver = Infinity;
    for (const w of prefs) {
      const st = strings(PRO_PANELS[w]!, requiredW);
      if (!st.compatible) continue;
      const over = (st.numPanels * w) / Math.max(1, requiredW) - 1;
      if (over <= 0.2) { recommended = w; break; }
      if (over < bestOver) { bestOver = over; recommended = w; }
    }
  }
  const manual = input.panelWattage && PRO_PANELS[input.panelWattage] ? input.panelWattage : null;
  const panel = PRO_PANELS[manual ?? recommended]!;
  const st = strings(panel, requiredW);
  const arrayW = st.numPanels * panel.wattage;
  if (!st.compatible) {
    warnings.push(`لا يوجد عدد ألواح تسلسلي يحقق نطاق MPPT (${cls.vMppMin}–${cls.vMppMax}V) وحد الجهد الأقصى ${cls.vPvMax}V معاً مع لوح ${panel.wattage}W — اختر قدرة لوح أخرى.`);
  }

  // ---- مقاس الوحدة وعددها (حمل + MPPT + قدرة PV) ----
  const startSize = nextStd(Math.min(ratingByLoad, cls.sizes[cls.sizes.length - 1]!), cls.sizes);
  let best: { unitW: number; units: number; perMppt: number } | null = null;
  for (const size of cls.sizes.filter((s) => s >= startSize)) {
    const perMppt = Math.max(1, Math.floor(cls.iMppt(size) / panel.imp + 1e-6));
    const nLoad = Math.ceil(ratingByLoad / size);
    const nMppt = Math.ceil(Math.ceil(st.strings / perMppt) / cls.mppts(size));
    const nPv = Math.ceil(arrayW / (size * cls.pvRatioMax));
    const units = Math.max(1, nLoad, nMppt, nPv);
    if (!best || units * size < best.units * best.unitW - 1e-6 || (units * size === best.units * best.unitW && units < best.units)) {
      best = { unitW: size, units, perMppt };
    }
  }
  if (!best) best = { unitW: startSize, units: 1, perMppt: 1 };
  const { unitW, units, perMppt } = best;
  const totalW = unitW * units;
  const mpptPerUnit = cls.mppts(unitW);
  const mpptTotal = mpptPerUnit * units;

  // توزيع السلاسل على مداخل MPPT
  const mpptMap: ProResult['pv']['mpptMap'] = [];
  {
    const perInv = Array.from({ length: units }, (_, i) => Math.floor(st.strings / units) + (i < st.strings % units ? 1 : 0));
    perInv.forEach((n, inv) => {
      for (let m = 0; m < mpptPerUnit; m++) {
        const k = Math.floor(n / mpptPerUnit) + (m < n % mpptPerUnit ? 1 : 0);
        if (k > 0) mpptMap.push({ inverter: inv + 1, mppt: m + 1, strings: k });
      }
    });
  }
  const maxOnMppt = mpptMap.reduce((m, x) => Math.max(m, x.strings), 0);
  if (maxOnMppt > perMppt) warnings.push(`عدد السلاسل على أحد مداخل MPPT (${maxOnMppt}) يتجاوز حد التيار ${cls.iMppt(unitW)}A — يلزم انفرتر بمداخل أكثر.`);

  // ---- الانفرتر: النوع والتزامن ----
  const batteryVNom = cls.batteryV(unitW);
  const systemLabel = PRO_SYSTEM_TYPES[input.systemType].label;
  const typeLabel = pureGrid
    ? 'انفرتر متصل بالشبكة (On-Grid String Inverter)'
    : input.systemType === 'off-grid'
      ? `انفرتر مستقل/هجين Off-Grid ${cls.freq === 'LF' ? 'منخفض التردد' : 'عالي التردد'}`
      : input.systemType === 'hybrid-generator'
        ? `انفرتر هجين بمدخل مولد ${cls.freq === 'LF' ? 'منخفض التردد' : 'عالي التردد'}`
        : `انفرتر هجين متفاعل مع الشبكة ${cls.freq === 'LF' ? 'منخفض التردد' : 'عالي التردد'}`;
  const surgeCapacityVA = totalW * cls.surge;
  const connection = units === 1
    ? (cls.phase === 3 ? 'وحدة واحدة ثلاثية الطور 400V' : 'وحدة واحدة أحادية الطور 230V')
    : cls.phase === 3
      ? `${units} وحدات ثلاثية الطور مربوطة على التوازي (نفس الطور والتسلسل) عبر كابل التوازي/الاتصال`
      : units % 3 === 0
        ? `${units} وحدات أحادية الطور على التوازي، ويمكن توزيعها ${units / 3} لكل طور لتكوين نظام ثلاثي الطور`
        : `${units} وحدات أحادية الطور مربوطة على التوازي بنفس الطور`;
  const sync: string[] = [];
  if (!pureGrid) sync.push(`اتصال مغلق (Closed-Loop) مع نظام BMS للبطاريات عبر CAN أو RS485 بنفس بروتوكول الانفرتر.`);
  if (units > 1) sync.push('نفس الموديل وإصدار البرنامج لجميع الوحدات، وبنك بطاريات مشترك بكابلات متساوية الطول لكل وحدة.');
  if (input.systemType === 'hybrid-generator') sync.push('مدخل مولد مستقل (GEN Port) أو مدخل AC مع إشارة تشغيل تلقائي جافة (Dry Contact) لبدء/إيقاف المولد حسب حالة شحن البطارية.');
  if (input.systemType === 'grid-interactive') {
    sync.push('حماية منع التغذية العكسية Anti-Islanding (IEC 62116 / IEC 61727) وفصل تلقائي عند انقطاع الشبكة.');
    sync.push('عداد ذكي أو محولات تيار CT عند نقطة الربط لوضع عدم التصدير (Zero Export) ما لم يُسمح بالتصدير.');
  }

  // ---- البطاريات ----
  const autonomyWh = (() => {
    if (!hasBattery) return 0;
    const H = input.autonomyHours;
    const full = Math.floor(H / 24);
    let e = full * loads.dailyWh;
    const rem = H - full * 24;
    for (let i = 0; i < Math.floor(rem); i++) e += loads.hourly[(18 + i) % 24]!;
    const frac = rem - Math.floor(rem);
    if (frac > 0) e += loads.hourly[(18 + Math.floor(rem)) % 24]! * frac;
    return e;
  })();
  const agingFactor = input.batteryType === 'lifepo4' ? 1.1 : input.batteryType === 'gel' ? 1.2 : 1.25;
  const etaDis = Math.sqrt(etaRt);
  const requiredNominalWh = hasBattery && !pureGrid ? (autonomyWh * agingFactor) / (battDef.dod * etaDis * cls.eff) : 0;
  const lfp = input.batteryType === 'lifepo4';
  let unitV: number, unitAh: number, series: number, unitLabel: string;
  if (lfp) {
    if (batteryVNom === 24) { unitV = 25.6; unitAh = requiredNominalWh > 10000 ? 200 : 100; series = 1; }
    else if (batteryVNom === 48) { unitV = 51.2; unitAh = requiredNominalWh > 40000 ? 200 : 100; series = 1; }
    else { unitV = 51.2; unitAh = 100; series = batteryVNom <= 200 ? 4 : 8; }
    unitLabel = `وحدة ليثيوم LiFePO4 ${unitV}V ${unitAh}Ah (${round((unitV * unitAh) / 1000, 2)} kWh)`;
  } else {
    unitV = 12; unitAh = 200; series = Math.max(1, Math.round(batteryVNom / 12));
    unitLabel = `${input.batteryType === 'gel' ? 'بطارية جل' : 'بطارية رصاص-حمض'} 12V 200Ah دورة عميقة`;
  }
  const bankV = unitV * series;
  const maxC = lfp ? 0.5 : input.batteryType === 'gel' ? 0.15 : 0.2;
  const maxCCharge = lfp ? 0.5 : input.batteryType === 'gel' ? 0.15 : 0.2;
  const vMinFactor = lfp ? 0.9 : 0.875;
  const maxDischargeW = hasBattery && !pureGrid ? Math.min(totalW, loads.peakW) / cls.eff : 0;
  const maxDischargeA = maxDischargeW / (bankV * vMinFactor);
  let parallel = hasBattery && !pureGrid ? Math.max(1, Math.ceil(requiredNominalWh / (bankV * unitAh))) : 0;
  if (parallel > 0 && maxDischargeA > maxC * unitAh * parallel) {
    const p2 = Math.ceil(maxDischargeA / (maxC * unitAh));
    warnings.push(`تيار التفريغ الأقصى ${round(maxDischargeA, 0)}A يتطلب رفع الفروع المتوازية من ${parallel} إلى ${p2} للبقاء ضمن ${maxC}C.`);
    parallel = p2;
  }
  const bankAh = unitAh * parallel;
  const nominalWh = bankV * bankAh;
  const usableWh = nominalWh * battDef.dod;
  const maxChargeW = parallel > 0 ? Math.min(arrayW * 0.9 * ETA_MPPT, totalW) : 0;
  const maxChargeA = parallel > 0 ? maxChargeW / bankV : 0;
  const chargeLimitA = Math.floor(maxCCharge * bankAh);
  const chargeLimited = parallel > 0 && maxChargeA > chargeLimitA;
  if (chargeLimited) warnings.push(`تيار الشحن المتاح من الألواح ${round(maxChargeA, 0)}A أعلى من الحد الآمن للبطاريات (${chargeLimitA}A = ${maxCCharge}C) — اضبط أقصى تيار شحن في الانفرتر.`);
  const bms: string[] = !parallel ? [] : lfp
    ? [
        'نظام BMS مدمج لكل وحدة: حماية الجهد الزائد/المنخفض، التيار الزائد، الحرارة، وموازنة الخلايا.',
        'اتصال مغلق مع الانفرتر عبر CAN Bus أو RS485 (بروتوكول متوافق مع قائمة الانفرتر المعتمدة).',
        batteryVNom > 60 ? 'وحدة تحكم رئيسية عالية الجهد (HV BMS / BCU) لكل برج بطاريات مع قاطع DC مدمج.' : 'ربط الوحدات المتوازية بكابل اتصال (Link) وتعيين وحدة رئيسية (Master).',
      ]
    : [
        'لا يوجد BMS — يُضبط الشحن بالجهد (Bulk/Absorption/Float) حسب ورقة بيانات البطارية.',
        'تعويض حراري للشحن ≈ −3mV/°C لكل خلية مع حساس حرارة البطارية.',
        'تهوية جيدة لغرفة البطاريات لتصريف غاز الهيدروجين (للرصاص المفتوح).',
      ];

  // ---- المولد ----
  let generator: ProResult['generator'] = null;
  if (input.systemType === 'hybrid-generator') {
    const chargeVA = Math.min(maxChargeW, totalW * 0.5);
    const kva = nextStd(Math.max(1.25 * (loads.peakVA + chargeVA), loads.surgeVA / 2.5) / 1000, GEN_SIZES_KVA);
    generator = { kva, note: `يغطي الحمل الأقصى ${round(loads.peakVA / 1000, 1)} kVA + شحن البطاريات، بهامش 25%، ويتحمل تيار بدء أكبر محرك.` };
  }

  // ---- التوجيه والميل ----
  const tilt = tiltAngles(site.lat);
  const az = facingAzimuth(input.orientation);
  const usedTilt = input.roofType === 'hangar' ? clamp(Math.round(input.roofPitch), 0, 30)
    : input.orientation === 'south' ? tilt.fixed : 10;
  const orientationNote = input.orientation === 'south'
    ? `التوجيه المثالي نحو الجنوب الجغرافي (سمت ${az}°) — انحراف حتى ±20° يقلل الإنتاج أقل من 3%.`
    : input.orientation === 'east-west'
      ? 'تركيب شرق-غرب متقابل (خيمة) بميل 10° — توزيع إنتاج أعرض خلال اليوم وكثافة ألواح أعلى على السطح.'
      : `توجيه ${ORIENTATIONS[input.orientation]} (سمت ${az}°) بميل منخفض 10° — الإنتاج أقل بنحو 12% من الجنوب.`;

  // ---- الكابلات ----
  const stringVmp = st.series * panel.vmp;
  const stringVocCold = st.series * temps.vocCold(panel);
  const pvCable = pickCable(PV_CABLES, { iz: 1.56 * panel.isc, currentA: panel.imp, lengthM: input.distances.dc, voltage: stringVmp, maxDrop: 1.5, minSize: 4 });
  const pvTotal = Math.ceil((st.strings * 2 * (input.distances.dc + 3) * 1.1) / 5) * 5;

  let batteryCable: ProResult['cables']['battery'] = null;
  let batteryBreaker: ProResult['protection']['batteryBreaker'] = null;
  if (parallel > 0) {
    const iUnit = unitW / (cls.eff * bankV * vMinFactor);
    const amps = nextStd(1.25 * iUnit, BREAKERS);
    const sel = pickCable(BAT_CABLES, { iz: amps, currentA: iUnit, lengthM: input.distances.battery, voltage: bankV, maxDrop: 1.5, minSize: 16 });
    batteryCable = { ...sel, currentA: round(iUnit, 1), lengthM: input.distances.battery, totalLengthM: Math.ceil(units * sel.runs * 2 * input.distances.battery * 1.1) };
    batteryBreaker = { amps, volts: batteryVNom > 60 ? '≥ 1000V DC' : '≥ 125V DC', qty: units };
  }

  const vAc = cls.phase === 3 ? V_LL : V_PH;
  const iOf = (va: number) => (cls.phase === 3 ? va / (Math.sqrt(3) * V_LL) : va / V_PH);
  const iUnitAc = iOf(unitW);
  const iTotalAc = iUnitAc * units;
  const acMainAmps = nextStd(1.25 * iTotalAc, BREAKERS);
  const acOutSel = pickCable(AC_CABLES, { iz: acMainAmps, currentA: iTotalAc, lengthM: input.distances.ac, voltage: vAc, maxDrop: 2, threePhase: cls.phase === 3, minSize: 2.5 });
  const cores = cls.phase === 3 ? '5 أقطاب (3L+N+PE)' : '3 أقطاب (L+N+PE)';
  const acOut = { ...acOutSel, currentA: round(iTotalAc, 1), lengthM: input.distances.ac, totalLengthM: Math.ceil(input.distances.ac * acOutSel.runs * 1.1), cores };
  let acIn: ProResult['cables']['acIn'] = null;
  let acInBreaker: ProResult['protection']['acInBreaker'] = null;
  if (input.systemType !== 'off-grid') {
    const chargeShare = pureGrid ? 0 : Math.min(maxChargeW / units, unitW * 0.5);
    const iIn = iOf(unitW + chargeShare) * units;
    const inAmps = nextStd(1.25 * iIn, BREAKERS);
    const sel = pickCable(AC_CABLES, { iz: inAmps, currentA: iIn, lengthM: input.distances.ac, voltage: vAc, maxDrop: 2, threePhase: cls.phase === 3, minSize: 2.5 });
    acIn = { ...sel, currentA: round(iIn, 1), lengthM: input.distances.ac, totalLengthM: Math.ceil(input.distances.ac * sel.runs * 1.1), cores };
    acInBreaker = { amps: inAmps, poles: cls.phase === 3 ? '4P' : '2P', qty: 1 };
  }
  const phaseSize = acOutSel.size;
  const pe = phaseSize <= 16 ? phaseSize : phaseSize <= 35 ? 16 : nextStd(phaseSize / 2, AC_CABLES.map((c) => c[0]));

  // ---- الحمايات ----
  const dcAmps = nextStd(1.56 * panel.isc * Math.max(1, maxOnMppt), BREAKERS);
  const dcVolts = nextStd(stringVocCold, DC_VOLT_RATINGS);
  const stringFuse = maxOnMppt >= 3 ? { amps: nextStd(1.56 * panel.isc, [10, 12, 15, 20, 25, 30, 32]), volts: dcVolts, qty: st.strings * 2 } : null;
  const ucpv = nextStd(1.2 * st.series * panel.voc, DC_VOLT_RATINGS);
  const mpptUsed = mpptMap.length;

  const earthingRods = 2 + (input.roofType === 'ground' ? Math.floor(arrayW / 50000) : 0);

  // ---- منحنيات 24 ساعة ومحاكاة حالة الشحن ----
  const shape: number[] = [];
  for (let h = 0; h < 24; h++) shape.push(h < 6 || h >= 18 ? 0 : Math.sin((Math.PI * (h - 6 + 0.5)) / 12));
  const shapeSum = shape.reduce((a, b) => a + b, 0);
  const dailyYieldWh = arrayW * site.psh * pr * orientFactor * ETA_MPPT;
  const generation = shape.map((s) => round((s / shapeSum) * dailyYieldWh, 0));
  const consumption = loads.hourly.map((v) => round(v, 0));
  const soc: number[] = [];
  let unmetWh = 0, surplusWh = 0;
  {
    const cap = Math.max(nominalWh, 1);
    const floorWh = nominalWh - usableWh;
    let stored = cap;
    for (let day = 0; day < 3; day++) {
      for (let h = 0; h < 24; h++) {
        const net = generation[h]! - consumption[h]! / cls.eff;
        if (net >= 0) {
          const room = (cap - stored) / etaDis;
          const charge = parallel > 0 ? Math.min(net, room) : 0;
          stored += charge * etaDis;
          if (day === 2) surplusWh += net - charge;
        } else {
          const need = -net;
          const avail = parallel > 0 ? (stored - floorWh) * etaDis : 0;
          const take = Math.min(need, avail);
          stored -= take / etaDis;
          if (day === 2) unmetWh += (need - take) * cls.eff;
        }
        if (day === 2) soc.push(parallel > 0 ? round((stored / cap) * 100, 0) : 0);
      }
    }
  }

  // ---- إرشادات التركيب ----
  const wind = site.coastal ? 45 : 40;
  const mounting: string[] = input.roofType === 'concrete'
    ? [
        `هياكل من الحديد المجلفن بالغمس الساخن (≥ 80 ميكرون) أو ألمنيوم 6005-T5 بزاوية ميل ${usedTilt}°، مصممة لسرعة رياح أساسية ${wind} م/ث (ASCE 7 / EN 1991-1-4).`,
        'التثبيت بقواعد خرسانية مسبقة الصب (Ballast) أو براغي كيميائية بعمق ≥ 10 سم دون اختراق طبقة العزل، مع إعادة عزل نقاط التثبيت.',
        'التحقق من قدرة تحمل السقف (حمل إضافي نموذجي 25-40 كجم/م² مع القواعد).',
        'ترك مسافة أمان ≥ 1 م من حواف السطح (الدروة) لمقاومة الرياح وسهولة الصيانة، وعدم تغطية مصارف المياه.',
        'رفع الحافة السفلية للألواح ≥ 30 سم عن السطح للتهوية وتقليل تراكم الأتربة.',
      ]
    : input.roofType === 'hangar'
      ? [
          `تركيب موازٍ لسطح الهنجر (ميل ${usedTilt}°) على قضبان ألمنيوم مثبتة على المدادات (Purlins) وليس على الصاج فقط.`,
          'استخدام مشابك مخصصة لنوع الصاج (Trapezoidal / Klip-Lok) أو براغي ذاتية الحفر مع جلبة EPDM مانعة للتسرب.',
          'التحقق إنشائياً من تحمل المدادات والجملونات للحمل الإضافي (≈ 12-15 كجم/م²) وقوى رفع الرياح.',
          `تصميم التثبيت لسرعة رياح ${wind} م/ث مع زيادة نقاط التثبيت في مناطق الحواف والزوايا.`,
          'ممرات صيانة كل 4 صفوف وعدم المشي على الألواح؛ عزل حراري/فاصل بين الألمنيوم والصاج لمنع التآكل الجلفاني.',
        ]
      : [
          `هياكل أرضية مجلفنة بالغمس الساخن بزاوية ${usedTilt}° على أساسات خرسانية أو أوتاد مدقوقة/لولبية حسب تقرير التربة.`,
          'ارتفاع الحافة السفلية ≥ 0.5–0.8 م عن الأرض لتجنب الرمال والمياه والنباتات.',
          `تصميم لسرعة رياح ${wind} م/ث مع دعامات قطرية (Bracing)، وتباعد صفوف محسوب لمنع التظليل.`,
          'سياج محيطي وبوابة، وتمديد الكابلات في خنادق بعمق ≥ 60 سم داخل أنابيب مع شريط تحذيري.',
          'تأريض حلقي محيطي للمصفوفة يربط جميع الهياكل.',
        ];
  if (site.coastal) mounting.push('منطقة ساحلية: براغي ستانلس ستيل A4 (316) وطلاء إضافي مقاوم للتآكل الملحي، ولوحات بتصنيف IP65 على الأقل.');

  // ---- ملاحظات وتحذيرات ----
  if (loads.count === 0) warnings.push('لم تُضف أي أحمال.');
  const dcAc = arrayW / Math.max(1, totalW);
  if (!pureGrid && dcAc < 0.8) warnings.push(`نسبة DC/AC = ${round(dcAc, 2)} منخفضة — قدرة الانفرتر محكومة بالأحمال القصوى، والألواح كافية للطاقة اليومية.`);
  if (pvCable.runs > 1 || !pvCable.ok) warnings.push('مسافة كابل الألواح طويلة جداً — يُنصح بنقل الانفرتر أو صندوق التجميع أقرب للمصفوفة.');
  if (batteryCable && !batteryCable.ok) warnings.push('مسافة البطاريات عن الانفرتر طويلة جداً لتيار التفريغ — قرّب البطاريات من الانفرتر (يفضل ≤ 3 م).');
  if (!acOut.ok) warnings.push('مسافة كابل AC كبيرة جداً — يتجاوز هبوط الجهد 2% حتى بأكبر مقاس.');
  if (cls.freq === 'HF' && loads.surgeVA > surgeCapacityVA) warnings.push('تيار البدء يتجاوز قدرة التحميل الزائد — استخدم مُشغل ناعم (Soft Starter) أو محول تردد (VFD) للمحركات.');
  if (hasBattery && input.autonomyHours > 24) warnings.push('استقلالية أطول من 24 ساعة ترفع تكلفة البطاريات كثيراً — فكّر في نظام هجين مع مولد.');
  if (pureGrid) assumptions.push('نظام بلا بطاريات: يتوقف عند انقطاع الشبكة (حماية Anti-Islanding). الحمل الليلي يُغطى من الشبكة.');
  if (unmetWh > 1 && hasBattery && !pureGrid) {
    warnings.push(`المحاكاة تُظهر عجزاً يومياً ≈ ${round(unmetWh / 1000, 2)} kWh في نهاية فترة الاستقلالية — يُغطى من ${input.systemType === 'off-grid' ? 'زيادة البطاريات أو ساعات الاستقلالية' : input.systemType === 'hybrid-generator' ? 'المولد' : 'الشبكة'}.`);
  }
  assumptions.push(`درجات الحرارة التصميمية لـ${site.name}: الدنيا ${site.tMin}°C (لحساب Voc الأقصى)، القصوى ${site.tMax}°C (خلية حتى ${site.tMax + 30}°C لحساب Vmp الأدنى).`);
  assumptions.push(`البطاريات: عمق تفريغ ${Math.round(battDef.dod * 100)}%، كفاءة تفريغ ${Math.round(etaDis * 100)}%، معامل شيخوخة ونهاية عمر ${agingFactor}.`);
  assumptions.push('مواصفات الألواح والانفرترات قيم نموذجية لفئات السوق؛ تُطابق مع أوراق البيانات الفعلية قبل الشراء.');
  assumptions.push('قيم الإشعاع ودرجات الحرارة تقديرية مجمعة — يُنصح بالتحقق عبر Global Solar Atlas / NASA POWER.');

  return {
    site: { ...site, pr: round(pr, 4), tempFactor: round(tempFactor, 4), orientFactor, tCellHot },
    loads,
    systemLabel,
    pv: {
      requiredW: round(requiredW, 0), arrayW, kWp: round(arrayW / 1000, 2), numPanels: st.numPanels, panel,
      panelAuto: manual === null, recommendedWattage: recommended,
      minEfficiency: 0.2,
      series: st.series, strings: st.strings, minSeries: st.minS, maxSeries: st.maxS, compatible: st.compatible,
      stringVmp: round(stringVmp, 1), stringVmpHot: round(st.series * temps.vmpHot(panel), 1),
      stringVoc: round(st.series * panel.voc, 1), stringVocCold: round(stringVocCold, 1),
      stringImp: panel.imp, stringIsc: panel.isc,
      arrayImp: round(panel.imp * st.strings, 1), arrayIsc: round(panel.isc * st.strings, 1),
      dailyYieldWh: round(dailyYieldWh, 0), dcAcRatio: round(dcAc, 2),
      mpptMap, stringsPerMpptMax: perMppt,
    },
    orientation: { label: ORIENTATIONS[input.orientation], azimuth: az, tilt: { ...tilt, used: usedTilt }, note: orientationNote },
    inverter: {
      typeLabel, freq: cls.freq, freqReason: pureGrid ? 'انفرتر الشبكة عالي التردد بدون محول — الأحمال تُغذى من الشبكة.' : lfCheck.reason,
      phase: cls.phase, gridTie: cls.gridTie,
      unitW, units, totalW, requiredW: round(ratingByLoad, 0),
      batteryV: batteryVNom, hv: cls.hv, mpptPerUnit, mpptTotal, mpptUsed,
      vMppMin: cls.vMppMin, vMppMax: cls.vMppMax, vPvMax: cls.vPvMax, iMppt: cls.iMppt(unitW),
      surgeFactor: cls.surge, surgeCapacityVA, requiredSurgeVA: round(loads.surgeVA, 0), surgeOk: pureGrid || loads.surgeVA <= surgeCapacityVA,
      efficiency: cls.eff, pvMaxW: Math.round(totalW * cls.pvRatioMax),
      connection, sync,
    },
    battery: {
      required: parallel > 0, type: input.batteryType, typeLabel: battDef.label,
      autonomyWh: round(autonomyWh, 0), nominalWh: round(nominalWh, 0), usableWh: round(usableWh, 0), requiredNominalWh: round(requiredNominalWh, 0),
      voltage: batteryVNom, nominalVoltage: round(bankV, 1), ah: bankAh, dod: battDef.dod, agingFactor,
      unitLabel, unitV, unitAh, series, parallel, units: series * parallel,
      maxDischargeW: round(maxDischargeW, 0), maxDischargeA: round(maxDischargeA, 0),
      maxChargeW: round(maxChargeW, 0), maxChargeA: round(maxChargeA, 0),
      cRateDischarge: bankAh > 0 ? round(maxDischargeA / bankAh, 2) : 0,
      cRateCharge: bankAh > 0 ? round(Math.min(maxChargeA, chargeLimitA) / bankAh, 2) : 0,
      chargeLimitA, chargeLimited, bms,
    },
    generator,
    cables: {
      pv: { ...pvCable, currentA: panel.imp, lengthM: input.distances.dc, totalLengthM: pvTotal },
      battery: batteryCable,
      acOut, acIn, pe,
    },
    protection: {
      dcBreaker: { amps: dcAmps, volts: dcVolts, poles: dcVolts <= 600 ? '2P' : '2P/4P (1000V DC)', qty: mpptUsed },
      stringFuse,
      dcSpd: { ucpv, qty: mpptUsed },
      batteryBreaker,
      acOutBreaker: { amps: nextStd(1.25 * iUnitAc, BREAKERS), poles: cls.phase === 3 ? '4P' : '2P', qty: units },
      acMainBreaker: units > 1 ? { amps: acMainAmps, poles: cls.phase === 3 ? '4P' : '2P' } : null,
      acInBreaker,
      rcd: {
        amps: nextStd(acMainAmps, [25, 40, 63, 80, 100, 125]), poles: cls.phase === 3 ? '4P' : '2P',
        type: loads.motorShare > 0.2 ? 'Type B 300mA للتغذية الرئيسية (محولات تردد/محركات) + Type A 30mA للدوائر النهائية' : 'Type A — 30mA للدوائر النهائية و100–300mA للتغذية الرئيسية',
      },
      acSpd: { poles: cls.phase === 3 ? '3P+N' : '1P+N', uc: 275 },
      earthing: {
        rods: earthingRods, mainMm2: Math.max(16, pe), bondingMm2: 6, targetOhm: 5,
        notes: [
          'قضبان تأريض نحاسية مطلية 5/8" بطول 1.5–2.4 م في حفر مع مادة تحسين التربة (Bentonite).',
          'ربط هياكل الألواح والقضبان بموصل 6 mm² أصفر/أخضر، والانفرتر ومانعات الصواعق بموصل رئيسي إلى قضيب التأريض.',
          'قضيب توزيع أرضي (Earth Bar) في غرفة الانفرتر، وربط متساوي الجهد بين تأريض DC وAC.',
          'مقاومة أرضية مستهدفة ≤ 5 أوم وقياسها بجهاز Earth Tester قبل التشغيل.',
          input.roofType === 'ground' || arrayW > 30000 ? 'تقييم الحاجة لنظام حماية خارجي من الصواعق LPS وفق IEC 62305 للمصفوفات الكبيرة.' : 'مانعات الصواعق Type 2 على جانبي DC وAC كافية للمنشآت الاعتيادية.',
        ],
      },
    },
    curves: { generation, consumption, soc, unmetWh: round(unmetWh, 0), surplusWh: round(surplusWh, 0) },
    mounting,
    warnings,
    assumptions,
  };
}
