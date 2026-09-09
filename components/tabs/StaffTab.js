"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Pencil, UserX, RotateCcw } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { staffStatus, monthsSinceStart, paymentForMonth, formatMonthKey, proratedSalaryForMonth, workedDaysInMonth } from "@/lib/db";

function PaymentEntryForm({ defaultAmount, defaultOvertime, note, onConfirm, onCancel }) {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [overtime, setOvertime] = useState(defaultOvertime ? String(defaultOvertime) : "");

  return (
    <div className="flex flex-wrap items-start gap-2">
      <label className="text-xs text-stone-500">
        الراتب المستحق
        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} className="block w-24 border border-stone-300 rounded px-2 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        {note && <span className="block text-[10px] text-amber-700 mt-0.5 max-w-[160px]">{note}</span>}
      </label>
      <label className="text-xs text-stone-500">
        إضافي (اختياري)
        <input value={overtime} onChange={(e) => setOvertime(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" className="block w-24 border border-stone-300 rounded px-2 py-1 text-xs" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
      </label>
      <button onClick={() => onConfirm(Number(amount) || 0, Number(overtime) || 0)} className="text-xs bg-emerald-600 text-white rounded px-3 py-1.5 font-bold self-end">تأكيد</button>
      <button onClick={onCancel} className="text-xs text-stone-500 border border-stone-300 rounded px-3 py-1.5 self-end">إلغاء</button>
    </div>
  );
}

function EndAssignmentForm({ onConfirm, onCancel }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs" />
      <button onClick={() => onConfirm(date)} className="text-xs bg-rose-600 text-white rounded-lg px-3 py-1.5 font-bold">تأكيد الإنهاء</button>
      <button onClick={onCancel} className="text-xs text-stone-500 border border-stone-300 rounded-lg px-3 py-1.5">إلغاء</button>
    </div>
  );
}

function StaffMemberCard({ s, isOwner, markStaffPaid, unmarkStaffPaid, updateStaffPayment, deleteStaffMember, endStaffAssignment, reopenStaffAssignment }) {
  const [showHistory, setShowHistory] = useState(false);
  const [payingMonth, setPayingMonth] = useState(null);
  const [editingMonth, setEditingMonth] = useState(null);
  const [endingAssignment, setEndingAssignment] = useState(false);
  const status = staffStatus(s);
  const months = monthsSinceStart(s.start_date, s.end_date);
  const unpaidMonths = months.filter((m) => !paymentForMonth(s, m));
  const totalReceived = (s.staff_payments || []).reduce((a, p) => a + Number(p.amount || 0) + Number(p.overtime || 0), 0);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <div className="font-bold">
            {s.name} <span className="text-xs text-stone-400 font-normal">— {s.role}</span>{" "}
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              إجمالي ما استلمه: {totalReceived.toLocaleString()} ر.س
            </span>
          </div>
          <div className="text-xs text-stone-500">بداية الدوام: {s.start_date}{s.end_date ? ` — نهاية التعيين: ${s.end_date}` : ""} — الراتب الشهري: {Number(s.monthly_salary).toLocaleString()} ر.س</div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
      </div>

      {isOwner && (
        <div className="no-print flex flex-wrap items-center gap-2">
          <button onClick={() => deleteStaffMember(s.id)} className="text-xs text-rose-600 border border-rose-200 rounded-lg px-3 py-1.5">حذف من الطاقم</button>
          {s.end_date ? (
            <button onClick={() => reopenStaffAssignment(s.id)} className="text-xs text-slate-600 border border-stone-300 rounded-lg px-3 py-1.5 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> إلغاء إنهاء التعيين</button>
          ) : endingAssignment ? (
            <EndAssignmentForm onConfirm={(date) => { endStaffAssignment(s.id, date); setEndingAssignment(false); }} onCancel={() => setEndingAssignment(false)} />
          ) : (
            <button onClick={() => setEndingAssignment(true)} className="text-xs text-rose-600 border border-rose-200 rounded-lg px-3 py-1.5 flex items-center gap-1"><UserX className="w-3.5 h-3.5" /> إنهاء التعيين</button>
          )}
          <button onClick={() => setShowHistory((v) => !v)} className="text-xs text-slate-600 border border-stone-300 rounded-lg px-3 py-1.5 flex items-center gap-1">
            سجل الرواتب الشهرية {unpaidMonths.length > 0 && <span className="bg-rose-100 text-rose-700 rounded-full px-1.5">{unpaidMonths.length}</span>}
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {showHistory && (
        <div className="mt-3 border-t border-stone-100 pt-3">
          <div className="text-xs text-stone-500 mb-2">كل الشهور من تاريخ بداية الدوام حتى الآن (أو حتى تاريخ إنهاء التعيين إن وُجد) — شهر البداية أو النهاية بيتحسب تلقائيًا بعدد الأيام الفعلية لو وقع في نص الشهر. سجّل هنا رواتب الشهور السابقة، وتقدر تعدّل أي شهر مسجّل بالغلط، ولو حبيت تضيف إضافي حطّه في خانته المنفصلة.</div>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50 text-stone-500">
                <tr><th className="text-right p-2">الشهر</th><th className="text-right p-2">الحالة</th><th className="text-right p-2">تاريخ الصرف</th>{isOwner && <th className="text-right p-2">إجراء</th>}</tr>
              </thead>
              <tbody>
                {months.map((m) => {
                  const payment = paymentForMonth(s, m);
                  const total = payment ? Number(payment.amount) + Number(payment.overtime || 0) : 0;
                  const worked = workedDaysInMonth(s, m);
                  const note = worked.isPartial ? `شهر جزئي: من يوم ${worked.fromDay} إلى يوم ${worked.toDay} من ${worked.daysInMonth} (${worked.workedDays} يوم)` : null;
                  return (
                    <tr key={m} className="border-t border-stone-100">
                      <td className="p-2 font-bold align-top">{formatMonthKey(m)}</td>
                      <td className="p-2 align-top">
                        {payment ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            مدفوع ({total.toLocaleString()} ر.س{Number(payment.overtime || 0) > 0 ? ` — منها ${Number(payment.overtime).toLocaleString()} إضافي` : ""})
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">غير مسجّل</span>
                        )}
                      </td>
                      <td className="p-2 text-stone-500 align-top" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{payment?.paid_date || "—"}</td>
                      {isOwner && (
                        <td className="p-2 align-top">
                          {editingMonth === m ? (
                            <PaymentEntryForm
                              defaultAmount={payment ? payment.amount : proratedSalaryForMonth(s, m)}
                              defaultOvertime={payment?.overtime}
                              note={note}
                              onConfirm={(amount, overtime) => { updateStaffPayment(s.id, m, amount, overtime); setEditingMonth(null); }}
                              onCancel={() => setEditingMonth(null)}
                            />
                          ) : payment ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingMonth(m)} title="تعديل" className="text-slate-500 border border-stone-300 rounded px-1.5 py-1"><Pencil className="w-3 h-3" /></button>
                              <button onClick={() => unmarkStaffPaid(s.id, m)} className="text-xs border border-stone-300 rounded px-2 py-1">تراجع</button>
                            </div>
                          ) : payingMonth === m ? (
                            <PaymentEntryForm
                              defaultAmount={proratedSalaryForMonth(s, m)}
                              note={note}
                              onConfirm={(amount, overtime) => { markStaffPaid(s.id, m, amount, overtime); setPayingMonth(null); }}
                              onCancel={() => setPayingMonth(null)}
                            />
                          ) : (
                            <button onClick={() => setPayingMonth(m)} className="text-xs bg-emerald-600 text-white rounded px-2 py-1 font-bold">تسجيل السداد</button>
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
  updateStaffPayment, endStaffAssignment, reopenStaffAssignment,
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
      <div className="text-xs text-stone-500 mb-3 no-print">افتح &quot;سجل الرواتب الشهرية&quot; لكل عضو لتسجيل صرف أي شهر أو تعديله (شامل الشهر الحالي)، مع إمكانية إضافة مبلغ إضافي لأي شهر. لو انتهى تعيين أحد الأعضاء (أو نزل إجازة بدون راتب) استخدم &quot;إنهاء التعيين&quot; بدل حذفه.</div>

      <div className="space-y-3">
        {staff.length === 0 && <div className="text-stone-400 text-sm">لا يوجد طاقم فني مسجّل بعد لهذا المشروع.</div>}
        {staff.map((s) => (
          <StaffMemberCard
            key={s.id} s={s} isOwner={isOwner}
            markStaffPaid={markStaffPaid} unmarkStaffPaid={unmarkStaffPaid} updateStaffPayment={updateStaffPayment}
            deleteStaffMember={deleteStaffMember} endStaffAssignment={endStaffAssignment} reopenStaffAssignment={reopenStaffAssignment}
          />
        ))}
      </div>
    </div>
  );
}
