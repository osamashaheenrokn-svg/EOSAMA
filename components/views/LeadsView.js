"use client";

import { UserPlus, Plus } from "lucide-react";

export function LeadsView({ leads, newLead, setNewLead, addLead, setLeadStatus, convertLeadToProject }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>عملاء محتملون</h1>
      </div>
      <div className="text-sm text-stone-500 mb-4">متابعة طلبات العملاء الجديدة قبل ما تتحول لمشروع فعلي.</div>

      <div className="flex flex-wrap gap-2 mb-5 bg-white border border-stone-200 rounded-lg p-3">
        <input value={newLead.name} onChange={(e) => setNewLead((f) => ({ ...f, name: e.target.value }))} placeholder="اسم العميل / وصف الطلب" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        <input value={newLead.phone} onChange={(e) => setNewLead((f) => ({ ...f, phone: e.target.value }))} placeholder="رقم الجوال" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
        <input value={newLead.notes} onChange={(e) => setNewLead((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        <button onClick={addLead} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      <div className="space-y-3">
        {leads.map((l) => (
          <div key={l.id} className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div>
                <div className="font-bold">{l.name}</div>
                <div className="text-xs text-stone-500">{l.phone}</div>
              </div>
              <select value={l.status} onChange={(e) => setLeadStatus(l.id, e.target.value)} className="text-xs border border-stone-300 rounded-full px-3 py-1.5">
                <option>تحت المتابعة</option>
                <option>تم الترسية</option>
                <option>ملغي</option>
              </select>
            </div>
            {l.notes && <div className="text-xs text-stone-600 mb-2">{l.notes}</div>}
            {l.status === "تم الترسية" && (
              <button onClick={() => convertLeadToProject(l)} className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold">
                تحويل لمشروع فعلي
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
