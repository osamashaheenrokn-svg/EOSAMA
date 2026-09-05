"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";
import { RowActions } from "../RowActions";

function LaborCostRow({ l, canEditDelete, updateRow, deleteRow, attachFile }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ week: l.week || "", from: l.from_date || "", to: l.to_date || "", count: l.count || "", cost: l.cost, notes: l.notes || "" });

  function save() {
    if (!draft.cost) return;
    updateRow("labor_costs", l.id, {
      week: draft.week ? Number(draft.week) : null, from_date: draft.from || null, to_date: draft.to || null,
      count: draft.count ? Number(draft.count) : null, cost: Number(draft.cost), notes: draft.notes.trim(),
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-2"><input value={draft.week} onChange={(e) => setDraft((f) => ({ ...f, week: e.target.value.replace(/[^0-9]/g, "") }))} className="w-16 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-2"><input type="date" value={draft.from} onChange={(e) => setDraft((f) => ({ ...f, from: e.target.value }))} className="border border-stone-300 rounded px-2 py-1 text-sm" /></td>
        <td className="p-2"><input type="date" value={draft.to} onChange={(e) => setDraft((f) => ({ ...f, to: e.target.value }))} className="border border-stone-300 rounded px-2 py-1 text-sm" /></td>
        <td className="p-2"><input value={draft.count} onChange={(e) => setDraft((f) => ({ ...f, count: e.target.value.replace(/[^0-9]/g, "") }))} className="w-16 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-2"><input value={draft.cost} onChange={(e) => setDraft((f) => ({ ...f, cost: e.target.value.replace(/[^0-9]/g, "") }))} className="w-28 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-2"><input value={draft.notes} onChange={(e) => setDraft((f) => ({ ...f, notes: e.target.value }))} className="w-full border border-stone-300 rounded px-2 py-1 text-sm" /></td>
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
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.week}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.from_date}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.to_date}</td>
      <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.count}</td>
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(l.cost).toLocaleString()}</td>
      <td className="p-2 text-stone-600">{l.notes}</td>
      <td className="p-2"><AttachmentCell path={l.attachment_path} canEdit={canEditDelete} inputId={`lc-${l.id}`} onUpload={(file) => attachFile("labor_costs", l.id, file)} /></td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          {canEditDelete && (
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <RowActions canManage={canEditDelete} onDelete={() => deleteRow("labor_costs", l.id)} />
        </div>
      </td>
    </tr>
  );
}

function LaborPaymentRow({ l, canEditDelete, updateRow, deleteRow, attachFile }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ paymentNumber: l.payment_number, date: l.date || "", amount: l.amount });

  function save() {
    if (!draft.paymentNumber || !draft.amount) return;
    updateRow("labor_payments", l.id, { payment_number: Number(draft.paymentNumber), date: draft.date || null, amount: Number(draft.amount) });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-2"><input value={draft.paymentNumber} onChange={(e) => setDraft((f) => ({ ...f, paymentNumber: e.target.value.replace(/[^0-9]/g, "") }))} className="w-20 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-2"><input type="date" value={draft.date} onChange={(e) => setDraft((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded px-2 py-1 text-sm" /></td>
        <td className="p-2"><input value={draft.amount} onChange={(e) => setDraft((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} className="w-28 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
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
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>دفعة {l.payment_number}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{l.date}</td>
      <td className="p-2 font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(l.amount).toLocaleString()}</td>
      <td className="p-2"><AttachmentCell path={l.attachment_path} canEdit={canEditDelete} inputId={`lp-${l.id}`} onUpload={(file) => attachFile("labor_payments", l.id, file)} /></td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          {canEditDelete && (
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <RowActions canManage={canEditDelete} onDelete={() => deleteRow("labor_payments", l.id)} />
        </div>
      </td>
    </tr>
  );
}

export function LaborTab({
  isOwner, canEditDelete, projLaborCost, projLaborPaid, laborCosts, laborPayments,
  newLaborCost, setNewLaborCost, addLaborCost, newLaborPayment, setNewLaborPayment, addLaborPayment,
  deleteRow, attachFile, updateRow,
}) {
  return (
    <div className="print-area">
      <PrintHeader title="تقرير العمالة" />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-3">العمالة مقسّمة لخانتين: التكاليف لوحدها، والمسدد لوحده. التعديل والحذف ورفع المرفقات متاح للمدير، أو لمن يمنحه المدير الصلاحية صراحةً.</div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي التكاليف</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborCost.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي المسدد</div>
          <div className="text-lg font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborPaid.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">المتبقي (مطلوب سداده)</div>
          <div className={`text-lg font-bold ${projLaborCost - projLaborPaid > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Math.max(0, projLaborCost - projLaborPaid).toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="text-sm font-bold mb-2">التكاليف</div>
      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={newLaborCost.week} onChange={(e) => setNewLaborCost((f) => ({ ...f, week: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم الأسبوع" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input type="date" value={newLaborCost.from} onChange={(e) => setNewLaborCost((f) => ({ ...f, from: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={newLaborCost.to} onChange={(e) => setNewLaborCost((f) => ({ ...f, to: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newLaborCost.count} onChange={(e) => setNewLaborCost((f) => ({ ...f, count: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="عدد العمالة" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newLaborCost.cost} onChange={(e) => setNewLaborCost((f) => ({ ...f, cost: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="تكاليف العمالة" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-36" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newLaborCost.notes} onChange={(e) => setNewLaborCost((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm min-w-[160px]" />
          <button onClick={addLaborCost} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">الأسبوع</th><th className="text-right p-2">من</th><th className="text-right p-2">إلى</th><th className="text-right p-2">عدد العمالة</th><th className="text-right p-2">التكلفة</th><th className="text-right p-2">ملاحظات</th><th className="text-right p-2">المرفق</th><th className="text-right p-2">إجراءات</th></tr>
          </thead>
          <tbody>
            {laborCosts.length === 0 && (<tr><td colSpan={8} className="text-center text-stone-400 p-4">لا توجد تكاليف مسجّلة بعد.</td></tr>)}
            {laborCosts.map((l) => (
              <LaborCostRow key={l.id} l={l} canEditDelete={canEditDelete} updateRow={updateRow} deleteRow={deleteRow} attachFile={attachFile} />
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2" colSpan={4}>الإجمالي</td>
              <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborCost.toLocaleString()}</td>
              <td className="p-2" colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-2">المسدد</div>
      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={newLaborPayment.paymentNumber} onChange={(e) => setNewLaborPayment((f) => ({ ...f, paymentNumber: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم الدفعة" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input type="date" value={newLaborPayment.date} onChange={(e) => setNewLaborPayment((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newLaborPayment.amount} onChange={(e) => setNewLaborPayment((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="المبلغ المسدد" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <button onClick={addLaborPayment} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">رقم الدفعة</th><th className="text-right p-2">التاريخ</th><th className="text-right p-2">المبلغ</th><th className="text-right p-2">المرفق</th><th className="text-right p-2">إجراءات</th></tr>
          </thead>
          <tbody>
            {laborPayments.length === 0 && (<tr><td colSpan={5} className="text-center text-stone-400 p-4">لا يوجد مسدد بعد.</td></tr>)}
            {laborPayments.map((l) => (
              <LaborPaymentRow key={l.id} l={l} canEditDelete={canEditDelete} updateRow={updateRow} deleteRow={deleteRow} attachFile={attachFile} />
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2" colSpan={2}>الإجمالي</td>
              <td className="p-2 text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborPaid.toLocaleString()}</td>
              <td className="p-2" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
