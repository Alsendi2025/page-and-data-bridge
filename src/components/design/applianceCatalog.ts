import type { ManualAppliance } from './types';

export type ApplianceTemplate = Omit<ManualAppliance, 'id' | 'suggested'>;

/** كتالوج الأجهزة الكهربائية والإلكترونية الشائعة في المنازل والمحلات اليمنية.
 *  القيم مقترحات نموذجية (قدرة تشغيل فعلية متوسطة) ويمكن للمستخدم تعديلها بحرية. */
export const APPLIANCE_CATALOG: { group: string; items: ApplianceTemplate[] }[] = [
  {
    group: 'الإنارة',
    items: [
      { name: 'لمبة LED', qty: 6, powerW: 10, unit: 'W', hours: 5, period: 'night' },
      { name: 'كشاف LED خارجي', qty: 1, powerW: 30, unit: 'W', hours: 10, period: 'night' },
      { name: 'إضاءة متجر / مكتب', qty: 10, powerW: 20, unit: 'W', hours: 8, period: 'day' },
    ],
  },
  {
    group: 'التبريد والتهوية',
    items: [
      { name: 'مروحة سقف', qty: 2, powerW: 60, unit: 'W', hours: 8, period: 'day' },
      { name: 'مروحة عمودية / طاولة', qty: 1, powerW: 45, unit: 'W', hours: 6, period: 'night' },
      { name: 'مبرد هواء (مكيف صحراوي)', qty: 1, powerW: 150, unit: 'W', hours: 8, period: 'day' },
      { name: 'مكيف سبليت 1 طن (12000 BTU)', qty: 1, powerW: 1100, unit: 'W', hours: 6, period: 'day' },
      { name: 'مكيف سبليت 1.5 طن (18000 BTU)', qty: 1, powerW: 1700, unit: 'W', hours: 6, period: 'day' },
    ],
  },
  {
    group: 'المطبخ',
    items: [
      { name: 'ثلاجة منزلية', qty: 1, powerW: 150, unit: 'W', hours: 8, period: '24h' },
      { name: 'فريزر (مجمد)', qty: 1, powerW: 200, unit: 'W', hours: 10, period: '24h' },
      { name: 'ميكروويف', qty: 1, powerW: 1000, unit: 'W', hours: 0.5, period: 'day' },
      { name: 'غلاية ماء كهربائية', qty: 1, powerW: 2000, unit: 'W', hours: 0.3, period: 'day' },
      { name: 'خلاط / عصارة', qty: 1, powerW: 400, unit: 'W', hours: 0.2, period: 'day' },
      { name: 'فرن كهربائي', qty: 1, powerW: 2000, unit: 'W', hours: 1, period: 'day' },
    ],
  },
  {
    group: 'الأجهزة المنزلية',
    items: [
      { name: 'غسالة ملابس', qty: 1, powerW: 500, unit: 'W', hours: 1, period: 'day' },
      { name: 'مكواة ملابس', qty: 1, powerW: 1000, unit: 'W', hours: 0.5, period: 'day' },
      { name: 'سخان ماء كهربائي', qty: 1, powerW: 1500, unit: 'W', hours: 1.5, period: 'day' },
      { name: 'مكنسة كهربائية', qty: 1, powerW: 1200, unit: 'W', hours: 0.3, period: 'day' },
    ],
  },
  {
    group: 'المياه والمضخات',
    items: [
      { name: 'مضخة رفع مياه للخزان (دينمو)', qty: 1, powerW: 750, unit: 'kW', hours: 1, period: 'day' },
      { name: 'مضخة ري زراعية 3 حصان', qty: 1, powerW: 2200, unit: 'kW', hours: 4, period: 'day' },
      { name: 'مضخة غاطسة 5 حصان', qty: 1, powerW: 3700, unit: 'kW', hours: 5, period: 'day' },
    ],
  },
  {
    group: 'الإلكترونيات والاتصالات',
    items: [
      { name: 'تلفاز LED', qty: 1, powerW: 80, unit: 'W', hours: 6, period: 'night' },
      { name: 'رسيفر', qty: 1, powerW: 20, unit: 'W', hours: 6, period: 'night' },
      { name: 'راوتر إنترنت', qty: 1, powerW: 15, unit: 'W', hours: 24, period: '24h' },
      { name: 'لابتوب', qty: 1, powerW: 65, unit: 'W', hours: 6, period: 'day' },
      { name: 'حاسوب مكتبي', qty: 1, powerW: 200, unit: 'W', hours: 8, period: 'day' },
      { name: 'شاحن هاتف', qty: 4, powerW: 10, unit: 'W', hours: 3, period: 'night' },
      { name: 'كاميرات مراقبة مع جهاز تسجيل', qty: 1, powerW: 40, unit: 'W', hours: 24, period: '24h' },
      { name: 'طابعة / ناسخة', qty: 1, powerW: 300, unit: 'W', hours: 0.5, period: 'day' },
    ],
  },
  {
    group: 'تجاري وورش',
    items: [
      { name: 'ثلاجة عرض تجارية', qty: 1, powerW: 400, unit: 'W', hours: 12, period: '24h' },
      { name: 'ماكينة خياطة', qty: 1, powerW: 250, unit: 'W', hours: 6, period: 'day' },
      { name: 'مثقاب / أدوات كهربائية', qty: 1, powerW: 700, unit: 'W', hours: 0.5, period: 'day' },
    ],
  },
];

export const CUSTOM_APPLIANCE: ApplianceTemplate = {
  name: '', qty: 1, powerW: 100, unit: 'W', hours: 4, period: 'day',
};

export function findTemplate(name: string): ApplianceTemplate | undefined {
  for (const g of APPLIANCE_CATALOG) {
    const t = g.items.find((i) => i.name === name);
    if (t) return t;
  }
  return undefined;
}
