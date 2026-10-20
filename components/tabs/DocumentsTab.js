"use client";

import { useEffect, useState } from "react";
import { Download, Eye, FolderOpen, Plus, Ruler, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDownloadUrl, getSignedUrl, isPreviewable } from "@/lib/attachments";

// View (PDF / images only — a browser can't open DWG) and download buttons for one stored file.
function FileActions({ path, name }) {
  const [url, setUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const previewable = isPreviewable(name || path);

  useEffect(() => {
    let active = true;
    if (path && previewable) {
      getSignedUrl(createClient(), path).then((u) => { if (active) setUrl(u); }).catch(() => {});
    }
    return () => { active = false; };
  }, [path, previewable]);

  async function download() {
    setBusy(true);
    try {
      const href = await getDownloadUrl(createClient(), path, name);
      const link = document.createElement("a");
      link.href = href;
      link.download = name || "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("تعذّر تنزيل الملف: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  if (!path) return null;
  const btn = "border border-stone-300 rounded p-1 text-stone-600 hover:text-slate-900 disabled:opacity-40";
  return (
    <span className="no-print inline-flex items-center gap-1 shrink-0">
      {previewable && (
        <a href={url || undefined} target="_blank" rel="noreferrer" className={`${btn} ${url ? "" : "pointer-events-none opacity-40"}`} title="عرض"><Eye className="w-3.5 h-3.5" /></a>
      )}
      <button onClick={download} disabled={busy} className={btn} title="تنزيل"><Download className="w-3.5 h-3.5" /></button>
    </span>
  );
}

function DocumentsSection({ isOwner, documents, newDocument, setNewDocument, addDocument, deleteDocument, documentError }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <FolderOpen className="w-4 h-4 text-amber-600" />
        <div className="font-extrabold">مستندات المشروع</div>
      </div>
      <div className="text-xs text-stone-500 mb-3">ملفات المشروع المهمة (غير المالية): عقد العميل، الرخص، وغيرها. يقبل أي نوع ملف.</div>
      {isOwner && (
        <div className="no-print flex flex-wrap gap-2 mb-3 items-center bg-stone-50 border border-stone-200 rounded-lg p-3">
          <select value={newDocument.category} onChange={(e) => setNewDocument((f) => ({ ...f, category: e.target.value }))} className="border border-stone-300 rounded-lg px-2 py-2 text-sm">
            <option>عقد العميل</option>
            <option>رخصة</option>
            <option>أخرى</option>
          </select>
          <label htmlFor="doc-upload-input" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer">
            <Upload className="w-4 h-4" /> رفع مستند
            <input
              id="doc-upload-input"
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                e.target.value = "";
                if (file) addDocument(newDocument.category, file);
              }}
            />
          </label>
          {documentError && <div className="w-full text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{documentError}</div>}
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">التصنيف</th><th className="text-right p-2">اسم الملف</th><th className="text-right p-2">التاريخ</th><th className="text-right p-2"></th></tr></thead>
          <tbody>
            {documents.length === 0 && (<tr><td colSpan={4} className="text-center text-stone-400 p-4">لا توجد مستندات مرفوعة بعد.</td></tr>)}
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t border-stone-100">
                <td className="p-2 whitespace-nowrap"><span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full">{doc.category}</span></td>
                <td className="p-2 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="break-all">{doc.name}</span>
                    <FileActions path={doc.attachment_path} name={doc.name} />
                  </div>
                </td>
                <td className="p-2 text-stone-500 whitespace-nowrap" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{doc.date}</td>
                <td className="p-2">{isOwner && <button onClick={() => deleteDocument(doc.id)} className="no-print text-rose-600 border border-rose-200 rounded px-1.5 py-1" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Natural order so "A-2" comes before "A-10".
function compareDrawingNumbers(a, b) {
  return (a.drawing_number || "").localeCompare(b.drawing_number || "", "ar", { numeric: true }) ||
    (a.created_at || "").localeCompare(b.created_at || "");
}

function DrawingsSection({ isOwner, drawings, drawingsMissing, addDrawing, updateDrawingField, replaceDrawingFile, deleteDrawing, drawingError }) {
  const empty = { number: "", title: "", description: "", file: null };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const sorted = [...drawings].sort(compareDrawingNumbers);

  async function submit() {
    setSaving(true);
    const ok = await addDrawing(form);
    setSaving(false);
    if (ok) {
      setForm(empty);
      setFileInputKey((k) => k + 1);
    }
  }

  const cellInput = "w-full border border-transparent hover:border-stone-300 focus:border-stone-400 rounded px-1.5 py-1 bg-transparent";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Ruler className="w-4 h-4 text-amber-600" />
        <div className="font-extrabold">مخططات المشروع</div>
      </div>
      <div className="text-xs text-stone-500 mb-3">المخططات الهندسية بأي صيغة (PDF، صور، أوتوكاد DWG / DXF، وغيرها).</div>

      {drawingsMissing && isOwner && (
        <div className="no-print text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
          خانة المخططات تحتاج تحديث قاعدة البيانات: شغّل ملف supabase/migration_7.sql من Supabase SQL Editor.
        </div>
      )}

      {isOwner && !drawingsMissing && (
        <div className="no-print flex flex-wrap gap-2 mb-3 items-end bg-stone-50 border border-stone-200 rounded-lg p-3">
          <label className="text-xs text-stone-500">
            رقم المخطط
            <input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} placeholder="مثال: A-101" className="block w-32 border border-stone-300 rounded-lg px-2 py-2 text-sm text-stone-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          </label>
          <label className="text-xs text-stone-500 flex-1 min-w-[160px]">
            اسم المخطط
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="مثال: مخطط الأساسات" className="block w-full border border-stone-300 rounded-lg px-2 py-2 text-sm text-stone-900" />
          </label>
          <label className="text-xs text-stone-500 flex-1 min-w-[160px]">
            الوصف (اختياري)
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="مثال: نسخة معتمدة من الاستشاري" className="block w-full border border-stone-300 rounded-lg px-2 py-2 text-sm text-stone-900" />
          </label>
          <label className="text-xs text-stone-500">
            المرفق
            <input key={fileInputKey} type="file" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] || null }))} className="block w-56 text-xs border border-stone-300 rounded-lg px-2 py-1.5 bg-white text-stone-900" />
          </label>
          <button onClick={submit} disabled={saving} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "إضافة مخطط"}
          </button>
        </div>
      )}
      {drawingError && <div className="no-print text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-3">{drawingError}</div>}

      <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr>
              <th className="text-right p-2 w-32">رقم المخطط</th>
              <th className="text-right p-2">اسم ووصف المخطط</th>
              <th className="text-right p-2">المرفق</th>
              {isOwner && <th className="text-right p-2 no-print"></th>}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (<tr><td colSpan={4} className="text-center text-stone-400 p-4">لا توجد مخططات مضافة بعد.</td></tr>)}
            {sorted.map((dr) => (
              <tr key={dr.id} className="border-t border-stone-100 align-top">
                <td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                  {isOwner ? (
                    <input key={`n-${dr.id}-${dr.drawing_number}`} defaultValue={dr.drawing_number} onBlur={(e) => updateDrawingField(dr.id, "drawing_number", e.target.value)} placeholder="—" className={`${cellInput} font-bold`} />
                  ) : (
                    <b>{dr.drawing_number || "—"}</b>
                  )}
                </td>
                <td className="p-2">
                  {isOwner ? (
                    <>
                      <input key={`t-${dr.id}-${dr.title}`} defaultValue={dr.title} onBlur={(e) => {
                          if (!e.target.value.trim()) { e.target.value = dr.title; return; }
                          updateDrawingField(dr.id, "title", e.target.value);
                        }} className={`${cellInput} font-bold`} />
                      <input key={`d-${dr.id}-${dr.description}`} defaultValue={dr.description} onBlur={(e) => updateDrawingField(dr.id, "description", e.target.value)} placeholder="إضافة وصف..." className={`${cellInput} text-xs text-stone-500`} />
                    </>
                  ) : (
                    <>
                      <div className="font-bold">{dr.title}</div>
                      {dr.description && <div className="text-xs text-stone-500">{dr.description}</div>}
                    </>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {dr.attachment_path ? (
                      <>
                        <span className="text-xs break-all">{dr.file_name}</span>
                        <FileActions path={dr.attachment_path} name={dr.file_name} />
                      </>
                    ) : (
                      <span className="text-xs text-stone-400">لا يوجد ملف</span>
                    )}
                    {isOwner && (
                      <label htmlFor={`drawing-file-${dr.id}`} className="no-print cursor-pointer text-xs border border-stone-300 rounded px-2 py-1 flex items-center gap-1 text-stone-600 hover:text-slate-900" title={dr.attachment_path ? "استبدال الملف" : "رفع ملف"}>
                        <Upload className="w-3.5 h-3.5" /> {dr.attachment_path ? "استبدال" : "رفع"}
                        <input
                          id={`drawing-file-${dr.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            e.target.value = "";
                            if (file && (!dr.attachment_path || confirm("استبدال ملف المخطط الحالي بالملف الجديد؟"))) replaceDrawingFile(dr.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </td>
                {isOwner && (
                  <td className="p-2 no-print">
                    <button onClick={() => deleteDrawing(dr.id)} className="text-rose-600 border border-rose-200 rounded px-1.5 py-1" title="حذف المخطط"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentsTab({
  isOwner, documents, newDocument, setNewDocument, addDocument, deleteDocument, documentError,
  drawings = [], drawingsMissing = false, addDrawing, updateDrawingField, replaceDrawingFile, deleteDrawing, drawingError,
}) {
  return (
    <div className="space-y-8">
      <DocumentsSection
        isOwner={isOwner} documents={documents} newDocument={newDocument} setNewDocument={setNewDocument}
        addDocument={addDocument} deleteDocument={deleteDocument} documentError={documentError}
      />
      <DrawingsSection
        isOwner={isOwner} drawings={drawings} drawingsMissing={drawingsMissing} addDrawing={addDrawing}
        updateDrawingField={updateDrawingField} replaceDrawingFile={replaceDrawingFile} deleteDrawing={deleteDrawing} drawingError={drawingError}
      />
    </div>
  );
}
