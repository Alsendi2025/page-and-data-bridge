import { useState, useMemo, useCallback } from 'react';
import {
  MapPin, Plus, Trash2, Info, Zap, Lightbulb, PackagePlus, Battery,
  Settings, Ruler, Compass, FileSpreadsheet, Building2, Layers,
} from 'lucide-react';
import {
  GOVERNORATES, FACILITY_TYPES, PRO_SYSTEM_TYPES, ROOF_TYPES,
  ORIENTATIONS, PRO_PANELS, PRO_PANEL_WATTAGES,
  type ProInput, type ProLoad, type FacilityType, type ProSystemType,
  type RoofType, type Orientation, type Operation, type LoadPeriod, type PhasePref,
} from '@/lib/proEngine';
import { PRO_APPLIANCE_CATALOG, CUSTOM_PRO_APPLIANCE, createProLoad, type ProApplianceTemplate } from './proApplianceCatalog';
import PanelLayoutCanvas, { type PanelLayoutResult } from './PanelLayoutCanvas';

const CUSTOM_KEY = '__custom__';
const PERIODS: { value: LoadPeriod; label: string }[] = [
  { value: 'day', label: 'نهاراً' },
  { value: 'night', label: 'ليلاً' },
  { value: '24h', label: 'مستمر (24 ساعة)' },
];

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="mt-0.5 block text-[10px] text-teal-600">مقترح: <span dir="ltr">{children}</span></span>;
}

export default function ProInputForm({
  onDesign,
}: {
  onDesign: (input: ProInput, layout: PanelLayoutResult | null) => void;
}) {
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]!.name);
  const [facility, setFacility] = useState<FacilityType>('factory');
  const [loads, setLoads] = useState<ProLoad[]>([]);
  const [picking, setPicking] = useState(false);
  const [operation, setOperation] = useState<Operation>('simultaneous');
  const [diversity, setDiversity] = useState(0.7);
  const [autonomyHours, setAutonomyHours] = useState(12);
  const [systemType, setSystemType] = useState<ProSystemType>('off-grid');
  const [phase, setPhase] = useState<PhasePref>('auto');
  const [roofType, setRoofType] = useState<RoofType>('concrete');
  const [orientation, setOrientation] = useState<Orientation>('south');
  const [roofPitch, setRoofPitch] = useState(15);
  const [areaW, setAreaW] = useState(20);
  const [areaH, setAreaH] = useState(10);
  const [distDc, setDistDc] = useState(10);
  const [distBattery, setDistBattery] = useState(2);
  const [distAc, setDistAc] = useState(15);
  const [panelWattage, setPanelWattage] = useState<number | null>(null);
  const [showArea, setShowArea] = useState(false);
  const [layout, setLayout] = useState<PanelLayoutResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const dailyEnergyWh = useMemo(
    () => loads.reduce((s, l) => s + l.qty * l.powerW * l.hours, 0),
    [loads],
  );
  const peakLoadW = useMemo(
    () => operation === 'simultaneous'
      ? loads.reduce((s, l) => s + l.qty * l.powerW, 0)
      : loads.reduce((m, l) => Math.max(m, l.qty * l.powerW), 0),
    [loads, operation],
  );

  const update = (id: string, patch: Partial<ProLoad>) =>
    setLoads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: string) => setLoads((prev) => prev.filter((l) => l.id !== id));

  const attach = (key: string) => {
    if (!key) return;
    const isCustom = key === CUSTOM_KEY;
    const t: ProApplianceTemplate | undefined = isCustom ? CUSTOM_PRO_APPLIANCE : PRO_APPLIANCE_CATALOG.flatMap((g) => g.items).find((i) => i.name === key);
    if (!t) return;
    setLoads((prev) => [...prev, createProLoad(isCustom ? { ...t, name: '' } : t)]);
    setPicking(false);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result || '');
        const lines = text.split('\n').filter((l) => l.trim());
        const newLoads: ProLoad[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,\t;]/).map((c) => c.trim());
          if (cols.length < 4) continue;
          const name = cols[0] || `جهاز ${i}`;
          const qty = Math.max(1, Number(cols[1]) || 1);
          const powerW = Math.max(1, Number(cols[2]) || 100);
          const hours = Math.min(24, Math.max(0, Number(cols[3]) || 4));
          const period = (cols[4] as LoadPeriod) || 'day';
          const pf = Math.min(1, Math.max(0.3, Number(cols[5]) || 0.8));
          const startFactor = Math.max(1, Number(cols[6]) || 1);
          newLoads.push({
            id: `imp-${Date.now()}-${i}`, name, qty, powerW, unit: 'W', pf, startFactor, hours,
            period: ['day', 'night', '24h'].includes(period) ? period : 'day',
          });
        }
        if (newLoads.length > 0) setLoads((prev) => [...prev, ...newLoads]);
      } catch {
        alert('تعذر قراءة الملف. تأكد من صيغة CSV: الاسم، العدد، القدرة(W)، الساعات، الفترة، PF، تيار البدء');
      }
    };
    reader.readAsText(file);
  };

  const onLayoutChange = useCallback((r: PanelLayoutResult | null) => setLayout(r), []);

  const handleDesign = () => {
    onDesign({
      governorate, facility, loads, operation, diversity,
      batteryType: 'lifepo4', autonomyHours, systemType, phase,
      roofType, orientation, roofPitch,
      distances: { dc: distDc, battery: distBattery, ac: distAc },
      panelWattage,
    }, layout);
  };

  const selectedPanel = PRO_PANELS[panelWattage ?? PRO_PANEL_WATTAGES[1]!]!;

  return (
    <div className="space-y-4">
      {/* ====== Section 1: Site & Facility ====== */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <MapPin className="h-4 w-4 text-teal-600" /> بيانات الموقع والمنشأة
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">المحافظة</span>
            <select value={governorate} onChange={(e) => setGovernorate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
              {GOVERNORATES.map((g) => <option key={g.name} value={g.name}>{g.name} — PSH {g.psh}</option>)}
            </select>
            <span className="mt-1 block text-[11px] text-slate-400">يحدد الإشعاع الشمسي ودرجات الحرارة التصميمية.</span>
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
              <Building2 className="h-4 w-4 text-teal-600" /> نوع الاستخدام
            </span>
            <select value={facility} onChange={(e) => setFacility(e.target.value as FacilityType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
              {Object.entries(FACILITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* ====== Section 2: Loads / Appliances ====== */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Zap className="h-4 w-4 text-teal-600" /> الأجهزة والمعدات
            {loads.length > 0 && <span className="text-xs font-medium text-slate-400">({loads.length})</span>}
          </h3>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700" dir="ltr">
              {(dailyEnergyWh / 1000).toFixed(2)} kWh/يوم
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700">
              <FileSpreadsheet className="h-3.5 w-3.5" /> استيراد Excel
              <input type="file" accept=".csv,.txt" onChange={handleExcelImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          {loads.length === 0 && !picking && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <PackagePlus className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-600">لم تُضف أي أجهزة بعد</p>
              <p className="mt-1 text-xs text-slate-400">اضغط «إرفاق جهاز» واختر أجهزتك ومعداتك واحداً تلو الآخر.</p>
            </div>
          )}

          {loads.map((l) => {
            const s = l.suggested;
            const displayPower = l.unit === 'kW' ? l.powerW / 1000 : l.powerW;
            return (
              <div key={l.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={l.name}
                    onChange={(e) => update(l.id, { name: e.target.value })}
                    placeholder="اسم الجهاز أو المعدة"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-400"
                  />
                  <span className="hidden shrink-0 text-[11px] text-slate-400 sm:inline" dir="ltr">
                    {((l.qty * l.powerW * l.hours) / 1000).toFixed(2)} kWh
                  </span>
                  <button onClick={() => remove(l.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">العدد</span>
                    <input type="number" min={1} value={l.qty} onChange={(e) => update(l.id, { qty: Math.max(1, Number(e.target.value)) })}
                      dir="ltr" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                    {s && <Hint>{s.qty}</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">القدرة</span>
                    <div className="flex">
                      <input type="number" min={0} step={l.unit === 'kW' ? 0.05 : 10} value={displayPower}
                        onChange={(e) => { const v = Math.max(0, Number(e.target.value)); update(l.id, { powerW: l.unit === 'kW' ? Math.round(v * 1000) : v }); }}
                        dir="ltr" className="w-full min-w-0 rounded-r-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                      <select value={l.unit} onChange={(e) => update(l.id, { unit: e.target.value as 'W' | 'kW' })}
                        className="rounded-l-lg border border-r-0 border-slate-200 bg-white px-1 text-xs outline-none">
                        <option value="W">W</option>
                        <option value="kW">kW</option>
                      </select>
                    </div>
                    {s && <Hint>{s.unit === 'kW' ? s.powerW / 1000 : s.powerW} {s.unit ?? 'W'}</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">ساعات/يوم</span>
                    <input type="number" min={0} max={24} step={0.5} value={l.hours}
                      onChange={(e) => update(l.id, { hours: Math.min(24, Math.max(0, Number(e.target.value))) })}
                      dir="ltr" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                    {s && <Hint>{s.hours}h</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">الفترة</span>
                    <select value={l.period} onChange={(e) => update(l.id, { period: e.target.value as LoadPeriod })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-center text-sm outline-none focus:border-teal-400">
                      {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">معامل القدرة</span>
                    <input type="number" min={0.3} max={1} step={0.05} value={l.pf}
                      onChange={(e) => update(l.id, { pf: Math.min(1, Math.max(0.3, Number(e.target.value))) })}
                      dir="ltr" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                    {s && <Hint>{s.pf}</Hint>}
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] text-slate-500">تيار البدء ×</span>
                    <input type="number" min={1} max={8} step={0.5} value={l.startFactor}
                      onChange={(e) => update(l.id, { startFactor: Math.min(8, Math.max(1, Number(e.target.value))) })}
                      dir="ltr" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none focus:border-teal-400" />
                    {s && <Hint>{s.startFactor}×</Hint>}
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          {picking ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3">
              <select autoFocus defaultValue="" onChange={(e) => attach(e.target.value)}
                className="w-full rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                <option value="" disabled>— اختر جهازاً أو معدة —</option>
                {PRO_APPLIANCE_CATALOG.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
                  </optgroup>
                ))}
                <optgroup label="غير موجود؟">
                  <option value={CUSTOM_KEY}>+ إضافة جهاز جديد يدوياً</option>
                </optgroup>
              </select>
              <button onClick={() => setPicking(false)} className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-700">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => setPicking(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" /> إرفاق جهاز
            </button>
          )}
          {loads.some((l) => l.suggested) && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-400">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              الأرقام المقترحة قيم نموذجية لكل نوع جهاز — عدّلها حسب ملصق جهازك الفعلي أو ورقة البيانات.
            </p>
          )}
        </div>
      </div>

      {/* ====== Section 3: Operation Mode ====== */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-slate-800">كيف تعمل الأجهزة؟</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setOperation('simultaneous')}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${operation === 'simultaneous' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500'}`}>
            تعمل معاً (ذروة أعلى)
          </button>
          <button onClick={() => setOperation('alternating')}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${operation === 'alternating' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500'}`}>
            بالتناوب (لا تعمل كلها)
          </button>
        </div>
        {operation === 'alternating' && (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-medium text-slate-600">معامل التزامن (نسبة الأجهزة العاملة في نفس الوقت)</span>
            <input type="range" min={0.2} max={1} step={0.05} value={diversity}
              onChange={(e) => setDiversity(Number(e.target.value))}
              className="w-full accent-teal-600" dir="ltr" />
            <span className="text-xs text-slate-500" dir="ltr">{Math.round(diversity * 100)}%</span>
          </label>
        )}
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>قدرة الذروة المقدّرة: <b dir="ltr">{Math.round(peakLoadW)} W</b></span>
        </div>
      </div>

      {/* ====== Section 4: System & Battery ====== */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Battery className="h-4 w-4 text-teal-600" /> النظام والبطاريات
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">نوع البطاريات</span>
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-800">
              ليثيوم LiFePO4 (تلقائي)
            </div>
            <span className="mt-1 block text-[11px] text-slate-400">أعلى كفاءة (95%)، أعمق تفريغ (90%)، أطول عمر (6000+ دورة).</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">ساعات الاستقلالية</span>
            <input type="number" min={0} max={72} value={autonomyHours}
              onChange={(e) => setAutonomyHours(Math.max(0, Number(e.target.value)))}
              dir="ltr" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
            <span className="mt-1 block text-[11px] text-slate-400">كم ساعة تعمل المنظومة ليلاً أو في غياب الشمس؟ (0 = بلا بطاريات)</span>
          </label>
        </div>
        <div className="mt-4 space-y-2">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">طبيعة النظام</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.entries(PRO_SYSTEM_TYPES) as [ProSystemType, typeof PRO_SYSTEM_TYPES[ProSystemType]][]).map(([key, val]) => (
              <button key={key} onClick={() => setSystemType(key)}
                className={`rounded-xl border p-3 text-right transition ${systemType === key ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <span className={`block text-sm font-bold ${systemType === key ? 'text-teal-700' : 'text-slate-700'}`}>{val.label}</span>
                <span className="mt-1 block text-[10px] text-slate-400" dir="ltr">{val.en}</span>
                <div className="mt-2 space-y-0.5">
                  {val.points.map((p) => <span key={p} className="block text-[10px] leading-snug text-slate-500">• {p}</span>)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====== Section 5: Installation Area & Panel Layout ====== */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Ruler className="h-4 w-4 text-teal-600" /> المساحة المتاحة ومحاكاة توزيع الألواح
          </h3>
          <button onClick={() => setShowArea((s) => !s)}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            {showArea ? 'إخفاء المحاكاة' : 'عرض المحاكاة المرئية'}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">عرض المساحة (م)</span>
            <input type="number" min={1} value={areaW} onChange={(e) => setAreaW(Math.max(1, Number(e.target.value)))}
              dir="ltr" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">طول المساحة (م)</span>
            <input type="number" min={1} value={areaH} onChange={(e) => setAreaH(Math.max(1, Number(e.target.value)))}
              dir="ltr" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600"><Layers className="h-3 w-3" /> نوع السطح</span>
            <select value={roofType} onChange={(e) => setRoofType(e.target.value as RoofType)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400">
              {Object.entries(ROOF_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600"><Compass className="h-3 w-3" /> التوجيه</span>
            <select value={orientation} onChange={(e) => setOrientation(e.target.value as Orientation)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400">
              {Object.entries(ORIENTATIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        {roofType === 'hangar' && (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-medium text-slate-600">ميل سقف الهنجر (درجات)</span>
            <input type="number" min={0} max={30} value={roofPitch} onChange={(e) => setRoofPitch(Number(e.target.value))}
              dir="ltr" className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400" />
          </label>
        )}

        {showArea && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <PanelLayoutCanvas
              areaW={areaW}
              areaH={areaH}
              panel={selectedPanel}
              onChange={onLayoutChange}
            />
            <p className="mt-2 text-[11px] text-slate-500">
              ارسم مستطيلات على المساحة لتحديد العوائق (أعمدة، فتحات، ظلال). سيتم توزيع الألواح تلقائياً مع تخطي العوائق.
            </p>
          </div>
        )}
      </div>

      {/* ====== Section 6: Distances (Advanced) ====== */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <button onClick={() => setShowAdvanced((s) => !s)}
          className="flex w-full items-center justify-between text-sm font-bold text-slate-800">
          <span className="flex items-center gap-2"><Settings className="h-4 w-4 text-teal-600" /> المسافات والإعدادات المتقدمة</span>
          <span className="text-xs font-normal text-slate-400">{showAdvanced ? 'إخفاء' : 'عرض'}</span>
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">مسافة الألواح → الانفرتر (م)</span>
                <input type="number" min={0} value={distDc} onChange={(e) => setDistDc(Math.max(0, Number(e.target.value)))}
                  dir="ltr" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">مسافة البطاريات → الانفرتر (م)</span>
                <input type="number" min={0} value={distBattery} onChange={(e) => setDistBattery(Math.max(0, Number(e.target.value)))}
                  dir="ltr" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">مسافة الانفرتر → لوحة التوزيع (م)</span>
                <input type="number" min={0} value={distAc} onChange={(e) => setDistAc(Math.max(0, Number(e.target.value)))}
                  dir="ltr" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">قدرة اللوح الشمسي (تلقائي = الأنسب)</span>
                <select value={panelWattage ?? ''} onChange={(e) => setPanelWattage(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400">
                  <option value="">تلقائي (موصى به)</option>
                  {PRO_PANEL_WATTAGES.map((w) => <option key={w} value={w}>{w}W</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">نوع الطور</span>
                <select value={phase} onChange={(e) => setPhase(e.target.value as PhasePref)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-400">
                  <option value="auto">تلقائي (حسب الحمل)</option>
                  <option value="single">أحادي الطور 230V</option>
                  <option value="three">ثلاثي الطور 400V</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ====== Design Button ====== */}
      <button
        onClick={handleDesign}
        disabled={loads.length === 0}
        className="w-full rounded-2xl bg-gradient-to-l from-teal-600 to-cyan-600 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/20 transition hover:from-teal-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        تصميم المنظومة وإخراج التقرير الفني
      </button>
      {loads.length === 0 && (
        <p className="text-center text-xs text-slate-400">أضف جهازاً واحداً على الأقل لبدء التصميم.</p>
      )}
    </div>
  );
}
