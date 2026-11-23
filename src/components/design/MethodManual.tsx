import { useEffect, useMemo, useState } from 'react';
import { MapPin, Plus, Trash2, Info, Zap, Lightbulb, PackagePlus } from 'lucide-react';
import { YEMEN_CITIES } from '@/lib/constants';
import {
  DEFAULT_ASSUMPTIONS, USAGE_TYPES, BATTERY_TYPES, SYSTEM_TYPES,
  type UsageType, type BatteryType, type SystemType,
} from '@/lib/designEngine';
import type { ManualAppliance, MethodOutput } from './types';
import { APPLIANCE_CATALOG, CUSTOM_APPLIANCE, findTemplate, type ApplianceTemplate } from './applianceCatalog';

let uid = 1;
const nid = () => `m${uid++}`;
const CUSTOM_KEY = '__custom__';

const PERIODS: { value: ManualAppliance['period']; label: string }[] = [
  { value: 'day', label: 'نهاراً' },
  { value: 'night', label: 'ليلاً' },
  { value: '24h', label: 'مستمر (24 ساعة)' },
];
const periodLabel = (p: ManualAppliance['period']) => PERIODS.find((x) => x.value === p)?.label ?? '';

function periodHours(p: ManualAppliance['period']): number[] {
  if (p === 'day') return [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  if (p === 'night') return [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
  return Array.from({ length: 24 }, (_, i) => i);
}

function buildWeights(appliances: ManualAppliance[]): number[] {
  const w = new Array(24).fill(0);
  for (const a of appliances) {
    const energy = a.qty * a.powerW * a.hours;
    if (energy <= 0) continue;
    const hrs = periodHours(a.period);
    const per = energy / hrs.length;
    for (const h of hrs) w[h] += per;
  }
  return w;
}

const fmtPower = (w: number, unit: 'W' | 'kW') => (unit === 'kW' ? `${w / 1000} kW` : `${w} W`);

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block text-[10px] text-teal-600">مقترح: <span dir="ltr">{children}</span></span>;
}

export default function MethodManual({ onOutput }: { onOutput: (o: MethodOutput) => void }) {
  const [city, setCity] = useState('صنعاء');
  const [usageType, setUsageType] = useState<UsageType>('home');
  const [appliances, setAppliances] = useState<ManualAppliance[]>([]);
  const [picking, setPicking] = useState(false);
  const [mode, setMode] = useState<'simultaneous' | 'alternating'>('simultaneous');
  const [batteryType, setBatteryType] = useState<BatteryType>('lifepo4');
  const [systemType, setSystemType] = useState<SystemType>('solar-battery');
  const [autonomyHours, setAutonomyHours] = useState(12);

  const dailyEnergyWh = useMemo(
    () => appliances.reduce((s, a) => s + a.qty * a.powerW * a.hours, 0),
    [appliances]
  );

  const peakLoadW = useMemo(() => {
    if (mode === 'alternating') {
      return appliances.reduce((m, a) => Math.max(m, a.qty * a.powerW), 0);
    }
    return appliances.reduce((s, a) => s + a.qty * a.powerW, 0);
  }, [appliances, mode]);

  const weights = useMemo(() => buildWeights(appliances), [appliances]);
  const psh = YEMEN_CITIES.find((c) => c.name === city)?.psh ?? 5.9;

  useEffect(() => {
    onOutput({
      city,
      psh,
      dailyEnergyWh,
      peakLoadW,
      usageType,
      hourlyWeights: weights,
      batteryType,
      systemType,
      autonomyHours,
      assumptions: DEFAULT_ASSUMPTIONS,
      methodLabel: 'الحساب اليدوي التفصيلي',
      ready: dailyEnergyWh > 0,
    });
  }, [city, psh, dailyEnergyWh, peakLoadW, usageType, weights, batteryType, systemType, autonomyHours, onOutput]);

  const update = (id: string, patch: Partial<ManualAppliance>) =>
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const remove = (id: string) => setAppliances((prev) => prev.filter((a) => a.id !== id));

  const attach = (key: string) => {
    if (!key) return;
    const isCustom = key === CUSTOM_KEY;
    const t: ApplianceTemplate | undefined = isCustom ? CUSTOM_APPLIANCE : findTemplate(key);
    if (!t) return;
    setAppliances((prev) => [
      ...prev,
      {
        ...t,
        id: nid(),
        suggested: isCustom ? undefined : { qty: t.qty, powerW: t.powerW, hours: t.hours, period: t.period },
      },
    ]);
    setPicking(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
            <MapPin className="h-4 w-4 text-teal-600" /> الموقع / المدينة
          </span>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
            {YEMEN_CITIES.map((c) => <option key={c.name} value={c.name}>{c.name} — {c.psh} PSH</option>)}
          </select>
          <span className="mt-1 block text-[11px] text-slate-400">تحديد الإشعاع الشمسي ودرجة الحرارة والفواقد.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">نوع الاستخدام</span>
          <select value={usageType} onChange={(e) => setUsageType(e.target.value as UsageType)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
            {Object.entries(USAGE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      {/* قائمة الأجهزة */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Zap className="h-4 w-4 text-teal-600" /> الأجهزة الكهربائية
            {appliances.length > 0 && <span className="text-xs font-medium text-slate-400">({appliances.length})</span>}
          </h3>
          <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700" dir="ltr">
            {(dailyEnergyWh / 1000).toFixed(2)} kWh/يوم
          </span>
        </div>

        <div className="space-y-3">
          {appliances.length === 0 && !picking && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <PackagePlus className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-600">لم تُضف أي أجهزة بعد</p>
              <p className="mt-1 text-xs text-slate-400">اضغط «إرفاق جهاز» واختر أجهزتك واحداً تلو الآخر.</p>
            </div>
          )}

          {appliances.map((a) => {
            const displayPower = a.unit === 'kW' ? a.powerW / 1000 : a.powerW;
            const s = a.suggested;
            return (
              <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={a.name}
                    onChange={(e) => update(a.id, { name: e.target.value })}
                    placeholder="اسم الجهاز"
                    aria-label="اسم الجهاز"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-400"
                  />
                  <span className="hidden shrink-0 text-[11px] text-slate-400 sm:inline" dir="ltr">
                    {((a.qty * a.powerW * a.hours) / 1000).toFixed(2)} kWh
                  </span>
                  <button onClick={() => remove(a.id)} aria-label={`حذف ${a.name || 'الجهاز'}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">العدد</span>
                    <input type="number" min={1} value={a.qty} onChange={(e) => update(a.id, { qty: Math.max(1, Number(e.target.value)) })} dir="ltr" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                    {s && <Hint>{s.qty}</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">القدرة الكهربائية</span>
                    <div className="flex">
                      <input type="number" min={0} step={a.unit === 'kW' ? 0.05 : 1} value={displayPower} onChange={(e) => { const v = Math.max(0, Number(e.target.value)); update(a.id, { powerW: a.unit === 'kW' ? Math.round(v * 1000) : v }); }} dir="ltr" className="w-full min-w-0 rounded-r-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                      <select value={a.unit} onChange={(e) => update(a.id, { unit: e.target.value as 'W' | 'kW' })} aria-label="وحدة القدرة" className="rounded-l-lg border border-r-0 border-slate-200 bg-white px-1 text-xs outline-none">
                        <option value="W">W</option>
                        <option value="kW">kW</option>
                      </select>
                    </div>
                    {s && <Hint>{fmtPower(s.powerW, a.unit)}</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">ساعات التشغيل/يوم</span>
                    <input type="number" min={0} max={24} step={0.5} value={a.hours} onChange={(e) => update(a.id, { hours: Math.min(24, Math.max(0, Number(e.target.value))) })} dir="ltr" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                    {s && <Hint>{s.hours} h</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">فترة التشغيل</span>
                    <select value={a.period} onChange={(e) => update(a.id, { period: e.target.value as ManualAppliance['period'] })} className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-center text-sm outline-none focus:border-teal-400">
                      {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    {s && <span className="mt-1 block text-[10px] text-teal-600">مقترح: {periodLabel(s.period)}</span>}
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* إرفاق جهاز */}
        <div className="mt-4">
          {picking ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-teal-800">اختر الجهاز من القائمة</span>
                <select
                  autoFocus
                  defaultValue=""
                  onChange={(e) => attach(e.target.value)}
                  aria-label="اختر الجهاز"
                  className="w-full rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400"
                >
                  <option value="" disabled>— اختر جهازاً كهربائياً أو إلكترونياً —</option>
                  {APPLIANCE_CATALOG.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </optgroup>
                  ))}
                  <optgroup label="غير موجود في القائمة؟">
                    <option value={CUSTOM_KEY}>+ إضافة جهاز جديد يدوياً</option>
                  </optgroup>
                </select>
              </label>
              <button onClick={() => setPicking(false)} className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-700">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => setPicking(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" /> إرفاق جهاز
            </button>
          )}
          {appliances.some((a) => a.suggested) && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-400">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              الأرقام المقترحة قيم نموذجية لكل نوع جهاز — عدّلها حسب ملصق جهازك الفعلي.
            </p>
          )}
        </div>
      </div>

      {/* التشغيل المتزامن/المتناوب */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-slate-800">كيف تعمل الأجهزة؟</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMode('simultaneous')} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${mode === 'simultaneous' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500'}`}>
            تعمل معاً (ذروة أعلى)
          </button>
          <button onClick={() => setMode('alternating')} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${mode === 'alternating' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500'}`}>
            بالتناوب (لا تعمل كلها)
          </button>
        </div>
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>قدرة الذروة المقدّرة: <b dir="ltr">{Math.round(peakLoadW)} W</b> — {mode === 'simultaneous' ? 'مجموع قدرات كل الأجهزة (احتمال تشغيلها معاً)' : 'أكبر جهاز واحد (تشغيل متناوب)'}.</span>
        </div>
      </div>

      {/* البطاريات والنظام */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-800">إعدادات النظام والبطاريات</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">نوع البطارية</span>
            <select value={batteryType} onChange={(e) => setBatteryType(e.target.value as BatteryType)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
              {Object.entries(BATTERY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">ساعات الاستقلالية</span>
            <input type="number" min={0} max={72} value={autonomyHours} onChange={(e) => setAutonomyHours(Math.max(0, Number(e.target.value)))} dir="ltr" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">نوع النظام</span>
            <select value={systemType} onChange={(e) => setSystemType(e.target.value as SystemType)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
              {Object.entries(SYSTEM_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-3 rounded-xl bg-teal-50 p-3 text-[11px] leading-relaxed text-teal-700">
          قدرة اللوح الشمسي تُختار تلقائياً بالقدرة الأنسب لحجم منظومتك، ويمكنك تغييرها بعد ظهور التقرير.
        </p>
      </div>
    </div>
  );
}
