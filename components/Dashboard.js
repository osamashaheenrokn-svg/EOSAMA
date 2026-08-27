"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  Camera, Wallet, Lock, Plus, ChevronLeft,
  Users, Vault, BarChart3, AlertTriangle, Printer,
  Home, HardHat as SubIcon, FileSpreadsheet, UserCog, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchProfiles, fetchProjects, fetchAllTeams, fetchTreasury, fetchProjectDetail, fetchCompanyFinancials, sum } from "@/lib/db";
import { uploadAttachment } from "@/lib/attachments";
import { HomeView } from "./views/HomeView";
import { UsersView } from "./views/UsersView";
import { CompanyView } from "./views/CompanyView";
import { NeedsView } from "./views/NeedsView";
import { TreasuryView } from "./views/TreasuryView";
import { UpdatesTab } from "./tabs/UpdatesTab";
import { PhotosTab } from "./tabs/PhotosTab";
import { CustodyTab } from "./tabs/CustodyTab";
import { LaborTab } from "./tabs/LaborTab";
import { TotalsTab } from "./tabs/TotalsTab";
import { SubcontractorsTab } from "./tabs/SubcontractorsTab";
import { FinancialTab } from "./tabs/FinancialTab";
import { SummaryTab } from "./tabs/SummaryTab";

const TABS = [
  { id: "updates", label: "تطورات المشروع", icon: ChevronLeft, ownerOnly: false },
  { id: "photos", label: "تقرير مصور", icon: Camera, ownerOnly: false },
  { id: "custody", label: "العهدة المصروفة", icon: Wallet, ownerOnly: true, accountantOk: true },
  { id: "labor", label: "تقرير العمالة اليومي", icon: Users, ownerOnly: true },
  { id: "totals", label: "إجمالي مصروفات المشروع", icon: Vault, ownerOnly: true, accountantOk: true },
  { id: "subcontractors", label: "مقاولو الباطن والتوريدات", icon: SubIcon, ownerOnly: true, accountantOk: true },
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
  const [newSalary, setNewSalary] = useState({ month: "", name: "", role: "", amount: "", notes: "" });
  const [newRevenue, setNewRevenue] = useState({ number: "", amount: "", notes: "" });
  const [newSubcontractor, setNewSubcontractor] = useState({ name: "", scope: "" });

  const isAdmin = profile.kind === "admin";

  const reloadProjects = useCallback(async () => setProjects(await fetchProjects(supabase)), [supabase]);
  const reloadRoster = useCallback(async () => setRoster(await fetchProfiles(supabase)), [supabase]);
  const reloadTeams = useCallback(async () => setTeams(await fetchAllTeams(supabase)), [supabase]);
  const reloadTreasuryData = useCallback(async () => setTreasuryData(await fetchTreasury(supabase)), [supabase]);
  const reloadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetail(await fetchProjectDetail(supabase, id));
  }, [supabase]);

  useEffect(() => {
    (async () => {
      await Promise.all([reloadProjects(), reloadRoster(), reloadTeams()]);
      setLoadingInitial(false);
    })();
  }, [reloadProjects, reloadRoster, reloadTeams]);

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
    if (canSeeTreasury && (view === "company" || view === "needs") && projects.length) {
      fetchCompanyFinancials(supabase, projects).then(setCompanyFinancials).catch(() => setCompanyFinancials([]));
    }
  }, [canSeeTreasury, view, projects, supabase]);

  const visibleTabs = TABS.filter((t) => !t.ownerOnly || isOwner || canViewAllFinance || (t.accountantOk && isProjectAccountant));
  const effectiveTab = visibleTabs.find((t) => t.id === tab) ? tab : "updates";

  const sortedProjects = [...projects].sort((a, b) => {
    const aOwn = getMembership(a, profile.id) === "engineer" ? 0 : 1;
    const bOwn = getMembership(b, profile.id) === "engineer" ? 0 : 1;
    return aOwn - bOwn;
  });

  const engineerRoster = roster.filter((r) => r.kind === "engineer");
  const grantableRoster = roster.filter((r) => r.id !== profile.id);

  // ---- active-project aggregates ----
  const d = detail || { updates: [], photos: [], custodyReceived: [], custodySpent: [], laborCosts: [], laborPayments: [], salaries: [], revenues: [], subcontractors: [] };
  const projCustodyReceived = sum(d.custodyReceived, "amount");
  const projCustodySpent = sum(d.custodySpent, "amount");
  const projLaborCost = sum(d.laborCosts, "cost");
  const projLaborPaid = sum(d.laborPayments, "amount");
  const projSalaries = sum(d.salaries, "amount");
  const projSubClaims = d.subcontractors.reduce((a, s) => a + sum(s.subcontractor_claims, "amount"), 0);
  const projSubPaid = d.subcontractors.reduce((a, s) => a + sum(s.subcontractor_payments, "amount"), 0);
  const projGrandTotal = projCustodySpent + projLaborCost + projSalaries + projSubClaims;
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
  const autoNetProfit = Number(t?.external_claims || 0) + custodyRemaining - netInvested;
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

  // ---------------- generic entry helpers ----------------
  async function insertRow(table, row) {
    await supabase.from(table).insert(row);
    reloadDetail(activeId);
  }
  async function deleteRow(table, id) {
    await supabase.from(table).delete().eq("id", id);
    reloadDetail(activeId);
  }
  async function attachFile(table, id, file) {
    const path = await uploadAttachment(supabase, activeId, file);
    await supabase.from(table).update({ attachment_path: path }).eq("id", id);
    reloadDetail(activeId);
  }

  async function addCustodyReceived() {
    if (!newCustodyReceived.number || !newCustodyReceived.date || !newCustodyReceived.amount) return;
    await insertRow("custody_received", { project_id: activeId, number: Number(newCustodyReceived.number), date: newCustodyReceived.date, amount: Number(newCustodyReceived.amount) });
    setNewCustodyReceived({ number: "", date: "", amount: "" });
  }
  async function addCustodySpent() {
    if (!newCustodySpent.fileNumber || !newCustodySpent.week || !newCustodySpent.amount) return;
    await insertRow("custody_spent", { project_id: activeId, file_number: Number(newCustodySpent.fileNumber), week: Number(newCustodySpent.week), from_date: newCustodySpent.from || null, to_date: newCustodySpent.to || null, amount: Number(newCustodySpent.amount) });
    setNewCustodySpent({ fileNumber: "", week: "", from: "", to: "", amount: "" });
  }
  async function addLaborCost() {
    if (!newLaborCost.week || !newLaborCost.count || !newLaborCost.cost) return;
    await insertRow("labor_costs", { project_id: activeId, week: Number(newLaborCost.week), from_date: newLaborCost.from || null, to_date: newLaborCost.to || null, count: Number(newLaborCost.count), cost: Number(newLaborCost.cost), notes: newLaborCost.notes.trim() });
    setNewLaborCost({ week: "", from: "", to: "", count: "", cost: "", notes: "" });
  }
  async function addLaborPayment() {
    if (!newLaborPayment.paymentNumber || !newLaborPayment.date || !newLaborPayment.amount) return;
    await insertRow("labor_payments", { project_id: activeId, payment_number: Number(newLaborPayment.paymentNumber), date: newLaborPayment.date, amount: Number(newLaborPayment.amount) });
    setNewLaborPayment({ paymentNumber: "", date: "", amount: "" });
  }
  async function addSalary() {
    if (!newSalary.month.trim() || !newSalary.name.trim() || !newSalary.amount) return;
    await insertRow("salaries", { project_id: activeId, month: newSalary.month.trim(), name: newSalary.name.trim(), role: newSalary.role.trim(), amount: Number(newSalary.amount), notes: newSalary.notes.trim() });
    setNewSalary({ month: "", name: "", role: "", amount: "", notes: "" });
  }
  async function addRevenue() {
    if (!newRevenue.number || !newRevenue.amount) return;
    await insertRow("revenues", { project_id: activeId, number: Number(newRevenue.number), amount: Number(newRevenue.amount), notes: newRevenue.notes.trim(), date: new Date().toISOString().slice(0, 10) });
    setNewRevenue({ number: "", amount: "", notes: "" });
  }

  // ---------------- subcontractors ----------------
  async function addSubcontractor() {
    if (!newSubcontractor.name.trim()) return;
    await insertRow("subcontractors", { project_id: activeId, name: newSubcontractor.name.trim(), scope: newSubcontractor.scope.trim() });
    setNewSubcontractor({ name: "", scope: "" });
  }
  async function deleteSubcontractor(id) { await deleteRow("subcontractors", id); }
  async function addSubClaim(subId, entry) {
    await insertRow("subcontractor_claims", { subcontractor_id: subId, number: Number(entry.number), amount: Number(entry.amount), date: entry.date || null });
  }
  async function addSubPayment(subId, entry) {
    await insertRow("subcontractor_payments", { subcontractor_id: subId, number: Number(entry.number), amount: Number(entry.amount), date: entry.date || null });
  }
  async function deleteSubClaim(id) { await deleteRow("subcontractor_claims", id); }
  async function deleteSubPayment(id) { await deleteRow("subcontractor_payments", id); }
  async function attachSubClaim(id, file) {
    const path = await uploadAttachment(supabase, activeId, file);
    await supabase.from("subcontractor_claims").update({ attachment_path: path }).eq("id", id);
    reloadDetail(activeId);
  }
  async function attachSubPayment(id, file) {
    const path = await uploadAttachment(supabase, activeId, file);
    await supabase.from("subcontractor_payments").update({ attachment_path: path }).eq("id", id);
    reloadDetail(activeId);
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
    await Promise.all([reloadRoster(), reloadProjects(), reloadTeams()]);
  }

  async function addProject() {
    if (!newProjectForm.name.trim()) return;
    let engineerId = null;
    if (newProjectForm.engineerMode === "existing") {
      if (!newProjectForm.existingEngineerId) return;
      engineerId = newProjectForm.existingEngineerId;
    } else {
      if (!newProjectForm.newEngineerName.trim() || !newProjectForm.newEngineerEmail.trim()) return;
      engineerId = await createUserAccount({ name: newProjectForm.newEngineerName, email: newProjectForm.newEngineerEmail, kind: "engineer" });
      if (!engineerId) return;
    }
    await supabase.from("projects").insert({
      name: newProjectForm.name.trim(),
      location: newProjectForm.location.trim() || "—",
      duration: newProjectForm.duration.trim() || "—",
      contract_value: Number(newProjectForm.contractValue) || 0,
      engineer_id: engineerId,
    });
    setNewProjectForm({ name: "", location: "", duration: "", contractValue: "", engineerMode: "new", existingEngineerId: "", newEngineerName: "", newEngineerEmail: "" });
    setShowAddProject(false);
    reloadProjects();
  }

  async function addStandaloneEngineer() {
    if (!newStandaloneEngineer.name.trim() || !newStandaloneEngineer.email.trim()) return;
    await createUserAccount({ name: newStandaloneEngineer.name, email: newStandaloneEngineer.email, kind: "engineer" });
    setNewStandaloneEngineer({ name: "", email: "" });
  }

  async function addCustomUser() {
    if (!newCustomUserForm.name.trim() || !newCustomUserForm.email.trim()) return;
    await createUserAccount({
      name: newCustomUserForm.name, email: newCustomUserForm.email, kind: "custom",
      treasuryAccess: newCustomUserForm.treasury, editAccess: newCustomUserForm.edit, reportsAccess: newCustomUserForm.reports,
    });
    setNewCustomUserForm({ name: "", email: "", treasury: false, reports: false, edit: false });
  }

  async function reassignProjectEngineer(projectId, engineerId) {
    await supabase.from("projects").update({ engineer_id: engineerId }).eq("id", projectId);
    reloadProjects();
  }

  async function addTeamMember(projectId, userId, roleType) {
    if (!userId) return;
    await supabase.from("project_team").upsert({ project_id: projectId, user_id: userId, role_type: roleType });
    reloadTeams();
  }
  async function removeTeamMember(projectId, userId) {
    await supabase.from("project_team").delete().eq("project_id", projectId).eq("user_id", userId);
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

    const salaryRows = [["الشهر", "الاسم", "الوظيفة", "الراتب", "ملاحظات"], ...d.salaries.map((s) => [s.month, s.name, s.role, s.amount, s.notes]), [], ["الإجمالي", "", "", projSalaries, ""]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(salaryRows), "الرواتب");

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
    return { custodyNeeded, laborNeeded, subcontractorsNeeded, totalNeeded: custodyNeeded + laborNeeded + subcontractorsNeeded };
  }

  if (loadingInitial) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-stone-100 text-stone-900" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
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
            <div className="font-extrabold text-xl" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>شركة قمة الحضارة للمقاولات</div>
            <div className="text-xs text-stone-400" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>س.ت ١٠١٠٨٤٥٤٧٦ — الرياض، حي طويق — kemetalhadara@gmail.com</div>
          </div>
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setView("home")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "home" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
            <Home className="w-4 h-4" /> الرئيسية
          </button>
          {canSeeTreasury && (
            <button onClick={() => setView(view === "company" ? "projects" : "company")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "company" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
              <BarChart3 className="w-4 h-4" /> نظرة عامة على المشروعات
            </button>
          )}
          {canSeeTreasury && (
            <button onClick={() => setView(view === "needs" ? "projects" : "needs")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "needs" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
              <AlertTriangle className="w-4 h-4" /> المطلوب لكل موقع
            </button>
          )}
          {canSeeTreasury && (
            <button onClick={() => setView(view === "treasury" ? "projects" : "treasury")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "treasury" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
              <Vault className="w-4 h-4" /> الخزينة الرئيسية
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setView(view === "users" ? "projects" : "users")} className={`text-sm px-3 py-2 rounded flex items-center gap-1.5 ${view === "users" ? "bg-amber-500 text-slate-900 font-bold" : "bg-slate-800 text-stone-200"}`}>
              <UserCog className="w-4 h-4" /> إدارة المستخدمين
            </button>
          )}
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
        />
      )}

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
        />
      )}

      {view === "projects" && (
        <div className="flex" style={{ minHeight: "600px" }}>
          <div className="w-72 bg-white border-l border-stone-200 p-4">
            <div className="text-xs font-bold text-stone-400 mb-3 tracking-wide">المشروعات</div>
            <div className="space-y-2">
              {projects.map((p) => {
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
                  <PhotosTab key={activeId} active={active} isOwner={isOwner} newPhotoCaption={newPhotoCaption} setNewPhotoCaption={setNewPhotoCaption} addPhoto={addPhoto} photos={d.photos} />
                )}
                {effectiveTab === "custody" && (canAccessLimited || canViewAllFinance) && (
                  <CustodyTab key={activeId} active={active} canAccessLimited={canAccessLimited} canEditDelete={canEditDelete}
                    projCustodyReceived={projCustodyReceived} projCustodySpent={projCustodySpent}
                    custodyReceived={d.custodyReceived} custodySpent={d.custodySpent}
                    newCustodyReceived={newCustodyReceived} setNewCustodyReceived={setNewCustodyReceived} addCustodyReceived={addCustodyReceived}
                    newCustodySpent={newCustodySpent} setNewCustodySpent={setNewCustodySpent} addCustodySpent={addCustodySpent}
                    deleteRow={deleteRow} attachFile={attachFile}
                  />
                )}
                {effectiveTab === "labor" && (isOwner || canViewAllFinance) && (
                  <LaborTab key={activeId} isOwner={isOwner} canEditDelete={canEditDelete}
                    projLaborCost={projLaborCost} projLaborPaid={projLaborPaid}
                    laborCosts={d.laborCosts} laborPayments={d.laborPayments}
                    newLaborCost={newLaborCost} setNewLaborCost={setNewLaborCost} addLaborCost={addLaborCost}
                    newLaborPayment={newLaborPayment} setNewLaborPayment={setNewLaborPayment} addLaborPayment={addLaborPayment}
                    deleteRow={deleteRow} attachFile={attachFile}
                  />
                )}
                {effectiveTab === "totals" && (canAccessLimited || canViewAllFinance) && (
                  <TotalsTab key={activeId} active={active} isOwner={isOwner} canAccessLimited={canAccessLimited}
                    projGrandTotal={projGrandTotal} projCustodySpent={projCustodySpent} projLaborCost={projLaborCost} projSalaries={projSalaries} projSubClaims={projSubClaims}
                    salaries={d.salaries} newSalary={newSalary} setNewSalary={setNewSalary} addSalary={addSalary}
                    projRevenue={projRevenue} revenues={d.revenues} newRevenue={newRevenue} setNewRevenue={setNewRevenue} addRevenue={addRevenue}
                    setProjectField={setProjectField} projProfit={projProfit} projProfitPercent={projProfitPercent}
                    attachFile={attachFile}
                  />
                )}
                {effectiveTab === "subcontractors" && (canAccessLimited || canViewAllFinance) && (
                  <SubcontractorsTab key={activeId} canAccessLimited={canAccessLimited} canEditDelete={canEditDelete}
                    projSubClaims={projSubClaims} projSubPaid={projSubPaid}
                    subcontractors={d.subcontractors} newSubcontractor={newSubcontractor} setNewSubcontractor={setNewSubcontractor} addSubcontractor={addSubcontractor}
                    addSubClaim={addSubClaim} addSubPayment={addSubPayment} deleteSubClaim={deleteSubClaim} deleteSubPayment={deleteSubPayment}
                    deleteSubcontractor={deleteSubcontractor} attachSubClaim={attachSubClaim} attachSubPayment={attachSubPayment}
                  />
                )}
                {effectiveTab === "financial" && (canAccessLimited || canViewAllFinance) && (
                  <FinancialTab key={activeId} active={active} detail={d} projGrandTotal={projGrandTotal} projRevenue={projRevenue} projProfit={projProfit} projProfitPercent={projProfitPercent}
                    projCustodyReceived={projCustodyReceived} projCustodySpent={projCustodySpent} projLaborCost={projLaborCost} projSalaries={projSalaries}
                    projSubClaims={projSubClaims} exportFinancialReportExcel={exportFinancialReportExcel}
                  />
                )}
                {effectiveTab === "summary" && (isOwner || canViewAllFinance) && (
                  <SummaryTab key={activeId} active={active} detail={d} projGrandTotal={projGrandTotal} projCustodySpent={projCustodySpent} projLaborCost={projLaborCost} projSalaries={projSalaries}
                    projSubClaims={projSubClaims} projRevenue={projRevenue}
                    needs={computeNeeds({ custodyReceived: projCustodyReceived, custodySpent: projCustodySpent, laborCost: projLaborCost, laborPaid: projLaborPaid, subClaims: projSubClaims, subPaid: projSubPaid })}
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
