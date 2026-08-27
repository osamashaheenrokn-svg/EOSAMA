import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6" dir="rtl">
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-8 max-w-md text-center">
          <div className="font-bold text-lg mb-2">لا يوجد حساب صلاحيات مرتبط بهذا البريد</div>
          <div className="text-sm text-stone-600">
            سجّلت الدخول بنجاح، لكن لا يوجد صف في جدول profiles لمعرّفك. إن كنت أول مستخدم (المدير)، نفّذ في SQL Editor:
          </div>
          <code dir="ltr" className="block bg-stone-100 rounded-lg p-3 text-xs mt-3 text-left" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            insert into public.profiles (id, name, kind)
            <br />
            values (&apos;{user.id}&apos;, &apos;اسمك&apos;, &apos;admin&apos;);
          </code>
        </div>
      </div>
    );
  }

  return <Dashboard profile={profile} userEmail={user.email} />;
}
