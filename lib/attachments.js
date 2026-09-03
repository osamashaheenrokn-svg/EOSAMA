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

export function attachmentDisplayName(path) {
  if (!path) return "";
  return path.split("/").pop().replace(/^[0-9a-f-]{36}-/, "");
}
