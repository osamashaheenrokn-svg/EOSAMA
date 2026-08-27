"use client";

import { Plus } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";

export function TotalsTab({
  active, isOwner, canAccessLimited, projGrandTotal, projCustodySpent, projLaborCost, projSalaries, projSubClaims,
  salaries, newSalary, setNewSalary, addSalary, projRevenue, revenues, newRevenue, setNewRevenue, addRevenue,
  setProjectField, projProfit, projProfitPercent, attachFile,
}) {
  return (
    <div className="print-area">
      <PrintHeader title={`تقرير إجمالي مصروفات وإيرادات مشروع: ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-3">إجمالي تلقائي مربوط بالعهدة المصروفة، تكاليف العمالة، الرواتب، وإيرادات المشروع.</div>

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
          <div className="text-xs text-stone-500 mb-1">إجمالي الرواتب</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSalaries.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي مقاولي الباطن والتوريدات</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubClaims.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="text-sm font-bold mb-2">رواتب المهندسين والإداريين المحمّلين على المشروع</div>
      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-4">
          <input value={newSalary.month} onChange={(e) => setNewSalary((f) => ({ ...f, month: e.target.value }))} placeholder="الشهر (مثال: أغسطس 2026)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
          <input value={newSalary.name} onChange={(e) => setNewSalary((f) => ({ ...f, name: e.target.value }))} placeholder="اسم الموظف" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
          <input value={newSalary.role} onChange={(e) => setNewSalary((f) => ({ ...f, role: e.target.value }))} placeholder="الوظيفة" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-56" />
          <input value={newSalary.amount} onChange={(e) => setNewSalary((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="الراتب الشهري" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newSalary.notes} onChange={(e) => setNewSalary((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm min-w-[140px]" />
          <button onClick={addSalary} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">الشهر</th><th className="text-right p-2">الاسم</th><th className="text-right p-2">الوظيفة</th><th className="text-right p-2">الراتب</th><th className="text-right p-2">ملاحظات</th></tr>
          </thead>
          <tbody>
            {salaries.length === 0 && (<tr><td colSpan={5} className="text-center text-stone-400 p-4">لا توجد رواتب مسجّلة بعد.</td></tr>)}
            {salaries.map((s) => (
              <tr key={s.id} className="border-t border-stone-100">
                <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{s.month}</td>
                <td className="p-2 font-bold">{s.name}</td>
                <td className="p-2 text-stone-600">{s.role}</td>
                <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(s.amount).toLocaleString()}</td>
                <td className="p-2 text-stone-600">{s.notes}</td>
              </tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2" colSpan={3}>الإجمالي</td>
              <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSalaries.toLocaleString()}</td>
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-emerald-700 text-white rounded-xl p-5 mb-4">
        <div className="text-xs text-emerald-100 mb-1">إجمالي إيرادات المشروع (مجموع المستخلصات)</div>
        <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()} ر.س</div>
      </div>

      {canAccessLimited && (
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={newRevenue.number} onChange={(e) => setNewRevenue((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم المستخلص" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newRevenue.amount} onChange={(e) => setNewRevenue((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="قيمة المستخلص" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newRevenue.notes} onChange={(e) => setNewRevenue((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm min-w-[160px]" />
          <button onClick={addRevenue} className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة مستخلص</button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">رقم المستخلص</th><th className="text-right p-2">قيمة المستخلص</th><th className="text-right p-2">التاريخ</th><th className="text-right p-2">ملاحظات</th><th className="text-right p-2">المرفق</th></tr>
          </thead>
          <tbody>
            {revenues.length === 0 && (<tr><td colSpan={5} className="text-center text-stone-400 p-4">لا توجد مستخلصات مسجّلة بعد.</td></tr>)}
            {[...revenues].sort((a, b) => a.number - b.number).map((r) => (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>مستخلص {r.number}</td>
                <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(r.amount).toLocaleString()}</td>
                <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{r.date}</td>
                <td className="p-2 text-stone-600">{r.notes}</td>
                <td className="p-2"><AttachmentCell path={r.attachment_path} canEdit={isOwner} inputId={`rev-${r.id}`} onUpload={(file) => attachFile("revenues", r.id, file)} /></td>
              </tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2">الإجمالي</td>
              <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()}</td>
              <td className="p-2" colSpan={3}></td>
            </tr>
          </tbody>
        </table>
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
