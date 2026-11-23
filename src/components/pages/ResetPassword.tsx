import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Lock, Sun, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Container } from '@/components/site-ui';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setError('تعذّر حفظ كلمة المرور. اطلب رابطاً جديداً وحاول مرة أخرى.');
      return;
    }
    navigate({ to: '/admin', replace: true });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <Container className="max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
              <Sun className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-slate-900">اختيار كلمة مرور جديدة</h1>
            <p className="mt-1 text-sm text-slate-500">
              {ready ? 'تم تأكيد بريدك. اختر كلمة مرور جديدة لحسابك.' : 'افتح هذه الصفحة من الرابط المرسل إلى بريدك.'}
            </p>
          </div>

          {ready && (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {[
                { label: 'كلمة المرور الجديدة', value: password, set: setPassword },
                { label: 'تأكيد كلمة المرور', value: confirm, set: setConfirm },
              ].map((f) => (
                <label key={f.label} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</span>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      required
                      dir="ltr"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </label>
              ))}
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
              </button>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
