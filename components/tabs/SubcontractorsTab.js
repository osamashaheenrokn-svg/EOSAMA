"use client";

import { Plus } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { SubcontractorCard } from "../SubcontractorCard";

export function SubcontractorsTab({
  canAccessLimited, canEditDelete, projSubClaims, projSubPaid, projSubVat, projSubPaidNet, subcontractors,
  newSubcontractor, setNewSubcontractor, addSubcontractor,
  addSubClaim, addSubPayment, deleteSubClaim, deleteSubPayment, deleteSubcontractor, attachFile, updateRow, rateSubcontractor,
}) {
  return (
    <div className="print-area">
      <PrintHeader title="تقرير مقاولي الباطن والتوريدات" />
      <PrintButton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي مستخلصات المقاولين</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubClaims.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي المدفوع للمقاولين <span className="text-stone-400 font-normal">(شامل الضريبة)</span></div>
          <div className="text-lg font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubPaid.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي المدفوع للمقاولين <span className="text-stone-400 font-normal">(بدون الضريبة)</span></div>
          <div className="text-lg font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubPaidNet.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">المتبقي (مطلوب سداده)</div>
          <div className={`text-lg font-bold ${projSubClaims - projSubPaid > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Math.max(0, projSubClaims - projSubPaid).toLocaleString()} ر.س</div>
        </div>
      </div>
      {projSubVat > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-stone-700">
          منها <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projSubVat.toLocaleString()}</b> ر.س ضريبة قيمة مضافة مستردة (محسوبة من المستخلصات المحدّدة كشاملة للضريبة) — مخصومة من إجمالي المدفوع، ولا تُحتسب ضمن مصروفات المشروع الفعلية لأنها تُستردّ لاحقًا في الإقرار الضريبي.
        </div>
      )}
      <div className="text-xs text-stone-500 mb-3">إجمالي المدفوع للمقاولين بدون الضريبة يُضاف تلقائيًا لإجمالي مصروفات المشروع.</div>

      {canAccessLimited && (
        <div className="flex flex-wrap gap-2 mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <input value={newSubcontractor.name} onChange={(e) => setNewSubcontractor((f) => ({ ...f, name: e.target.value }))} placeholder="اسم المقاول أو المورد" className="flex-1 min-w-[200px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newSubcontractor.scope} onChange={(e) => setNewSubcontractor((f) => ({ ...f, scope: e.target.value }))} placeholder="نطاق الأعمال أو التوريد" className="flex-1 min-w-[200px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addSubcontractor} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> إضافة مقاول جديد
          </button>
        </div>
      )}

      {subcontractors.length === 0 && <div className="text-stone-400 text-sm">لا يوجد مقاولو باطن مسجّلين بعد لهذا المشروع.</div>}
      {subcontractors.map((sub) => (
        <SubcontractorCard
          key={sub.id}
          sub={sub}
          canEdit={canAccessLimited}
          canManage={canEditDelete}
          onAddClaim={(entry) => addSubClaim(sub.id, entry)}
          onAddPayment={(entry) => addSubPayment(sub.id, entry)}
          onDeleteClaim={(id) => deleteSubClaim(id)}
          onDeletePayment={(id) => deleteSubPayment(id)}
          onDeleteSub={() => deleteSubcontractor(sub.id)}
          onAttachClaim={(id, file) => attachFile("subcontractor_claims", id, file)}
          onAttachPayment={(id, file) => attachFile("subcontractor_payments", id, file)}
          onUpdateClaim={(id, fields) => updateRow("subcontractor_claims", id, fields)}
          onUpdatePayment={(id, fields) => updateRow("subcontractor_payments", id, fields)}
          onRate={(rating) => rateSubcontractor(sub.id, rating)}
        />
      ))}
    </div>
  );
}
