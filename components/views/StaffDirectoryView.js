"use client";

import { Contact, Briefcase } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";
import { staffStatus, sum } from "@/lib/db";

export function StaffDirectoryView({ staff, attachStaffFile }) {
  return (
    <div className="p-6 max-w-5xl mx-auto print-area">
      <PrintHeader title="تقارير العمالة والأطقم الفنية" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <Contact className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>تقارير العمالة والأطقم الفنية</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">كل أعضاء الطاقم الفني في كل المشروعات — بياناتهم، مشروعهم الحالي، ومستنداتهم الشخصية وعقودهم.</div>

      {staff.length === 0 && <div className="text-stone-400 text-sm">لا يوجد طاقم فني مسجّل بعد.</div>}

      <div className="space-y-3">
        {staff.map((s) => {
          const status = staffStatus(s);
          const totalReceived = sum(s.staff_payments, "amount") + sum(s.staff_payments, "overtime");
          return (
            <div key={s.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <div className="font-bold text-base" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{s.name} <span className="text-xs text-stone-400 font-normal">— {s.role}</span></div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                    <Briefcase className="w-3 h-3" /> {s.projects?.name || "بدون مشروع"}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">بداية الدوام</div>
                  <div className="font-bold text-slate-900 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{s.start_date}</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">نهاية التعيين</div>
                  <div className="font-bold text-slate-900 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{s.end_date || "مستمر"}</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">الراتب الشهري</div>
                  <div className="font-bold text-slate-900 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(s.monthly_salary).toLocaleString()} ر.س</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">إجمالي ما استلمه</div>
                  <div className="font-bold text-emerald-700 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{totalReceived.toLocaleString()} ر.س</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-stone-200 rounded-lg p-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-600 font-bold">المستندات الشخصية</span>
                  <AttachmentCell path={s.documents_path} canEdit inputId={`staff-doc-${s.id}`} onUpload={(file) => attachStaffFile(s.id, s.project_id, file, "documents_path")} />
                </div>
                <div className="border border-stone-200 rounded-lg p-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-600 font-bold">العقد</span>
                  <AttachmentCell path={s.contract_path} canEdit inputId={`staff-contract-${s.id}`} onUpload={(file) => attachStaffFile(s.id, s.project_id, file, "contract_path")} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
