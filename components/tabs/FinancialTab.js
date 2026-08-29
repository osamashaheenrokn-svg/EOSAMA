"use client";

import { FileSpreadsheet } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { sum, staffStatus } from "@/lib/db";

export function FinancialTab({ active, detail, projGrandTotal, projRevenue, projProfit, projProfitPercent, projCustodyReceived, projCustodySpent, projLaborCost, projLaborPaid, projStaffMonthly, projStaffOverdue, projSubClaims, exportFinancialReportExcel }) {
  return (
    <div className="print-area">
      <PrintHeader title={`التقرير المالي الشامل — ${active.name}`} />
      <div className="flex flex-wrap gap-2 mb-4 no-print">
        <PrintButton label="تنزيل PDF" />
        <button onClick={exportFinancialReportExcel} className="bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 mb-4">
          <FileSpreadsheet className="w-3.5 h-3.5" /> تنزيل Excel
        </button>
      </div>

      <h2 className="text-xl font-extrabold mb-4" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{active.name}</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 text-white rounded-xl p-4">
          <div className="text-xs text-stone-300 mb-1">إجمالي المصروفات</div>
          <div className="text-2xl font-extrabold text-amber-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projGrandTotal.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-emerald-700 text-white rounded-xl p-4">
          <div className="text-xs text-emerald-100 mb-1">إجمالي الإيرادات</div>
          <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className={`rounded-lg p-3 mb-6 border ${projProfit >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
        <span className="text-xs text-stone-600">صافي الربح / الخسارة: </span>
        <span className={`font-bold ${projProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projProfit >= 0 ? "+" : ""}{projProfit.toLocaleString()} ر.س ({projProfitPercent.toLocaleString(undefined, { maximumFractionDigits: 1 })}٪)</span>
      </div>

      <h3 className="text-base font-bold mb-3 border-b-2 border-slate-900 pb-1">بيان مفصل للمصروفات</h3>

      <div className="text-sm font-bold mb-1">العهدة المستلمة ({detail.custodyReceived.length})</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1.5">رقم العهدة</th><th className="text-right p-1.5">التاريخ</th><th className="text-right p-1.5">المبلغ</th></tr></thead>
          <tbody>
            {[...detail.custodyReceived].sort((a, b) => a.number - b.number).map((c) => (
              <tr key={c.id} className="border-t border-stone-100"><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>عهدة {c.number}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.date}</td><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td></tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-1.5" colSpan={2}>الإجمالي</td><td className="p-1.5" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodyReceived.toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-1">المصروف من العهدة ({detail.custodySpent.length})</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1.5">رقم الملف</th><th className="text-right p-1.5">الأسبوع</th><th className="text-right p-1.5">من</th><th className="text-right p-1.5">إلى</th><th className="text-right p-1.5">المصروف</th></tr></thead>
          <tbody>
            {detail.custodySpent.map((c) => (
              <tr key={c.id} className="border-t border-stone-100"><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>ملف {c.file_number}</td><td className="p-1.5" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.week}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.from_date}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.to_date}</td><td className="p-1.5 font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td></tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-1.5" colSpan={4}>الإجمالي</td><td className="p-1.5 text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodySpent.toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-1">تكاليف العمالة ({detail.laborCosts.length})</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1.5">الأسبوع</th><th className="text-right p-1.5">من</th><th className="text-right p-1.5">إلى</th><th className="text-right p-1.5">عدد العمالة</th><th className="text-right p-1.5">التكلفة</th></tr></thead>
          <tbody>
            {detail.laborCosts.map((l) => (
              <tr key={l.id} className="border-t border-stone-100"><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.week}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.from_date}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.to_date}</td><td className="p-1.5" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.count}</td><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(l.cost).toLocaleString()}</td></tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-1.5" colSpan={4}>الإجمالي</td><td className="p-1.5" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborCost.toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-1">الدفعات المصروفة للعمالة ({detail.laborPayments.length})</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1.5">رقم الدفعة</th><th className="text-right p-1.5">التاريخ</th><th className="text-right p-1.5">المبلغ</th></tr></thead>
          <tbody>
            {detail.laborPayments.map((l) => (
              <tr key={l.id} className="border-t border-stone-100"><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>دفعة {l.payment_number}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.date}</td><td className="p-1.5 font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(l.amount).toLocaleString()}</td></tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-1.5" colSpan={2}>الإجمالي</td><td className="p-1.5 text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborPaid.toLocaleString()}</td></tr>
            <tr className="border-t border-stone-200"><td className="p-1.5 font-bold" colSpan={2}>المتبقي (مطلوب سداده)</td><td className={`p-1.5 font-bold ${projLaborCost - projLaborPaid > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Math.max(0, projLaborCost - projLaborPaid).toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-1">الطاقم الفني ({detail.staff.length})</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1.5">الاسم</th><th className="text-right p-1.5">الوظيفة</th><th className="text-right p-1.5">الراتب الشهري</th><th className="text-right p-1.5">بداية الدوام</th><th className="text-right p-1.5">حالة الشهر الحالي</th></tr></thead>
          <tbody>
            {detail.staff.map((s) => {
              const st = staffStatus(s);
              return (
                <tr key={s.id} className="border-t border-stone-100"><td className="p-1.5 font-bold">{s.name}</td><td className="p-1.5 text-stone-600">{s.role}</td><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(s.monthly_salary).toLocaleString()}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{s.start_date}</td><td className={`p-1.5 font-bold ${st.overdue ? "text-rose-700" : "text-stone-600"}`}>{st.label}</td></tr>
              );
            })}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-1.5" colSpan={2}>الإجمالي الشهري</td><td className="p-1.5" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projStaffMonthly.toLocaleString()}</td><td className="p-1.5" colSpan={2}></td></tr>
            {projStaffOverdue > 0 && (
              <tr className="border-t border-stone-200"><td className="p-1.5 font-bold text-rose-700" colSpan={2}>رواتب متأخرة</td><td className="p-1.5 font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projStaffOverdue.toLocaleString()}</td><td className="p-1.5" colSpan={2}></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-1">مقاولو الباطن والتوريدات ({detail.subcontractors.length})</div>
      {detail.subcontractors.length === 0 && <div className="text-xs text-stone-400 mb-4">لا يوجد مقاولون مسجّلون.</div>}
      {detail.subcontractors.map((s) => {
        const claimsTotal = sum(s.subcontractor_claims, "amount");
        const paidTotal = sum(s.subcontractor_payments, "amount");
        return (
          <div key={s.id} className="bg-white border border-stone-200 rounded-lg p-3 mb-3">
            <div className="font-bold text-sm mb-1">{s.name} <span className="text-xs text-stone-500 font-normal">— {s.scope}</span></div>
            <div className="text-xs text-stone-600 mb-2">إجمالي المستخلصات: <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{claimsTotal.toLocaleString()}</b> ر.س — إجمالي المدفوع: <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{paidTotal.toLocaleString()}</b> ر.س</div>
            <table className="w-full text-xs">
              <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1">البند</th><th className="text-right p-1">الرقم</th><th className="text-right p-1">التاريخ</th><th className="text-right p-1">القيمة</th></tr></thead>
              <tbody>
                {(s.subcontractor_claims || []).map((c) => (<tr key={"c" + c.id} className="border-t border-stone-100"><td className="p-1">مستخلص</td><td className="p-1" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.number}</td><td className="p-1 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.date}</td><td className="p-1 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td></tr>))}
                {(s.subcontractor_payments || []).map((p) => (<tr key={"p" + p.id} className="border-t border-stone-100"><td className="p-1">دفعة</td><td className="p-1" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{p.number}</td><td className="p-1 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{p.date}</td><td className="p-1 font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(p.amount).toLocaleString()}</td></tr>))}
              </tbody>
            </table>
          </div>
        );
      })}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-8 text-sm font-bold flex justify-between">
        <span>إجمالي مستخلصات كل المقاولين والموردين</span>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubClaims.toLocaleString()} ر.س</span>
      </div>

      <h3 className="text-base font-bold mb-3 border-b-2 border-emerald-700 pb-1">بيان مفصل للإيرادات</h3>
      <div className="text-sm font-bold mb-1">المستخلصات المرفوعة ({detail.revenues.length})</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500"><tr><th className="text-right p-1.5">رقم المستخلص</th><th className="text-right p-1.5">التاريخ</th><th className="text-right p-1.5">القيمة</th><th className="text-right p-1.5">ملاحظات</th></tr></thead>
          <tbody>
            {[...detail.revenues].sort((a, b) => a.number - b.number).map((r) => (
              <tr key={r.id} className="border-t border-stone-100"><td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>مستخلص {r.number}</td><td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{r.date}</td><td className="p-1.5 font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(r.amount).toLocaleString()}</td><td className="p-1.5 text-stone-600">{r.notes}</td></tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-1.5" colSpan={2}>الإجمالي</td><td className="p-1.5 text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()}</td><td className="p-1.5"></td></tr>
          </tbody>
        </table>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
        أعمال منتهية ومتوقع رفعها بمستخلص جاري (غير مفوترة بعد): <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(active.pending_billing).toLocaleString()}</b> ر.س
      </div>
    </div>
  );
}
