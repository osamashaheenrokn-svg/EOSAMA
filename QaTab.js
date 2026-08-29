"use client";

import { Plus, Trash2 } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function QaTab({ active, isOwner, qaChecklist, newQaItem, setNewQaItem, addQaItem, toggleQaItem, deleteQaItem }) {
  const done = qaChecklist.filter((q) => q.checked).length;
  const pct = qaChecklist.length ? Math.round((done / qaChecklist.length) * 100) : 0;
  const grouped = qaChecklist.reduce((acc, q) => { (acc[q.phase] = acc[q.phase] || []).push(q); return acc; }, {});

  return (
    <div className="print-area">
      <PrintHeader title={`سجل تدقيق الجودة — ${active.name}`} />
      <PrintButton />
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold">نسبة اكتمال بنود الجودة</span>
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{pct}٪ ({done}/{qaChecklist.length})</span>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden"><div className="h-2 bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} /></div>
      </div>

      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-4 no-print">
          <input value={newQaItem.phase} onChange={(e) => setNewQaItem((f) => ({ ...f, phase: e.target.value }))} placeholder="المرحلة (مثال: التأسيسات)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-48" />
          <input value={newQaItem.item} onChange={(e) => setNewQaItem((f) => ({ ...f, item: e.target.value }))} placeholder="بند التدقيق" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addQaItem} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة بند</button>
        </div>
      )}

      {Object.keys(grouped).length === 0 && <div className="text-stone-400 text-sm">لا توجد بنود تدقيق بعد.</div>}
      {Object.entries(grouped).map(([phase, items]) => (
        <div key={phase} className="mb-4">
          <div className="text-sm font-bold mb-2">{phase}</div>
          <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
            {items.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                  <input type="checkbox" checked={q.checked} onChange={() => isOwner && toggleQaItem(q.id, !q.checked)} disabled={!isOwner} />
                  <span className={q.checked ? "line-through text-stone-400" : ""}>{q.item}</span>
                </label>
                {isOwner && <button onClick={() => deleteQaItem(q.id)} className="no-print text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
