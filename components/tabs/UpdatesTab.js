"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { RowActions } from "../RowActions";

function UpdateRow({ u, isOwner, updateRow, deleteRow }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ text: u.text, date: u.date });

  function save() {
    if (!draft.text.trim()) return;
    updateRow("updates", u.id, { text: draft.text.trim(), date: draft.date });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft((f) => ({ ...f, date: e.target.value }))}
          className="border border-stone-300 rounded px-2 py-1 text-xs mb-2"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        />
        <textarea
          value={draft.text}
          onChange={(e) => setDraft((f) => ({ ...f, text: e.target.value }))}
          rows={2}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-2"
        />
        <div className="flex items-center gap-1">
          <button onClick={save} title="حفظ" className="text-emerald-700 border border-emerald-200 rounded px-1.5 py-1"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setEditing(false); setDraft({ text: u.text, date: u.date }); }} title="إلغاء" className="text-stone-500 border border-stone-300 rounded px-1.5 py-1"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-stone-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{u.date}</div>
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0 no-print">
            <button onClick={() => setEditing(true)} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <RowActions canManage={isOwner} onDelete={() => deleteRow("updates", u.id)} />
          </div>
        )}
      </div>
      <div className="text-sm mt-1">{u.text}</div>
    </div>
  );
}

export function UpdatesTab({ active, isOwner, setProjectField, newUpdate, setNewUpdate, addUpdate, updates, updateRow, deleteRow, progressColor, projGrandTotal, projRevenue, revenuesCount }) {
  const pc = progressColor(active.progress);
  const r = 42, circumference = 2 * Math.PI * r;
  const dash = (active.progress / 100) * circumference;

  return (
    <div className="print-area">
      <PrintHeader title={`تقرير تطورات المشروع — ${active.name}`} />
      <PrintButton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">موقع المشروع</div>
          {isOwner ? (
            <input defaultValue={active.location} onBlur={(e) => setProjectField("location", e.target.value)} className="w-full border border-stone-300 rounded px-2 py-1.5 text-sm" />
          ) : (
            <div className="text-sm font-bold">{active.location}</div>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">مدة المشروع</div>
          {isOwner ? (
            <input defaultValue={active.duration} onBlur={(e) => setProjectField("duration", e.target.value)} className="w-full border border-stone-300 rounded px-2 py-1.5 text-sm" />
          ) : (
            <div className="text-sm font-bold">{active.duration}</div>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">قيمة عقد المشروع</div>
          {isOwner ? (
            <input defaultValue={active.contract_value} onBlur={(e) => setProjectField("contract_value", Number(e.target.value.replace(/[^0-9]/g, "") || 0))} className="w-full border border-stone-300 rounded px-2 py-1.5 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          ) : (
            <div className="text-sm font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(active.contract_value).toLocaleString()} ر.س</div>
          )}
        </div>
      </div>

      <div className={`rounded-xl border p-4 mb-5 flex items-center gap-6 flex-wrap ${pc.bg} ${pc.border}`}>
        <svg width="110" height="110" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#d9dce0" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={pc.stroke} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`} transform="rotate(-90 50 50)" />
          <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill={pc.stroke} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{active.progress}%</text>
        </svg>
        <div className="flex-1 min-w-[180px]">
          <div className="text-sm font-bold text-stone-700 mb-2">نسبة إنجاز المشروع</div>
          <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden mb-2">
            <div className="h-3 rounded-full transition-all" style={{ width: `${active.progress}%`, backgroundColor: pc.stroke }} />
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="100" value={active.progress} onChange={(e) => setProjectField("progress", Number(e.target.value))} className="flex-1" />
              <input type="number" min="0" max="100" value={active.progress} onChange={(e) => setProjectField("progress", Math.max(0, Math.min(100, Number(e.target.value) || 0)))} className="w-16 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
              <span className="text-xs text-stone-500">٪</span>
            </div>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-900 text-white rounded-xl p-4">
            <div className="text-xs text-stone-300 mb-1">إجمالي المصاريف حتى تاريخه</div>
            <div className="text-2xl font-extrabold text-amber-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projGrandTotal.toLocaleString()} ر.س</div>
            <div className="text-xs text-stone-400 mt-1">عهدة + عمالة + رواتب</div>
          </div>
          <div className="bg-emerald-700 text-white rounded-xl p-4">
            <div className="text-xs text-emerald-100 mb-1">إجمالي الإيرادات حتى تاريخه</div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()} ر.س</div>
            <div className="text-xs text-emerald-100 mt-1">{revenuesCount} مستخلص مرفوع</div>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="flex gap-2 mb-4">
          <input value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} placeholder="اكتب تحديث جديد عن سير العمل..." className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addUpdate} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
        </div>
      )}
      <div className="space-y-3">
        {updates.length === 0 && <div className="text-stone-400 text-sm">لا توجد تحديثات بعد.</div>}
        {updates.map((u) => (
          <UpdateRow key={u.id} u={u} isOwner={isOwner} updateRow={updateRow} deleteRow={deleteRow} />
        ))}
      </div>
    </div>
  );
}
