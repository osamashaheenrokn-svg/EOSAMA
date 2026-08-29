"use client";

import { Bell, AlertTriangle, X } from "lucide-react";

export function NotificationsBell({ notifications, show, setShow, onSelect }) {
  return (
    <div className="relative">
      <button onClick={() => setShow((s) => !s)} className="relative bg-slate-800 text-stone-200 rounded-full p-2.5" title="التنبيهات">
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {show && (
        <div className="absolute left-0 mt-2 w-80 bg-white border border-stone-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-stone-100 font-bold text-sm text-slate-900 flex items-center justify-between">
            التنبيهات
            <button onClick={() => setShow(false)} className="text-stone-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <div className="p-4 text-xs text-stone-400 text-center">لا توجد تنبيهات حاليًا — كل شيء تمام.</div>}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { onSelect(n); setShow(false); }}
                className={`w-full text-right p-3 border-b border-stone-50 text-xs flex items-start gap-2 hover:bg-stone-50 ${n.level === "danger" ? "text-rose-700" : "text-amber-700"}`}
              >
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {n.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
