"use client";

import { useState } from "react";
import { UserCog, HardHat, UserPlus, Trash2, Users, X, Plus } from "lucide-react";

function DeleteUserButton({ onDelete }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => { onDelete(); setConfirming(false); }} className="text-xs bg-rose-600 text-white rounded px-2 py-1 font-bold">تأكيد الحذف نهائيًا</button>
        <button onClick={() => setConfirming(false)} className="text-xs text-stone-500 border border-stone-300 rounded px-2 py-1">إلغاء</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="text-rose-600 hover:text-rose-800 border border-rose-200 rounded px-2 py-1.5 text-xs flex items-center gap-1">
      <Trash2 className="w-3.5 h-3.5" /> حذف المستخدم
    </button>
  );
}

const KIND_LABELS = { admin: "المدير", engineer: "مهندس", custom: "مستخدم إضافي", viewer: "مشاهد" };

export function UsersView({
  roster, projects, teams, teamDrafts, setTeamDrafts, reassignDrafts, setReassignDrafts,
  newStandaloneEngineer, setNewStandaloneEngineer, newCustomUserForm, setNewCustomUserForm,
  addStandaloneEngineer, addCustomUser, deleteUser, reassignProjectEngineer, addTeamMember, removeTeamMember,
  setUserFlag, userActionError,
}) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <UserCog className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>إدارة المستخدمين</h1>
      </div>
      <div className="text-sm text-stone-500 mb-6">إضافة أو حذف أي مهندس أو مستخدم إضافي، وتحديد صلاحياته بدقة — متاحة للمدير فقط. يُرسل لكل مستخدم جديد بريد دعوة لتعيين كلمة مرور.</div>

      {userActionError && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">{userActionError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-sm font-bold mb-2 flex items-center gap-1.5"><HardHat className="w-4 h-4 text-slate-700" /> إضافة مهندس جديد</div>
          <div className="text-xs text-stone-500 mb-3">يُضاف بدون مشروع مبدئيًا، وتقدر تعيّنه لمشروع من صفحة المشروع نفسه أو من القائمة تحت.</div>
          <div className="flex flex-col gap-2">
            <input value={newStandaloneEngineer.name} onChange={(e) => setNewStandaloneEngineer((f) => ({ ...f, name: e.target.value }))} placeholder="اسم المهندس" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            <input type="email" value={newStandaloneEngineer.email} onChange={(e) => setNewStandaloneEngineer((f) => ({ ...f, email: e.target.value }))} placeholder="بريده الإلكتروني" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={addStandaloneEngineer} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
              <UserPlus className="w-4 h-4" /> إضافة
            </button>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-sm font-bold mb-2 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-slate-700" /> إضافة مستخدم إضافي (محاسب، شريك، مالك..)</div>
          <div className="text-xs text-stone-500 mb-2">غير مرتبط بأي مشروع — يحصل بس على الصلاحيات اللي تحددها له.</div>
          <input value={newCustomUserForm.name} onChange={(e) => setNewCustomUserForm((f) => ({ ...f, name: e.target.value }))} placeholder="اسم المستخدم (مثال: المحاسب العام)" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-2" />
          <input type="email" value={newCustomUserForm.email} onChange={(e) => setNewCustomUserForm((f) => ({ ...f, email: e.target.value }))} placeholder="بريده الإلكتروني" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-2" />
          <div className="flex flex-col gap-1 mb-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newCustomUserForm.reports} onChange={(e) => setNewCustomUserForm((f) => ({ ...f, reports: e.target.checked }))} />
              الاطّلاع على التقارير المالية لكل المشاريع وتنزيلها PDF
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newCustomUserForm.treasury} onChange={(e) => setNewCustomUserForm((f) => ({ ...f, treasury: e.target.checked }))} />
              الاطّلاع على الخزينة الرئيسية
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newCustomUserForm.edit} onChange={(e) => setNewCustomUserForm((f) => ({ ...f, edit: e.target.checked }))} />
              صلاحية التعديل والحذف على العهدة والمصروفات
            </label>
          </div>
          <button onClick={addCustomUser} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
            <UserPlus className="w-4 h-4" /> إضافة المستخدم
          </button>
        </div>
      </div>

      <div className="text-sm font-bold mb-3">كل المستخدمين ({roster.length})</div>
      <div className="space-y-3">
        {roster.length === 0 && <div className="text-stone-400 text-sm">لا يوجد مستخدمون مضافون بعد.</div>}
        {roster.map((u) => {
          const theirProject = u.kind === "engineer" ? projects.find((p) => p.engineer_id === u.id) : null;
          return (
            <div key={u.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {u.kind === "engineer" ? <HardHat className="w-4 h-4 text-slate-500" /> : <UserPlus className="w-4 h-4 text-slate-500" />}
                    {u.name}
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{KIND_LABELS[u.kind]}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {u.kind === "engineer" ? (theirProject ? `مسؤول عن: ${theirProject.name}` : "بانتظار تعيين مشروع") : "غير مرتبط بمشروع"}
                  </div>
                </div>
                {u.kind !== "admin" && <DeleteUserButton onDelete={() => deleteUser(u.id)} />}
              </div>

              {u.kind === "engineer" && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs text-stone-500">نقل/تعيين مشروع:</span>
                  <select
                    value={reassignDrafts[u.id] || ""}
                    onChange={(e) => setReassignDrafts((d) => ({ ...d, [u.id]: e.target.value }))}
                    className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs"
                  >
                    <option value="">اختر مشروع...</option>
                    {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  <button
                    onClick={() => { if (reassignDrafts[u.id]) reassignProjectEngineer(reassignDrafts[u.id], u.id); }}
                    className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    تعيين
                  </button>
                </div>
              )}

              {u.kind !== "admin" && (
                <div className="flex flex-wrap gap-4 text-xs border-t border-stone-100 pt-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={!!u.reports_access} onChange={(e) => setUserFlag(u.id, "reports_access", e.target.checked)} />
                    التقارير المالية لكل المشاريع
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={!!u.treasury_access} onChange={(e) => setUserFlag(u.id, "treasury_access", e.target.checked)} />
                    الخزينة الرئيسية
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={!!u.edit_access} onChange={(e) => setUserFlag(u.id, "edit_access", e.target.checked)} />
                    التعديل والحذف على العهدة والمصروفات
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm font-bold mb-3 mt-8 flex items-center gap-1.5"><Users className="w-4 h-4" /> فرق المشاريع (تعيين أكثر من شخص على نفس المشروع)</div>
      <div className="text-xs text-stone-500 mb-3">تقدر تعيّن أكتر من مهندس على المشروع الكبير، أو تضيف محاسبًا خاصًا بمشروع معيّن يقدر يسجّل بيانات العهدة والمستخلصات ومقاولي الباطن فقط لهذا المشروع.</div>
      <div className="space-y-3">
        {projects.map((p) => {
          const teamDraft = teamDrafts[p.id] || { userId: "", roleType: "engineer" };
          const projectTeam = teams.filter((t) => t.project_id === p.id);
          const availableUsers = roster.filter((r) => r.id !== p.engineer_id && !projectTeam.some((t) => t.user_id === r.id));
          return (
            <div key={p.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="font-bold mb-1" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{p.name}</div>
              <div className="text-xs text-stone-500 mb-2">المهندس الأساسي: {roster.find((r) => r.id === p.engineer_id)?.name || "—"}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {projectTeam.length === 0 && <span className="text-xs text-stone-400">لا يوجد أعضاء إضافيون في الفريق.</span>}
                {projectTeam.map((t) => {
                  const u = roster.find((r) => r.id === t.user_id);
                  return (
                    <span key={t.user_id} className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded-full flex items-center gap-1.5">
                      {u ? u.name : t.user_id} — {t.role_type === "engineer" ? "مهندس إضافي" : "محاسب المشروع"}
                      <button onClick={() => removeTeamMember(p.id, t.user_id)} className="text-stone-400 hover:text-rose-600"><X className="w-3 h-3" /></button>
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={teamDraft.userId}
                  onChange={(e) => setTeamDrafts((d) => ({ ...d, [p.id]: { ...teamDraft, userId: e.target.value } }))}
                  className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="">اختر مستخدم لإضافته للفريق...</option>
                  {availableUsers.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                </select>
                <select
                  value={teamDraft.roleType}
                  onChange={(e) => setTeamDrafts((d) => ({ ...d, [p.id]: { ...teamDraft, roleType: e.target.value } }))}
                  className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="engineer">مهندس إضافي (صلاحية كاملة على المشروع)</option>
                  <option value="accountant">محاسب المشروع (العهدة + المستخلصات + مقاولو الباطن فقط)</option>
                </select>
                <button
                  onClick={() => { if (teamDraft.userId) { addTeamMember(p.id, teamDraft.userId, teamDraft.roleType); setTeamDrafts((d) => ({ ...d, [p.id]: { userId: "", roleType: "engineer" } })); } }}
                  className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة للفريق
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
