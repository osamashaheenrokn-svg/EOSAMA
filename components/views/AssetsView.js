"use client";

import { ClipboardCheck, Plus, Trash2, Upload } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { daysUntil } from "@/lib/db";

export function AssetsView({
  companyAssets, newAsset, setNewAsset, addAsset, updateAssetField, deleteAsset, addAssetDocument, deleteAssetDocument,
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

      <div className="space-y-3">
        {companyAssets.length === 0 && <div className="text-stone-400 text-sm">لا توجد أصول مسجّلة بعد.</div>}
        {companyAssets.map((a) => {
          const licDays = daysUntil(a.license_expiry);
          const insDays = daysUntil(a.insurance_expiry);
          const licStatus = licDays === null ? null : licDays < 0 ? { label: "منتهية", color: "bg-rose-100 text-rose-800" } : licDays <= 30 ? { label: `باقي ${licDays} يوم`, color: "bg-amber-100 text-amber-800" } : { label: "سارية", color: "bg-emerald-100 text-emerald-800" };
          const insStatus = insDays === null ? null : insDays < 0 ? { label: "منتهي", color: "bg-rose-100 text-rose-800" } : insDays <= 30 ? { label: `باقي ${insDays} يوم`, color: "bg-amber-100 text-amber-800" } : { label: "ساري", color: "bg-emerald-100 text-emerald-800" };
          return (
            <div key={a.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="font-bold">{a.type} <span className="text-xs text-stone-400 font-normal">— {a.number}</span></div>
                <button onClick={() => deleteAsset(a.id)} className="no-print text-rose-600 border border-rose-200 rounded px-2 py-1 text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="text-xs text-stone-500">سنة الصنع: <b>{a.year_made || "—"}</b></div>
                <div className="text-xs">
                  نهاية الترخيص: <input type="date" defaultValue={a.license_expiry || ""} onBlur={(e) => updateAssetField(a.id, "license_expiry", e.target.value)} className="no-print border border-stone-300 rounded px-1 py-0.5 text-xs" />
                  {licStatus && <span className={`mr-2 px-2 py-0.5 rounded-full ${licStatus.color}`}>{licStatus.label}</span>}
                </div>
                <div className="text-xs">
                  نهاية التأمين: <input type="date" defaultValue={a.insurance_expiry || ""} onBlur={(e) => updateAssetField(a.id, "insurance_expiry", e.target.value)} className="no-print border border-stone-300 rounded px-1 py-0.5 text-xs" />
                  {insStatus && <span className={`mr-2 px-2 py-0.5 rounded-full ${insStatus.color}`}>{insStatus.label}</span>}
                </div>
              </div>

              <div className="text-xs font-bold mb-1.5">المستندات (الاستمارة، الرخصة، أوراق السيارة)</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(a.asset_documents || []).length === 0 && <span className="text-xs text-stone-400">لا توجد مستندات مرفوعة.</span>}
                {(a.asset_documents || []).map((d) => (
                  <span key={d.id} className="text-xs bg-stone-100 px-2 py-1 rounded-full flex items-center gap-1.5">
                    {d.name}
                    <button onClick={() => deleteAssetDocument(a.id, d.id)} className="no-print text-stone-400 hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
              <label className="no-print inline-flex items-center gap-1.5 text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> رفع مستند
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files[0] && addAssetDocument(a.id, e.target.files[0])} />
              </label>
            </div>
          );
        })}
      </div>

      <div className="text-lg font-extrabold mt-10 mb-1" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>العدة والأدوات</div>
      <div className="text-sm text-stone-500 mb-4">سجل بالنوع والكمية لمخزون العدة والمواد القابلة لإعادة الاستخدام (أخشاب فرم، شدة معدنية، وغيرها).</div>

      <div className="flex flex-wrap gap-2 mb-4 no-print bg-white border border-stone-200 rounded-lg p-3">
        <input value={newTool.type} onChange={(e) => setNewTool((f) => ({ ...f, type: e.target.value }))} placeholder="النوع (مثال: أخشاب فرم)" className="flex-1 min-w-[160px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        <input value={newTool.quantity} onChange={(e) => setNewTool((f) => ({ ...f, quantity: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="الكمية" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
        <input value={newTool.unit} onChange={(e) => setNewTool((f) => ({ ...f, unit: e.target.value }))} placeholder="الوحدة (لوح، قطعة، طن..)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40" />
        <button onClick={addTool} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة صنف</button>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">النوع</th><th className="text-right p-2">الكمية</th><th className="text-right p-2">الوحدة</th><th className="text-right p-2 no-print"></th></tr></thead>
          <tbody>
            {companyTools.length === 0 && (<tr><td colSpan={4} className="text-center text-stone-400 p-4">لا توجد أصناف مسجّلة بعد.</td></tr>)}
            {companyTools.map((t) => (
              <tr key={t.id} className="border-t border-stone-100">
                <td className="p-2 font-bold">{t.type}</td>
                <td className="p-2">
                  <input defaultValue={t.quantity} onBlur={(e) => updateToolField(t.id, "quantity", e.target.value.replace(/[^0-9]/g, ""))} className="no-print w-20 border border-stone-300 rounded px-2 py-1 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                </td>
                <td className="p-2 text-stone-500">{t.unit || "—"}</td>
                <td className="p-2 no-print"><button onClick={() => deleteTool(t.id)} className="text-rose-600 border border-rose-200 rounded px-1.5 py-1"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
