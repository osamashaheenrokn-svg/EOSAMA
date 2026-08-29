"use client";

import { Plus } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { staffStatus, isStaffPaidThisMonth } from "@/lib/db";

export function StaffTab({
  active, isOwner, staff, projStaffMonthly, projStaffPaid, projStaffOverdue,
  newStaffMember, setNewStaffMember, addStaffMember, deleteStaffMember, markStaffPaid, unmarkStaffPaid,
}) {
  return (
    <div className="print-area">
      <PrintHeader title={`الطاقم الفني — ${active.name}`} />
      <PrintButton />
      <div className="text-xs text-stone-500 mb-4">المهندسون والمراقبون والمساحون وأي طاقم فني آخر محمّل على المشروع (غير العمالة اليومية) — راتب شهري ثابت، مع متابعة الصرف كل شهر.</div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي الرواتب الشهرية</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projStaffMonthly.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">إجمالي المصروف فعليًا</div>
          <div className="text-lg font-bold text-emerald-700" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projStaffPaid.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-500 mb-1">رواتب متأخرة (الشهر الحالي)</div>
          <div className={`text-lg font-bold ${projStaffOverdue > 0 ? "text-rose-700" : "text-stone-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{projStaffOverdue > 0 ? projStaffOverdue.toLocaleString() + " ر.س" : "لا يوجد"}</div>
        </div>
      </div>

      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-5 no-print bg-stone-50 border border-stone-200 rounded-lg p-3">
          <input value={newStaffMember.name} onChange={(e) => setNewStaffMember((f) => ({ ...f, name: e.target.value }))} placeholder="الاسم" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
          <input value={newStaffMember.role} onChange={(e) => setNewStaffMember((f) => ({ ...f, role: e.target.value }))} placeholder="الوظيفة (مهندس، مراقب، مساح..)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-52" />
          <input value={newStaffMember.monthlySalary} onChange={(e) => setNewStaffMember((f) => ({ ...f, monthlySalary: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="الراتب الشهري" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <label className="text-xs text-stone-500">
            بداية الدوام
            <input type="date" value={newStaffMember.startDate} onChange={(e) => setNewStaffMember((f) => ({ ...f, startDate: e.target.value }))} className="block border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </label>
          <button onClick={addStaffMember} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 self-end"><Plus className="w-4 h-4" /> تسجيل في الطاقم</button>
        </div>
      )}

      <div className="space-y-3">
        {staff.length === 0 && <div className="text-stone-400 text-sm">لا يوجد طاقم فني مسجّل بعد لهذا المشروع.</div>}
        {staff.map((s) => {
          const status = staffStatus(s);
          const paidThisMonth = isStaffPaidThisMonth(s);
          return (
            <div key={s.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div>
                  <div className="font-bold">{s.name} <span className="text-xs text-stone-400 font-normal">— {s.role}</span></div>
                  <div className="text-xs text-stone-500">بداية الدوام: {s.start_date} — الراتب الشهري: {Number(s.monthly_salary).toLocaleString()} ر.س</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
              </div>
              {isOwner && (
                <div className="no-print flex gap-2">
                  {paidThisMonth ? (
                    <button onClick={() => unmarkStaffPaid(s.id)} className="text-xs border border-stone-300 rounded-lg px-3 py-1.5">تراجع عن تسجيل الصرف</button>
                  ) : (
                    <button onClick={() => markStaffPaid(s.id)} className="text-xs bg-emerald-600 text-white rounded-lg px-3 py-1.5 font-bold">تسجيل صرف راتب هذا الشهر</button>
                  )}
                  <button onClick={() => deleteStaffMember(s.id)} className="text-xs text-rose-600 border border-rose-200 rounded-lg px-3 py-1.5">حذف من الطاقم</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
