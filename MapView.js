"use client";

import { MapPin } from "lucide-react";

export function MapView({ projects, isAdmin, getMembership, profileId, setProjectField }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>خريطة المشروعات</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">مواقع كل المشروعات — في الموقع الحقيقي هتظهر كـ Pins على خريطة تفاعلية فعلية.</div>

      <div className="space-y-3">
        {projects.map((p) => {
          const canEdit = isAdmin || getMembership(p, profileId) === "engineer";
          return (
            <div key={p.id} className="bg-white border border-stone-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-stone-500">{p.location}</div>
                {canEdit && (
                  <div className="flex gap-2 mt-2">
                    <input defaultValue={p.map_lat || ""} onBlur={(e) => setProjectField(p.id, "map_lat", e.target.value ? Number(e.target.value) : null)} placeholder="Latitude" className="w-28 border border-stone-300 rounded px-2 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                    <input defaultValue={p.map_lng || ""} onBlur={(e) => setProjectField(p.id, "map_lng", e.target.value ? Number(e.target.value) : null)} placeholder="Longitude" className="w-28 border border-stone-300 rounded px-2 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                  </div>
                )}
              </div>
              {p.map_lat && p.map_lng && (
                <a
                  href={`https://www.google.com/maps?q=${p.map_lat},${p.map_lng}`}
                  target="_blank" rel="noreferrer"
                  className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> فتح في خرائط جوجل
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
