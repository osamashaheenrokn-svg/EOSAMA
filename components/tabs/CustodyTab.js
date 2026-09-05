"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";
import { RowActions } from "../RowActions";

function CustodyReceivedRow({ c, canEditDelete, updateRow, deleteRow, attachFile }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ number: c.number, date: c.date || "", amount: c.amount });

  function save() {
    if (!draft.number || !draft.amount) return;
    updateRow("custody_received", c.id, { number: Number(draft.number), date: draft.date || null, amount: Number(draft.amount) });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-2">
          <input value={draft.number} onChange={(e) => setDraft((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} className="w-20 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        </td>
        <td className="p-2">
          <input type="date" value={draft.date} onChange={(e) => setDraft((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded px-2 py-1 text-sm" />
        </td>
        <td className="p-2">
          <input value={draft.amount} onChange={(e) => setDraft((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} className="w-28 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
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
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>عهدة {c.number}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.date}</td>
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td>
      <td className="p-2"><AttachmentCell path={c.attachment_path} canEdit={canEditDelete} inputId={`cr-${c.id}`} onUpload={(file) => attachFile("custody_received", c.id, file)} /></td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          {canEditDelete && (
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <RowActions canManage={canEditDelete} onDelete={() => deleteRow("custody_received", c.id)} />
        </div>
      </td>
    </tr>
  );
}

function CustodySpentRow({ c, canEditDelete, updateRow, deleteRow, attachFile }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ fileNumber: c.file_number, week: c.week || "", from: c.from_date || "", to: c.to_date || "", amount: c.amount });

  function save() {
    if (!draft.fileNumber || !draft.amount) return;
    updateRow("custody_spent", c.id, {
      file_number: Number(draft.fileNumber), week: draft.week ? Number(draft.week) : null,
      from_date: draft.from || null, to_date: draft.to || null, amount: Number(draft.amount),
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-stone-100 bg-amber-50">
        <td className="p-2">
          <input value={draft.fileNumber} onChange={(e) => setDraft((f) => ({ ...f, fileNumber: e.target.value.replace(/[^0-9]/g, "") }))} className="w-20 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        </td>
        <td className="p-2">
          <input value={draft.week} onChange={(e) => setDraft((f) => ({ ...f, week: e.target.value.replace(/[^0-9]/g, "") }))} className="w-16 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        </td>
        <td className="p-2">
          <input type="date" value={draft.from} onChange={(e) => setDraft((f) => ({ ...f, from: e.target.value }))} className="border border-stone-300 rounded px-2 py-1 text-sm" />
        </td>
        <td className="p-2">
          <input type="date" value={draft.to} onChange={(e) => setDraft((f) => ({ ...f, to: e.target.value }))} className="border border-stone-300 rounded px-2 py-1 text-sm" />
        </td>
        <td className="p-2">
          <input value={draft.amount} onChange={(e) => setDraft((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} className="w-28 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
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
      <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>ملف {c.file_number}</td>
      <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.week}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.from_date}</td>
      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{c.to_date}</td>
      <td className="p-2 font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(c.amount).toLocaleString()}</td>
      <td className="p-2"><AttachmentCell path={c.attachment_path} canEdit={canEditDelete} inputId={`cs-${c.id}`} onUpload={(file) => attachFile("custody_spent", c.id, file)} /></td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          {canEditDelete && (
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <RowActions canManage={canEditDelete} onDelete={() => deleteRow("custody_spent", c.id)} />
        </div>
      </td>
    </tr>
  );
}

export function CustodyTab({
  active, canAccessLimited, canEditDelete, projCustodyReceived, projCustodySpent,
  custodyReceived, custodySpent, newCustodyReceived, setNewCustodyReceived, addCustodyReceived,
  newCustodySpent, setNewCustodySpent, addCustodySpent, deleteRow, attachFile, updateRow,
}) {
  return (
    <div className="print-area">
      <PrintHeader title={`تقرير العهدة — ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-3">العهدة مقسّمة لخانتين منفصلتين: المستلمة لوحدها، والمصروف لوحده. التعديل والحذف ورفع المرفقات متاح للمدير، أو لمن يمنحه المدير الصلاحية صراحةً.</div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي العهدة المستلمة</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodyReceived.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي المصروف</div>
          <div className="text-lg font-bold text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodySpent.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">الرصيد المتبقي</div>
          <div className={`text-lg font-bold ${projCustodyReceived - projCustodySpent >= 0 ? "text-emerald-700" : "text-rose-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{(projCustodyReceived - projCustodySpent).toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="text-sm font-bold mb-2">العهدة المستلمة</div>
      {canAccessLimited && (
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={newCustodyReceived.number} onChange={(e) => setNewCustodyReceived((f) => ({ ...f, number: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم العهدة" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input type="date" value={newCustodyReceived.date} onChange={(e) => setNewCustodyReceived((f) => ({ ...f, date: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newCustodyReceived.amount} onChange={(e) => setNewCustodyReceived((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="المبلغ المستلم" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <button onClick={addCustodyReceived} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">رقم العهدة</th><th className="text-right p-2">التاريخ</th><th className="text-right p-2">المبلغ</th><th className="text-right p-2">المرفق</th><th className="text-right p-2">إجراءات</th></tr>
          </thead>
          <tbody>
            {custodyReceived.length === 0 && (<tr><td colSpan={5} className="text-center text-stone-400 p-4">لا توجد عهدة مستلمة بعد.</td></tr>)}
            {[...custodyReceived].sort((a, b) => a.number - b.number).map((c) => (
              <CustodyReceivedRow key={c.id} c={c} canEditDelete={canEditDelete} updateRow={updateRow} deleteRow={deleteRow} attachFile={attachFile} />
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2" colSpan={2}>الإجمالي</td>
              <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodyReceived.toLocaleString()}</td>
              <td className="p-2" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm font-bold mb-2">المصروف</div>
      {canAccessLimited && (
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={newCustodySpent.fileNumber} onChange={(e) => setNewCustodySpent((f) => ({ ...f, fileNumber: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="رقم الملف" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-24" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newCustodySpent.week} onChange={(e) => setNewCustodySpent((f) => ({ ...f, week: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="الأسبوع رقم" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input type="date" value={newCustodySpent.from} onChange={(e) => setNewCustodySpent((f) => ({ ...f, from: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={newCustodySpent.to} onChange={(e) => setNewCustodySpent((f) => ({ ...f, to: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newCustodySpent.amount} onChange={(e) => setNewCustodySpent((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="المصروف" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <button onClick={addCustodySpent} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr><th className="text-right p-2">رقم الملف</th><th className="text-right p-2">الأسبوع</th><th className="text-right p-2">من</th><th className="text-right p-2">إلى</th><th className="text-right p-2">المصروف</th><th className="text-right p-2">المرفق</th><th className="text-right p-2">إجراءات</th></tr>
          </thead>
          <tbody>
            {custodySpent.length === 0 && (<tr><td colSpan={7} className="text-center text-stone-400 p-4">لا يوجد مصروف مسجّل بعد.</td></tr>)}
            {custodySpent.map((c) => (
              <CustodySpentRow key={c.id} c={c} canEditDelete={canEditDelete} updateRow={updateRow} deleteRow={deleteRow} attachFile={attachFile} />
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td className="p-2" colSpan={4}>الإجمالي</td>
              <td className="p-2 text-rose-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodySpent.toLocaleString()}</td>
              <td className="p-2" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
