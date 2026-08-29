"use client";

import { History } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

export function AuditView({ auditLog }) {
  return (
    <div className="p-6 max-w-3xl mx-auto print-area">
      <PrintHeader title="سجل الأرقام (Audit Log)" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <History className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>سجل الأرقام</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">سجل تلقائي لكل إضافة أو تعديل أو حذف حصل في النظام، مين عمله وإمتى — متاح للمدير فقط.</div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">الوقت</th><th className="text-right p-2">بواسطة</th><th className="text-right p-2">الإجراء</th></tr></thead>
          <tbody>
            {auditLog.length === 0 && (<tr><td colSpan={3} className="text-center text-stone-400 p-6">لا يوجد أي نشاط مسجّل بعد. أي إضافة أو حذف تعمله من دلوقتي هيتسجّل هنا تلقائيًا.</td></tr>)}
            {auditLog.map((e) => (
              <tr key={e.id} className="border-t border-stone-100">
                <td className="p-2 text-stone-400 whitespace-nowrap" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{new Date(e.created_at).toLocaleString("ar-SA")}</td>
                <td className="p-2 font-bold whitespace-nowrap">{e.actor_name}</td>
                <td className="p-2 text-stone-700">{e.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
