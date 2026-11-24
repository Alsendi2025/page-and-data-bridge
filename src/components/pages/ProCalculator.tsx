import { useState, useCallback } from 'react';
import { Gauge, Info, ArrowRight, FileText, Calculator } from 'lucide-react';
import { Container } from '@/components/site-ui';
import ProInputForm from '@/components/pro/ProInputForm';
import ProReport from '@/components/pro/ProReport';
import type { PanelLayoutResult } from '@/components/pro/PanelLayoutCanvas';
import { designPro, type ProInput, type ProResult } from '@/lib/proEngine';

export default function ProCalculator() {
  const [result, setResult] = useState<ProResult | null>(null);
  const [layout, setLayout] = useState<PanelLayoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDesign = useCallback((input: ProInput, layoutData: PanelLayoutResult | null) => {
    try {
      const res = designPro(input);
      setResult(res);
      setLayout(layoutData);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في الحساب. تأكد من صحة المدخلات.');
    }
  }, []);

  const handleBack = useCallback(() => {
    setResult(null);
    setLayout(null);
  }, []);

  if (result) {
    return (
      <div className="py-8">
        <Container>
          <ProReport result={result} layout={layout} onBack={handleBack} />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold text-white">
              <Gauge className="h-4 w-4 text-teal-400" /> الحاسبة الاحترافية — وضع المهندس
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <Calculator className="h-3.5 w-3.5" /> تصميم متكامل من أ إلى ي
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">حاسبة المنظومات الاحترافية</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            حاسبة هندسية احترافية مخصصة للمهندسين والشركات — حسابات دقيقة تفصيلية للمنظومات الشمسية من التصميم حتى التركيب،
            مع محاكاة وتوزيع الألواح على المساحة المتاحة، تقرير فني شامل، وقائمة كميات ومواصفات (BoM) قابلة للتنزيل.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              هذه الحاسبة مخصصة للمهندسين والفنيين والشركات. القيم الافتراضية مضبوطة مبدئياً — عدّلها حسب ظروف مشروعك.
              الحسابات مبنية على معايير IEC / NEC العالمية.
            </span>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </header>

        <div className="mx-auto max-w-4xl">
          <ProInputForm onDesign={handleDesign} />
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Calculator, title: 'حسابات هندسية دقيقة', desc: 'مبنية على IEC 62548 / NEC 690 — تحليل أحمال، سلاسل، كابلات، وحمايات.' },
              { icon: FileText, title: 'تقرير فني شامل', desc: 'مواصفات ألواح، انفرتر، بطاريات، كابلات، قواطع، BoM، وإرشادات تركيب.' },
              { icon: ArrowRight, title: 'محاكاة توزيع الألواح', desc: 'ارسم مساحتك وعوائقها ووزع الألواح بصرياً مع تحديد الكفاية.' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
