"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";
import { RowActions } from "../RowActions";

function RevenueRow({ r, canEditDelete, updateRevenue, deleteRevenue, attachFile }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ number: r.number, amount: r.amount, notes: r.notes || "" });

  function save() {
    if (!draft.number || !draft.amount) return;
    updateRevenue(r.id, { number: Number(draft.number), amount: Number(draft.amount), notes: draft.notes.trim() });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-2">
          <input value={draft.number} onChange={(e) => setDraft((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} className="w-20 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        </td>
        <td className="p-2">
          <input value={draft.amount} onChange={(e) => setDraft((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} className="w-28 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        </td>
        <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{r.date}</td>
        <td className="p-2">
          <input value={draft.notes} onChange={(e) => setDraft((f) => ({ ...f, notes: e.target.value }))} className="w-full border border-stone-300 rounded px-2 py-1 text-sm" />
        </td>
        <td className="p-2"></td>
        <td className="p-2">
          <div className="flex items-center gap-1">
            <button onClick={save} title="حفظ" className="text-emerald-700 border border-emerald-200 rounded px-1.5 py-1"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditing(false)} title="إلغاء" className="text-stone-500 border border-stone-300 rounded px-1.5 py-1"><X className="w-3.5 h-3.5" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-stone-100">
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>مستخلص {r.number}</td>
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(r.amount).toLocaleString()}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{r.date}</td>
      <td className="p-2 text-stone-600">{r.notes}</td>
      <td className="p-2"><AttachmentCell path={r.attachment_path} canEdit={canEditDelete} inputId={`rev-${r.id}`} onUpload={(file) => attachFile("revenues", r.id, file)} /></td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          {canEditDelete && (
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <RowActions canManage={canEditDelete} onDelete={() => deleteRevenue(r.id)} />
        </div>
      </td>
    </tr>
  );
}

export function RevenuesTab({ active, canAccessLimited, canEditDelete, projRevenue, revenues, newRevenue, setNewRevenue, addRevenue, updateRevenue, deleteRevenue, attachFile }) {
  return (
    <div className="print-area">
      <PrintHeader title={`تقرير المستخلصات — ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-3">المستخلصات المرفوعة والمعتمدة من العميل لهذا المشروع. التعديل والحذف ورفع المرفقات متاح للمدير، أو لمن يمنحه المدير الصلاحية صراحةً.</div>

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
            <tr><th className="text-right p-2">رقم المستخلص</th><th className="text-right p-2">قيمة المستخلص</th><th className="text-right p-2">التاريخ</th><th className="text-right p-2">ملاحظات</th><th className="text-right p-2">المرفق</th><th className="text-right p-2">إجراءات</th></tr>
          </thead>
          <tbody>
            {revenues.length === 0 && (<tr><td colSpan={6} className="text-center text-stone-400 p-4">لا توجد مستخلصات مسجّلة بعد.</td></tr>)}
            {[...revenues].sort((a, b) => a.number - b.number).map((r) => (
              <RevenueRow key={r.id} r={r} canEditDelete={canEditDelete} updateRevenue={updateRevenue} deleteRevenue={deleteRevenue} attachFile={attachFile} />
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2">الإجمالي</td>
              <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()}</td>
              <td className="p-2" colSpan={4}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
