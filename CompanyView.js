"use client";

import { BarChart3, AlertTriangle } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function CompanyView({ companyFinancials }) {
  const companyExpenses = companyFinancials.reduce((a, f) => a + f.expenses, 0);
  const companyRevenue = companyFinancials.reduce((a, f) => a + f.revenue, 0);
  const companyProfit = companyRevenue - companyExpenses;
  const companyMax = Math.max(1, ...companyFinancials.map((f) => Math.max(f.expenses, f.revenue)));

  return (
    <div className="p-6 max-w-4xl mx-auto print-area">
      <PrintHeader title="تقرير نظرة عامة على المشروعات" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>نظرة عامة على المشروعات</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">إجمالي المصروفات والإيرادات والربح أو الخسارة لكل مشروع، ولكل الشركة مجتمعة.</div>

      <div className="space-y-3 mb-6">
        {companyFinancials.map((f) => {
          const isLoss = f.profit < 0;
          return (
            <div key={f.id} className={`bg-white border rounded-lg p-4 ${isLoss ? "border-rose-300" : "border-stone-200"}`}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
                  {f.name}
                  {isLoss && (
                    <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> المصروفات أعلى من الإيرادات
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-stone-500 mb-1">إجمالي المصروفات</div>
                  <div className="font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.expenses.toLocaleString()} ر.س</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500 mb-1">إجمالي الإيرادات</div>
                  <div className="font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.revenue.toLocaleString()} ر.س</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500 mb-1">الربح أو الخسارة</div>
                  <div className={`font-bold ${f.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                    {f.profit >= 0 ? "+" : ""}{f.profit.toLocaleString()} ر.س
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`rounded-2xl p-6 mb-6 border-4 ${companyProfit >= 0 ? "bg-emerald-100 border-emerald-500" : "bg-rose-100 border-rose-500"}`}>
        <div className="text-sm font-bold text-stone-600 mb-3">إجمالي كل المشروعات مجتمعة</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-stone-500 mb-1">إجمالي المصروفات</div>
            <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companyExpenses.toLocaleString()} ر.س</div>
          </div>
          <div>
            <div className="text-xs text-stone-500 mb-1">إجمالي الإيرادات</div>
            <div className="text-xl font-extrabold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companyRevenue.toLocaleString()} ر.س</div>
          </div>
          <div>
            <div className="text-xs text-stone-500 mb-1">الربح أو الخسارة الكلي</div>
            <div className={`text-xl font-extrabold ${companyProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {companyProfit >= 0 ? "+" : ""}{companyProfit.toLocaleString()} ر.س
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="text-sm font-bold mb-4">مقارنة المصروفات والإيرادات لكل مشروع</div>
        <div className="flex items-center gap-1 text-xs text-stone-500 mb-2">
          <span className="w-3 h-3 rounded-sm bg-slate-700 inline-block" /> مصروفات
          <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block mr-3" /> إيرادات
        </div>
        <div className="flex items-end gap-6 h-48 mt-4">
          {companyFinancials.map((f) => (
            <div key={f.id} className="flex flex-col items-center flex-1">
              <div className="flex items-end gap-1.5 h-40">
                <div className="w-6 bg-slate-700 rounded-t" style={{ height: `${(f.expenses / companyMax) * 100}%` }} title={`مصروفات: ${f.expenses.toLocaleString()}`} />
                <div className="w-6 bg-emerald-600 rounded-t" style={{ height: `${(f.revenue / companyMax) * 100}%` }} title={`إيرادات: ${f.revenue.toLocaleString()}`} />
              </div>
              <div className="text-xs text-stone-500 mt-2 text-center leading-tight">{f.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
