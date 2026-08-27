"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSignedUrl } from "@/lib/attachments";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

function ThumbPhoto({ photo }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    if (photo.attachment_path) {
      getSignedUrl(createClient(), photo.attachment_path).then((u) => { if (active) setUrl(u); }).catch(() => {});
    }
    return () => { active = false; };
  }, [photo.attachment_path]);
  if (!url) return <div className="h-40 bg-stone-200 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-stone-400" /></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={photo.caption} className="w-full h-40 object-cover" />;
}

export function SummaryTab({ active, detail, projGrandTotal, projCustodySpent, projLaborCost, projSalaries, projSubClaims, projRevenue, needs }) {
  return (
    <div className="print-area">
      <PrintHeader title={`تقرير مختصر — ${active.name}`} />
      <PrintButton />

      <div className="bg-slate-900 text-white rounded-xl p-5 mb-4">
        <div className="text-xs text-stone-300 mb-1">إجمالي التكاليف (عهدة + عمالة + مقاولو الباطن والتوريدات + رواتب)</div>
        <div className="text-3xl font-extrabold text-amber-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projGrandTotal.toLocaleString()} ر.س</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">العهدة المصروفة</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projCustodySpent.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">تكاليف العمالة</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projLaborCost.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">مستخلصات مقاولي الباطن والتوريدات</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubClaims.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">الرواتب</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSalaries.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className={`rounded-xl p-4 mb-5 border ${needs.totalNeeded > 0 ? "bg-rose-50 border-rose-300" : "bg-emerald-50 border-emerald-200"}`}>
        <div className="text-xs text-stone-600 mb-1">المطلوب لهذا الموقع (إجمالي المتأخرات: عجز العهدة + متبقي العمالة + متبقي مقاولي الباطن والتوريدات)</div>
        <div className={`text-2xl font-extrabold ${needs.totalNeeded > 0 ? "text-rose-700" : "text-emerald-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
          {needs.totalNeeded > 0 ? needs.totalNeeded.toLocaleString() + " ر.س" : "لا يوجد مطلوب"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">إجمالي المستخلصات المرفوعة (الإيرادات)</div>
          <div className="text-xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projRevenue.toLocaleString()} ر.س <span className="text-xs text-stone-400 font-normal">({detail.revenues.length} مستخلص)</span></div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-xs text-stone-600 mb-1">أعمال منتهية لم تُفوتر بعد</div>
          <div className="text-xl font-bold text-amber-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(active.pending_billing).toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">نسبة إنجاز المشروع</div>
          <div className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{active.progress}٪</div>
        </div>
      </div>

      <div className="text-sm font-bold mb-2">الأعمال المنتهية (آخر تحديثات المشروع)</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-5">
        {detail.updates.length === 0 ? (
          <div className="text-stone-400 text-sm p-4 text-center">لا توجد أعمال مسجّلة بعد.</div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {detail.updates.map((u) => (
                <tr key={u.id} className="border-t border-stone-100 first:border-t-0">
                  <td className="p-2 text-stone-400 w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{u.date}</td>
                  <td className="p-2">{u.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-sm font-bold mb-2">أحدث صورتين من الموقع</div>
      <div className="grid grid-cols-2 gap-3">
        {detail.photos.length === 0 && <div className="text-stone-400 text-sm col-span-2">لا توجد صور بعد.</div>}
        {detail.photos.slice(0, 2).map((ph) => (
          <div key={ph.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <ThumbPhoto photo={ph} />
            <div className="p-2 text-xs text-stone-600">{ph.caption || "بدون وصف"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
