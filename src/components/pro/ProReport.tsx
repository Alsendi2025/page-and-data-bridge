import { useRef } from 'react';
import {
  Sun, BatteryCharging, Cpu, Zap, Cable, ShieldCheck, Compass,
  Download, MessageCircle, AlertTriangle, Info, FileText, Layout,
  Gauge, Package, TrendingUp, Layers,
} from 'lucide-react';
import type { ProResult } from '@/lib/proEngine';
import { formatPower, formatEnergy, formatNumber } from '@/lib/format';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import type { PanelLayoutResult } from './PanelLayoutCanvas';

function SectionCard({ icon, title, children, accent = 'teal' }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; accent?: string;
}) {
  const colors: Record<string, string> = {
    teal: 'border-teal-100 bg-teal-50/30',
    blue: 'border-blue-100 bg-blue-50/30',
    amber: 'border-amber-100 bg-amber-50/30',
    slate: 'border-slate-100 bg-slate-50/30',
  };
  return (
    <div className={`rounded-2xl border ${colors[accent]} p-5`}>
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value, unit, hint }: { label: string; value: string | number; unit?: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800" dir="ltr">
        {value}{unit && <span className="mr-1 text-xs text-slate-400"> {unit}</span>}
        {hint && <span className="mr-2 text-xs text-slate-400"> ({hint})</span>}
      </span>
    </div>
  );
}

export default function ProReport({
  result,
  layout,
  onBack,
}: {
  result: ProResult;
  layout: PanelLayoutResult | null;
  onBack: () => void;
}) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { pv, inverter, battery, cables, protection, orientation, site, loads, generator, curves, mounting, warnings, assumptions } = result;

  const bomItems: { category: string; desc: string; qty: string; note: string }[] = [
    { category: 'الألواح الشمسية', desc: `${pv.panel.wattage}W أحادي البلورة (${formatNumber(pv.panel.length * 100, 0)}×${formatNumber(pv.panel.width * 100, 0)} cm)`, qty: `${pv.numPanels} لوح`, note: `الإجمالي: ${formatPower(pv.arrayW)}` },
    { category: 'الانفرتر', desc: `${inverter.typeLabel}`, qty: `${inverter.units} وحدة`, note: `${formatPower(inverter.unitW)} لكل وحدة، ${inverter.phase === 3 ? 'ثلاثي الطور' : 'أحادي الطور'}` },
    { category: 'البطاريات', desc: battery.unitLabel, qty: `${battery.units} وحدة`, note: `${battery.series} توالي × ${battery.parallel} توازي، ${formatEnergy(battery.nominalWh)} إجمالي` },
  ];
  if (generator) bomItems.push({ category: 'مولد كهربائي', desc: `مولد احتياطي ${generator.kva} kVA`, qty: '1', note: generator.note });
  bomItems.push(
    { category: 'كابل الألواح DC', desc: `كابل شمسي ${cables.pv.size}mm² مزدوج العزل H1Z2Z2-K`, qty: `${cables.pv.totalLengthM} م`, note: `${cables.pv.runs > 1 ? `${cables.pv.runs} مسارات، ` : ''}هبوط الجهد: ${cables.pv.dropPct}%` },
    { category: 'كابل البطاريات', desc: battery.required && cables.battery ? `كابل نحاس مرن ${cables.battery.size}mm²` : '—', qty: battery.required && cables.battery ? `${cables.battery.totalLengthM} م` : '—', note: battery.required && cables.battery ? `هبوط الجهد: ${cables.battery.dropPct}%` : '' },
    { category: 'كابل AC خروج', desc: `كابل نحاس ${cables.acOut.size}mm² ${cables.acOut.cores}`, qty: `${cables.acOut.totalLengthM} م`, note: `هبوط الجهد: ${cables.acOut.dropPct}%` },
    { category: 'قاطع DC للألواح', desc: `${protection.dcBreaker.amps}A ${protection.dcBreaker.poles} — ${protection.dcBreaker.volts}V DC`, qty: `${protection.dcBreaker.qty}`, note: '' },
    { category: 'مانع صواعق DC', desc: `Type 2 — ${protection.dcSpd.ucpv}V DC`, qty: `${protection.dcSpd.qty}`, note: '' },
    { category: 'قاطع AC خروج', desc: `${protection.acOutBreaker.amps}A ${protection.acOutBreaker.poles}`, qty: `${protection.acOutBreaker.qty}`, note: '' },
    { category: 'قاطع تسريب أرضي RCD', desc: `${protection.rcd.amps}A ${protection.rcd.poles} — ${protection.rcd.type}`, qty: '1', note: '' },
    { category: 'مانع صواعق AC', desc: `Type 2 — ${protection.acSpd.poles} ${protection.acSpd.uc}V`, qty: '1', note: '' },
    { category: 'تأريض', desc: `${protection.earthing.rods} قضبان نحاسية + موصل ${protection.earthing.mainMm2}mm²`, qty: `${protection.earthing.rods}`, note: `مقاومة ≤ ${protection.earthing.targetOhm} أوم` },
  );
  if (protection.batteryBreaker) bomItems.push({ category: 'قاطع البطاريات', desc: `${protection.batteryBreaker.amps}A — ${protection.batteryBreaker.volts}`, qty: `${protection.batteryBreaker.qty}`, note: '' });
  if (protection.stringFuse) bomItems.push({ category: 'منصهرات السلاسل', desc: `${protection.stringFuse.amps}A — ${protection.stringFuse.volts}V DC`, qty: `${protection.stringFuse.qty}`, note: 'لكل قطب' });
  if (cables.acIn) bomItems.push({ category: 'كابل AC دخول', desc: `كابل نحاس ${cables.acIn.size}mm² ${cables.acIn.cores}`, qty: `${cables.acIn.totalLengthM} م`, note: `هبوط: ${cables.acIn.dropPct}%` });
  if (protection.acInBreaker) bomItems.push({ category: 'قاطع AC دخول', desc: `${protection.acInBreaker.amps}A ${protection.acInBreaker.poles}`, qty: `${protection.acInBreaker.qty}`, note: '' });

  const waText = encodeURIComponent(
    `مرحباً، أرغب في طلب عرض سعر لمنظومة شمسية بالمواصفات التالية:\n` +
    `• حجم المنظومة: ${formatPower(pv.arrayW)}\n` +
    `• الانفرتر: ${formatPower(inverter.totalW)} ${inverter.typeLabel}\n` +
    `• البطاريات: ${formatEnergy(battery.nominalWh)}\n` +
    `• عدد الألواح: ${pv.numPanels} لوح ${pv.panel.wattage}W\n` +
    `• الموقع: ${site.name}`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  const downloadReport = () => {
    if (!reportRef.current) return;
    const html = reportRef.current.innerHTML;
    const full = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير تصميم منظومة شمسية</title><style>body{font-family:Tajawal,Arial,sans-serif;max-width:900px;margin:20px auto;padding:20px;color:#1e293b}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #e2e8f0;padding:6px 10px;text-align:right;font-size:13px}h2{color:#0f766e;border-bottom:2px solid #14b8a6;padding-bottom:5px}h3{color:#334155}</style></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'تقرير-منظومة-شمسية.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={reportRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">التقرير الفني الهندسي</h2>
          <p className="mt-1 text-sm text-slate-500">{site.name} — {result.systemLabel}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            تعديل المدخلات
          </button>
          <button onClick={downloadReport} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            <Download className="h-4 w-4" /> تنزيل التقرير
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {w}
            </div>
          ))}
        </div>
      )}

      {/* 1. Data Card */}
      <SectionCard icon={<Gauge className="h-5 w-5 text-teal-600" />} title="بطاقة البيانات الأساسية">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <Sun className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-2 text-xl font-bold text-slate-800" dir="ltr">{formatPower(pv.arrayW)}</p>
            <p className="text-xs text-slate-500">حجم المنظومة</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <Cpu className="mx-auto h-6 w-6 text-teal-600" />
            <p className="mt-2 text-xl font-bold text-slate-800" dir="ltr">{formatPower(inverter.totalW)}</p>
            <p className="text-xs text-slate-500">حجم الانفرتر</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <BatteryCharging className="mx-auto h-6 w-6 text-cyan-600" />
            <p className="mt-2 text-xl font-bold text-slate-800" dir="ltr">{battery.required ? formatEnergy(battery.nominalWh) : '—'}</p>
            <p className="text-xs text-slate-500">سعة البطارية</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <Layers className="mx-auto h-6 w-6 text-slate-600" />
            <p className="mt-2 text-sm font-bold text-slate-800">{result.systemLabel}</p>
            <p className="text-xs text-slate-500">نوع النظام</p>
          </div>
        </div>
      </SectionCard>

      {/* 2. Panel Specs */}
      <SectionCard icon={<Sun className="h-5 w-5 text-amber-500" />} title="مواصفات الألواح الشمسية" accent="amber">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Row label="إجمالي القدرة المطلوبة" value={formatPower(pv.requiredW)} />
            <Row label="القدرة الاسمية لكل لوح" value={`${pv.panel.wattage}W`} hint={pv.panelAuto ? 'تلقائي' : 'يدوي'} />
            <Row label="الحد الأدنى لكفاءة اللوح" value={`${formatNumber(pv.minEfficiency * 100, 1)}%`} />
            <Row label="عدد الألواح" value={pv.numPanels} />
            <Row label="القدرة الفعلية للمصفوفة" value={formatPower(pv.arrayW)} hint={`${pv.kWp} kWp`} />
          </div>
          <div>
            <Row label="أبعاد اللوح" value={`${formatNumber(pv.panel.length, 2)}×${formatNumber(pv.panel.width, 2)} م`} />
            <Row label="نطاق الجهد (Vmp)" value={`${pv.stringVmp}V`} hint={`ساخن: ${pv.stringVmpHot}V`} />
            <Row label="جهد الدارة المفتوحة (Voc)" value={`${pv.stringVoc}V`} hint={`بارد: ${pv.stringVocCold}V`} />
            <Row label="التيار (Imp / Isc)" value={`${pv.stringImp}A / ${pv.stringIsc}A`} />
            <Row label="نسبة DC/AC" value={pv.dcAcRatio} />
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          <b>توصيل المصفوفة:</b> {pv.series} ألواح في التوالي × {pv.strings} سلسلة في التوازي.
          {' '}نطاق التوالي المسموح: {pv.minSeries}–{pv.maxSeries} لوح {pv.compatible ? '(متوافق مع الانفرتر)' : '(غير متوافق!)'}.
        </div>
      </SectionCard>

      {/* 3. Inverter Specs */}
      <SectionCard icon={<Cpu className="h-5 w-5 text-teal-600" />} title="مواصفات الانفرتر">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Row label="نوع الانفرتر" value={inverter.typeLabel} />
            <Row label="التردد" value={inverter.freq === 'LF' ? 'منخفض (LF)' : 'عالي (HF)'} hint={inverter.freqReason} />
            <Row label="القدرة الاسمية للوحدة" value={formatPower(inverter.unitW)} />
            <Row label="عدد الوحدات" value={inverter.units} />
            <Row label="القدرة الإجمالية" value={formatPower(inverter.totalW)} />
            <Row label="الطور" value={inverter.phase === 3 ? 'ثلاثي 400V' : 'أحادي 230V'} />
          </div>
          <div>
            <Row label="جهد البطارية" value={inverter.batteryV > 0 ? `${inverter.batteryV}V` : '—'} hint={inverter.hv ? 'عالي الجهد' : ''} />
            <Row label="مداخل MPPT" value={`${inverter.mpptUsed}/${inverter.mpptTotal}`} />
            <Row label="نطاق جهد MPPT" value={`${inverter.vMppMin}–${inverter.vMppMax}V`} />
            <Row label="أقصى جهد PV" value={`${inverter.vPvMax}V`} />
            <Row label="التحميل الزائد" value={`${inverter.surgeFactor}×`} hint={`${formatNumber(inverter.surgeCapacityVA / 1000, 1)} kVA`} />
            <Row label="الكفاءة" value={`${formatNumber(inverter.efficiency * 100, 1)}%`} />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="rounded-lg bg-teal-50 p-3 text-xs text-teal-800">
            <b>طريقة الربط:</b> {inverter.connection}
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <b className="block mb-1">متطلبات التزامن:</b>
            {inverter.sync.map((s, i) => <span key={i} className="block">• {s}</span>)}
          </div>
          {inverter.mpptMap.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
              <b className="block mb-1">توزيع السلاسل على مداخل MPPT:</b>
              <div className="flex flex-wrap gap-2">
                {inverter.mpptMap.map((m, i) => (
                  <span key={i} className="rounded-lg bg-white px-2.5 py-1 ring-1 ring-slate-200" dir="ltr">
                    INV{m.inverter}-MPPT{m.mppt}: {m.strings} strings
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* 4. Battery Specs */}
      {battery.required && (
        <SectionCard icon={<BatteryCharging className="h-5 w-5 text-cyan-600" />} title="مواصفات البطاريات" accent="blue">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Row label="القدرة التخزينية الصافية المطلوبة" value={formatEnergy(battery.requiredNominalWh)} />
              <Row label="القدرة الاسمية الإجمالية" value={formatEnergy(battery.nominalWh)} />
              <Row label="القدرة القابلة للاستخدام" value={formatEnergy(battery.usableWh)} />
              <Row label="الجهد الاسمي للبنك" value={`${battery.nominalVoltage}V`} />
              <Row label="السعة الإجمالية" value={`${battery.ah}Ah`} />
              <Row label="وحدة البطارية" value={battery.unitLabel} />
            </div>
            <div>
              <Row label="عدد الوحدات" value={battery.units} hint={`${battery.series} توالي × ${battery.parallel} توازي`} />
              <Row label="عمق التفريغ (DoD)" value={`${formatNumber(battery.dod * 100, 0)}%`} />
              <Row label="أقصى قدرة تفريغ" value={formatPower(battery.maxDischargeW)} hint={`${battery.maxDischargeA}A`} />
              <Row label="معدل التفريغ (C-rate)" value={`${battery.cRateDischarge}C`} />
              <Row label="أقصى قدرة شحن" value={formatPower(battery.maxChargeW)} hint={`${battery.maxChargeA}A`} />
              <Row label="معدل الشحن (C-rate)" value={`${battery.cRateCharge}C`} />
            </div>
          </div>
          {battery.bms.length > 0 && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              <b className="block mb-1">نظام إدارة البطارية (BMS):</b>
              {battery.bms.map((b, i) => <span key={i} className="block">• {b}</span>)}
            </div>
          )}
        </SectionCard>
      )}

      {/* 5. Array Configuration & Orientation */}
      <SectionCard icon={<Compass className="h-5 w-5 text-teal-600" />} title="تصميم الربط والتوجيه">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Row label="طريقة التوزيع والربط" value={`${pv.series} توالي × ${pv.strings} توازي`} />
            <Row label="التوجيه" value={orientation.label} hint={`سمت ${orientation.azimuth}°`} />
            <Row label="زاوية الميل المستخدمة" value={`${orientation.tilt.used}°`} />
            <Row label="الميل الأمثل (ثابت)" value={`${orientation.tilt.fixed}°`} />
            <Row label="موسمي: صيف / شتاء" value={`${orientation.tilt.summer}° / ${orientation.tilt.winter}°`} />
          </div>
          <div>
            <Row label="تقسيم المصفوفة على MPPT" value={`${inverter.mpptUsed} مداخل`} />
            <Row label="السلاسل لكل مدخل (أقصى)" value={pv.stringsPerMpptMax} />
            <Row label="الإنتاج اليومي المقدّر" value={formatEnergy(pv.dailyYieldWh)} />
            <Row label="معامل الأداء PR" value={`${formatNumber(site.pr * 100, 1)}%`} />
            <Row label="معامل التوجيه" value={`${formatNumber(site.orientFactor * 100, 0)}%`} />
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-teal-50 p-3 text-xs text-teal-800">{orientation.note}</div>

        {/* Panel Layout Visualization */}
        {layout && layout.placedPanels > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Layout className="h-4 w-4 text-teal-600" /> محاكاة توزيع الألواح على المساحة
            </h4>
            <div className="relative mx-auto" style={{ maxWidth: 500 }}>
              <svg viewBox={`0 0 ${layout.areaW} ${layout.areaH}`} className="w-full rounded-lg border border-slate-300 bg-slate-100" preserveAspectRatio="xMidYMid meet">
                {/* Obstacles */}
                {layout.obstacles.map((o) => (
                  <rect key={o.id} x={o.x} y={o.y} width={o.w} height={o.h} fill="#ef444499" stroke="#dc2626" strokeWidth={0.05} />
                ))}
                {/* Panels */}
                {layout.placements.map((p, i) => (
                  <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill="#0d9488" stroke="#14b8a6" strokeWidth={0.02} />
                ))}
              </svg>
              <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-slate-600">
                <span><span className="inline-block h-3 w-3 rounded bg-teal-600" /> ألواح ({layout.placedPanels})</span>
                <span><span className="inline-block h-3 w-3 rounded bg-red-500" /> عوائق ({layout.obstacles.length})</span>
                <span>تغطية: {layout.coveragePct}%</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-50 p-2"><b className="block text-base text-slate-800" dir="ltr">{layout.placedPanels}</b>لوح يمكن وضعه</div>
              <div className="rounded-lg bg-slate-50 p-2"><b className="block text-base text-slate-800" dir="ltr">{pv.numPanels}</b>لوح مطلوب للمنظومة</div>
              <div className={`rounded-lg p-2 ${layout.placedPanels >= pv.numPanels ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <b className={`block text-base ${layout.placedPanels >= pv.numPanels ? 'text-emerald-700' : 'text-red-700'}`}>
                  {layout.placedPanels >= pv.numPanels ? 'كافية' : 'غير كافية'}
                </b>
                {layout.placedPanels < pv.numPanels ? `نقص ${pv.numPanels - layout.placedPanels}` : `فائض ${layout.placedPanels - pv.numPanels}`}
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* 6. Cables & Protection */}
      <SectionCard icon={<Cable className="h-5 w-5 text-teal-600" />} title="الكابلات والقواطع والحماية">
        <div className="space-y-4">
          {/* Cables */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">الكابلات المطلوبة</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2 text-right font-semibold">الكابل</th>
                    <th className="py-2 text-right font-semibold">المقاس</th>
                    <th className="py-2 text-right font-semibold">الطول</th>
                    <th className="py-2 text-right font-semibold">التيار</th>
                    <th className="py-2 text-right font-semibold">هبوط الجهد</th>
                    <th className="py-2 text-right font-semibold">ملاحظة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="text-slate-700">
                    <td className="py-2 pr-2 font-medium">كابل الألواح DC</td>
                    <td className="font-semibold" dir="ltr">{cables.pv.size} mm²</td>
                    <td dir="ltr">{cables.pv.totalLengthM} م</td>
                    <td dir="ltr">{cables.pv.currentA}A</td>
                    <td dir="ltr">{cables.pv.dropPct}%</td>
                    <td className="text-slate-500">{cables.pv.runs > 1 ? `${cables.pv.runs} مسارات` : 'مسار واحد'}، مزدوج العزل</td>
                  </tr>
                  {cables.battery && (
                    <tr className="text-slate-700">
                      <td className="py-2 pr-2 font-medium">كابل البطاريات</td>
                      <td className="font-semibold" dir="ltr">{cables.battery.size} mm²</td>
                      <td dir="ltr">{cables.battery.totalLengthM} م</td>
                      <td dir="ltr">{cables.battery.currentA}A</td>
                      <td dir="ltr">{cables.battery.dropPct}%</td>
                      <td className="text-slate-500">نحاس مرن</td>
                    </tr>
                  )}
                  <tr className="text-slate-700">
                    <td className="py-2 pr-2 font-medium">كابل AC خروج</td>
                    <td className="font-semibold" dir="ltr">{cables.acOut.size} mm²</td>
                    <td dir="ltr">{cables.acOut.totalLengthM} م</td>
                    <td dir="ltr">{cables.acOut.currentA}A</td>
                    <td dir="ltr">{cables.acOut.dropPct}%</td>
                    <td className="text-slate-500">{cables.acOut.cores}</td>
                  </tr>
                  {cables.acIn && (
                    <tr className="text-slate-700">
                      <td className="py-2 pr-2 font-medium">كابل AC دخول</td>
                      <td className="font-semibold" dir="ltr">{cables.acIn.size} mm²</td>
                      <td dir="ltr">{cables.acIn.totalLengthM} م</td>
                      <td dir="ltr">{cables.acIn.currentA}A</td>
                      <td dir="ltr">{cables.acIn.dropPct}%</td>
                      <td className="text-slate-500">{cables.acIn.cores}</td>
                    </tr>
                  )}
                  <tr className="text-slate-700">
                    <td className="py-2 pr-2 font-medium">موصل التأريض (PE)</td>
                    <td className="font-semibold" dir="ltr">{cables.pe} mm²</td>
                    <td colSpan={4} className="text-slate-500">نحاس أصفر/أخضر</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Protection */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700"><ShieldCheck className="h-4 w-4 text-teal-600" /> القواطع والحماية</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <b>قاطع DC للألواح:</b> {protection.dcBreaker.amps}A {protection.dcBreaker.poles} — {protection.dcBreaker.volts}V ({protection.dcBreaker.qty} وحدة)
              </div>
              {protection.stringFuse && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <b>منصهرات السلاسل:</b> {protection.stringFuse.amps}A — {protection.stringFuse.volts}V ({protection.stringFuse.qty} منصهر)
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <b>مانع صواعق DC:</b> Type 2 — {protection.dcSpd.ucpv}V ({protection.dcSpd.qty})
              </div>
              {protection.batteryBreaker && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <b>قاطع البطاريات:</b> {protection.batteryBreaker.amps}A — {protection.batteryBreaker.volts} ({protection.batteryBreaker.qty})
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <b>قاطع AC خروج:</b> {protection.acOutBreaker.amps}A {protection.acOutBreaker.poles} ({protection.acOutBreaker.qty})
              </div>
              {protection.acInBreaker && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <b>قاطع AC دخول:</b> {protection.acInBreaker.amps}A {protection.acInBreaker.poles}
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <b>قاطع تسريب أرضي RCD:</b> {protection.rcd.type}
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <b>مانع صواعق AC:</b> Type 2 — {protection.acSpd.poles} {protection.acSpd.uc}V
              </div>
            </div>
          </div>

          {/* Earthing */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <b className="block mb-1">نظام التأريض:</b>
            <div className="grid gap-2 sm:grid-cols-2">
              <span>• قضبان تأريض: {protection.earthing.rods}</span>
              <span>• موصل رئيسي: {protection.earthing.mainMm2} mm²</span>
              <span>• موصل ربط متساوي الجهد: {protection.earthing.bondingMm2} mm²</span>
              <span>• المقاومة المستهدفة: ≤ {protection.earthing.targetOhm} أوم</span>
            </div>
            <div className="mt-2 space-y-0.5">
              {protection.earthing.notes.map((n, i) => <span key={i} className="block">• {n}</span>)}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Generator */}
      {generator && (
        <SectionCard icon={<Zap className="h-5 w-5 text-amber-500" />} title="المولد الاحتياطي" accent="amber">
          <Row label="القدرة الموصى بها" value={`${generator.kva} kVA`} />
          <p className="mt-2 text-xs text-slate-600">{generator.note}</p>
        </SectionCard>
      )}

      {/* Mounting Instructions */}
      <SectionCard icon={<Package className="h-5 w-5 text-teal-600" />} title="إرشادات التركيب والتركيب">
        <div className="space-y-2">
          {mounting.map((m, i) => (
            <div key={i} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
              • {m}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Energy Curves */}
      <SectionCard icon={<TrendingUp className="h-5 w-5 text-teal-600" />} title="محاكاة الإنتاج والاستهلاك (24 ساعة)">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400" /> الإنتاج الشمسي</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-teal-500" /> الاستهلاك</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-400" /> حالة شحن البطارية</span>
          </div>
          <div className="flex h-48 items-end gap-0.5 rounded-xl bg-slate-50 p-3" dir="ltr">
            {Array.from({ length: 24 }, (_, h) => {
              const gen = curves.generation[h] ?? 0;
              const con = curves.consumption[h] ?? 0;
              const max = Math.max(...curves.generation, ...curves.consumption, 1);
              return (
                <div key={h} className="flex flex-1 flex-col items-center justify-end gap-0.5" title={`${h}:00 — إنتاج: ${formatEnergy(gen)}، استهلاك: ${formatEnergy(con)}`}>
                  <div className="w-full rounded-t bg-amber-400" style={{ height: `${(gen / max) * 60}%`, minHeight: gen > 0 ? 2 : 0 }} />
                  <div className="w-full rounded-t bg-teal-500" style={{ height: `${(con / max) * 60}%`, minHeight: con > 0 ? 2 : 0 }} />
                  <span className="text-[8px] text-slate-400">{h}</span>
                </div>
              );
            })}
          </div>
          {battery.required && (
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              <b>حالة شحن البطارية (SOC):</b>
              <div className="mt-2 flex h-8 items-end gap-0.5" dir="ltr">
                {curves.soc.map((s, h) => (
                  <div key={h} className="flex-1 rounded-t bg-blue-400" style={{ height: `${s}%`, minHeight: s > 0 ? 2 : 0 }} title={`${h}:00 — ${s}%`} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <span>عجز يومي: <b dir="ltr">{formatEnergy(curves.unmetWh)}</b></span>
                <span>فائض يومي: <b dir="ltr">{formatEnergy(curves.surplusWh)}</b></span>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* BoM */}
      <SectionCard icon={<FileText className="h-5 w-5 text-teal-600" />} title="قائمة الكميات والمواصفات (BoM)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-2 text-right font-semibold">#</th>
                <th className="py-2 text-right font-semibold">البند</th>
                <th className="py-2 text-right font-semibold">المواصفات</th>
                <th className="py-2 text-right font-semibold">الكمية</th>
                <th className="py-2 text-right font-semibold">ملاحظة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bomItems.map((item, i) => (
                <tr key={i} className="text-slate-700">
                  <td className="py-2 pr-2 text-slate-400" dir="ltr">{i + 1}</td>
                  <td className="font-medium">{item.category}</td>
                  <td className="text-slate-600">{item.desc}</td>
                  <td className="font-semibold" dir="ltr">{item.qty}</td>
                  <td className="text-slate-500">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          القائمة بالمواصفات الفنية المطلوبة دون إلزام بعلامة تجارية معينة. توافق المكونات مع الانفرتر والبطاريات شرط أساسي.
        </p>
      </SectionCard>

      {/* Assumptions */}
      <SectionCard icon={<Info className="h-5 w-5 text-slate-400" />} title="الفرضيات والمعتمدات الهندسية" accent="slate">
        <div className="space-y-1.5">
          {assumptions.map((a, i) => (
            <p key={i} className="text-xs text-slate-600">• {a}</p>
          ))}
        </div>
      </SectionCard>

      {/* CTA */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-teal-600 to-cyan-600 p-6 text-center">
        <h3 className="text-lg font-bold text-white">جاهز لطلب عرض السعر؟</h3>
        <p className="mt-2 text-sm text-teal-50">أرسل مواصفات المنظومة مباشرة عبر واتساب للحصول على عرض سعر رسمي.</p>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50">
          <MessageCircle className="h-5 w-5" /> طلب عرض سعر عبر واتساب
        </a>
      </div>
    </div>
  );
}
