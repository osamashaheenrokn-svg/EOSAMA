"use client";

import { Building2, Plus, ChevronRight } from "lucide-react";

function progressColor(pct) {
  if (pct < 40) return { text: "text-rose-700", stroke: "#e11d48" };
  if (pct < 75) return { text: "text-amber-600", stroke: "#d97706" };
  return { text: "text-emerald-700", stroke: "#059669" };
}

export function HomeView({
  isAdmin, sortedProjects, profile, getMembership, showAddProject, setShowAddProject,
  newProjectForm, setNewProjectForm, engineerRoster, addProject, userActionError,
  setActiveId, setTab, setView,
}) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10 mt-4">
        <svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="mb-4">
          <defs>
            <linearGradient id="peakGoldHome" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="200" height="200" rx="32" fill="#0f172a" />
          <g transform="translate(20,26)">
            <rect x="0" y="128" width="160" height="8" rx="4" fill="#f5f5f4" />
            <polygon points="8,128 28,86 48,128" fill="#f5f5f4" opacity="0.55" />
            <polygon points="48,128 78,54 108,128" fill="#f5f5f4" opacity="0.8" />
            <polygon points="108,128 138,20 168,128" fill="url(#peakGoldHome)" />
            <circle cx="138" cy="20" r="6" fill="#0f172a" />
            <line x1="138" y1="20" x2="138" y2="4" stroke="#f5f5f4" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
        <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>شركة قمة الحضارة للمقاولات</h1>
        <div className="text-sm text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>س.ت ١٠١٠٨٤٥٤٧٦ — الرياض، حي طويق — kemetalhadara@gmail.com</div>
        <div className="text-stone-600 mt-3">
          {isAdmin ? "مرحبًا بك، لديك صلاحية الدخول والتحكم الكامل في كل المشروعات." :
           profile.kind === "viewer" ? "مرحبًا بك، يمكنك الاطّلاع على تطورات وصور جميع المشروعات." :
           "مرحبًا بك، اختر موقعك لممارسة صلاحياتك، أو اطّلع على باقي المشروعات."}
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddProject((s) => !s)} className="mt-4 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة مشروع جديد
          </button>
        )}
      </div>

      {isAdmin && showAddProject && (
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
          <div className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>بيانات المشروع الجديد</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <label className="text-xs text-stone-500">
              اسم المشروع
              <input value={newProjectForm.name} onChange={(e) => setNewProjectForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="مثال: برج الواحة - الروضة" />
            </label>
            <label className="text-xs text-stone-500">
              موقع المشروع
              <input value={newProjectForm.location} onChange={(e) => setNewProjectForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="مثال: الرياض، حي الروضة" />
            </label>
            <label className="text-xs text-stone-500">
              مدة المشروع
              <input value={newProjectForm.duration} onChange={(e) => setNewProjectForm((f) => ({ ...f, duration: e.target.value }))} className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="مثال: 12 شهر" />
            </label>
            <label className="text-xs text-stone-500">
              قيمة عقد المشروع
              <input value={newProjectForm.contractValue} onChange={(e) => setNewProjectForm((f) => ({ ...f, contractValue: e.target.value.replace(/[^0-9]/g, "") }))} className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} placeholder="بالريال" />
            </label>
          </div>

          <div className="text-sm font-bold mb-2">المهندس المسؤول عن الموقع</div>
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" checked={newProjectForm.engineerMode === "new"} onChange={() => setNewProjectForm((f) => ({ ...f, engineerMode: "new" }))} />
              مهندس جديد (يُرسل له بريد دعوة لإنشاء كلمة مرور)
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" checked={newProjectForm.engineerMode === "existing"} onChange={() => setNewProjectForm((f) => ({ ...f, engineerMode: "existing" }))} />
              مهندس موجود بالفعل
            </label>
          </div>

          {newProjectForm.engineerMode === "new" ? (
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                value={newProjectForm.newEngineerName}
                onChange={(e) => setNewProjectForm((f) => ({ ...f, newEngineerName: e.target.value }))}
                placeholder="اسم المهندس الجديد (مثال: م. فيصل الحربي)"
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={newProjectForm.newEngineerEmail}
                onChange={(e) => setNewProjectForm((f) => ({ ...f, newEngineerEmail: e.target.value }))}
                placeholder="بريده الإلكتروني"
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ) : (
            <select
              value={newProjectForm.existingEngineerId}
              onChange={(e) => setNewProjectForm((f) => ({ ...f, existingEngineerId: e.target.value }))}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-4"
            >
              <option value="">اختر مهندس...</option>
              {engineerRoster.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
          )}

          {userActionError && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-3">{userActionError}</div>}

          <div className="flex gap-2">
            <button onClick={addProject} className="bg-amber-500 text-slate-900 px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> إضافة المشروع
            </button>
            <button onClick={() => setShowAddProject(false)} className="text-sm text-stone-500 border border-stone-300 rounded-lg px-4 py-2">إلغاء</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedProjects.map((p) => {
          const owned = getMembership(p, profile.id) === "engineer";
          const pc = progressColor(p.progress);
          return (
            <button
              key={p.id}
              onClick={() => { setActiveId(p.id); setTab("updates"); setView("projects"); }}
              className={`text-right bg-white rounded-2xl border-2 p-5 hover:shadow-lg transition-shadow ${owned ? "border-amber-400" : "border-stone-200"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${owned ? "bg-amber-100" : "bg-slate-100"}`}>
                  <Building2 className={`w-7 h-7 ${owned ? "text-amber-600" : "text-slate-500"}`} />
                </div>
                {owned && <span className="text-xs bg-amber-500 text-slate-900 font-bold px-2 py-1 rounded-full">موقعك</span>}
              </div>
              <div className="font-extrabold text-lg mb-1" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{p.name}</div>
              <div className="text-xs text-stone-500 mb-3">{p.location}</div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "جاري" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{p.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${p.progress}%`, backgroundColor: pc.stroke }} />
                </div>
                <span className={`text-xs font-bold ${pc.text}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{p.progress}%</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900 border-t border-stone-100 pt-3">
                دخول {owned ? "وإدارة الموقع" : "للاطّلاع"} <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
