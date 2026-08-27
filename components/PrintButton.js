"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "تنزيل / طباعة PDF" }) {
  return (
    <button onClick={() => window.print()} className="no-print bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 mb-4">
      <Printer className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
