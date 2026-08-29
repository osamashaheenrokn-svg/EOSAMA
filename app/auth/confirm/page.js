"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

function ConfirmInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenHash = params.get("token_hash");
  const type = params.get("type") || "invite";
  const next = params.get("next") || "/set-password";

  async function handleConfirm() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    setLoading(false);
    if (verifyError) {
      setError("رابط الدعوة غير صالح أو منتهي الصلاحية. اطلب من المدير إعادة إرسال الدعوة.");
      return;
    }
    router.push(next);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6" dir="rtl">
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="font-extrabold text-lg mb-1" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
          شركة قمة الحضارة للمقاولات
        </div>
        <div className="text-sm text-stone-500 mb-6">تأكيد الدعوة</div>

        {!tokenHash ? (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
            رابط الدعوة غير صالح. اطلب من المدير إعادة إرسال الدعوة.
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-600 mb-4">دوس الزر ده لتأكيد دعوتك وإنشاء كلمة مرور لحسابك.</p>
            {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-3">{error}</div>}
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> {loading ? "جاري التأكيد..." : "تأكيد الدعوة"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmInner />
    </Suspense>
  );
}
