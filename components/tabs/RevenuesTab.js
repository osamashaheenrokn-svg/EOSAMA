"use client";

import { Plus } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";

export function RevenuesTab({ active, isOwner, canAccessLimited, projRevenue, revenues, newRevenue, setNewRevenue, addRevenue, attachFile }) {
  return (
    <div className="print-area">
      <PrintHeader title={`تقرير المستخلصات — ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-3">المستخلصات المرفوعة والمعتمدة من العميل لهذا المشروع.</div>

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

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
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
    </div>
  );
}
