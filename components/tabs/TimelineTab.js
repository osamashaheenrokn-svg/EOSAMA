"use client";

import { Plus } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function TimelineTab({ active, isOwner, phases, newPhase, setNewPhase, addPhase, updatePhaseField, deletePhase }) {
  const today = new Date();
  return (
    <div className="print-area">
      <PrintHeader title={`الجدول الزمني — ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-4">مراحل المشروع مقابل الخطة الزمنية الفعلية — يساعد على اكتشاف التأخير مبكرًا.</div>

      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-4 no-print bg-stone-50 border border-stone-200 rounded-lg p-3">
          <input value={newPhase.name} onChange={(e) => setNewPhase((f) => ({ ...f, name: e.target.value }))} placeholder="اسم المرحلة (مثال: أعمال الدهانات)" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={newPhase.plannedStart} onChange={(e) => setNewPhase((f) => ({ ...f, plannedStart: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={newPhase.plannedEnd} onChange={(e) => setNewPhase((f) => ({ ...f, plannedEnd: e.target.value }))} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addPhase} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة مرحلة</button>
        </div>
      )}

      <div className="space-y-3">
        {phases.length === 0 && <div className="text-stone-400 text-sm">لا توجد مراحل مسجّلة بعد.</div>}
        {phases.map((ph) => {
          const plannedEndDate = ph.planned_end ? new Date(ph.planned_end) : null;
          let status = { label: "لم تبدأ", color: "bg-stone-100 text-stone-600" };
          if (ph.actual_end) status = { label: "مكتملة", color: "bg-emerald-100 text-emerald-800" };
          else if (ph.actual_start && plannedEndDate && today > plannedEndDate) status = { label: "متأخرة", color: "bg-rose-100 text-rose-800" };
          else if (ph.actual_start) status = { label: "جارية", color: "bg-amber-100 text-amber-800" };
          return (
            <div key={ph.id} className="bg-white border border-stone-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="font-bold text-sm">{ph.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-stone-500 mb-1">مخطط له: من {ph.planned_start || "—"} إلى {ph.planned_end || "—"}</div>
                  {isOwner ? (
                    <div className="text-stone-500">
                      فعلي: من <input type="date" value={ph.actual_start || ""} onChange={(e) => updatePhaseField(ph.id, "actual_start", e.target.value)} className="border border-stone-300 rounded px-1 py-0.5 text-xs no-print" />
                      {" "}إلى <input type="date" value={ph.actual_end || ""} onChange={(e) => updatePhaseField(ph.id, "actual_end", e.target.value)} className="border border-stone-300 rounded px-1 py-0.5 text-xs no-print" />
                      <span className="print-only-header" style={{ display: "inline" }}>{ph.actual_start || "—"} إلى {ph.actual_end || "—"}</span>
                    </div>
                  ) : (
                    <div className="text-stone-500">فعلي: من {ph.actual_start || "—"} إلى {ph.actual_end || "—"}</div>
                  )}
                </div>
                {isOwner && <button onClick={() => deletePhase(ph.id)} className="no-print text-rose-600 border border-rose-200 rounded px-2 py-1 h-fit text-xs">حذف المرحلة</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
