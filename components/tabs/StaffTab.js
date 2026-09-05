"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { staffStatus, isStaffPaidThisMonth, monthsSinceStart, paymentForMonth, formatMonthKey, currentMonthKey } from "@/lib/db";

function StaffMemberCard({ s, isOwner, markStaffPaid, unmarkStaffPaid, deleteStaffMember }) {
  const [showHistory, setShowHistory] = useState(false);
  const status = staffStatus(s);
  const paidThisMonth = isStaffPaidThisMonth(s);
  const months = monthsSinceStart(s.start_date);
  const thisMonth = currentMonthKey();
  const unpaidPastMonths = months.filter((m) => m !== thisMonth && !paymentForMonth(s, m));

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <div className="font-bold">{s.name} <span className="text-xs text-stone-400 font-normal">— {s.role}</span></div>
          <div className="text-xs text-stone-500">بداية الدوام: {s.start_date} — الراتب الشهري: {Number(s.monthly_salary).toLocaleString()} ر.س</div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
      </div>

      {isOwner && (
        <div className="no-print flex flex-wrap items-center gap-2">
          {paidThisMonth ? (
            <button onClick={() => unmarkStaffPaid(s.id)} className="text-xs border border-stone-300 rounded-lg px-3 py-1.5">تراجع عن تسجيل الصرف</button>
          ) : (
            <button onClick={() => markStaffPaid(s.id)} className="text-xs bg-emerald-600 text-white rounded-lg px-3 py-1.5 font-bold">تسجيل صرف راتب هذا الشهر</button>
          )}
          <button onClick={() => deleteStaffMember(s.id)} className="text-xs text-rose-600 border border-rose-200 rounded-lg px-3 py-1.5">حذف من الطاقم</button>
          <button onClick={() => setShowHistory((v) => !v)} className="text-xs text-slate-600 border border-stone-300 rounded-lg px-3 py-1.5 flex items-center gap-1">
            سجل الرواتب الشهرية {unpaidPastMonths.length > 0 && <span className="bg-rose-100 text-rose-700 rounded-full px-1.5">{unpaidPastMonths.length}</span>}
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {showHistory && (
        <div className="mt-3 border-t border-stone-100 pt-3">
          <div className="text-xs text-stone-500 mb-2">كل الشهور من تاريخ بداية الدوام حتى الآن — سجّل رواتب الشهور السابقة اللي اتصرفت قبل استخدام البرنامج.</div>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50 text-stone-500">
                <tr><th className="text-right p-2">الشهر</th><th className="text-right p-2">الحالة</th><th className="text-right p-2">تاريخ الصرف</th>{isOwner && <th className="text-right p-2">إجراء</th>}</tr>
              </thead>
              <tbody>
                {months.map((m) => {
                  const payment = paymentForMonth(s, m);
                  return (
                    <tr key={m} className="border-t border-stone-100">
                      <td className="p-2 font-bold">{formatMonthKey(m)}</td>
                      <td className="p-2">
                        {payment ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">مدفوع ({Number(payment.amount).toLocaleString()} ر.س)</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">غير مسجّل</span>
                        )}
                      </td>
                      <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{payment?.paid_date || "—"}</td>
                      {isOwner && (
                        <td className="p-2">
                          {payment ? (
                            <button onClick={() => unmarkStaffPaid(s.id, m)} className="text-xs border border-stone-300 rounded px-2 py-1">تراجع</button>
                          ) : (
                            <button onClick={() => markStaffPaid(s.id, m)} className="text-xs bg-emerald-600 text-white rounded px-2 py-1 font-bold">تسجيل السداد</button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <div className="text-xs text-stone-500 mb-3 no-print">لو تاريخ بداية الدوام أقدم من اليوم، افتح &quot;سجل الرواتب الشهرية&quot; لكل عضو لتسجيل رواتب الشهور السابقة اللي اتصرفت قبل استخدام البرنامج.</div>

      <div className="space-y-3">
        {staff.length === 0 && <div className="text-stone-400 text-sm">لا يوجد طاقم فني مسجّل بعد لهذا المشروع.</div>}
        {staff.map((s) => (
          <StaffMemberCard key={s.id} s={s} isOwner={isOwner} markStaffPaid={markStaffPaid} unmarkStaffPaid={unmarkStaffPaid} deleteStaffMember={deleteStaffMember} />
        ))}
      </div>
    </div>
  );
}
