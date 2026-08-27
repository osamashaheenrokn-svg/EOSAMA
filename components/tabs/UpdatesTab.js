"use client";

import { Plus } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function UpdatesTab({ active, isOwner, setProjectField, newUpdate, setNewUpdate, addUpdate, updates, progressColor, projGrandTotal, projRevenue, revenuesCount }) {
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
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e7e5e4" strokeWidth="10" />
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
          <div key={u.id} className="bg-white border border-stone-200 rounded-lg p-3">
            <div className="text-xs text-stone-400 mb-1" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{u.date}</div>
            <div className="text-sm">{u.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
