"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  Camera, Wallet, Lock, Plus, ChevronLeft,
  Users, Vault, BarChart3, AlertTriangle, Printer,
  Home, HardHat as SubIcon, FileSpreadsheet, UserCog, LogOut,
  History, CalendarClock, FolderOpen, ClipboardCheck, Send, MapPin, Globe, ShieldAlert, UserPlus, Receipt, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchProfiles, fetchProjects, fetchAllTeams, fetchTreasury, fetchProjectDetail, fetchCompanyFinancials, sum,
  fetchCompanySettings, fetchPendingApprovals, fetchCompanyAssets, fetchCompanyTools, fetchLeads, fetchAuditLog, logAction as logActionDb, daysUntil,
  staffMonthlyTotal, staffPaidTotal, staffOverdueTotal, staffStatus, currentMonthKey,
} from "@/lib/db";
import { uploadAttachment } from "@/lib/attachments";
import { HomeView } from "./views/HomeView";
import { ProjectDeleteModal } from "./ProjectDeleteModal";
import { UsersView } from "./views/UsersView";
import { CompanyView } from "./views/CompanyView";
import { NeedsView } from "./views/NeedsView";
import { TreasuryView } from "./views/TreasuryView";
import { AuditView } from "./views/AuditView";
import { ApprovalsView } from "./views/ApprovalsView";
import { LeadsView } from "./views/LeadsView";
import { MapView } from "./views/MapView";
import { AssetsView } from "./views/AssetsView";
import { PeriodicView } from "./views/PeriodicView";
import { CompareView } from "./views/CompareView";
import { NotificationsBell } from "./NotificationsBell";
import { MoreMenu } from "./MoreMenu";
import { UpdatesTab } from "./tabs/UpdatesTab";
import { PhotosTab } from "./tabs/PhotosTab";
import { StaffTab } from "./tabs/StaffTab";
import { TimelineTab } from "./tabs/TimelineTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { QaTab } from "./tabs/QaTab";
import { CustodyTab } from "./tabs/CustodyTab";
import { LaborTab } from "./tabs/LaborTab";
import { TotalsTab } from "./tabs/TotalsTab";
import { RevenuesTab } from "./tabs/RevenuesTab";
import { SubcontractorsTab } from "./tabs/SubcontractorsTab";
import { FinancialTab } from "./tabs/FinancialTab";
import { SummaryTab } from "./tabs/SummaryTab";

const TABS = [
  { id: "updates", label: "تطورات المشروع", icon: ChevronLeft, ownerOnly: false },
  { id: "custody", label: "العهدة المصروفة", icon: Wallet, ownerOnly: true, accountantOk: true },
  { id: "labor", label: "تقرير العمالة اليومي", icon: Users, ownerOnly: true },
  { id: "staff", label: "الطاقم الفني", icon: UserCog, ownerOnly: true },
  { id: "photos", label: "تقرير مصور", icon: Camera, ownerOnly: false },
  { id: "subcontractors", label: "مقاولو الباطن والتوريدات", icon: SubIcon, ownerOnly: true, accountantOk: true },
  { id: "timeline", label: "الجدول الزمني", icon: CalendarClock, ownerOnly: false },
  { id: "documents", label: "مستندات المشروع", icon: FolderOpen, ownerOnly: false },
  { id: "qa", label: "سجل تدقيق الجودة", icon: ClipboardCheck, ownerOnly: false },
  { id: "revenues", label: "المستخلصات", icon: Receipt, ownerOnly: true, accountantOk: true },
  { id: "totals", label: "إجمالي مصروفات المشروع", icon: Vault, ownerOnly: true, accountantOk: true },
  { id: "financial", label: "التقرير المالي الشامل", icon: FileSpreadsheet, ownerOnly: true, accountantOk: true },
  { id: "summary", label: "تقرير مختصر", icon: Printer, ownerOnly: true },
];

const KIND_LABELS = { admin: "المدير", engineer: "مهندس", custom: "مستخدم إضافي", viewer: "مشاهد" };

function progressColor(pct) {
  if (pct < 40) return { text: "text-rose-700", stroke: "#e11d48", bg: "bg-rose-50", border: "border-rose-200" };
  if (pct < 75) return { text: "text-amber-600", stroke: "#d97706", bg: "bg-amber-50", border: "border-amber-200" };
  return { text: "text-emerald-700", stroke: "#059669", bg: "bg-emerald-50", border: "border-emerald-200" };
}

export function Dashboard({ profile, userEmail }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [roster, setRoster] = useState([]);
  const [teams, setTeams] = useState([]);
  const [treasuryData, setTreasuryData] = useState({ treasury: null, deposits: [], withdrawals: [] });
  const [companyFinancials, setCompanyFinancials] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [view, setView] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("updates");
  const [detail, setDetail] = useState(null);

  const [showAddProject, setShowAddProject] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({ name: "", location: "", duration: "", contractValue: "", engineerMode: "new", existingEngineerId: "", newEngineerName: "", newEngineerEmail: "" });
  const [newStandaloneEngineer, setNewStandaloneEngineer] = useState({ name: "", email: "" });
  const [newCustomUserForm, setNewCustomUserForm] = useState({ name: "", email: "", treasury: false, reports: false, edit: false });
  const [reassignDrafts, setReassignDrafts] = useState({});
  const [teamDrafts, setTeamDrafts] = useState({});
  const [userActionError, setUserActionError] = useState("");

  const [newDeposit, setNewDeposit] = useState({ amount: "", desc: "" });
  const [newWithdrawal, setNewWithdrawal] = useState({ amount: "", notes: "" });
  const [importMessage, setImportMessage] = useState("");

  const [newUpdate, setNewUpdate] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newCustodyReceived, setNewCustodyReceived] = useState({ number: "", date: "", amount: "" });
  const [newCustodySpent, setNewCustodySpent] = useState({ fileNumber: "", week: "", from: "", to: "", amount: "" });
  const [newLaborCost, setNewLaborCost] = useState({ week: "", from: "", to: "", count: "", cost: "", notes: "" });
  const [newLaborPayment, setNewLaborPayment] = useState({ paymentNumber: "", date: "", amount: "" });
  const [newStaffMember, setNewStaffMember] = useState({ name: "", role: "", monthlySalary: "", startDate: "" });
  const [newRevenue, setNewRevenue] = useState({ number: "", amount: "", notes: "" });
  const [newSubcontractor, setNewSubcontractor] = useState({ name: "", scope: "" });
  const [newPhase, setNewPhase] = useState({ name: "", plannedStart: "", plannedEnd: "" });
  const [newDocument, setNewDocument] = useState({ category: "عقد العميل" });
  const [documentError, setDocumentError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [newQaItem, setNewQaItem] = useState({ phase: "", item: "" });

  const [lang, setLang] = useState("ar");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [companyAssets, setCompanyAssets] = useState([]);
  const [companyTools, setCompanyTools] = useState([]);
  const [leads, setLeads] = useState([]);
  const [newAsset, setNewAsset] = useState({ type: "", number: "", yearMade: "", licenseExpiry: "", insuranceExpiry: "" });
  const [newTool, setNewTool] = useState({ type: "", quantity: "", unit: "" });
  const [newLead, setNewLead] = useState({ name: "", phone: "", notes: "" });

  const isAdmin = profile.kind === "admin";

  const reloadProjects = useCallback(async () => setProjects(await fetchProjects(supabase)), [supabase]);
  const reloadRoster = useCallback(async () => setRoster(await fetchProfiles(supabase)), [supabase]);
  const reloadTeams = useCallback(async () => setTeams(await fetchAllTeams(supabase)), [supabase]);
  const reloadTreasuryData = useCallback(async () => setTreasuryData(await fetchTreasury(supabase)), [supabase]);
  const reloadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetail(await fetchProjectDetail(supabase, id));
  }, [supabase]);
  const reloadCompanySettings = useCallback(async () => setCompanySettings(await fetchCompanySettings(supabase)), [supabase]);
  const reloadPendingApprovals = useCallback(async () => setPendingApprovals(await fetchPendingApprovals(supabase)), [supabase]);
  const reloadCompanyAssets = useCallback(async () => setCompanyAssets(await fetchCompanyAssets(supabase)), [supabase]);
  const reloadCompanyTools = useCallback(async () => setCompanyTools(await fetchCompanyTools(supabase)), [supabase]);
  const reloadLeads = useCallback(async () => setLeads(await fetchLeads(supabase)), [supabase]);
  const reloadAuditLog = useCallback(async () => setAuditLog(await fetchAuditLog(supabase)), [supabase]);

  useEffect(() => {
    (async () => {
      await Promise.all([reloadProjects(), reloadRoster(), reloadTeams(), reloadCompanySettings()]);
      setLoadingInitial(false);
    })();
  }, [reloadProjects, reloadRoster, reloadTeams, reloadCompanySettings]);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      await reloadDetail(activeId);
    })();
  }, [activeId, reloadDetail]);

  const active = projects.find((p) => p.id === activeId) || null;

  function getMembership(project, userId) {
    if (!project) return null;
    if (project.engineer_id === userId) return "engineer";
    const m = teams.find((t) => t.project_id === project.id && t.user_id === userId);
    return m ? m.role_type : null;
  }

  const isOwner = isAdmin || getMembership(active, profile.id) === "engineer";
  const isProjectAccountant = getMembership(active, profile.id) === "accountant";
  const canAccessLimited = isOwner || isProjectAccountant;
  const canSeeTreasury = isAdmin || profile.treasury_access;
  const canEditDelete = isAdmin || profile.edit_access;
  const canViewAllFinance = isAdmin || profile.reports_access;

  useEffect(() => {
    if (!canSeeTreasury) return;
    (async () => {
      await reloadTreasuryData();
    })();
  }, [canSeeTreasury, reloadTreasuryData]);

  useEffect(() => {
    if ((canSeeTreasury || canViewAllFinance) && projects.length) {
      fetchCompanyFinancials(supabase, projects).then(setCompanyFinancials).catch(() => setCompanyFinancials([]));
    }
  }, [canSeeTreasury, canViewAllFinance, projects, supabase]);

  useEffect(() => {
    if (!canViewAllFinance) return;
    (async () => { await reloadCompanyAssets(); })();
  }, [canViewAllFinance, reloadCompanyAssets]);

  useEffect(() => {
    if (!(isAdmin && view === "approvals")) return;
    (async () => { await reloadPendingApprovals(); })();
  }, [isAdmin, view, reloadPendingApprovals]);

  useEffect(() => {
    if (!(isAdmin && view === "assets")) return;
    (async () => { await reloadCompanyTools(); })();
  }, [isAdmin, view, reloadCompanyTools]);

  useEffect(() => {
    if (!(isAdmin && view === "leads")) return;
    (async () => { await reloadLeads(); })();
  }, [isAdmin, view, reloadLeads]);

  useEffect(() => {
    if (!(isAdmin && view === "audit")) return;
    (async () => { await reloadAuditLog(); })();
  }, [isAdmin, view, reloadAuditLog]);

  const visibleTabs = TABS.filter((t) => !t.ownerOnly || isOwner || canViewAllFinance || (t.accountantOk && isProjectAccountant));
  const effectiveTab = visibleTabs.find((t) => t.id === tab) ? tab : "updates";

  const sortedProjects = [...projects].filter((p) => !p.archived).sort((a, b) => {
    const aOwn = getMembership(a, profile.id) === "engineer" ? 0 : 1;
    const bOwn = getMembership(b, profile.id) === "engineer" ? 0 : 1;
    return aOwn - bOwn;
  });
  const archivedProjects = projects.filter((p) => p.archived);

  const engineerRoster = roster.filter((r) => r.kind === "engineer");
  const grantableRoster = roster.filter((r) => r.id !== profile.id);

  async function logAction(action) {
    await logActionDb(supabase, profile, action);
    if (view === "audit") reloadAuditLog();
  }

  const notifications = [
    ...companyFinancials.filter((n) => n.totalNeeded > 0).map((n) => ({
      id: `need-${n.id}`, projectId: n.id, level: "danger",
      text: `مشروع "${n.name}" محتاج تغطية ${n.totalNeeded.toLocaleString()} ر.س (عهدة/عمالة/مقاولين)`,
    })),
    ...companyFinancials.filter((f) => f.profit < 0).map((f) => ({
      id: `loss-${f.id}`, projectId: f.id, level: "danger",
      text: `مشروع "${f.name}" بيحقق خسارة حاليًا (${f.profit.toLocaleString()} ر.س)`,
    })),
    ...projects.filter((p) => p.pending_billing > 0).map((p) => ({
      id: `bill-${p.id}`, projectId: p.id, level: "warning",
      text: `مشروع "${p.name}" فيه أعمال منتهية بقيمة ${Number(p.pending_billing).toLocaleString()} ر.س لسه ما اتفوترتش`,
    })),
    ...companyAssets.filter((a) => a.license_expiry && daysUntil(a.license_expiry) <= 30).map((a) => {
      const dd = daysUntil(a.license_expiry);
      return { id: `lic-${a.id}`, targetView: "assets", level: dd < 0 ? "danger" : "warning", text: `رخصة "${a.type}" (${a.number}) ${dd < 0 ? "منتهية من " + Math.abs(dd) + " يوم" : "هتنتهي خلال " + dd + " يوم"}` };
    }),
    ...companyAssets.filter((a) => a.insurance_expiry && daysUntil(a.insurance_expiry) <= 30).map((a) => {
      const dd = daysUntil(a.insurance_expiry);
      return { id: `ins-${a.id}`, targetView: "assets", level: dd < 0 ? "danger" : "warning", text: `تأمين "${a.type}" (${a.number}) ${dd < 0 ? "منتهي من " + Math.abs(dd) + " يوم" : "هينتهي خلال " + dd + " يوم"}` };
    }),
  ];
  const visibleNotifications = canViewAllFinance ? notifications : [];

  // ---- active-project aggregates ----
  const d = detail || { updates: [], photos: [], custodyReceived: [], custodySpent: [], laborCosts: [], laborPayments: [], staff: [], revenues: [], subcontractors: [], phases: [], documents: [], qaChecklist: [] };
  const projCustodyReceived = sum(d.custodyReceived, "amount");
  const projCustodySpent = sum(d.custodySpent, "amount");
  const projLaborCost = sum(d.laborCosts, "cost");
  const projLaborPaid = sum(d.laborPayments, "amount");
  const projStaffMonthly = staffMonthlyTotal(d.staff);
  const projStaffPaid = staffPaidTotal(d.staff);
  const projStaffOverdue = staffOverdueTotal(d.staff);
  const projSubClaims = d.subcontractors.reduce((a, s) => a + sum(s.subcontractor_claims, "amount"), 0);
  const projSubPaid = d.subcontractors.reduce((a, s) => a + sum(s.subcontractor_payments, "amount"), 0);
  const projGrandTotal = projCustodySpent + projLaborCost + projStaffMonthly + projSubClaims;
  const projRevenue = sum(d.revenues, "amount");
  const projProfit = projRevenue - projGrandTotal;
  const projProfitPercent = projRevenue !== 0 ? (projProfit / projRevenue) * 100 : 0;

  // ---- treasury derived numbers ----
  const t = treasuryData.treasury;
  const autoDeposits = sum(treasuryData.deposits, "amount");
  const autoWithdrawals = sum(treasuryData.withdrawals, "amount");
  const totalDeposits = t?.override_capital_paid ?? autoDeposits;
  const totalWithdrawals = t?.override_capital_returned ?? autoWithdrawals;
  const netInvested = totalDeposits - totalWithdrawals;
  const custodyRemaining = Number(t?.cash_custody_remaining || 0) + Number(t?.company_sheet_remaining || 0);
  const overdueCustodyTotal = sum(companyFinancials, "custodyNeeded");
  const overdueLaborTotal = sum(companyFinancials, "laborNeeded");
  const overdueSubcontractorsTotal = sum(companyFinancials, "subcontractorsNeeded");
  const overdueTax = Number(t?.overdue_tax || 0);
  const otherPendingAmount = Number(t?.other_pending_amount || 0);
  const totalOverdueAmounts = overdueCustodyTotal + overdueLaborTotal + overdueSubcontractorsTotal + overdueTax + otherPendingAmount;
  const autoNetProfit = Number(t?.external_claims || 0) + custodyRemaining - netInvested - totalOverdueAmounts;
  const netProfit = t?.override_net_profit ?? autoNetProfit;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // ---------------- mutations: project fields ----------------
  async function setProjectField(key, value) {
    await supabase.from("projects").update({ [key]: value }).eq("id", activeId);
    reloadProjects();
  }

  // ---------------- mutations: updates / photos ----------------
  async function addUpdate() {
    if (!newUpdate.trim()) return;
    await supabase.from("updates").insert({ project_id: activeId, text: newUpdate.trim(), date: new Date().toISOString().slice(0, 10) });
    setNewUpdate("");
    reloadDetail(activeId);
  }

  async function addPhoto(file) {
    if (!file) return;
    const path = await uploadAttachment(supabase, activeId, file);
    await supabase.from("photos").insert({ project_id: activeId, caption: newPhotoCaption.trim(), attachment_path: path });
    setNewPhotoCaption("");
    reloadDetail(activeId);
  }
  async function updatePhotoCaption(photoId, caption) {
    await supabase.from("photos").update({ caption }).eq("id", photoId);
    reloadDetail(activeId);
  }

  // ---------------- generic entry helpers ----------------
  async function insertRow(table, row) {
    try {
      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر الحفظ. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }
  async function updateRow(table, id, fields) {
    try {
      const { error } = await supabase.from(table).update(fields).eq("id", id);
      if (error) throw error;
      logAction(`تعديل بند في (${table}) — ${active?.name}`);
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر حفظ التعديل. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }
  async function deleteRow(table, id) {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      logAction(`حذف بند من (${table}) — ${active?.name}`);
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر الحذف. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }
  async function attachFile(table, id, file) {
    try {
      const path = await uploadAttachment(supabase, activeId, file);
      const { error } = await supabase.from(table).update({ attachment_path: path }).eq("id", id);
      if (error) throw error;
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر رفع المرفق. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }

  async function addCustodyReceived() {
    if (!newCustodyReceived.number || !newCustodyReceived.date || !newCustodyReceived.amount) return;
    await insertRow("custody_received", { project_id: activeId, number: Number(newCustodyReceived.number), date: newCustodyReceived.date, amount: Number(newCustodyReceived.amount) });
    logAction(`إضافة عهدة مستلمة رقم ${newCustodyReceived.number} بمبلغ ${Number(newCustodyReceived.amount).toLocaleString()} ر.س — ${active?.name}`);
    setNewCustodyReceived({ number: "", date: "", amount: "" });
  }
  async function addCustodySpent() {
    if (!newCustodySpent.fileNumber || !newCustodySpent.week || !newCustodySpent.amount) return;
    const amount = Number(newCustodySpent.amount);
    const entry = { file_number: Number(newCustodySpent.fileNumber), week: Number(newCustodySpent.week), from_date: newCustodySpent.from || null, to_date: newCustodySpent.to || null, amount };
    const threshold = Number(companySettings?.approval_threshold ?? Infinity);
    if (!isAdmin && amount > threshold) {
      try {
        const { error } = await supabase.from("pending_approvals").insert({
          project_id: activeId, type: "custody_spent", entry, amount,
          requested_by: profile.id, requested_by_name: profile.name,
        });
        if (error) throw error;
        logAction(`طلب موافقة على صرف عهدة بمبلغ ${amount.toLocaleString()} ر.س (فوق حد الموافقة) — ${active?.name}`);
      } catch {
        setSaveError("تعذّر إرسال طلب الموافقة. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
        return;
      }
    } else {
      await insertRow("custody_spent", { project_id: activeId, ...entry });
      logAction(`تسجيل مصروف عهدة (ملف ${newCustodySpent.fileNumber}) بمبلغ ${amount.toLocaleString()} ر.س — ${active?.name}`);
    }
    setNewCustodySpent({ fileNumber: "", week: "", from: "", to: "", amount: "" });
  }
  async function approveRequest(req) {
    await supabase.from("custody_spent").insert({ project_id: req.project_id, ...req.entry });
    await supabase.from("pending_approvals").delete().eq("id", req.id);
    logAction(`موافقة على صرف بمبلغ ${Number(req.amount).toLocaleString()} ر.س — ${projects.find((p) => p.id === req.project_id)?.name}`);
    reloadPendingApprovals();
    if (req.project_id === activeId) reloadDetail(activeId);
  }
  async function rejectRequest(req) {
    await supabase.from("pending_approvals").delete().eq("id", req.id);
    logAction(`رفض طلب صرف بمبلغ ${Number(req.amount).toLocaleString()} ر.س — ${projects.find((p) => p.id === req.project_id)?.name}`);
    reloadPendingApprovals();
  }
  async function setApprovalThreshold(value) {
    await supabase.from("company_settings").update({ approval_threshold: value }).eq("id", 1);
    reloadCompanySettings();
  }
  async function setPeriodicSetting(key, value) {
    await supabase.from("company_settings").update({ [key]: value }).eq("id", 1);
    reloadCompanySettings();
  }
  async function addLaborCost() {
    if (!newLaborCost.week || !newLaborCost.count || !newLaborCost.cost) return;
    await insertRow("labor_costs", { project_id: activeId, week: Number(newLaborCost.week), from_date: newLaborCost.from || null, to_date: newLaborCost.to || null, count: Number(newLaborCost.count), cost: Number(newLaborCost.cost), notes: newLaborCost.notes.trim() });
    logAction(`تسجيل تكلفة عمالة الأسبوع ${newLaborCost.week} بمبلغ ${Number(newLaborCost.cost).toLocaleString()} ر.س — ${active?.name}`);
    setNewLaborCost({ week: "", from: "", to: "", count: "", cost: "", notes: "" });
  }
  async function addLaborPayment() {
    if (!newLaborPayment.paymentNumber || !newLaborPayment.date || !newLaborPayment.amount) return;
    await insertRow("labor_payments", { project_id: activeId, payment_number: Number(newLaborPayment.paymentNumber), date: newLaborPayment.date, amount: Number(newLaborPayment.amount) });
    logAction(`تسجيل دفعة عمالة رقم ${newLaborPayment.paymentNumber} بمبلغ ${Number(newLaborPayment.amount).toLocaleString()} ر.س — ${active?.name}`);
    setNewLaborPayment({ paymentNumber: "", date: "", amount: "" });
  }
  async function addStaffMember() {
    if (!newStaffMember.name.trim() || !newStaffMember.role.trim() || !newStaffMember.monthlySalary || !newStaffMember.startDate) return;
    await supabase.from("staff").insert({
      project_id: activeId, name: newStaffMember.name.trim(), role: newStaffMember.role.trim(),
      monthly_salary: Number(newStaffMember.monthlySalary), start_date: newStaffMember.startDate,
    });
    logAction(`تسجيل "${newStaffMember.name.trim()}" (${newStaffMember.role.trim()}) في الطاقم الفني براتب شهري ${Number(newStaffMember.monthlySalary).toLocaleString()} ر.س — ${active?.name}`);
    setNewStaffMember({ name: "", role: "", monthlySalary: "", startDate: "" });
    reloadDetail(activeId);
  }
  async function deleteStaffMember(staffId) {
    await supabase.from("staff").delete().eq("id", staffId);
    logAction(`حذف عضو من الطاقم الفني — ${active?.name}`);
    reloadDetail(activeId);
  }
  async function markStaffPaid(staffId, month) {
    const member = d.staff.find((s) => s.id === staffId);
    if (!member) return;
    const targetMonth = month || currentMonthKey();
    try {
      const { error } = await supabase.from("staff_payments").insert({ staff_id: staffId, month: targetMonth, amount: member.monthly_salary, paid_date: new Date().toISOString().slice(0, 10) });
      if (error) throw error;
      logAction(`تسجيل صرف راتب "${member.name}" لشهر ${targetMonth} بمبلغ ${Number(member.monthly_salary).toLocaleString()} ر.س — ${active?.name}`);
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر تسجيل صرف الراتب. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }
  async function unmarkStaffPaid(staffId, month) {
    const member = d.staff.find((s) => s.id === staffId);
    const targetMonth = month || currentMonthKey();
    try {
      const { error } = await supabase.from("staff_payments").delete().eq("staff_id", staffId).eq("month", targetMonth);
      if (error) throw error;
      logAction(`تراجع عن تسجيل صرف راتب "${member?.name}" لشهر ${targetMonth} — ${active?.name}`);
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر التراجع عن تسجيل الصرف. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }
  async function addRevenue() {
    if (!newRevenue.number || !newRevenue.amount) return;
    await insertRow("revenues", { project_id: activeId, number: Number(newRevenue.number), amount: Number(newRevenue.amount), notes: newRevenue.notes.trim(), date: new Date().toISOString().slice(0, 10) });
    logAction(`إضافة مستخلص رقم ${newRevenue.number} بقيمة ${Number(newRevenue.amount).toLocaleString()} ر.س — ${active?.name}`);
    setNewRevenue({ number: "", amount: "", notes: "" });
  }
  async function updateRevenue(id, fields) {
    try {
      const { error } = await supabase.from("revenues").update(fields).eq("id", id);
      if (error) throw error;
      logAction(`تعديل مستخلص — ${active?.name}`);
      reloadDetail(activeId);
    } catch {
      setSaveError("تعذّر حفظ التعديل. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
  }

  // ---------------- subcontractors ----------------
  async function addSubcontractor() {
    if (!newSubcontractor.name.trim()) return;
    await insertRow("subcontractors", { project_id: activeId, name: newSubcontractor.name.trim(), scope: newSubcontractor.scope.trim() });
    logAction(`إضافة مقاول/مورد جديد "${newSubcontractor.name.trim()}" — ${active?.name}`);
    setNewSubcontractor({ name: "", scope: "" });
  }
  async function deleteSubcontractor(id) {
    const sub = d.subcontractors.find((s) => s.id === id);
    await deleteRow("subcontractors", id);
    logAction(`حذف المقاول/المورد "${sub?.name || id}" — ${active?.name}`);
  }
  async function rateSubcontractor(subId, rating) {
    await supabase.from("subcontractors").update({ rating }).eq("id", subId);
    reloadDetail(activeId);
  }
  async function addSubClaim(subId, entry) {
    await insertRow("subcontractor_claims", { subcontractor_id: subId, number: Number(entry.number), amount: Number(entry.amount), date: entry.date || null });
    const sub = d.subcontractors.find((s) => s.id === subId);
    logAction(`إضافة مستخلص رقم ${entry.number} بقيمة ${Number(entry.amount).toLocaleString()} ر.س للمقاول "${sub?.name}" — ${active?.name}`);
  }
  async function addSubPayment(subId, entry) {
    await insertRow("subcontractor_payments", { subcontractor_id: subId, number: Number(entry.number), amount: Number(entry.amount), date: entry.date || null });
    const sub = d.subcontractors.find((s) => s.id === subId);
    logAction(`تسجيل دفعة رقم ${entry.number} بقيمة ${Number(entry.amount).toLocaleString()} ر.س للمقاول "${sub?.name}" — ${active?.name}`);
  }
  async function deleteSubClaim(id) { await deleteRow("subcontractor_claims", id); }
  async function deleteSubPayment(id) { await deleteRow("subcontractor_payments", id); }

  // ---------------- timeline / documents / QA ----------------
  async function addPhase() {
    if (!newPhase.name.trim()) return;
    await supabase.from("project_phases").insert({ project_id: activeId, name: newPhase.name.trim(), planned_start: newPhase.plannedStart || null, planned_end: newPhase.plannedEnd || null });
    logAction(`إضافة مرحلة "${newPhase.name.trim()}" للجدول الزمني — ${active?.name}`);
    setNewPhase({ name: "", plannedStart: "", plannedEnd: "" });
    reloadDetail(activeId);
  }
  async function updatePhaseField(phaseId, field, value) {
    await supabase.from("project_phases").update({ [field]: value || null }).eq("id", phaseId);
    reloadDetail(activeId);
  }
  async function deletePhase(phaseId) {
    await supabase.from("project_phases").delete().eq("id", phaseId);
    reloadDetail(activeId);
  }

  async function addDocument(category, file) {
    if (!file) return;
    setDocumentError("");
    try {
      const path = await uploadAttachment(supabase, activeId, file);
      const { error } = await supabase.from("project_documents").insert({ project_id: activeId, category, name: file.name, attachment_path: path });
      if (error) throw error;
      logAction(`رفع مستند (${category}) — ${active?.name}`);
      setNewDocument({ category: "عقد العميل" });
      reloadDetail(activeId);
    } catch (err) {
      setDocumentError(err?.message || "تعذّر رفع المستند. حاول مرة أخرى.");
    }
  }
  async function deleteDocument(docId) {
    await supabase.from("project_documents").delete().eq("id", docId);
    reloadDetail(activeId);
  }

  async function addQaItem() {
    if (!newQaItem.phase.trim() || !newQaItem.item.trim()) return;
    await supabase.from("qa_checklist").insert({ project_id: activeId, phase: newQaItem.phase.trim(), item: newQaItem.item.trim() });
    setNewQaItem({ phase: "", item: "" });
    reloadDetail(activeId);
  }
  async function toggleQaItem(itemId, checked) {
    await supabase.from("qa_checklist").update({ checked }).eq("id", itemId);
    reloadDetail(activeId);
  }
  async function deleteQaItem(itemId) {
    await supabase.from("qa_checklist").delete().eq("id", itemId);
    reloadDetail(activeId);
  }

  // ---------------- map ----------------
  async function setProjectFieldFor(projectId, key, value) {
    await supabase.from("projects").update({ [key]: value }).eq("id", projectId);
    reloadProjects();
  }

  // ---------------- company assets / tools ----------------
  async function addAsset() {
    if (!newAsset.type.trim() || !newAsset.number.trim()) return;
    await supabase.from("company_assets").insert({ type: newAsset.type.trim(), number: newAsset.number.trim(), year_made: Number(newAsset.yearMade) || null, license_expiry: newAsset.licenseExpiry || null, insurance_expiry: newAsset.insuranceExpiry || null });
    logAction(`إضافة أصل جديد "${newAsset.type.trim()}" (${newAsset.number.trim()})`);
    setNewAsset({ type: "", number: "", yearMade: "", licenseExpiry: "", insuranceExpiry: "" });
    reloadCompanyAssets();
  }
  async function updateAssetField(assetId, field, value) {
    await supabase.from("company_assets").update({ [field]: value || null }).eq("id", assetId);
    reloadCompanyAssets();
  }
  async function deleteAsset(assetId) {
    await supabase.from("company_assets").delete().eq("id", assetId);
    logAction("حذف أصل من سجل أصول الشركة");
    reloadCompanyAssets();
  }
  async function addAssetDocument(assetId, file) {
    const path = await uploadAttachment(supabase, `assets/${assetId}`, file);
    await supabase.from("asset_documents").insert({ asset_id: assetId, name: file.name, attachment_path: path });
    logAction(`رفع مستند لأصل "${companyAssets.find((a) => a.id === assetId)?.type}"`);
    reloadCompanyAssets();
  }
  async function deleteAssetDocument(assetId, docId) {
    await supabase.from("asset_documents").delete().eq("id", docId);
    reloadCompanyAssets();
  }

  async function addTool() {
    if (!newTool.type.trim() || !newTool.quantity) return;
    await supabase.from("company_tools").insert({ type: newTool.type.trim(), quantity: Number(newTool.quantity), unit: newTool.unit.trim() });
    logAction(`إضافة صنف عدة/أدوات "${newTool.type.trim()}" — الكمية ${newTool.quantity}`);
    setNewTool({ type: "", quantity: "", unit: "" });
    reloadCompanyTools();
  }
  async function updateToolField(toolId, field, value) {
    await supabase.from("company_tools").update({ [field]: field === "quantity" ? Number(value) || 0 : value }).eq("id", toolId);
    reloadCompanyTools();
  }
  async function deleteTool(toolId) {
    await supabase.from("company_tools").delete().eq("id", toolId);
    logAction("حذف صنف من سجل العدة والأدوات");
    reloadCompanyTools();
  }

  // ---------------- leads ----------------
  async function addLead() {
    if (!newLead.name.trim()) return;
    await supabase.from("leads").insert({ name: newLead.name.trim(), phone: newLead.phone.trim(), notes: newLead.notes.trim() });
    setNewLead({ name: "", phone: "", notes: "" });
    reloadLeads();
  }
  async function setLeadStatus(leadId, status) {
    await supabase.from("leads").update({ status }).eq("id", leadId);
    reloadLeads();
  }
  function convertLeadToProject(lead) {
    setNewProjectForm((f) => ({ ...f, name: lead.name }));
    setView("home");
    setShowAddProject(true);
  }

  // ---------------- admin: projects / users / teams ----------------
  async function createUserAccount({ name, email, kind, treasuryAccess, editAccess, reportsAccess }) {
    setUserActionError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name, email, kind, treasuryAccess, editAccess, reportsAccess }),
    });
    const body = await res.json();
    if (!res.ok) { setUserActionError(body.error || "تعذّر إنشاء المستخدم"); return null; }
    await reloadRoster();
    return body.id;
  }

  async function deleteUser(userId) {
    setUserActionError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId }),
    });
    const body = await res.json();
    if (!res.ok) { setUserActionError(body.error || "تعذّر حذف المستخدم"); return; }
    const u = roster.find((r) => r.id === userId);
    logAction(`حذف المستخدم "${u?.name || userId}" وإلغاء كل صلاحياته`);
    await Promise.all([reloadRoster(), reloadProjects(), reloadTeams()]);
  }

  async function addProject() {
    if (!newProjectForm.name.trim()) return;
    let engineerId = null;
    let engineerName = "";
    if (newProjectForm.engineerMode === "existing") {
      if (!newProjectForm.existingEngineerId) return;
      engineerId = newProjectForm.existingEngineerId;
      engineerName = engineerRoster.find((r) => r.id === engineerId)?.name || "";
    } else {
      if (!newProjectForm.newEngineerName.trim() || !newProjectForm.newEngineerEmail.trim()) return;
      engineerId = await createUserAccount({ name: newProjectForm.newEngineerName, email: newProjectForm.newEngineerEmail, kind: "engineer" });
      if (!engineerId) return;
      engineerName = newProjectForm.newEngineerName.trim();
    }
    await supabase.from("projects").insert({
      name: newProjectForm.name.trim(),
      location: newProjectForm.location.trim() || "—",
      duration: newProjectForm.duration.trim() || "—",
      contract_value: Number(newProjectForm.contractValue) || 0,
      engineer_id: engineerId,
    });
    logAction(`إنشاء مشروع جديد "${newProjectForm.name.trim()}" — المهندس المسؤول: ${engineerName}`);
    setNewProjectForm({ name: "", location: "", duration: "", contractValue: "", engineerMode: "new", existingEngineerId: "", newEngineerName: "", newEngineerEmail: "" });
    setShowAddProject(false);
    reloadProjects();
  }

  async function archiveProject(projectId) {
    const proj = projects.find((p) => p.id === projectId);
    await supabase.from("projects").update({ archived: true }).eq("id", projectId);
    logAction(`أرشفة مشروع "${proj?.name}"`);
    if (activeId === projectId) { setActiveId(null); setView("home"); }
    reloadProjects();
  }

  async function unarchiveProject(projectId) {
    const proj = projects.find((p) => p.id === projectId);
    await supabase.from("projects").update({ archived: false }).eq("id", projectId);
    logAction(`إلغاء أرشفة مشروع "${proj?.name}"`);
    reloadProjects();
  }

  async function deleteProject(projectId) {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    await supabase.from("projects").delete().eq("id", projectId);
    logAction(`حذف مشروع "${proj.name}" نهائيًا وكل بياناته`);
    if (activeId === projectId) { setActiveId(null); setView("home"); }
    setProjectToDelete(null);
    reloadProjects();
  }

  async function addStandaloneEngineer() {
    if (!newStandaloneEngineer.name.trim() || !newStandaloneEngineer.email.trim()) return;
    await createUserAccount({ name: newStandaloneEngineer.name, email: newStandaloneEngineer.email, kind: "engineer" });
    logAction(`إضافة مهندس جديد "${newStandaloneEngineer.name.trim()}" (بدون مشروع بعد)`);
    setNewStandaloneEngineer({ name: "", email: "" });
  }

  async function addCustomUser() {
    if (!newCustomUserForm.name.trim() || !newCustomUserForm.email.trim()) return;
    await createUserAccount({
      name: newCustomUserForm.name, email: newCustomUserForm.email, kind: "custom",
      treasuryAccess: newCustomUserForm.treasury, editAccess: newCustomUserForm.edit, reportsAccess: newCustomUserForm.reports,
    });
    logAction(`إضافة مستخدم إضافي "${newCustomUserForm.name.trim()}"`);
    setNewCustomUserForm({ name: "", email: "", treasury: false, reports: false, edit: false });
  }

  async function reassignProjectEngineer(projectId, engineerId) {
    const eng = roster.find((r) => r.id === engineerId);
    const proj = projects.find((p) => p.id === projectId);
    await supabase.from("projects").update({ engineer_id: engineerId }).eq("id", projectId);
    logAction(`تعيين "${eng?.name}" مهندسًا مسؤولاً عن مشروع "${proj?.name}"`);
    reloadProjects();
  }

  async function addTeamMember(projectId, userId, roleType) {
    if (!userId) return;
    const proj = projects.find((p) => p.id === projectId);
    const u = roster.find((r) => r.id === userId);
    await supabase.from("project_team").upsert({ project_id: projectId, user_id: userId, role_type: roleType });
    logAction(`إضافة "${u?.name}" لفريق مشروع "${proj?.name}" بصفة ${roleType === "engineer" ? "مهندس إضافي" : "محاسب المشروع"}`);
    reloadTeams();
  }
  async function removeTeamMember(projectId, userId) {
    const proj = projects.find((p) => p.id === projectId);
    const u = roster.find((r) => r.id === userId);
    await supabase.from("project_team").delete().eq("project_id", projectId).eq("user_id", userId);
    logAction(`إزالة "${u?.name}" من فريق مشروع "${proj?.name}"`);
    reloadTeams();
  }

  async function setUserFlag(userId, field, value) {
    await supabase.from("profiles").update({ [field]: value }).eq("id", userId);
    reloadRoster();
  }

  // ---------------- treasury ----------------
  async function setTreasuryField(key, value) {
    await supabase.from("treasury").update({ [key]: value === "" ? 0 : Number(value) }).eq("id", 1);
    reloadTreasuryData();
  }
  async function setTreasuryTextField(key, value) {
    await supabase.from("treasury").update({ [key]: value }).eq("id", 1);
    reloadTreasuryData();
  }
  async function setOverride(key, value) {
    await supabase.from("treasury").update({ [key]: value === "" ? null : Number(value) }).eq("id", 1);
    reloadTreasuryData();
  }
  async function clearOverride(key) {
    await supabase.from("treasury").update({ [key]: null }).eq("id", 1);
    reloadTreasuryData();
  }
  async function addDeposit() {
    if (!newDeposit.amount || !newDeposit.desc.trim()) return;
    await supabase.from("treasury_deposits").insert({ amount: Number(newDeposit.amount), description: newDeposit.desc.trim(), date: new Date().toISOString().slice(0, 10) });
    setNewDeposit({ amount: "", desc: "" });
    reloadTreasuryData();
  }
  async function addWithdrawal() {
    if (!newWithdrawal.amount || !newWithdrawal.notes.trim()) return;
    await supabase.from("treasury_withdrawals").insert({ amount: Number(newWithdrawal.amount), notes: newWithdrawal.notes.trim(), date: new Date().toISOString().slice(0, 10) });
    setNewWithdrawal({ amount: "", notes: "" });
    reloadTreasuryData();
  }
  async function deleteDeposit(id) { await supabase.from("treasury_deposits").delete().eq("id", id); reloadTreasuryData(); }
  async function deleteWithdrawal(id) { await supabase.from("treasury_withdrawals").delete().eq("id", id); reloadTreasuryData(); }

  function importTreasuryFromExcel(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const findNumberInRow = (row) => {
          for (const cell of row) {
            if (typeof cell === "number") return cell;
            if (typeof cell === "string" && /^-?[\d.,]+$/.test(cell.trim()) && cell.trim() !== "") return Number(cell.replace(/,/g, ""));
          }
          return null;
        };
        const rowText = (row) => row.map((c) => String(c || "")).join(" ");

        const fieldMap = [
          ["external_claims", ["مستخلصات خارجية", "مستخلصات خارجيه"]],
          ["cash_custody_remaining", ["المتبقي بالعهدة (كاش)", "المتبقى بالعهدة (كاش)", "المتبقي بالعهده كاش"]],
          ["company_sheet_remaining", ["المتبقي بشيت الشركة", "المتبقى بشيت الشركة"]],
        ];

        const foundFields = {};
        let mode = null;
        const foundDeposits = [];
        const foundWithdrawals = [];

        rows.forEach((row) => {
          const text = rowText(row);
          if (!text.trim()) return;
          fieldMap.forEach(([key, labels]) => {
            if (labels.some((l) => text.includes(l))) {
              const num = findNumberInRow(row);
              if (num !== null) foundFields[key] = num;
            }
          });
          if (text.includes("الإيداعات") || text.includes("إيداعات رأس المال")) { mode = "deposits"; return; }
          if (text.includes("الراجع للشركاء") || text.includes("الراجع من رأس المال")) { mode = "withdrawals"; return; }
          if (text.includes("الإجمالي") || text.includes("رصيد")) { mode = null; return; }
          if (mode) {
            const num = findNumberInRow(row);
            const dateCell = row.find((c) => typeof c === "string" && /\d{4}-\d{2}-\d{2}/.test(c));
            if (num !== null && num > 0) {
              if (mode === "deposits") foundDeposits.push({ date: dateCell || null, amount: num, description: rowText(row).slice(0, 60), from_import: true });
              else foundWithdrawals.push({ date: dateCell || null, amount: num, notes: rowText(row).slice(0, 60), from_import: true });
            }
          }
        });

        if (Object.keys(foundFields).length) await supabase.from("treasury").update(foundFields).eq("id", 1);
        if (foundDeposits.length) await supabase.from("treasury_deposits").insert(foundDeposits);
        if (foundWithdrawals.length) await supabase.from("treasury_withdrawals").insert(foundWithdrawals);
        await reloadTreasuryData();

        const summary = [
          ...Object.keys(foundFields).map((k) => `• تحديث ${k}`),
          foundDeposits.length ? `• ${foundDeposits.length} إيداع مستورد` : null,
          foundWithdrawals.length ? `• ${foundWithdrawals.length} سحب/راجع مستورد` : null,
        ].filter(Boolean);
        setImportMessage(summary.length ? `تم الاستيراد بنجاح:\n${summary.join("\n")}\nراجع الأرقام قبل الاعتماد عليها.` : "لم يتم التعرف على بيانات مطابقة في هذا الملف.");
      } catch {
        setImportMessage("تعذّرت قراءة الملف. تأكد أنه ملف Excel صحيح (.xlsx) وحاول مرة أخرى.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function exportFinancialReportExcel() {
    if (!active) return;
    const wb = XLSX.utils.book_new();
    const summaryRows = [
      ["تقرير مالي شامل", active.name],
      ["تاريخ الإصدار", new Date().toLocaleDateString("ar-SA")],
      [],
      ["إجمالي المصروفات", projGrandTotal],
      ["إجمالي الإيرادات", projRevenue],
      ["الربح / الخسارة", projProfit],
      ["نسبة الربح / الخسارة (%)", Number(projProfitPercent.toFixed(2))],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "الملخص");

    const custodyReceivedRows = [["رقم العهدة", "التاريخ", "المبلغ"], ...d.custodyReceived.map((c) => [c.number, c.date, c.amount]), [], ["الإجمالي", "", projCustodyReceived]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(custodyReceivedRows), "العهدة المستلمة");

    const custodySpentRows = [["رقم الملف", "الأسبوع", "من", "إلى", "المصروف"], ...d.custodySpent.map((c) => [c.file_number, c.week, c.from_date, c.to_date, c.amount]), [], ["الإجمالي", "", "", "", projCustodySpent]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(custodySpentRows), "المصروف من العهدة");

    const laborRows = [["الأسبوع", "من", "إلى", "عدد العمالة", "التكلفة"], ...d.laborCosts.map((l) => [l.week, l.from_date, l.to_date, l.count, l.cost]), [], ["الإجمالي", "", "", "", projLaborCost]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(laborRows), "تكاليف العمالة");

    const laborPaymentsRows = [["رقم الدفعة", "التاريخ", "المبلغ"], ...d.laborPayments.map((l) => [l.payment_number, l.date, l.amount]), [], ["الإجمالي", "", projLaborPaid], ["المتبقي", "", Math.max(0, projLaborCost - projLaborPaid)]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(laborPaymentsRows), "دفعات العمالة");

    const staffRows = [["الاسم", "الوظيفة", "الراتب الشهري", "بداية الدوام", "حالة الشهر الحالي"], ...d.staff.map((s) => [s.name, s.role, s.monthly_salary, s.start_date, staffStatus(s).label]), [], ["إجمالي الرواتب الشهرية", "", "", "", projStaffMonthly], ["إجمالي المصروف فعليًا", "", "", "", projStaffPaid], ["رواتب متأخرة", "", "", "", projStaffOverdue]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(staffRows), "الطاقم الفني");

    const revenueRows = [["رقم المستخلص", "التاريخ", "القيمة", "ملاحظات"], ...d.revenues.map((r) => [r.number, r.date, r.amount, r.notes]), [], ["الإجمالي", "", projRevenue, ""], ["أعمال منتهية غير مفوترة", "", active.pending_billing, ""]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(revenueRows), "المستخلصات");

    const subRows = [["المقاول / المورد", "نطاق الأعمال", "نوع البند", "الرقم", "التاريخ", "القيمة"]];
    d.subcontractors.forEach((s) => {
      (s.subcontractor_claims || []).forEach((c) => subRows.push([s.name, s.scope, "مستخلص", c.number, c.date, c.amount]));
      (s.subcontractor_payments || []).forEach((p) => subRows.push([s.name, s.scope, "دفعة مسددة", p.number, p.date, p.amount]));
    });
    subRows.push([], ["إجمالي مستخلصات المقاولين", "", "", "", "", projSubClaims], ["إجمالي المدفوع للمقاولين", "", "", "", "", projSubPaid]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(subRows), "مقاولو الباطن والتوريدات");

    XLSX.writeFile(wb, `تقرير مالي - ${active.name}.xlsx`);
  }

  function computeNeeds(financials) {
    const custodyNeeded = Math.max(0, -(financials.custodyReceived - financials.custodySpent));
    const laborNeeded = Math.max(0, financials.laborCost - financials.laborPaid);
    const subcontractorsNeeded = Math.max(0, financials.subClaims - financials.subPaid);
    const staffNeeded = financials.staffOverdue || 0;
    return { custodyNeeded, laborNeeded, subcontractorsNeeded, staffNeeded, totalNeeded: custodyNeeded + laborNeeded + subcontractorsNeeded + staffNeeded };
  }

  if (loadingInitial) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">جاري التحميل...</div>;
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-stone-100 text-stone-900" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; inset: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
        }
        .print-only-header { display: none; }
        @media print { .print-only-header { display: block; } }
        .print-photos-grid { display: none; }
        @media print {
          .print-photos-grid { display: block; page-break-inside: avoid; }
          .print-photos-grid img { break-inside: avoid; }
        }
      `}</style>

      {saveError && (
        <div className="no-print fixed top-3 inset-x-3 z-50 flex justify-center">
          <div className="bg-rose-600 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 max-w-lg">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold flex-1">{saveError}</span>
            <button onClick={() => setSaveError("")} className="shrink-0"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-stone-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => setView("home")} className="flex items-center gap-4 text-right">
          <svg width="56" height="56" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="peakGoldHeader" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="200" rx="28" fill="#1e293b" />
            <g transform="translate(20,26)">
              <rect x="0" y="128" width="160" height="8" rx="4" fill="#f5f5f4" />
              <polygon points="8,128 28,86 48,128" fill="#f5f5f4" opacity="0.55" />
              <polygon points="48,128 78,54 108,128" fill="#f5f5f4" opacity="0.8" />
              <polygon points="108,128 138,20 168,128" fill="url(#peakGoldHeader)" />
              <circle cx="138" cy="20" r="6" fill="#1e293b" />
              <line x1="138" y1="20" x2="138" y2="4" stroke="#f5f5f4" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
          <div>
            <div className="font-extrabold text-xl" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{lang === "ar" ? "شركة قمة الحضارة للمقاولات" : "Qimmat Al-Hadara Contracting Co."}</div>
            <div className="text-xs text-stone-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{lang === "ar" ? "س.ت ١٠١٠٨٤٥٤٧٦ — الرياض، حي طويق — kemetalhadara@gmail.com" : "CR 1010845476 — Riyadh, Tuwaiq — kemetalhadara@gmail.com"}</div>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {canViewAllFinance && (
            <NotificationsBell
              notifications={visibleNotifications} show={showNotifications} setShow={setShowNotifications}
              onSelect={(n) => { if (n.targetView) { setView(n.targetView); } else { setActiveId(n.projectId); setTab("totals"); setView("projects"); } }}
            />
          )}
          <button onClick={() => setView("home")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "home" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
            <Home className="w-4 h-4" /> {lang === "ar" ? "الرئيسية" : "Home"}
          </button>
          {canSeeTreasury && (
            <button onClick={() => setView(view === "treasury" ? "projects" : "treasury")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "treasury" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
              <Vault className="w-4 h-4" /> الخزينة الرئيسية
            </button>
          )}
          <MoreMenu
            view={view} setView={setView} show={showMoreMenu} setShow={setShowMoreMenu}
            items={[
              canSeeTreasury && { id: "company", icon: BarChart3, label: "نظرة عامة على المشروعات" },
              canSeeTreasury && { id: "needs", icon: AlertTriangle, label: "المطلوب لكل موقع" },
              isAdmin && { id: "users", icon: UserCog, label: "إدارة المستخدمين" },
              isAdmin && { id: "audit", icon: History, label: "سجل الأرقام" },
              isAdmin && { id: "periodic", icon: Send, label: "التقارير الدورية" },
              (isAdmin || canViewAllFinance) && { id: "compare", icon: BarChart3, label: "مقارنة المشروعات" },
              isAdmin && { id: "approvals", icon: ShieldAlert, label: "طلبات الموافقة", badge: pendingApprovals.length },
              isAdmin && { id: "leads", icon: UserPlus, label: "عملاء محتملون" },
              { id: "map", icon: MapPin, label: "خريطة المشروعات" },
              isAdmin && { id: "assets", icon: ClipboardCheck, label: "أصول الشركة" },
            ].filter(Boolean)}
          />
          <button onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))} className="text-sm px-3 py-2 rounded flex items-center gap-1.5 bg-slate-800 text-stone-200" title="Toggle language">
            <Globe className="w-4 h-4" /> {lang === "ar" ? "EN" : "AR"}
          </button>
          <div className="text-xs text-stone-300 border-s border-slate-700 ps-3 flex items-center gap-2">
            <span>{profile.name} <span className="text-stone-500">({KIND_LABELS[profile.kind]})</span></span>
            <button onClick={handleSignOut} title="تسجيل الخروج" className="text-stone-300 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {view === "users" && isAdmin && (
        <UsersView
          roster={roster} projects={projects} teams={teams} teamDrafts={teamDrafts} setTeamDrafts={setTeamDrafts}
          reassignDrafts={reassignDrafts} setReassignDrafts={setReassignDrafts}
          newStandaloneEngineer={newStandaloneEngineer} setNewStandaloneEngineer={setNewStandaloneEngineer}
          newCustomUserForm={newCustomUserForm} setNewCustomUserForm={setNewCustomUserForm}
          addStandaloneEngineer={addStandaloneEngineer} addCustomUser={addCustomUser} deleteUser={deleteUser}
          reassignProjectEngineer={reassignProjectEngineer} addTeamMember={addTeamMember} removeTeamMember={removeTeamMember}
          setUserFlag={setUserFlag} userActionError={userActionError}
        />
      )}

      {view === "home" && (
        <HomeView
          isAdmin={isAdmin} sortedProjects={sortedProjects} profile={profile} getMembership={getMembership}
          showAddProject={showAddProject} setShowAddProject={setShowAddProject}
          newProjectForm={newProjectForm} setNewProjectForm={setNewProjectForm}
          engineerRoster={engineerRoster} addProject={addProject} userActionError={userActionError}
          setActiveId={setActiveId} setTab={setTab} setView={setView}
          archivedProjects={archivedProjects} showArchived={showArchived} setShowArchived={setShowArchived}
          archiveProject={archiveProject} unarchiveProject={unarchiveProject} requestDeleteProject={setProjectToDelete}
        />
      )}

      <ProjectDeleteModal project={projectToDelete} onConfirm={deleteProject} onClose={() => setProjectToDelete(null)} />

      {view === "company" && canSeeTreasury && (
        <CompanyView companyFinancials={companyFinancials} />
      )}

      {view === "needs" && canSeeTreasury && (
        <NeedsView companyFinancials={companyFinancials} />
      )}

      {view === "treasury" && canSeeTreasury && (
        <TreasuryView
          isAdmin={isAdmin} treasuryData={treasuryData} t={t} totalDeposits={totalDeposits} totalWithdrawals={totalWithdrawals}
          netInvested={netInvested} custodyRemaining={custodyRemaining} netProfit={netProfit}
          setTreasuryField={setTreasuryField} setOverride={setOverride} clearOverride={clearOverride}
          newDeposit={newDeposit} setNewDeposit={setNewDeposit} addDeposit={addDeposit} deleteDeposit={deleteDeposit}
          newWithdrawal={newWithdrawal} setNewWithdrawal={setNewWithdrawal} addWithdrawal={addWithdrawal} deleteWithdrawal={deleteWithdrawal}
          importMessage={importMessage} importTreasuryFromExcel={importTreasuryFromExcel}
          grantableRoster={grantableRoster} setUserFlag={setUserFlag}
          setTreasuryTextField={setTreasuryTextField} setView={setView}
          overdueCustodyTotal={overdueCustodyTotal} overdueLaborTotal={overdueLaborTotal}
          overdueSubcontractorsTotal={overdueSubcontractorsTotal} totalOverdueAmounts={totalOverdueAmounts}
        />
      )}

      {view === "compare" && (isAdmin || canViewAllFinance) && (
        <CompareView projects={projects} companyFinancials={companyFinancials} />
      )}

      {view === "approvals" && isAdmin && companySettings && (
        <ApprovalsView
          approvalThreshold={companySettings.approval_threshold} setApprovalThreshold={setApprovalThreshold}
          pendingApprovals={pendingApprovals.map((r) => ({ ...r, project_name: projects.find((p) => p.id === r.project_id)?.name }))}
          approveRequest={approveRequest} rejectRequest={rejectRequest}
        />
      )}

      {view === "leads" && isAdmin && (
        <LeadsView leads={leads} newLead={newLead} setNewLead={setNewLead} addLead={addLead} setLeadStatus={setLeadStatus} convertLeadToProject={convertLeadToProject} />
      )}

      {view === "map" && (
        <MapView projects={projects} isAdmin={isAdmin} getMembership={getMembership} profileId={profile.id} setProjectField={setProjectFieldFor} />
      )}

      {view === "assets" && isAdmin && (
        <AssetsView
          companyAssets={companyAssets} newAsset={newAsset} setNewAsset={setNewAsset} addAsset={addAsset}
          updateAssetField={updateAssetField} deleteAsset={deleteAsset} addAssetDocument={addAssetDocument} deleteAssetDocument={deleteAssetDocument}
          companyTools={companyTools} newTool={newTool} setNewTool={setNewTool} addTool={addTool} updateToolField={updateToolField} deleteTool={deleteTool}
        />
      )}

      {view === "periodic" && isAdmin && companySettings && (
        <PeriodicView settings={companySettings} setSettings={setPeriodicSetting} companyFinancials={companyFinancials} projects={projects} />
      )}

      {view === "audit" && isAdmin && (
        <AuditView auditLog={auditLog} />
      )}

      {view === "projects" && (
        <div className="flex" style={{ minHeight: "600px" }}>
          <div className="w-72 bg-white border-l border-stone-200 p-4">
            <div className="text-xs font-bold text-stone-400 mb-3 tracking-wide">المشروعات</div>
            <div className="space-y-2">
              {projects.filter((p) => !p.archived).map((p) => {
                const ownedByViewer = isAdmin || getMembership(p, profile.id) === "engineer" || getMembership(p, profile.id) === "accountant";
                return (
                  <button key={p.id} onClick={() => { setActiveId(p.id); setTab("updates"); }}
                    className={`w-full text-right p-3 rounded-lg border transition ${activeId === p.id ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:bg-stone-50"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{p.name}</span>
                      {!ownedByViewer && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">{p.location}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "جاري" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{p.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-6">
            {active && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>{active.name}</h1>
                  <span className="text-xs px-3 py-1 rounded-full border border-stone-300 text-stone-600 flex items-center gap-1">
                    {isOwner ? <><Plus className="w-3 h-3" /> صلاحية كاملة (تعديل)</> : <><Lock className="w-3 h-3" /> اطّلاع على التطورات والصور فقط</>}
                  </span>
                </div>

                <div className="flex gap-2 border-b border-stone-200 mb-5 flex-wrap">
                  {visibleTabs.map((tb) => (
                    <button key={tb.id} onClick={() => setTab(tb.id)}
                      className={`px-4 py-2 text-sm font-bold flex items-center gap-1.5 border-b-2 -mb-px ${effectiveTab === tb.id ? "border-amber-500 text-amber-700" : "border-transparent text-stone-500"}`}>
                      <tb.icon className="w-4 h-4" /> {tb.label}
                    </button>
                  ))}
                </div>

                {effectiveTab === "updates" && (
                  <UpdatesTab key={activeId} active={active} isOwner={isOwner} setProjectField={setProjectField} newUpdate={newUpdate} setNewUpdate={setNewUpdate} addUpdate={addUpdate} updates={d.updates} progressColor={progressColor} projGrandTotal={projGrandTotal} projRevenue={projRevenue} revenuesCount={d.revenues.length} />
                )}
                {effectiveTab === "photos" && (
                  <PhotosTab key={activeId} active={active} isOwner={isOwner} newPhotoCaption={newPhotoCaption} setNewPhotoCaption={setNewPhotoCaption} addPhoto={addPhoto} photos={d.photos} updatePhotoCaption={updatePhotoCaption} deletePhoto={(id) => deleteRow("photos", id)} />
                )}
                {effectiveTab === "timeline" && (
                  <TimelineTab key={activeId} active={active} isOwner={isOwner} phases={d.phases} newPhase={newPhase} setNewPhase={setNewPhase} addPhase={addPhase} updatePhaseField={updatePhaseField} deletePhase={deletePhase} />
                )}
                {effectiveTab === "documents" && (
                  <DocumentsTab key={activeId} isOwner={isOwner} documents={d.documents} newDocument={newDocument} setNewDocument={setNewDocument} addDocument={addDocument} deleteDocument={deleteDocument} documentError={documentError} />
                )}
                {effectiveTab === "qa" && (
                  <QaTab key={activeId} active={active} isOwner={isOwner} qaChecklist={d.qaChecklist} newQaItem={newQaItem} setNewQaItem={setNewQaItem} addQaItem={addQaItem} toggleQaItem={toggleQaItem} deleteQaItem={deleteQaItem} />
                )}
                {effectiveTab === "custody" && (canAccessLimited || canViewAllFinance) && (
                  <CustodyTab key={activeId} active={active} canAccessLimited={canAccessLimited} canEditDelete={canEditDelete}
                    projCustodyReceived={projCustodyReceived} projCustodySpent={projCustodySpent}
                    custodyReceived={d.custodyReceived} custodySpent={d.custodySpent}
                    newCustodyReceived={newCustodyReceived} setNewCustodyReceived={setNewCustodyReceived} addCustodyReceived={addCustodyReceived}
                    newCustodySpent={newCustodySpent} setNewCustodySpent={setNewCustodySpent} addCustodySpent={addCustodySpent}
                    deleteRow={deleteRow} attachFile={attachFile} updateRow={updateRow}
                  />
                )}
                {effectiveTab === "labor" && (isOwner || canViewAllFinance) && (
                  <LaborTab key={activeId} isOwner={isOwner} canEditDelete={canEditDelete}
                    projLaborCost={projLaborCost} projLaborPaid={projLaborPaid}
                    laborCosts={d.laborCosts} laborPayments={d.laborPayments}
                    newLaborCost={newLaborCost} setNewLaborCost={setNewLaborCost} addLaborCost={addLaborCost}
                    newLaborPayment={newLaborPayment} setNewLaborPayment={setNewLaborPayment} addLaborPayment={addLaborPayment}
                    deleteRow={deleteRow} attachFile={attachFile} updateRow={updateRow}
                  />
                )}
                {effectiveTab === "staff" && (isOwner || canViewAllFinance) && (
                  <StaffTab key={activeId} active={active} isOwner={isOwner}
                    staff={d.staff} projStaffMonthly={projStaffMonthly} projStaffPaid={projStaffPaid} projStaffOverdue={projStaffOverdue}
                    newStaffMember={newStaffMember} setNewStaffMember={setNewStaffMember} addStaffMember={addStaffMember}
                    deleteStaffMember={deleteStaffMember} markStaffPaid={markStaffPaid} unmarkStaffPaid={unmarkStaffPaid}
                  />
                )}
                {effectiveTab === "revenues" && (canAccessLimited || canViewAllFinance) && (
                  <RevenuesTab key={activeId} active={active} isOwner={isOwner} canAccessLimited={canAccessLimited} canEditDelete={canEditDelete}
                    projRevenue={projRevenue} revenues={d.revenues} newRevenue={newRevenue} setNewRevenue={setNewRevenue} addRevenue={addRevenue}
                    updateRevenue={updateRevenue} deleteRevenue={(id) => deleteRow("revenues", id)}
                    attachFile={attachFile}
                  />
                )}
                {effectiveTab === "totals" && (canAccessLimited || canViewAllFinance) && (
                  <TotalsTab key={activeId} active={active} isOwner={isOwner}
                    projGrandTotal={projGrandTotal} projCustodySpent={projCustodySpent} projLaborCost={projLaborCost} projStaffMonthly={projStaffMonthly} projSubClaims={projSubClaims}
                    projRevenue={projRevenue}
                    setProjectField={setProjectField} projProfit={projProfit} projProfitPercent={projProfitPercent}
                  />
                )}
                {effectiveTab === "subcontractors" && (canAccessLimited || canViewAllFinance) && (
                  <SubcontractorsTab key={activeId} canAccessLimited={canAccessLimited} canEditDelete={canEditDelete}
                    projSubClaims={projSubClaims} projSubPaid={projSubPaid}
                    subcontractors={d.subcontractors} newSubcontractor={newSubcontractor} setNewSubcontractor={setNewSubcontractor} addSubcontractor={addSubcontractor}
                    addSubClaim={addSubClaim} addSubPayment={addSubPayment} deleteSubClaim={deleteSubClaim} deleteSubPayment={deleteSubPayment}
                    deleteSubcontractor={deleteSubcontractor} attachFile={attachFile} updateRow={updateRow} rateSubcontractor={rateSubcontractor}
                  />
                )}
                {effectiveTab === "financial" && (canAccessLimited || canViewAllFinance) && (
                  <FinancialTab key={activeId} active={active} detail={d} projGrandTotal={projGrandTotal} projRevenue={projRevenue} projProfit={projProfit} projProfitPercent={projProfitPercent}
                    projCustodyReceived={projCustodyReceived} projCustodySpent={projCustodySpent} projLaborCost={projLaborCost} projLaborPaid={projLaborPaid}
                    projStaffMonthly={projStaffMonthly} projStaffOverdue={projStaffOverdue}
                    projSubClaims={projSubClaims} exportFinancialReportExcel={exportFinancialReportExcel}
                  />
                )}
                {effectiveTab === "summary" && (isOwner || canViewAllFinance) && (
                  <SummaryTab key={activeId} active={active} detail={d} projGrandTotal={projGrandTotal} projCustodySpent={projCustodySpent} projLaborCost={projLaborCost} projStaffMonthly={projStaffMonthly}
                    projSubClaims={projSubClaims} projRevenue={projRevenue} projProfit={projProfit} projProfitPercent={projProfitPercent}
                    needs={computeNeeds({ custodyReceived: projCustodyReceived, custodySpent: projCustodySpent, laborCost: projLaborCost, laborPaid: projLaborPaid, subClaims: projSubClaims, subPaid: projSubPaid, staffOverdue: projStaffOverdue })}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
