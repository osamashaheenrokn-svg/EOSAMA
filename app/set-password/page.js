"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) setReady(true);
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          if (retry.session) setReady(true);
          else setInvalid(true);
        }, 1500);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("كلمة المرور لازم تكون 6 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("تعذّر حفظ كلمة المرور. جرّب رابط الدعوة تاني أو تواصل مع المدير.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6" dir="rtl">
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="font-extrabold text-lg" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
            شركة قمة الحضارة للمقاولات
          </div>
          <div className="text-xs text-stone-500 mt-1">تعيين كلمة مرور الحساب</div>
        </div>

        {invalid ? (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
            رابط الدعوة غير صالح أو منتهي الصلاحية. اطلب من المدير إعادة إرسال الدعوة.
          </div>
        ) : !ready ? (
          <div className="text-sm text-stone-500 text-center">جاري التحقق من رابط الدعوة...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-stone-500">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500">تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
            {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" /> {loading ? "جاري الحفظ..." : "حفظ كلمة المرور والدخول"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
