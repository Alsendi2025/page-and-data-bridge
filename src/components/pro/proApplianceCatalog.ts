import type { ProLoad, LoadPeriod } from '@/lib/proEngine';

export interface ProApplianceTemplate {
  name: string;
  qty: number;
  powerW: number;
  unit: 'W' | 'kW';
  pf: number;
  startFactor: number;
  hours: number;
  period: LoadPeriod;
}

/** كتالوج احترافي للأجهزة والمعدات الصناعية والتجارية والزراعية */
export const PRO_APPLIANCE_CATALOG: { group: string; items: ProApplianceTemplate[] }[] = [
  {
    group: 'الإنارة',
    items: [
      { name: 'لمبة LED صناعية', qty: 20, powerW: 50, unit: 'W', pf: 0.9, startFactor: 1, hours: 10, period: 'night' },
      { name: 'كشاف LED عالي (High Bay)', qty: 10, powerW: 150, unit: 'W', pf: 0.9, startFactor: 1, hours: 10, period: 'night' },
      { name: 'فلوارسنت صناعي 120cm', qty: 15, powerW: 36, unit: 'W', pf: 0.85, startFactor: 1, hours: 10, period: 'day' },
      { name: 'إنارة مخزن/مستودع', qty: 30, powerW: 80, unit: 'W', pf: 0.9, startFactor: 1, hours: 8, period: '24h' },
    ],
  },
  {
    group: 'التكييف والتبريد',
    items: [
      { name: 'مكيف سبليت 1 طن (12000 BTU)', qty: 2, powerW: 1100, unit: 'W', pf: 0.8, startFactor: 3, hours: 8, period: 'day' },
      { name: 'مكيف سبليت 2 طن (24000 BTU)', qty: 1, powerW: 2200, unit: 'W', pf: 0.8, startFactor: 3, hours: 8, period: 'day' },
      { name: 'مكيف مركزي 5 طن', qty: 1, powerW: 5500, unit: 'W', pf: 0.85, startFactor: 4, hours: 10, period: 'day' },
      { name: 'ثلاجة تجارية عرض', qty: 2, powerW: 400, unit: 'W', pf: 0.8, startFactor: 2, hours: 24, period: '24h' },
      { name: 'فريزر صناعي كبير', qty: 1, powerW: 1500, unit: 'W', pf: 0.8, startFactor: 3, hours: 24, period: '24h' },
      { name: 'غرفة تبريد (Cold Room)', qty: 1, powerW: 3000, unit: 'W', pf: 0.8, startFactor: 4, hours: 16, period: '24h' },
    ],
  },
  {
    group: 'المضخات والمحركات',
    items: [
      { name: 'مضخة مياه 1 حصان', qty: 1, powerW: 750, unit: 'W', pf: 0.8, startFactor: 3, hours: 2, period: 'day' },
      { name: 'مضخة مياه 3 حصان', qty: 1, powerW: 2200, unit: 'W', pf: 0.8, startFactor: 4, hours: 4, period: 'day' },
      { name: 'مضخة غاطسة 5 حصان', qty: 1, powerW: 3700, unit: 'W', pf: 0.82, startFactor: 5, hours: 5, period: 'day' },
      { name: 'مضخة ري 10 حصان', qty: 1, powerW: 7500, unit: 'W', pf: 0.85, startFactor: 5, hours: 6, period: 'day' },
      { name: 'مضخة حرارية صناعية 20 حصان', qty: 1, powerW: 15000, unit: 'W', pf: 0.85, startFactor: 6, hours: 8, period: '24h' },
      { name: 'محرك طارد مركزي Exhaust Fan', qty: 2, powerW: 550, unit: 'W', pf: 0.8, startFactor: 2, hours: 12, period: 'day' },
    ],
  },
  {
    group: 'الآلات الصناعية',
    items: [
      { name: 'ماكينة لحام كهربائي', qty: 1, powerW: 5000, unit: 'W', pf: 0.6, startFactor: 2, hours: 4, period: 'day' },
      { name: 'منشار قطع خرسانة', qty: 1, powerW: 2200, unit: 'W', pf: 0.8, startFactor: 4, hours: 3, period: 'day' },
      { name: 'خلاطة خرسانة', qty: 1, powerW: 3000, unit: 'W', pf: 0.8, startFactor: 4, hours: 4, period: 'day' },
      { name: 'كومبروسر هواء 10 حصان', qty: 1, powerW: 7500, unit: 'W', pf: 0.8, startFactor: 5, hours: 6, period: 'day' },
      { name: 'ماكينة CNC متوسطة', qty: 1, powerW: 4000, unit: 'W', pf: 0.75, startFactor: 2, hours: 8, period: 'day' },
      { name: 'خط إنتاج صغير', qty: 1, powerW: 11000, unit: 'W', pf: 0.82, startFactor: 3, hours: 8, period: 'day' },
    ],
  },
  {
    group: 'المطبخ التجاري',
    items: [
      { name: 'فرن صناعي كهربائي', qty: 1, powerW: 6000, unit: 'W', pf: 1, startFactor: 1, hours: 4, period: 'day' },
      { name: 'غلاية ماء كبيرة', qty: 1, powerW: 3000, unit: 'W', pf: 1, startFactor: 1, hours: 2, period: 'day' },
      { name: 'ثلاجة مطبخ فندقي', qty: 3, powerW: 500, unit: 'W', pf: 0.8, startFactor: 2, hours: 24, period: '24h' },
      { name: 'ماكينة قهوة صناعية', qty: 2, powerW: 1800, unit: 'W', pf: 1, startFactor: 1, hours: 6, period: 'day' },
    ],
  },
  {
    group: 'إلكترونيات ومكاتب',
    items: [
      { name: 'حاسوب مكتبي', qty: 10, powerW: 200, unit: 'W', pf: 0.65, startFactor: 1, hours: 9, period: 'day' },
      { name: 'خادم / Server', qty: 2, powerW: 600, unit: 'W', pf: 0.9, startFactor: 1, hours: 24, period: '24h' },
      { name: 'راوتر ومعدات شبكة', qty: 1, powerW: 100, unit: 'W', pf: 0.9, startFactor: 1, hours: 24, period: '24h' },
      { name: 'كاميرات مراقبة + NVR', qty: 1, powerW: 120, unit: 'W', pf: 0.9, startFactor: 1, hours: 24, period: '24h' },
      { name: 'طابعة / ناسخة كبيرة', qty: 1, powerW: 800, unit: 'W', pf: 0.7, startFactor: 1, hours: 2, period: 'day' },
      { name: 'يو بي إس (UPS)', qty: 3, powerW: 50, unit: 'W', pf: 0.9, startFactor: 1, hours: 24, period: '24h' },
    ],
  },
  {
    group: 'زراعة وثروة حيوانية',
    items: [
      { name: 'مضخة ري تنقيط', qty: 2, powerW: 1500, unit: 'W', pf: 0.8, startFactor: 3, hours: 6, period: 'day' },
      { name: 'نظام تهوية دفيئة', qty: 4, powerW: 300, unit: 'W', pf: 0.8, startFactor: 2, hours: 12, period: 'day' },
      { name: 'إنارة دفيئة نمو', qty: 20, powerW: 100, unit: 'W', pf: 0.9, startFactor: 1, hours: 8, period: 'night' },
      { name: 'حلابة آلية', qty: 1, powerW: 1200, unit: 'W', pf: 0.8, startFactor: 3, hours: 4, period: '24h' },
      { name: 'معلف آلي', qty: 2, powerW: 400, unit: 'W', pf: 0.8, startFactor: 2, hours: 6, period: '24h' },
    ],
  },
  {
    group: 'مولدات كهرباء (مساعدة)',
    items: [
      { name: 'مولد احتياطي 20 kVA', qty: 1, powerW: 16000, unit: 'W', pf: 0.8, startFactor: 1, hours: 0, period: '24h' },
      { name: 'مولد احتياطي 50 kVA', qty: 1, powerW: 40000, unit: 'W', pf: 0.8, startFactor: 1, hours: 0, period: '24h' },
    ],
  },
];

export const CUSTOM_PRO_APPLIANCE: ProApplianceTemplate = {
  name: '', qty: 1, powerW: 500, unit: 'W', pf: 0.8, startFactor: 1, hours: 4, period: 'day',
};

let proUid = 1;
const proNid = () => `pro-${proUid++}`;

export function createProLoad(t: ProApplianceTemplate): ProLoad {
  return {
    id: proNid(),
    name: t.name || 'جهاز جديد',
    qty: t.qty,
    powerW: t.powerW,
    unit: t.unit,
    pf: t.pf,
    startFactor: t.startFactor,
    hours: t.hours,
    period: t.period,
    suggested: { qty: t.qty, powerW: t.powerW, pf: t.pf, startFactor: t.startFactor, hours: t.hours, period: t.period },
  };
}
