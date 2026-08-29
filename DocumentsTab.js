"use client";

import { useEffect, useState } from "react";
import { Upload, FolderOpen, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSignedUrl } from "@/lib/attachments";

function DocLink({ doc }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    if (doc.attachment_path) {
      getSignedUrl(createClient(), doc.attachment_path).then((u) => { if (active) setUrl(u); }).catch(() => {});
    }
    return () => { active = false; };
  }, [doc.attachment_path]);
  if (!url) return <span>{doc.name}</span>;
  return <a href={url} target="_blank" rel="noreferrer" className="text-amber-700 underline">{doc.name}</a>;
}

export function DocumentsTab({ isOwner, documents, newDocument, setNewDocument, addDocument, deleteDocument }) {
  return (
    <div>
      <div className="text-xs text-stone-500 mb-4">مكان ثابت لملفات المشروع المهمة (غير المالية): عقد العميل، الرخص، المخططات الهندسية.</div>
      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-4 items-center bg-stone-50 border border-stone-200 rounded-lg p-3">
          <select value={newDocument.category} onChange={(e) => setNewDocument((f) => ({ ...f, category: e.target.value }))} className="border border-stone-300 rounded-lg px-2 py-2 text-sm">
            <option>عقد العميل</option>
            <option>رخصة</option>
            <option>مخطط هندسي</option>
            <option>أخرى</option>
          </select>
          <label htmlFor="doc-upload-input" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer">
            <Upload className="w-4 h-4" /> رفع مستند
            <input id="doc-upload-input" type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => e.target.files[0] && addDocument(newDocument.category, e.target.files[0])} />
          </label>
        </div>
      )}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">التصنيف</th><th className="text-right p-2">اسم الملف</th><th className="text-right p-2">التاريخ</th><th className="text-right p-2"></th></tr></thead>
          <tbody>
            {documents.length === 0 && (<tr><td colSpan={4} className="text-center text-stone-400 p-4">لا توجد مستندات مرفوعة بعد.</td></tr>)}
            {documents.map((d) => (
              <tr key={d.id} className="border-t border-stone-100">
                <td className="p-2"><span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full">{d.category}</span></td>
                <td className="p-2 font-bold flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5 text-stone-400" /> <DocLink doc={d} /></td>
                <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{d.date}</td>
                <td className="p-2">{isOwner && <button onClick={() => deleteDocument(d.id)} className="text-rose-600 border border-rose-200 rounded px-1.5 py-1"><Trash2 className="w-3.5 h-3.5" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
