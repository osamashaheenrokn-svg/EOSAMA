"use client";

export function MoreMenu({ items, show, setShow, view, setView }) {
  const totalBadge = items.reduce((a, m) => a + (m.badge || 0), 0);
  return (
    <div className="relative">
      <button
        onClick={() => setShow((s) => !s)}
        className={`relative text-sm px-3 py-2 rounded flex items-center gap-1.5 ${items.some((m) => m.id === view) ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}
      >
        المزيد
        {totalBadge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{totalBadge}</span>
        )}
      </button>
      {show && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-stone-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => { setView(view === m.id ? "projects" : m.id); setShow(false); }}
              className={`w-full text-right p-3 text-sm flex items-center justify-between gap-2 hover:bg-stone-50 border-b border-stone-50 last:border-0 ${view === m.id ? "text-amber-700 font-bold" : "text-slate-700"}`}
            >
              <span className="flex items-center gap-2"><m.icon className="w-4 h-4" /> {m.label}</span>
              {m.badge > 0 && <span className="bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{m.badge}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
