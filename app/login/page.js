"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6" dir="rtl">
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <svg width="72" height="72" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="mb-3">
            <defs>
              <linearGradient id="peakGoldLogin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="200" rx="32" fill="#0f172a" />
            <g transform="translate(20,26)">
              <rect x="0" y="128" width="160" height="8" rx="4" fill="#f5f5f4" />
              <polygon points="8,128 28,86 48,128" fill="#f5f5f4" opacity="0.55" />
              <polygon points="48,128 78,54 108,128" fill="#f5f5f4" opacity="0.8" />
              <polygon points="108,128 138,20 168,128" fill="url(#peakGoldLogin)" />
              <circle cx="138" cy="20" r="6" fill="#0f172a" />
              <line x1="138" y1="20" x2="138" y2="4" stroke="#f5f5f4" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
          <div className="font-extrabold text-lg" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
            شركة قمة الحضارة للمقاولات
          </div>
          <div className="text-xs text-stone-500 mt-1">تسجيل الدخول إلى بوابة المشروعات</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-stone-500">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <Lock className="w-4 h-4" /> {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
        <div className="text-xs text-stone-400 mt-4 text-center">
          الحسابات تُنشأ عبر المدير من لوحة إدارة المستخدمين — لا يوجد تسجيل ذاتي.
        </div>
      </div>
    </div>
  );
}
