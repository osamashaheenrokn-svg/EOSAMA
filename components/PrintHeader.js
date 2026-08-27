"use client";

export function PrintHeader({ title }) {
  return (
    <div className="print-only-header mb-4 pb-3 border-b-2 border-slate-900 flex items-center gap-3">
      <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="peakGoldPrint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="200" rx="28" fill="#0f172a" />
        <g transform="translate(20,26)">
          <rect x="0" y="128" width="160" height="8" rx="4" fill="#f5f5f4" />
          <polygon points="8,128 28,86 48,128" fill="#f5f5f4" opacity="0.55" />
          <polygon points="48,128 78,54 108,128" fill="#f5f5f4" opacity="0.8" />
          <polygon points="108,128 138,20 168,128" fill="url(#peakGoldPrint)" />
          <circle cx="138" cy="20" r="6" fill="#0f172a" />
          <line x1="138" y1="20" x2="138" y2="4" stroke="#f5f5f4" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
      <div>
        <div className="text-lg font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>شركة قمة الحضارة للمقاولات</div>
        <div className="text-xs text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>س.ت ١٠١٠٨٤٥٤٧٦ — الرياض، حي طويق — kemetalhadara@gmail.com</div>
        <div className="text-base font-bold mt-1">{title}</div>
        <div className="text-xs text-stone-500">تاريخ الإصدار: {new Date().toLocaleDateString("ar-SA")}</div>
      </div>
    </div>
  );
}
