"use client";

import { useState } from "react";
import { Copy, Mail, MessageCircle, Send } from "lucide-react";

const COMPANY_NAME = "شركة قمة الحضارة للمقاولات";

function money(n) {
  return `${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ر.س`;
}

// wa.me needs the full international number with digits only. A local Saudi number
// (05xxxxxxxx) becomes 9665xxxxxxxx; numbers already starting with a country code stay as they are.
function toWhatsAppNumber(raw) {
  let digits = String(raw || "").replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660)).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "966" + digits.slice(1);
  else if (digits.length === 9 && digits.startsWith("5")) digits = "966" + digits;
  return digits;
}

function projectFinancials(project, companyFinancials) {
  return companyFinancials.find((x) => x.id === project.id) || { expenses: 0, revenue: 0, profit: 0 };
}

function projectLines(project, f) {
  return [
    `🏗️ *${project.name}*`,
    `• نسبة الإنجاز: ${project.progress ?? 0}٪ — الحالة: ${project.status || "—"}`,
    `• المصروفات: ${money(f.expenses)}`,
    `• الإيرادات: ${money(f.revenue)}`,
    `• ${f.profit >= 0 ? "الربح" : "الخسارة"}: ${money(Math.abs(f.profit))}`,
  ];
}

function buildReport(projects, companyFinancials, frequency) {
  const period = frequency === "monthly" ? "الشهري" : "الأسبوعي";
  const date = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  const lines = [`📊 *التقرير ${period} — ${COMPANY_NAME}*`, `التاريخ: ${date}`, ""];
  let expenses = 0, revenue = 0;
  for (const p of projects) {
    const f = projectFinancials(p, companyFinancials);
    expenses += f.expenses;
    revenue += f.revenue;
    lines.push(...projectLines(p, f), "");
  }
  if (projects.length > 1) {
    const profit = revenue - expenses;
    lines.push(
      `📌 *الإجمالي (${projects.length} مشروع)*`,
      `• المصروفات: ${money(expenses)}`,
      `• الإيرادات: ${money(revenue)}`,
      `• ${profit >= 0 ? "الربح" : "الخسارة"}: ${money(Math.abs(profit))}`,
    );
  }
  return lines.join("\n").trim();
}

function buildProjectReport(project, companyFinancials) {
  const date = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  return [`📊 *تقرير مشروع — ${COMPANY_NAME}*`, `التاريخ: ${date}`, "", ...projectLines(project, projectFinancials(project, companyFinancials))].join("\n");
}

export function PeriodicView({ settings, setSettings, companyFinancials, projects }) {
  const [recipient, setRecipient] = useState(settings.periodic_report_recipient || "");
  const [copied, setCopied] = useState(false);
  const isWhatsApp = settings.periodic_report_method === "whatsapp";
  const activeProjects = projects.filter((p) => !p.archived);

  function send(text) {
    if (isWhatsApp) {
      const phone = toWhatsAppNumber(recipient);
      // Without a number WhatsApp opens its own contact picker, so sending still works.
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } else {
      const subject = `التقرير ${settings.periodic_report_frequency === "monthly" ? "الشهري" : "الأسبوعي"} — ${COMPANY_NAME}`;
      window.location.href = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.replace(/\*/g, ""))}`;
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildReport(activeProjects, companyFinancials, settings.periodic_report_frequency));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("تعذّر النسخ. جرّب من متصفح آخر.");
    }
  }

  const SendIcon = isWhatsApp ? MessageCircle : Mail;
  const sendLabel = isWhatsApp ? "إرسال على واتساب" : "إرسال بالإيميل";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>التقارير الدورية</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">تقرير مختصر لكل المشاريع الجارية، يتبعت بضغطة زرار على واتساب أو الإيميل.</div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-stone-700 mb-5">
        <b>طريقة الإرسال:</b> دوس &quot;{sendLabel}&quot; — {isWhatsApp ? "هيفتح واتساب والتقرير مكتوب جاهز، دوس إرسال." : "هيفتح برنامج الإيميل والتقرير مكتوب جاهز، دوس إرسال."} الإرسال التلقائي في مواعيد ثابتة لسه مش مفعّل.
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
        <div className="text-sm font-bold mb-3">إعدادات الإرسال</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <label className="text-xs text-stone-500">
            التكرار
            <select value={settings.periodic_report_frequency} onChange={(e) => setSettings("periodic_report_frequency", e.target.value)} className="mt-1 w-full border border-stone-300 rounded-lg px-2 py-2 text-sm">
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </label>
          <label className="text-xs text-stone-500">
            طريقة الإرسال
            <select value={settings.periodic_report_method} onChange={(e) => setSettings("periodic_report_method", e.target.value)} className="mt-1 w-full border border-stone-300 rounded-lg px-2 py-2 text-sm">
              <option value="whatsapp">واتساب</option>
              <option value="email">إيميل</option>
            </select>
          </label>
          <label className="text-xs text-stone-500">
            {isWhatsApp ? "رقم الواتساب" : "الإيميل"}
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onBlur={(e) => { if (e.target.value !== (settings.periodic_report_recipient || "")) setSettings("periodic_report_recipient", e.target.value); }}
              placeholder={isWhatsApp ? "05xxxxxxxx" : "you@example.com"}
              dir="ltr"
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-right"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => send(buildReport(activeProjects, companyFinancials, settings.periodic_report_frequency))}
            disabled={activeProjects.length === 0}
            className={`${isWhatsApp ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900"} text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-40`}
          >
            <SendIcon className="w-4 h-4" /> {sendLabel} (كل المشاريع)
          </button>
          <button onClick={copy} disabled={activeProjects.length === 0} className="border border-stone-300 text-stone-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-40">
            <Copy className="w-4 h-4" /> {copied ? "اتنسخ ✓" : "نسخ التقرير"}
          </button>
        </div>
      </div>

      <div className="text-sm font-bold mb-3">معاينة التقرير ({settings.periodic_report_frequency === "weekly" ? "أسبوعي" : "شهري"})</div>
      <div className="space-y-3">
        {activeProjects.length === 0 && <div className="text-stone-400 text-sm">لا توجد مشاريع جارية.</div>}
        {activeProjects.map((p) => {
          const f = projectFinancials(p, companyFinancials);
          return (
            <div key={p.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="font-bold">{p.name}</div>
                <button onClick={() => send(buildProjectReport(p, companyFinancials))} className="text-xs border border-stone-300 text-stone-700 rounded-lg px-2.5 py-1 flex items-center gap-1 hover:text-slate-900">
                  <SendIcon className="w-3.5 h-3.5" /> إرسال تقرير المشروع ده
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>المصروفات: <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.expenses.toLocaleString()} ر.س</b></div>
                <div>الإيرادات: <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.revenue.toLocaleString()} ر.س</b></div>
                <div>الربح/الخسارة: <b className={f.profit >= 0 ? "text-emerald-700" : "text-rose-700"} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{f.profit.toLocaleString()} ر.س</b></div>
              </div>
              <div className="text-xs text-stone-500 mt-1">نسبة الإنجاز: {p.progress}٪ — الحالة: {p.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
