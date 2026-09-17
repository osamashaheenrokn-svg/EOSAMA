// Supabase Storage keys must be ASCII — a file named in Arabic (or any other
// non-Latin script) otherwise fails to upload with no useful error. Strip it
// down to safe characters for the storage path only; the original name is
// kept wherever the caller stores it separately (e.g. project_documents.name).
function sanitizeForStoragePath(filename) {
  const lastDot = filename.lastIndexOf(".");
  const base = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.slice(lastDot) : "";
  const diacritics = new RegExp("[\\u0300-\\u036f]", "g");
  const safeBase = base
    .normalize("NFKD")
    .replace(diacritics, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (safeBase || "file") + ext;
}

export async function uploadAttachment(supabase, projectId, file) {
  const path = `${projectId}/${crypto.randomUUID()}-${sanitizeForStoragePath(file.name)}`;
  const { error } = await supabase.storage.from("attachments").upload(path, file);
  if (error) throw error;
  return path;
}

export async function getSignedUrl(supabase, path) {
  const { data, error } = await supabase.storage.from("attachments").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// One request for every path instead of one request per photo — the photo report tab
// used to open a separate signed-url round trip per thumbnail (and a second one for the
// duplicate print grid), which is what made it feel slow before anything even started
// downloading.
export async function getSignedUrls(supabase, paths) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (uniquePaths.length === 0) return {};
  const { data, error } = await supabase.storage.from("attachments").createSignedUrls(uniquePaths, 3600);
  if (error) throw error;
  const map = {};
  for (const item of data) {
    if (item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

// Site photos come straight off phone cameras (often 3-8MB at 4000px+) but only ever
// render as a small thumbnail or a print tile, so we downscale + re-compress client-side
// before upload instead of shipping the original bytes every time the report is opened.
export async function compressImageFile(file, maxDimension = 1600, quality = 0.82) {
  if (!file.type?.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function attachmentDisplayName(path) {
  if (!path) return "";
  return path.split("/").pop().replace(/^[0-9a-f-]{36}-/, "");
}
