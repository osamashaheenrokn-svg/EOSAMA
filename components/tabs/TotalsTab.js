"use client";

import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function TotalsTab({
  active, isOwner, projGrandTotal, projCustodySpent, projLaborCost, projStaffMonthly, projSubClaims,
  projRevenue, setProjectField, projProfit, projProfitPercent,
}) {
  return (
    <div className="print-area">
      <PrintHeader title={`تقرير إجمالي مصروفات وإيرادات مشروع: ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-3">إجمالي تلقائي مربوط بالعهدة المصروفة، تكاليف العمالة، رواتب الطاقم الفني، وإيرادات المشروع. تفاصيل المستخلصات نفسها في تبويب &quot;المستخلصات&quot;.</div>

      <div className="bg-slate-900 text-white rounded-xl p-5 mb-4">
        <div className="text-xs text-stone-300 mb-1">إجمالي مصروفات المشروع (الكلي)</div>
        <div className="text-3xl font-extrabold text-amber-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projGrandTotal.toLocaleString()} ر.س</div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي العهدة المصروفة</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodySpent.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي تكاليف العمالة</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborCost.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي رواتب الطاقم الفني <span className="text-stone-400 font-normal">(تفاصيل في تبويب &quot;الطاقم الفني&quot;)</span></div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projStaffMonthly.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي مقاولي الباطن والتوريدات</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubClaims.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="bg-emerald-700 text-white rounded-xl p-5 mb-6">
        <div className="text-xs text-emerald-100 mb-1">إجمالي إيرادات المشروع (مجموع المستخلصات) <span className="text-emerald-200">— تفاصيلها في تبويب &quot;المستخلصات&quot;</span></div>
        <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()} ر.س</div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="text-xs text-stone-600 mb-1">الأعمال المنتهية ومتوقع رفعها بمستخلص جاري</div>
        {isOwner ? (
          <div className="flex items-center gap-2">
            <input
              defaultValue={active.pending_billing}
              onBlur={(e) => setProjectField("pending_billing", Number(e.target.value.replace(/[^0-9]/g, "") || 0))}
              className="w-40 border border-amber-300 rounded-lg px-3 py-2 text-sm font-bold"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            />
            <span className="text-xs text-stone-500">ر.س</span>
          </div>
        ) : (
          <div className="text-xl font-bold text-amber-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(active.pending_billing).toLocaleString()} ر.س</div>
        )}
      </div>

      <div className={`rounded-2xl p-6 flex items-center justify-between flex-wrap gap-6 border-4 ${projProfit >= 0 ? "bg-emerald-100 border-emerald-500" : "bg-rose-100 border-rose-500"}`}>
        <div>
          <div className="text-sm font-bold text-stone-600 mb-1">صافي الربح أو الخسارة (الإيرادات − المصروفات)</div>
          <div className={`text-4xl font-extrabold ${projProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            {projProfit >= 0 ? "+" : ""}{projProfit.toLocaleString()} ر.س
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-stone-600 mb-1">نسبة الربح / الخسارة</div>
          <div className={`text-4xl font-extrabold ${projProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            {projProfit >= 0 ? "+" : ""}{projProfitPercent.toLocaleString(undefined, { maximumFractionDigits: 1 })}٪
          </div>
        </div>
      </div>
    </div>
  );
}
