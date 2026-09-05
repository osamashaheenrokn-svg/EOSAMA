"use client";

import { useState } from "react";
import { Plus, Trash2, Star, Pencil, Check, X } from "lucide-react";
import { AttachmentCell } from "./AttachmentCell";
import { sum } from "@/lib/db";

function ClaimRow({ c, canManage, onUpdateClaim, onDeleteClaim, onAttachClaim }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ number: c.number, date: c.date || "", amount: c.amount });

  function save() {
    if (!draft.number || !draft.amount) return;
    onUpdateClaim(c.id, { number: Number(draft.number), date: draft.date || null, amount: Number(draft.amount) });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-1.5"><input value={draft.number} onChange={(e) => setDraft((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} className="w-16 border border-stone-300 rounded px-1.5 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-1.5"><input type="date" value={draft.date} onChange={(e) => setDraft((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded px-1.5 py-1 text-xs" /></td>
        <td className="p-1.5"><input value={draft.amount} onChange={(e) => setDraft((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} className="w-20 border border-stone-300 rounded px-1.5 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-1.5"></td>
        <td className="p-1.5">
          <div className="flex items-center gap-1">
            <button onClick={save} title="حفظ" className="text-emerald-700 border border-emerald-200 rounded px-1 py-0.5"><Check className="w-3 h-3" /></button>
            <button onClick={() => setEditing(false)} title="إلغاء" className="text-stone-500 border border-stone-300 rounded px-1 py-0.5"><X className="w-3 h-3" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-stone-100">
      <td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.number}</td>
      <td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.date}</td>
      <td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td>
      <td className="p-1.5"><AttachmentCell path={c.attachment_path} canEdit={canManage} inputId={`claim-${c.id}`} onUpload={(file) => onAttachClaim(c.id, file)} /></td>
      {canManage && (
        <td className="p-1.5">
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 border border-stone-300 rounded px-1 py-0.5"><Pencil className="w-3 h-3" /></button>
            <button onClick={() => onDeleteClaim(c.id)} className="text-rose-600 border border-rose-200 rounded px-1 py-0.5"><Trash2 className="w-3 h-3" /></button>
          </div>
        </td>
      )}
    </tr>
  );
}

function PaymentRow({ c, canManage, onUpdatePayment, onDeletePayment, onAttachPayment }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ number: c.number, date: c.date || "", amount: c.amount });

  function save() {
    if (!draft.number || !draft.amount) return;
    onUpdatePayment(c.id, { number: Number(draft.number), date: draft.date || null, amount: Number(draft.amount) });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-1.5"><input value={draft.number} onChange={(e) => setDraft((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} className="w-16 border border-stone-300 rounded px-1.5 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-1.5"><input type="date" value={draft.date} onChange={(e) => setDraft((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded px-1.5 py-1 text-xs" /></td>
        <td className="p-1.5"><input value={draft.amount} onChange={(e) => setDraft((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} className="w-20 border border-stone-300 rounded px-1.5 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} /></td>
        <td className="p-1.5"></td>
        <td className="p-1.5">
          <div className="flex items-center gap-1">
            <button onClick={save} title="حفظ" className="text-emerald-700 border border-emerald-200 rounded px-1 py-0.5"><Check className="w-3 h-3" /></button>
            <button onClick={() => setEditing(false)} title="إلغاء" className="text-stone-500 border border-stone-300 rounded px-1 py-0.5"><X className="w-3 h-3" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-stone-100">
      <td className="p-1.5 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.number}</td>
      <td className="p-1.5 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.date}</td>
      <td className="p-1.5 font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td>
      <td className="p-1.5"><AttachmentCell path={c.attachment_path} canEdit={canManage} inputId={`payment-${c.id}`} onUpload={(file) => onAttachPayment(c.id, file)} /></td>
      {canManage && (
        <td className="p-1.5">
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 border border-stone-300 rounded px-1 py-0.5"><Pencil className="w-3 h-3" /></button>
            <button onClick={() => onDeletePayment(c.id)} className="text-rose-600 border border-rose-200 rounded px-1 py-0.5"><Trash2 className="w-3 h-3" /></button>
          </div>
        </td>
      )}
    </tr>
  );
}

export function SubcontractorCard({ sub, canEdit, canManage, onAddClaim, onAddPayment, onDeleteClaim, onDeletePayment, onDeleteSub, onAttachClaim, onAttachPayment, onUpdateClaim, onUpdatePayment, onRate }) {
  const [newClaim, setNewClaim] = useState({ number: "", amount: "", date: "" });
  const [newPayment, setNewPayment] = useState({ number: "", amount: "", date: "" });
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const claims = sub.subcontractor_claims || [];
  const payments = sub.subcontractor_payments || [];
  const claimsTotal = sum(claims, "amount");
  const paymentsTotal = sum(payments, "amount");
  const remaining = Math.max(0, claimsTotal - paymentsTotal);

  return (
    <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 mb-5">
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <div className="font-bold text-base" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{sub.name}</div>
          <div className="text-xs text-stone-500">{sub.scope}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => canEdit && onRate(n)}
                disabled={!canEdit}
                className={n <= (sub.rating || 0) ? "text-amber-500" : "text-stone-300"}
                title={`${n} نجوم`}
              >
                <Star className="w-4 h-4" fill="currentColor" />
              </button>
            ))}
            {sub.rating > 0 && <span className="text-xs text-stone-400 mr-1">({sub.rating}/5)</span>}
          </div>
        </div>
        {canManage && (
          confirmingDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={() => { onDeleteSub(); setConfirmingDelete(false); }} className="text-xs bg-rose-600 text-white rounded px-2 py-1 font-bold">تأكيد حذف المقاول</button>
              <button onClick={() => setConfirmingDelete(false)} className="text-xs text-stone-500 border border-stone-300 rounded px-2 py-1">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => setConfirmingDelete(true)} className="text-rose-600 hover:text-rose-800 border border-rose-200 rounded px-1.5 py-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="bg-stone-50 rounded-lg p-2">
          <div className="text-xs text-stone-500">إجمالي المستخلصات</div>
          <div className="font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{claimsTotal.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-stone-50 rounded-lg p-2">
          <div className="text-xs text-stone-500">إجمالي المدفوع</div>
          <div className="font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{paymentsTotal.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-stone-50 rounded-lg p-2">
          <div className="text-xs text-stone-500">المتبقي</div>
          <div className={`font-bold ${remaining > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{remaining > 0 ? remaining.toLocaleString() + " ر.س" : "مسدد بالكامل"}</div>
        </div>
      </div>

      <div className="text-xs font-bold mb-1.5">مستخلصات المقاول</div>
      {canEdit && (
        <div className="flex flex-wrap gap-2 mb-2">
          <input value={newClaim.number} onChange={(e) => setNewClaim((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم المستخلص" className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs w-24" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input type="date" value={newClaim.date} onChange={(e) => setNewClaim((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs" />
          <input value={newClaim.amount} onChange={(e) => setNewClaim((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="القيمة" className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <button
            onClick={() => { if (newClaim.number && newClaim.amount) { onAddClaim(newClaim); setNewClaim({ number: "", amount: "", date: "" }); } }}
            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> إضافة
          </button>
        </div>
      )}
      <div className="border border-stone-200 rounded-lg overflow-hidden mb-3">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500">
            <tr><th className="text-right p-1.5">رقم</th><th className="text-right p-1.5">التاريخ</th><th className="text-right p-1.5">القيمة</th><th className="text-right p-1.5">مرفق</th>{canManage && <th className="text-right p-1.5">إجراءات</th>}</tr>
          </thead>
          <tbody>
            {claims.length === 0 && (<tr><td colSpan={canManage ? 5 : 4} className="text-center text-stone-400 p-2">لا توجد مستخلصات بعد.</td></tr>)}
            {claims.map((c) => (
              <ClaimRow key={c.id} c={c} canManage={canManage} onUpdateClaim={onUpdateClaim} onDeleteClaim={onDeleteClaim} onAttachClaim={onAttachClaim} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs font-bold mb-1.5">الدفعات المصروفة للمقاول</div>
      {canEdit && (
        <div className="flex flex-wrap gap-2 mb-2">
          <input value={newPayment.number} onChange={(e) => setNewPayment((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم الدفعة" className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs w-24" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input type="date" value={newPayment.date} onChange={(e) => setNewPayment((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs" />
          <input value={newPayment.amount} onChange={(e) => setNewPayment((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="المبلغ" className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <button
            onClick={() => { if (newPayment.number && newPayment.amount) { onAddPayment(newPayment); setNewPayment({ number: "", amount: "", date: "" }); } }}
            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> إضافة
          </button>
        </div>
      )}
      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500">
            <tr><th className="text-right p-1.5">رقم</th><th className="text-right p-1.5">التاريخ</th><th className="text-right p-1.5">المبلغ</th><th className="text-right p-1.5">مرفق</th>{canManage && <th className="text-right p-1.5">إجراءات</th>}</tr>
          </thead>
          <tbody>
            {payments.length === 0 && (<tr><td colSpan={canManage ? 5 : 4} className="text-center text-stone-400 p-2">لا توجد دفعات بعد.</td></tr>)}
            {payments.map((c) => (
              <PaymentRow key={c.id} c={c} canManage={canManage} onUpdatePayment={onUpdatePayment} onDeletePayment={onDeletePayment} onAttachPayment={onAttachPayment} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
