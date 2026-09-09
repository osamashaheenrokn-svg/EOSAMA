"use client";

import { useState } from "react";
import { Contact, Briefcase, Star, ChevronRight, Printer } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { AttachmentCell } from "../AttachmentCell";
import { staffStatus, staffPerformancePercent, staffPerformanceLabel, monthsSinceStart, paymentForMonth, formatMonthKey, sum } from "@/lib/db";

function StarRating({ rating, onRate }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onRate(n === rating ? 0 : n)} className={n <= rating ? "text-amber-500" : "text-stone-300"} title={`${n}/10`}>
            <Star className="w-3.5 h-3.5" fill="currentColor" />
          </button>
        ))}
      </div>
      <span className="text-xs text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{staffPerformancePercent(rating)}٪</span>
    </div>
  );
}

function StaffProfileReport({ s, onBack }) {
  const status = staffStatus(s);
  const perf = staffPerformanceLabel(s.rating);
  const totalReceived = sum(s.staff_payments, "amount") + sum(s.staff_payments, "overtime");
  const months = monthsSinceStart(s.start_date, s.end_date);

  return (
    <div className="print-area">
      <button onClick={onBack} className="no-print text-sm text-slate-600 border border-stone-300 rounded-lg px-3 py-2 mb-4 flex items-center gap-1">
        <ChevronRight className="w-4 h-4" /> الرجوع لكل الموظفين
      </button>
      <PrintHeader title={`تقرير موظف — ${s.name}`} />
      <PrintButton label="تنزيل / طباعة تقرير الموظف" />

      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="font-extrabold text-lg" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{s.name}</div>
            <div className="text-sm text-stone-500">{s.role}</div>
            <div className="text-xs text-stone-500 flex items-center gap-1 mt-1"><Briefcase className="w-3 h-3" /> {s.projects?.name || "بدون مشروع"}</div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-stone-50 rounded-lg p-2">
            <div className="text-xs text-stone-500">بداية الدوام</div>
            <div className="font-bold text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{s.start_date}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2">
            <div className="text-xs text-stone-500">نهاية التعيين</div>
            <div className="font-bold text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{s.end_date || "مستمر"}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2">
            <div className="text-xs text-stone-500">الراتب الشهري</div>
            <div className="font-bold text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(s.monthly_salary).toLocaleString()} ر.س</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2">
            <div className="text-xs text-stone-500">إجمالي ما استلمه</div>
            <div className="font-bold text-emerald-700 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{totalReceived.toLocaleString()} ر.س</div>
          </div>
        </div>

        <div className={`rounded-lg p-3 flex items-center justify-between flex-wrap gap-3 ${perf.color}`}>
          <div className="text-sm font-bold">التقييم الفني: {perf.label}</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Star key={n} className={`w-3.5 h-3.5 ${n <= s.rating ? "opacity-100" : "opacity-25"}`} fill="currentColor" />
            ))}
            <span className="text-sm font-bold mr-1" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{staffPerformancePercent(s.rating)}٪</span>
          </div>
        </div>
      </div>

      <div className="text-sm font-bold mb-2">سجل الرواتب الشهرية</div>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-5">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500">
            <tr><th className="text-right p-2">الشهر</th><th className="text-right p-2">الحالة</th><th className="text-right p-2">تاريخ الصرف</th></tr>
          </thead>
          <tbody>
            {months.map((m) => {
              const payment = paymentForMonth(s, m);
              const total = payment ? Number(payment.amount) + Number(payment.overtime || 0) : 0;
              return (
                <tr key={m} className="border-t border-stone-100">
                  <td className="p-2 font-bold">{formatMonthKey(m)}</td>
                  <td className="p-2">
                    {payment ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">مدفوع ({total.toLocaleString()} ر.س)</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">غير مسجّل</span>
                    )}
                  </td>
                  <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{payment?.paid_date || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-stone-200 rounded-lg p-2 flex items-center justify-between gap-2">
          <span className="text-xs text-stone-600 font-bold">المستندات الشخصية</span>
          {s.documents_path ? <AttachmentCell path={s.documents_path} canEdit={false} /> : <span className="text-xs text-stone-400">لا يوجد مرفق</span>}
        </div>
        <div className="border border-stone-200 rounded-lg p-2 flex items-center justify-between gap-2">
          <span className="text-xs text-stone-600 font-bold">العقد</span>
          {s.contract_path ? <AttachmentCell path={s.contract_path} canEdit={false} /> : <span className="text-xs text-stone-400">لا يوجد مرفق</span>}
        </div>
      </div>
    </div>
  );
}

export function StaffDirectoryView({ staff, attachStaffFile, rateStaffMember }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = staff.find((s) => s.id === selectedId);

  if (selected) {
    return <StaffProfileReport s={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto print-area">
      <PrintHeader title="تقارير العمالة والأطقم الفنية" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <Contact className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>تقارير العمالة والأطقم الفنية</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">كل أعضاء الطاقم الفني في كل المشروعات — بياناتهم، مشروعهم الحالي، تقييم أدائهم الفني، ومستنداتهم الشخصية وعقودهم. اضغط &quot;تقرير الموظف&quot; لطباعة تقرير مستقل لموظف واحد.</div>

      {staff.length === 0 && <div className="text-stone-400 text-sm">لا يوجد طاقم فني مسجّل بعد.</div>}

      <div className="space-y-3">
        {staff.map((s) => {
          const status = staffStatus(s);
          const perf = staffPerformanceLabel(s.rating);
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
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  <button onClick={() => setSelectedId(s.id)} className="no-print text-xs bg-slate-900 text-white rounded-lg px-2.5 py-1.5 flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5" /> تقرير الموظف
                  </button>
                </div>
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

              <div className={`rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2 mb-3 ${perf.color}`}>
                <span className="text-xs font-bold">التقييم الفني: {perf.label}</span>
                <StarRating rating={s.rating || 0} onRate={(n) => rateStaffMember(s.id, n)} />
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
