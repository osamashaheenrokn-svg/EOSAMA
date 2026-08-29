"use client";

import { useEffect, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSignedUrl } from "@/lib/attachments";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";

function Photo({ photo }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    if (photo.attachment_path) {
      getSignedUrl(createClient(), photo.attachment_path).then((u) => { if (active) setUrl(u); }).catch(() => {});
    }
    return () => { active = false; };
  }, [photo.attachment_path]);

  if (!url) return <div className="h-40 bg-stone-200 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-stone-400" /></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={photo.caption} className="w-full h-40 object-cover" />;
}

export function PhotosTab({ active, isOwner, newPhotoCaption, setNewPhotoCaption, addPhoto, photos }) {
  return (
    <div className="print-area">
      <PrintHeader title={`التقرير المصور — ${active.name}`} />
      <PrintButton />
      {isOwner && (
        <div className="flex flex-wrap gap-2 mb-4 items-center no-print">
          <input value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} placeholder="وصف الصورة (مثال: صب سقف الدور الثاني)" className="flex-1 min-w-[200px] border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <label htmlFor="photo-upload-input" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer">
            <Camera className="w-4 h-4" /> رفع صورة
            <input id="photo-upload-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && addPhoto(e.target.files[0])} />
          </label>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 no-print">
        {photos.length === 0 && <div className="text-stone-400 text-sm col-span-3">لا توجد صور بعد.</div>}
        {photos.map((ph) => (
          <div key={ph.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <Photo photo={ph} />
            <div className="p-2 text-xs text-stone-600">{ph.caption || "بدون وصف"}</div>
          </div>
        ))}
      </div>

      <div className="print-photos-grid">
        <div className="text-xs text-stone-500 mb-2">آخر {Math.min(8, photos.length)} صور مرفوعة للمشروع</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {photos.slice(0, 8).map((ph) => (
            <div key={ph.id} className="border border-stone-300 rounded overflow-hidden">
              <Photo photo={ph} />
              <div className="p-1 text-xs text-stone-600">{ph.caption || "بدون وصف"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
