"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardCheck, Download, Eye, FileText, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { daysUntil } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { getDownloadUrl, getSignedUrls } from "@/lib/attachments";

const DOC_SLOTS = [
  { category: "استمارة", label: "الاستمارة", multiple: false },
  { category: "تأمين", label: "التأمين", multiple: false },
  { category: "أخرى", label: "مرفقات أخرى", multiple: true },
];

function AssetDocRow({ doc, url, canEdit, onDelete }) {
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const href = await getDownloadUrl(createClient(), doc.attachment_path, doc.name);
      const link = document.createElement("a");
      link.href = href;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("تعذّر تنزيل الملف: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }
  const btn = "no-print border border-stone-300 rounded p-1 text-stone-600 hover:text-slate-900 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded px-2 py-1">
      <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
      <span className="text-xs truncate flex-1 min-w-0" title={doc.name}>{doc.name}</span>
      <a href={url || undefined} target="_blank" rel="noreferrer" aria-disabled={!url} className={`${btn} ${url ? "" : "pointer-events-none opacity-40"}`} title="عرض"><Eye className="w-3.5 h-3.5" /></a>
      <button onClick={download} disabled={busy || !doc.attachment_path} className={btn} title="تنزيل"><Download className="w-3.5 h-3.5" /></button>
      {canEdit && <button onClick={onDelete} className="no-print border border-rose-200 rounded p-1 text-rose-600" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>}
    </div>
  );
}

function AssetDocSlots({ asset, canEdit, addAssetDocument, deleteAssetDocument }) {
  const docs = asset.asset_documents || [];
  const [urls, setUrls] = useState({});
  const [uploading, setUploading] = useState(null);
  const pathsKey = docs.map((d) => d.attachment_path).filter(Boolean).sort().join("|");

  useEffect(() => {
    let active = true;
    const paths = pathsKey ? pathsKey.split("|") : [];
    if (paths.length === 0) return;
    getSignedUrls(createClient(), paths).then((map) => { if (active) setUrls(map); }).catch(() => {});
    return () => { active = false; };
  }, [pathsKey]);

  async function upload(category, file, hasExisting) {
    if (hasExisting && !confirm("يوجد ملف في هذه الخانة بالفعل. استبداله بالملف الجديد؟")) return;
    setUploading(category);
    try {
      await addAssetDocument(asset.id, category, file);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {DOC_SLOTS.map((slot) => {
        // Documents from before the slots existed have no category — show them under "أخرى".
        const slotDocs = docs.filter((d) => (d.category || "أخرى") === slot.category);
        const hasExisting = !slot.multiple && slotDocs.length > 0;
        const inputId = `asset-doc-${asset.id}-${slot.category}`;
        return (
          <div key={slot.category} className="border border-stone-200 rounded-lg p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold">{slot.label}</div>
              {slotDocs.length > 0
                ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{slot.multiple ? `${slotDocs.length} ملف` : "مرفوعة"}</span>
                : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">غير مرفوعة</span>}
            </div>
            {slotDocs.length === 0 && <div className="text-xs text-stone-400">لا يوجد ملف.</div>}
            {slotDocs.map((d) => (
              <AssetDocRow key={d.id} doc={d} url={urls[d.attachment_path]} canEdit={canEdit} onDelete={() => deleteAssetDocument(asset.id, d.id)} />
            ))}
            {canEdit && (
              <label htmlFor={inputId} className={`no-print mt-auto inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer ${hasExisting ? "border border-stone-300 text-stone-700" : "bg-slate-900 text-white"} ${uploading === slot.category ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-3.5 h-3.5" />
                {uploading === slot.category ? "جاري الرفع..." : hasExisting ? "استبدال" : slot.multiple ? "إضافة مرفق" : "رفع"}
                <input
                  id={inputId}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    e.target.value = "";
                    if (file) upload(slot.category, file, hasExisting);
                  }}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AssetHeader({ asset, isAdmin, canEdit, updateAssetInfo, deleteAsset }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "", number: "", yearMade: "" });

  function startEdit() {
    setForm({ type: asset.type || "", number: asset.number || "", yearMade: asset.year_made ? String(asset.year_made) : "" });
    setEditing(true);
  }
  async function save() {
    setSaving(true);
    const ok = await updateAssetInfo(asset.id, form);
    setSaving(false);
    if (ok) setEditing(false);
  }

  if (editing) {
    return (
      <div className="no-print flex flex-wrap items-end gap-2 mb-3 bg-stone-50 border border-stone-200 rounded-lg p-2.5">
        <label className="text-xs text-stone-500 flex-1 min-w-[160px]">
          نوع المعدة
          <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="block w-full border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-900" />
        </label>
        <label className="text-xs text-stone-500">
          رقم المعدة / اللوحة
          <input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} className="block w-40 border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-900" />
        </label>
        <label className="text-xs text-stone-500">
          سنة الصنع
          <input value={form.yearMade} onChange={(e) => setForm((f) => ({ ...f, yearMade: e.target.value.replace(/[^0-9]/g, "") }))} className="block w-24 border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-stone-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        </label>
        <button onClick={save} disabled={saving} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"><Check className="w-3.5 h-3.5" /> {saving ? "جاري الحفظ..." : "حفظ"}</button>
        <button onClick={() => setEditing(false)} disabled={saving} className="border border-stone-300 text-stone-600 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"><X className="w-3.5 h-3.5" /> إلغاء</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div className="font-bold">{asset.type} <span className="text-xs text-stone-400 font-normal">— {asset.number}</span></div>
      <div className="no-print flex items-center gap-2">
        {canEdit && (
          <button onClick={startEdit} className="text-slate-700 border border-stone-300 rounded px-2 py-1 text-xs flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> تعديل</button>
        )}
        {isAdmin && (
          <button onClick={() => deleteAsset(asset.id)} className="text-rose-600 border border-rose-200 rounded px-2 py-1 text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
        )}
      </div>
    </div>
  );
}

export function AssetsView({
  isAdmin, canEdit, companyAssets, newAsset, setNewAsset, addAsset, updateAssetField, updateAssetInfo, deleteAsset, addAssetDocument, deleteAssetDocument,
  companyTools, newTool, setNewTool, addTool, updateToolField, deleteTool,
}) {
  return (
    <div className="p-6 max-w-4xl mx-auto print-area">
      <PrintHeader title="أصول الشركة" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <ClipboardCheck className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>أصول الشركة (السيارات والمعدات)</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">سجل ثابت لكل معدة أو سيارة تمتلكها الشركة، مع متابعة تلقائية لتواريخ انتهاء الرخصة والتأمين.</div>

      {canEdit && (
        <div className="flex flex-wrap gap-2 mb-6 no-print bg-white border border-stone-200 rounded-lg p-3">
          <input value={newAsset.type} onChange={(e) => setNewAsset((f) => ({ ...f, type: e.target.value }))} placeholder="نوع المعدة (مثال: شاحنة نقل)" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newAsset.number} onChange={(e) => setNewAsset((f) => ({ ...f, number: e.target.value }))} placeholder="رقم المعدة / اللوحة" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
          <input value={newAsset.yearMade} onChange={(e) => setNewAsset((f) => ({ ...f, yearMade: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="سنة الصنع" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <label className="text-xs text-stone-500">
            نهاية الترخيص
            <input type="date" value={newAsset.licenseExpiry} onChange={(e) => setNewAsset((f) => ({ ...f, licenseExpiry: e.target.value }))} className="block border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-stone-500">
            نهاية التأمين
            <input type="date" value={newAsset.insuranceExpiry} onChange={(e) => setNewAsset((f) => ({ ...f, insuranceExpiry: e.target.value }))} className="block border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </label>
          <button onClick={addAsset} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 self-end"><Plus className="w-4 h-4" /> إضافة أصل</button>
        </div>
      )}

      <div className="space-y-3">
        {companyAssets.length === 0 && <div className="text-stone-400 text-sm">لا توجد أصول مسجّلة بعد.</div>}
        {companyAssets.map((a) => {
          const licDays = daysUntil(a.license_expiry);
          const insDays = daysUntil(a.insurance_expiry);
          const licStatus = licDays === null ? null : licDays < 0 ? { label: "منتهية", color: "bg-rose-100 text-rose-800" } : licDays <= 30 ? { label: `باقي ${licDays} يوم`, color: "bg-amber-100 text-amber-800" } : { label: "سارية", color: "bg-emerald-100 text-emerald-800" };
          const insStatus = insDays === null ? null : insDays < 0 ? { label: "منتهي", color: "bg-rose-100 text-rose-800" } : insDays <= 30 ? { label: `باقي ${insDays} يوم`, color: "bg-amber-100 text-amber-800" } : { label: "ساري", color: "bg-emerald-100 text-emerald-800" };
          return (
            <div key={a.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <AssetHeader asset={a} isAdmin={isAdmin} canEdit={canEdit} updateAssetInfo={updateAssetInfo} deleteAsset={deleteAsset} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="text-xs text-stone-500">سنة الصنع: <b>{a.year_made || "—"}</b></div>
                <div className="text-xs">
                  نهاية الترخيص: {canEdit ? (
                    <input type="date" defaultValue={a.license_expiry || ""} onBlur={(e) => updateAssetField(a.id, "license_expiry", e.target.value)} className="no-print border border-stone-300 rounded px-1 py-0.5 text-xs" />
                  ) : (
                    <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{a.license_expiry || "—"}</b>
                  )}
                  {licStatus && <span className={`mr-2 px-2 py-0.5 rounded-full ${licStatus.color}`}>{licStatus.label}</span>}
                </div>
                <div className="text-xs">
                  نهاية التأمين: {canEdit ? (
                    <input type="date" defaultValue={a.insurance_expiry || ""} onBlur={(e) => updateAssetField(a.id, "insurance_expiry", e.target.value)} className="no-print border border-stone-300 rounded px-1 py-0.5 text-xs" />
                  ) : (
                    <b style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{a.insurance_expiry || "—"}</b>
                  )}
                  {insStatus && <span className={`mr-2 px-2 py-0.5 rounded-full ${insStatus.color}`}>{insStatus.label}</span>}
                </div>
              </div>

              <AssetDocSlots asset={a} canEdit={canEdit} addAssetDocument={addAssetDocument} deleteAssetDocument={deleteAssetDocument} />
            </div>
          );
        })}
      </div>

      <div className="text-lg font-extrabold mt-10 mb-1" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>العدة والأدوات</div>
      <div className="text-sm text-stone-500 mb-4">سجل بالنوع والكمية لمخزون العدة والمواد القابلة لإعادة الاستخدام (أخشاب فرم، شدة معدنية، وغيرها).</div>

      {canEdit && (
        <div className="flex flex-wrap gap-2 mb-4 no-print bg-white border border-stone-200 rounded-lg p-3">
          <input value={newTool.type} onChange={(e) => setNewTool((f) => ({ ...f, type: e.target.value }))} placeholder="النوع (مثال: أخشاب فرم)" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input value={newTool.quantity} onChange={(e) => setNewTool((f) => ({ ...f, quantity: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="الكمية" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={newTool.unit} onChange={(e) => setNewTool((f) => ({ ...f, unit: e.target.value }))} placeholder="الوحدة (لوح، قطعة، طن..)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
          <button onClick={addTool} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة صنف</button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">النوع</th><th className="text-right p-2">الكمية</th><th className="text-right p-2">الوحدة</th>{canEdit && <th className="text-right p-2 no-print"></th>}</tr></thead>
          <tbody>
            {companyTools.length === 0 && (<tr><td colSpan={4} className="text-center text-stone-400 p-4">لا توجد أصناف مسجّلة بعد.</td></tr>)}
            {companyTools.map((t) => (
              <tr key={t.id} className="border-t border-stone-100">
                <td className="p-2 font-bold">{t.type}</td>
                <td className="p-2">
                  {canEdit ? (
                    <input defaultValue={t.quantity} onBlur={(e) => updateToolField(t.id, "quantity", e.target.value.replace(/[^0-9]/g, ""))} className="no-print w-20 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                  ) : (
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{t.quantity}</span>
                  )}
                </td>
                <td className="p-2 text-stone-500">{t.unit || "—"}</td>
                {canEdit && <td className="p-2 no-print"><button onClick={() => deleteTool(t.id)} className="text-rose-600 border border-rose-200 rounded px-1.5 py-1"><Trash2 className="w-3.5 h-3.5" /></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
