"use client";

import { Send } from "lucide-react";

export function PeriodicView({ settings, setSettings, companyFinancials, projects }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>التقارير الدورية التلقائية</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">إعداد إرسال تقرير مختصر تلقائي لكل مشروع بشكل دوري عبر واتساب أو الإيميل.</div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-stone-700 mb-5">
        <b>ملحوظة مهمة:</b> الإرسال التلقائي الفعلي (سواء واتساب أو إيميل) محتاج خدمة سيرفر شغالة في الخلفية تبعت التقارير في مواعيدها — ده مش مفعّل بعد. اللي تحته هو إعداد التفضيلات + معاينة شكل التقرير اللي هيتبعت.
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
        <div className="text-sm font-bold mb-3">إعدادات الإرسال</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <label className="text-xs text-stone-500">
            التكرار
            <select value={settings.periodic_report_frequency} onChange={(e) => setSettings("periodic_report_frequency", e.target.value)} className="mt-1 w-full border border-stone-300 rounded-lg px-2 py-2 text-sm">
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </label>
          <label className="text-xs text-stone-500">
            طريقة الإرسال
            <select value={settings.periodic_report_method} onChange={(e) => setSettings("periodic_report_method", e.target.value)} className="mt-1 w-full border border-stone-300 rounded-lg px-2 py-2 text-sm">
              <option value="whatsapp">واتساب</option>
              <option value="email">إيميل</option>
            </select>
          </label>
          <label className="text-xs text-stone-500">
            {settings.periodic_report_method === "whatsapp" ? "رقم الواتساب" : "الإيميل"}
            <input defaultValue={settings.periodic_report_recipient} onBlur={(e) => setSettings("periodic_report_recipient", e.target.value)} placeholder={settings.periodic_report_method === "whatsapp" ? "05xxxxxxxx" : "you@example.com"} className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>
      </div>

      <div className="text-sm font-bold mb-3">معاينة التقرير اللي هيتبعت ({settings.periodic_report_frequency === "weekly" ? "أسبوعيًا" : "شهريًا"})</div>
      <div className="space-y-3">
        {projects.map((p) => {
          const f = companyFinancials.find((x) => x.id === p.id) || { expenses: 0, revenue: 0, profit: 0 };
          return (
            <div key={p.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="font-bold mb-2">{p.name}</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>المصروفات: <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.expenses.toLocaleString()} ر.س</b></div>
                <div>الإيرادات: <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.revenue.toLocaleString()} ر.س</b></div>
                <div>الربح/الخسارة: <b className={f.profit >= 0 ? "text-emerald-700" : "text-rose-700"} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.profit.toLocaleString()} ر.س</b></div>
              </div>
              <div className="text-xs text-stone-500 mt-1">نسبة الإنجاز: {p.progress}٪ — الحالة: {p.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
