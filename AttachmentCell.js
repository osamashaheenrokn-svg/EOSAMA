"use client";

import { useEffect, useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSignedUrl, attachmentDisplayName } from "@/lib/attachments";

export function AttachmentCell({ path, canEdit, onUpload, inputId }) {
  const [signedUrl, setSignedUrl] = useState(null);

  useEffect(() => {
    let active = true;
    if (path) {
      getSignedUrl(createClient(), path).then((url) => {
        if (active) setSignedUrl(url);
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [path]);

  return (
    <div className="flex items-center gap-2">
      {path ? (
        <a href={signedUrl || "#"} target="_blank" rel="noreferrer" className="text-xs text-amber-700 underline flex items-center gap-1 max-w-[110px] truncate">
          <Paperclip className="w-3 h-3 shrink-0" /> {attachmentDisplayName(path)}
        </a>
      ) : (
        <span className="text-xs text-stone-400">لا يوجد مرفق</span>
      )}
      {canEdit && (
        <label htmlFor={inputId} className="cursor-pointer text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1" title="رفع مرفق (صورة أو PDF)">
          <input id={inputId} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} />
          <Upload className="w-3.5 h-3.5" />
        </label>
      )}
    </div>
  );
}
