"use client";

import { useEffect, useState } from "react";
import { Camera, Image as ImageIcon, Pencil, Trash2, Check, X } from "lucide-react";
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

function PhotoCard({ photo, isOwner, updatePhotoCaption, deletePhoto }) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(photo.caption || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function save() {
    updatePhotoCaption(photo.id, caption.trim());
    setEditing(false);
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <Photo photo={photo} />
      <div className="p-2">
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="flex-1 border border-stone-300 rounded px-2 py-1 text-xs"
            />
            <button onClick={save} title="حفظ" className="text-emerald-700 border border-emerald-200 rounded px-1.5 py-1">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setEditing(false); setCaption(photo.caption || ""); }} title="إلغاء" className="text-stone-500 border border-stone-300 rounded px-1.5 py-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-stone-600 truncate">{photo.caption || "بدون وصف"}</span>
            {isOwner && (
              confirmingDelete ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => deletePhoto(photo.id)} className="text-[10px] bg-rose-600 text-white rounded px-1.5 py-1 font-bold">تأكيد</button>
                  <button onClick={() => setConfirmingDelete(false)} className="text-[10px] text-stone-500 border border-stone-300 rounded px-1.5 py-1">إلغاء</button>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(true)} title="تعديل الوصف" className="text-slate-500 hover:text-slate-900 border border-stone-300 rounded px-1.5 py-1">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => setConfirmingDelete(true)} title="حذف" className="text-rose-600 hover:text-rose-800 border border-rose-200 rounded px-1.5 py-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhotosTab({ active, isOwner, newPhotoCaption, setNewPhotoCaption, addPhoto, photos, updatePhotoCaption, deletePhoto }) {
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
          <PhotoCard key={ph.id} photo={ph} isOwner={isOwner} updatePhotoCaption={updatePhotoCaption} deletePhoto={deletePhoto} />
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
