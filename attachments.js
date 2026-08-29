export async function uploadAttachment(supabase, projectId, file) {
  const path = `${projectId}/${crypto.randomUUID()}-${file.name}`;
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
