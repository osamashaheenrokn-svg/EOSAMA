"use client";

import { BarChart3 } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function CompareView({ projects, companyFinancials }) {
  return (
    <div className="p-6 max-w-4xl mx-auto print-area">
      <PrintHeader title="مقارنة المشروعات" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>مقارنة المشروعات</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">مقارنة أداء كل المشروعات جنب بعض على نفس المقاييس.</div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">المشروع</th><th className="text-right p-2">قيمة العقد</th><th className="text-right p-2">نسبة الإنجاز</th><th className="text-right p-2">إجمالي المصروفات</th><th className="text-right p-2">إجمالي الإيرادات</th><th className="text-right p-2">الربح/الخسارة</th><th className="text-right p-2">هامش الربح %</th></tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const f = companyFinancials.find((x) => x.id === p.id) || { expenses: 0, revenue: 0, profit: 0 };
              const margin = f.revenue ? ((f.profit / f.revenue) * 100).toFixed(1) : "0";
              return (
                <tr key={p.id} className="border-t border-stone-100">
                  <td className="p-2 font-bold">{p.name}</td>
                  <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(p.contract_value).toLocaleString()}</td>
                  <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{p.progress}٪</td>
                  <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.expenses.toLocaleString()}</td>
                  <td className="p-2 text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.revenue.toLocaleString()}</td>
                  <td className={`p-2 font-bold ${f.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.profit.toLocaleString()}</td>
                  <td className={`p-2 font-bold ${f.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{margin}٪</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
