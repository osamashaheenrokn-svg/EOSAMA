import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مسجّل الدخول" };
  const { data: profile } = await supabase.from("profiles").select("kind").eq("id", user.id).single();
  if (profile?.kind !== "admin") return { error: "هذا الإجراء متاح للمدير فقط" };
  return { supabase };
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createSupabaseJsClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 403 });

  const admin = serviceClient();
  if (!admin) {
    return NextResponse.json(
      { error: "ميزة إدارة المستخدمين تحتاج SUPABASE_SERVICE_ROLE_KEY في متغيرات البيئة." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const { name, email, kind, treasuryAccess, editAccess, reportsAccess } = body;
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "الاسم والبريد الإلكتروني مطلوبان" }, { status: 400 });
    }
    const redirectTo = `${new URL(request.url).origin}/set-password`;
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email.trim(), { redirectTo });
    if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 400 });

    const { error: profileError } = await admin.from("profiles").insert({
      id: invited.user.id,
      name: name.trim(),
      kind,
      treasury_access: !!treasuryAccess,
      edit_access: !!editAccess,
      reports_access: !!reportsAccess,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(invited.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
    return NextResponse.json({ id: invited.user.id });
  }

  if (action === "delete") {
    const { userId } = body;
    const { error: delError } = await admin.auth.admin.deleteUser(userId);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
}
