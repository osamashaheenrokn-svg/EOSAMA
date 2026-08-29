"use client";

import { ShieldAlert, Check } from "lucide-react";

export function ApprovalsView({ approvalThreshold, setApprovalThreshold, pendingApprovals, approveRequest, rejectRequest }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>طلبات الموافقة على الصرف الكبير</h1>
      </div>
      <div className="text-sm text-stone-500 mb-4">أي صرف من العهدة يتجاوز الحد المحدد يحتاج موافقتك قبل ما يتسجل فعليًا.</div>

      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
        <label className="text-xs text-stone-500">
          حد الموافقة (ر.س) — أي مبلغ فوق ده هيحتاج موافقتك
          <div className="flex items-center gap-2 mt-1">
            <input defaultValue={approvalThreshold} onBlur={(e) => setApprovalThreshold(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} className="w-40 border border-stone-300 rounded-lg px-3 py-2 text-sm font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
            <span className="text-xs text-stone-500">ر.س</span>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        {pendingApprovals.length === 0 && <div className="text-stone-400 text-sm">لا توجد طلبات موافقة معلّقة حاليًا.</div>}
        {pendingApprovals.map((req) => (
          <div key={req.id} className="bg-white border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div>
                <div className="font-bold">{req.project_name}</div>
                <div className="text-xs text-stone-500">طلب من: {req.requested_by_name} — {new Date(req.requested_at).toLocaleString("ar-SA")}</div>
              </div>
              <div className="text-xl font-extrabold text-amber-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(req.amount).toLocaleString()} ر.س</div>
            </div>
            <div className="text-xs text-stone-600 mb-3">صرف عهدة — ملف رقم {req.entry.file_number}، الأسبوع {req.entry.week}</div>
            <div className="flex gap-2">
              <button onClick={() => approveRequest(req)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Check className="w-4 h-4" /> موافقة</button>
              <button onClick={() => rejectRequest(req)} className="border border-rose-300 text-rose-700 px-4 py-2 rounded-lg text-sm font-bold">رفض</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
