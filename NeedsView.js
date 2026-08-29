"use client";

import { AlertTriangle } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function NeedsView({ companyFinancials }) {
  const companyCustodyNeeded = companyFinancials.reduce((a, n) => a + n.custodyNeeded, 0);
  const companyLaborNeeded = companyFinancials.reduce((a, n) => a + n.laborNeeded, 0);
  const companySubcontractorsNeeded = companyFinancials.reduce((a, n) => a + n.subcontractorsNeeded, 0);
  const companyStaffNeeded = companyFinancials.reduce((a, n) => a + n.staffNeeded, 0);
  const companyTotalNeeded = companyCustodyNeeded + companyLaborNeeded + companySubcontractorsNeeded + companyStaffNeeded;

  return (
    <div className="p-6 max-w-3xl mx-auto print-area">
      <PrintHeader title="تقرير المطلوب لكل موقع" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>المطلوب لكل موقع</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">المبالغ المطلوب توفيرها لكل موقع لتغطية عجز العهدة ومتبقي مستحقات العمالة.</div>

      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-4 text-center">
        <div className="text-xs text-stone-300 mb-1">إجمالي المبلغ المطلوب (كل المواقع)</div>
        <div className="text-4xl font-extrabold text-amber-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companyTotalNeeded.toLocaleString()} ر.س</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">إجمالي المطلوب للعهدة (تغطية العجز)</div>
          <div className="text-xl font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companyCustodyNeeded.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">إجمالي المطلوب لتكاليف العمالة</div>
          <div className="text-xl font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companyLaborNeeded.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">إجمالي المطلوب لمقاولي الباطن والتوريدات</div>
          <div className="text-xl font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companySubcontractorsNeeded.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">إجمالي رواتب الطاقم الفني المتأخرة</div>
          <div className="text-xl font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{companyStaffNeeded.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="text-sm font-bold mb-3">تفاصيل كل موقع</div>
      <div className="space-y-3">
        {companyFinancials.map((n) => (
          <div key={n.id} className={`bg-white border rounded-lg p-4 ${n.totalNeeded > 0 ? "border-rose-300" : "border-stone-200"}`}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="font-bold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{n.name}</div>
              {n.totalNeeded > 0 ? (
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> يحتاج تغطية
                </span>
              ) : (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">لا يوجد مطلوب</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <div className="text-xs text-stone-500 mb-1">مطلوب للعهدة</div>
                <div className={`font-bold ${n.custodyNeeded > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{n.custodyNeeded > 0 ? n.custodyNeeded.toLocaleString() + " ر.س" : "لا يوجد"}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">مطلوب للعمالة</div>
                <div className={`font-bold ${n.laborNeeded > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{n.laborNeeded > 0 ? n.laborNeeded.toLocaleString() + " ر.س" : "لا يوجد"}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">مطلوب لمقاولي الباطن والتوريدات</div>
                <div className={`font-bold ${n.subcontractorsNeeded > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{n.subcontractorsNeeded > 0 ? n.subcontractorsNeeded.toLocaleString() + " ر.س" : "لا يوجد"}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">رواتب طاقم متأخرة</div>
                <div className={`font-bold ${n.staffNeeded > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{n.staffNeeded > 0 ? n.staffNeeded.toLocaleString() + " ر.س" : "لا يوجد"}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">إجمالي مطلوب الموقع</div>
                <div className={`font-bold ${n.totalNeeded > 0 ? "text-rose-700" : "text-emerald-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{n.totalNeeded.toLocaleString()} ر.س</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
