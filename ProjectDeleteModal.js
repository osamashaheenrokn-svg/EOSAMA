"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ProjectDeleteModal({ project, onConfirm, onClose }) {
  const [typed, setTyped] = useState("");
  if (!project) return null;
  const matches = typed.trim() === project.name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold">
            <AlertTriangle className="w-5 h-5" /> حذف المشروع نهائيًا
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-stone-600 mb-4 leading-relaxed">
          سيتم حذف مشروع <span className="font-bold text-stone-900">&quot;{project.name}&quot;</span> نهائيًا، مع كل بياناته: التحديثات
          والصور والعهدة والعمالة والطاقم الفني ورواتبهم ومقاولو الباطن والإيرادات والجدول الزمني والمستندات وسجل الجودة.
          <br />
          <span className="font-bold text-rose-700">هذا الإجراء لا يمكن التراجع عنه.</span> لو المشروع منتهى بس عايز تحتفظ ببياناته، استخدم
          &quot;أرشفة&quot; بدل الحذف.
        </div>

        <label className="text-xs text-stone-500 block mb-1.5">
          للتأكيد، اكتب اسم المشروع بالكامل: <span className="font-bold text-stone-800">{project.name}</span>
        </label>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-4"
          placeholder={project.name}
          autoFocus
        />

        <div className="flex gap-2">
          <button
            disabled={!matches}
            onClick={() => onConfirm(project.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold ${matches ? "bg-rose-600 text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
          >
            حذف المشروع نهائيًا
          </button>
          <button onClick={onClose} className="text-sm text-stone-500 border border-stone-300 rounded-lg px-4 py-2">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
