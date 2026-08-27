"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export function RowActions({ canManage, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  if (!canManage) return null;
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button onClick={onEdit} title="تعديل" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {confirming ? (
        <>
          <button onClick={() => { onDelete(); setConfirming(false); }} className="text-xs bg-rose-600 text-white rounded px-2 py-1 font-bold">
            تأكيد الحذف
          </button>
          <button onClick={() => setConfirming(false)} className="text-xs text-stone-500 border border-stone-300 rounded px-2 py-1">
            إلغاء
          </button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} title="حذف" className="text-rose-600 hover:text-rose-800 border border-rose-200 rounded px-1.5 py-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
