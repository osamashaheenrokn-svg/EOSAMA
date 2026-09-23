"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, FolderOpen, Copy } from "lucide-react";
import { PrintButton } from "../PrintButton";

const DEFAULT_TERMS = [
  "أعمال الحفر والردم والسند والأعمال المساحية هي مسؤولية الطرف الأول",
  "توفير الكرين هي مسؤولية الطرف الأول، وفي حالة طلب الطرف الأول توفير الكرين يتم زيادة السعر 30 ريال لكل 1م3",
  "الأسعار تشمل أعمال الحدادة والنجارة والصب والمصنعيات شامل العدة اللازمة",
  "الأسعار لا تشمل توريد أي مواد، جميع المواد مسؤولية الطرف الأول",
  "الأسعار لا تشمل ضريبة القيمة المضافة",
].join("\n");

function todayPlain() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function blankItem() {
  return { description: "", description_en: "", unit: "", price: "" };
}

function blankSheet() {
  return {
    id: null,
    client_name: "",
    subject: "",
    quote_date: todayPlain(),
    items: [blankItem()],
    terms: DEFAULT_TERMS,
  };
}

export function QuotationsView({ quotations, saveQuotation, deleteQuotation }) {
  const [sheet, setSheet] = useState(blankSheet());
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setSheet((s) => ({ ...s, [field]: value }));
  }
  function updateItem(i, field, value) {
    setSheet((s) => ({ ...s, items: s.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)) }));
  }
  function addItem() {
    setSheet((s) => ({ ...s, items: [...s.items, blankItem()] }));
  }
  function removeItem(i) {
    setSheet((s) => ({ ...s, items: s.items.filter((_, idx) => idx !== i) }));
  }
  function loadQuotation(q, asCopy) {
    setSheet({
      id: asCopy ? null : q.id,
      client_name: q.client_name || "",
      subject: q.subject || "",
      quote_date: asCopy ? todayPlain() : (q.quote_date || todayPlain()),
      items: q.items?.length ? q.items : [blankItem()],
      terms: q.terms || DEFAULT_TERMS,
    });
  }

  async function handleSave() {
    setSaving(true);
    const id = await saveQuotation(sheet);
    if (id) setSheet((s) => ({ ...s, id }));
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="no-print">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>عروض الأسعار</h1>
        </div>
        <div className="text-sm text-stone-500 mb-4">اكتب مباشرة في الخانات تحت زي أي عرض سعر جاهز، واحفظه عشان ترجعله تاني أو تنسخه لعميل جديد بسرعة.</div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setSheet(blankSheet())} className="bg-white border border-stone-300 text-stone-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> عرض سعر جديد فاضي
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-60">
            {saving ? "جاري الحفظ..." : "حفظ في القائمة"}
          </button>
        </div>

        {quotations.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-lg p-3 mb-6">
            <div className="text-xs font-bold text-stone-600 mb-2 flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" /> عروض أسعار محفوظة ({quotations.length})</div>
            <div className="space-y-1.5">
              {quotations.map((q) => (
                <div key={q.id} className={`flex items-center justify-between gap-2 text-xs border rounded-lg px-2.5 py-2 ${sheet.id === q.id ? "border-amber-400 bg-amber-50" : "border-stone-200"}`}>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{q.client_name || "بدون اسم عميل"}</div>
                    <div className="text-stone-400 truncate">{q.subject || "بدون موضوع"} — {q.quote_date}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => loadQuotation(q, false)} title="فتح للتعديل" className="text-slate-600 border border-stone-300 rounded px-2 py-1"><FolderOpen className="w-3.5 h-3.5" /></button>
                    <button onClick={() => loadQuotation(q, true)} title="نسخ لعميل جديد" className="text-slate-600 border border-stone-300 rounded px-2 py-1"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteQuotation(q.id)} title="حذف" className="text-rose-600 border border-rose-200 rounded px-2 py-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <PrintButton label="تنزيل / طباعة عرض السعر PDF" />
      </div>

      <style>{`
        .qs-field { border: none; background: transparent; font: inherit; color: inherit; width: 100%; resize: none; }
        .qs-field:focus { outline: none; background: #fbf4e4; }
      `}</style>

      {/*
        The whole document is one outer table: a native <thead>/<tfoot> is the only
        technique browsers reliably repeat on every printed page with correctly
        reserved space — position:fixed plus manual padding looked right on screen
        but silently hid a row wherever a page happened to break, because CSS only
        applies top/bottom padding once, not to every page fragment.
      */}
      <table className="print-area w-full border-collapse bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden" dir="rtl">
        <thead>
          <tr><td className="p-0">
            <div className="h-2 bg-gradient-to-l from-amber-400 via-amber-500 to-slate-900" />
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b-2 border-slate-900">
                <div className="text-center w-32" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
                  <div className="font-extrabold text-sm leading-tight">شركة قمة الحضارة للمقاولات</div>
                  <div className="text-[11px] mt-1" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>س.ت : ١٠١٠٨٤٥٤٧٦</div>
                </div>
                <div className="w-16 h-16 shrink-0 rounded-full border-2 border-slate-900 flex items-center justify-center font-extrabold text-slate-900">K.A</div>
                <div className="text-center text-slate-900 w-32">
                  <div className="italic font-bold text-sm leading-tight">Kemet alhadara Contracting Company</div>
                  <div className="text-[11px] mt-1">C.R: 1010845476</div>
                </div>
              </div>

              <div className="flex justify-center mb-5">
                <span className="inline-block bg-amber-50 text-amber-800 border border-amber-300 rounded-full px-5 py-1 text-xs font-extrabold tracking-wide" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
                  عرض سعر
                </span>
              </div>
            </div>
          </td></tr>
        </thead>

        <tbody>
          <tr><td className="px-6 align-top">
        <div className="flex justify-start mb-4 text-sm">
          <label className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-stone-500 shrink-0">التاريخ :</span>
            <input className="qs-field font-bold w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} value={sheet.quote_date} onChange={(e) => updateField("quote_date", e.target.value)} />
          </label>
        </div>

        <div className="flex items-baseline justify-start gap-1 mb-2 text-sm">
          <span className="font-bold shrink-0">السادة /</span>
          <input
            className="qs-field font-bold text-right"
            style={{ width: `${(sheet.client_name.length || 20) + 1}ch`, maxWidth: "60%" }}
            placeholder="اسم العميل أو الجهة"
            value={sheet.client_name}
            onChange={(e) => updateField("client_name", e.target.value)}
          />
          <span className="font-bold shrink-0">المحترمين</span>
        </div>

        <textarea
          className="qs-field text-center font-bold mb-5 mt-3"
          rows={2}
          placeholder="نقدم لكم عرض سعر أعمال..."
          value={sheet.subject}
          onChange={(e) => updateField("subject", e.target.value)}
        />

        <div className="no-print text-[11px] text-stone-400 mb-1.5">تقدر تضيف وصف بالإنجليزي تحت كل بند لو محتاج، أو تسيبه فاضي.</div>
        <table className="w-full border-collapse border border-slate-900 text-sm mb-2 overflow-hidden rounded-lg">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="border border-slate-900 p-2 w-10">م<div className="text-[9px] font-normal opacity-70">No.</div></th>
              <th className="border border-slate-900 p-2">البيان<div className="text-[9px] font-normal opacity-70">Description</div></th>
              <th className="border border-slate-900 p-2 w-24">الوحدة<div className="text-[9px] font-normal opacity-70">Unit</div></th>
              <th className="border border-slate-900 p-2 w-24">السعر<div className="text-[9px] font-normal opacity-70">Price</div></th>
              <th className="no-print w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sheet.items.map((it, i) => {
              const hasEn = !!(it.description_en || "").trim();
              return (
                <tr key={i} className={i % 2 === 1 ? "bg-stone-50" : ""} style={{ breakInside: "avoid" }}>
                  <td className="border border-slate-900 p-2 text-center align-top">{i + 1}</td>
                  <td className="border border-slate-900 p-0 align-top">
                    <textarea
                      className="qs-field p-2"
                      dir="rtl"
                      rows={2}
                      value={it.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                    />
                    <textarea
                      className={`qs-field text-left text-stone-600 italic leading-tight ${hasEn ? "p-2 border-t border-stone-200" : "px-2 py-0.5"}`}
                      dir="ltr"
                      rows={hasEn ? 2 : 1}
                      value={it.description_en || ""}
                      onChange={(e) => updateItem(i, "description_en", e.target.value)}
                    />
                  </td>
                  <td className="border border-slate-900 p-2 align-top">
                    <input className="qs-field text-center" value={it.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} />
                  </td>
                  <td className="border border-slate-900 p-2 align-top" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                    <input className="qs-field text-center font-bold text-amber-800" value={it.price} onChange={(e) => updateItem(i, "price", e.target.value)} />
                  </td>
                  <td className="no-print p-1 text-center align-top">
                    <button onClick={() => removeItem(i)} className="text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button onClick={addItem} className="no-print text-xs text-slate-700 border border-stone-300 rounded-lg px-2.5 py-1.5 mb-5 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> إضافة بند
        </button>

        <div className={sheet.terms.trim() ? "bg-stone-50 border border-stone-200 rounded-lg p-4 mb-10" : "mb-2"} style={{ breakInside: "avoid" }}>
          {sheet.terms.trim() && <div className="text-[11px] font-bold text-stone-500 mb-2">الشروط والملاحظات</div>}
          <textarea
            className="qs-field font-bold text-sm leading-7"
            rows={sheet.terms.trim() ? 6 : 1}
            value={sheet.terms}
            onChange={(e) => updateField("terms", e.target.value)}
          />
          {!sheet.terms.trim() && <div className="no-print text-xs text-stone-300">اكتب الشروط والملاحظات هنا (اختياري)...</div>}
        </div>
          </td></tr>
        </tbody>

        <tfoot>
          <tr><td className="px-6 pb-6 align-top">
            <div className="mb-2 text-left">
              <div className="font-bold text-sm mb-1">شركة قمة الحضاره للمقاولات</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/company-stamp.png" alt="ختم الشركة" className="h-20 w-auto inline-block" />
            </div>

            <div className="text-center text-[10px] text-stone-500 border-t-2 border-amber-400 pt-2 leading-5">
              <div>س.ت : ١٠١٠٨٤٥٤٧٦ — ٤٧٦٠٩١١ - ٤٧٦٠٩٧٧ — فاكس : ٢٩١٧٣٩٤ — ص.ب : ٥٠٠٦٥ الرياض ١١٥٢٣ — رقم إشتراك الغرفة ٢٦٥٤٢</div>
              <div className="italic">C.R: 1010845476 - Tel: 4760911 - 4790612 - Fax: 2917394 - P.O.Box 50065 . Riyadh 11523 - C.C. No. 26542</div>
            </div>
          </td></tr>
        </tfoot>
      </table>
    </div>
  );
}
