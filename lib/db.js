export async function fetchProfiles(supabase) {
  const { data, error } = await supabase.rpc("list_roster");
  if (error) throw error;
  return data;
}

export async function fetchProjects(supabase) {
  const { data, error } = await supabase.from("projects").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function fetchAllTeams(supabase) {
  const { data, error } = await supabase.from("project_team").select("*");
  if (error) throw error;
  return data;
}

export async function fetchTreasury(supabase) {
  const [{ data: treasury, error: e1 }, { data: deposits, error: e2 }, { data: withdrawals, error: e3 }] = await Promise.all([
    supabase.from("treasury").select("*").eq("id", 1).single(),
    supabase.from("treasury_deposits").select("*").order("date", { ascending: false }),
    supabase.from("treasury_withdrawals").select("*").order("date", { ascending: false }),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  return { treasury, deposits, withdrawals };
}

// Every staff member across every project the caller can see, with their project's
// name and full payment history — used by the company-wide staff directory report.
export async function fetchAllStaff(supabase) {
  const { data, error } = await supabase
    .from("staff")
    .select("*, staff_payments(*), projects(name)")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProjectDetail(supabase, projectId) {
  const [updates, photos, custodyReceived, custodySpent, laborCosts, laborPayments, staff, revenues, subcontractors, phases, documents, qaChecklist] =
    await Promise.all([
      supabase.from("updates").select("*").eq("project_id", projectId).order("date", { ascending: false }),
      supabase.from("photos").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("custody_received").select("*").eq("project_id", projectId),
      supabase.from("custody_spent").select("*").eq("project_id", projectId),
      supabase.from("labor_costs").select("*").eq("project_id", projectId),
      supabase.from("labor_payments").select("*").eq("project_id", projectId),
      supabase.from("staff").select("*, staff_payments(*)").eq("project_id", projectId),
      supabase.from("revenues").select("*").eq("project_id", projectId),
      supabase.from("subcontractors").select("*, subcontractor_claims(*), subcontractor_payments(*)").eq("project_id", projectId),
      supabase.from("project_phases").select("*").eq("project_id", projectId).order("created_at"),
      supabase.from("project_documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("qa_checklist").select("*").eq("project_id", projectId).order("created_at"),
    ]);

  for (const r of [updates, photos, custodyReceived, custodySpent, laborCosts, laborPayments, staff, revenues, subcontractors, phases, documents, qaChecklist]) {
    if (r.error) throw r.error;
  }

  return {
    updates: updates.data,
    photos: photos.data,
    custodyReceived: custodyReceived.data,
    custodySpent: custodySpent.data,
    laborCosts: laborCosts.data,
    laborPayments: laborPayments.data,
    staff: staff.data,
    revenues: revenues.data,
    subcontractors: subcontractors.data,
    phases: phases.data,
    documents: documents.data,
    qaChecklist: qaChecklist.data,
  };
}

export async function fetchCompanySettings(supabase) {
  const { data, error } = await supabase.from("company_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function fetchPendingApprovals(supabase) {
  const { data, error } = await supabase.from("pending_approvals").select("*").order("requested_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCompanyAssets(supabase) {
  const { data, error } = await supabase.from("company_assets").select("*, asset_documents(*)").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCompanyTools(supabase) {
  const { data, error } = await supabase.from("company_tools").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchLeads(supabase) {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAuditLog(supabase) {
  const { data, error } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data;
}

export async function logAction(supabase, profile, action) {
  await supabase.from("audit_log").insert({ actor_id: profile.id, actor_name: profile.name, action });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
}

const SALARY_GRACE_DAY = 5;

export function currentMonthKey(today = new Date()) {
  return today.toISOString().slice(0, 7);
}

export function isStaffPaidThisMonth(member, today = new Date()) {
  const monthKey = currentMonthKey(today);
  return (member.staff_payments || []).some((sp) => sp.month === monthKey);
}

export function staffStatus(member, today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  if (member.start_date && member.start_date > todayStr) return { label: "لم يبدأ بعد", color: "bg-stone-100 text-stone-600", overdue: false };
  if (member.end_date && member.end_date < todayStr) return { label: `تم إنهاء التعيين (${member.end_date})`, color: "bg-stone-200 text-stone-600", overdue: false };
  if (isStaffPaidThisMonth(member, today)) return { label: "مدفوع هذا الشهر", color: "bg-emerald-100 text-emerald-800", overdue: false };
  if (today.getDate() <= SALARY_GRACE_DAY) return { label: "لم يحن الموعد بعد", color: "bg-stone-100 text-stone-600", overdue: false };
  return { label: "متأخر", color: "bg-rose-100 text-rose-800", overdue: true };
}

// Technical performance evaluation: a 0-10 star rating expressed as a percentage,
// with a plain-language performance label for quick reading on a printed report.
export function staffPerformancePercent(rating) {
  return Math.round((Number(rating || 0) / 10) * 100);
}

export function staffPerformanceLabel(rating) {
  if (!rating) return { label: "لم يتم التقييم", color: "bg-stone-100 text-stone-600" };
  const pct = staffPerformancePercent(rating);
  if (pct >= 90) return { label: "ممتاز", color: "bg-emerald-100 text-emerald-800" };
  if (pct >= 75) return { label: "جيد جدًا", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 60) return { label: "جيد", color: "bg-amber-100 text-amber-800" };
  if (pct >= 40) return { label: "متوسط", color: "bg-orange-100 text-orange-800" };
  return { label: "ضعيف", color: "bg-rose-100 text-rose-800" };
}

export function staffMonthlyTotal(staff, today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  return (staff || []).filter((s) => (!s.start_date || s.start_date <= todayStr) && (!s.end_date || s.end_date >= todayStr)).reduce((a, s) => a + Number(s.monthly_salary || 0), 0);
}

export function staffPaidTotal(staff) {
  return (staff || []).reduce((a, s) => a + sum(s.staff_payments, "amount") + sum(s.staff_payments, "overtime"), 0);
}

export function staffOverdueTotal(staff, today = new Date()) {
  return (staff || []).filter((s) => staffStatus(s, today).overdue).reduce((a, s) => a + Number(s.monthly_salary || 0), 0);
}

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function formatMonthKey(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return `${ARABIC_MONTHS[m - 1]} ${y}`;
}

// All 'YYYY-MM' months from a staff member's start_date through the current month
// (or their end_date if the assignment already ended before this month) — lets the
// admin backfill payment history for staff who joined (in real life) before this
// system did, instead of only ever being able to mark the current month paid.
export function monthsSinceStart(startDate, endDate, today = new Date()) {
  const endKey = currentMonthKey(today);
  const cappedEndKey = endDate && endDate.slice(0, 7) < endKey ? endDate.slice(0, 7) : endKey;
  if (!startDate) return [cappedEndKey];
  const start = new Date(startDate);
  const [endY, endM] = cappedEndKey.split("-").map(Number);
  let y = start.getFullYear();
  let m = start.getMonth() + 1;
  if (y > endY || (y === endY && m > endM)) return [];
  const months = [];
  while (y < endY || (y === endY && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months.reverse();
}

export function paymentForMonth(member, month) {
  return (member.staff_payments || []).find((sp) => sp.month === month) || null;
}

// Days actually worked in a given 'YYYY-MM', accounting for a start_date and/or
// end_date that falls inside that month — used both to prorate the salary due and
// to show the admin why a partial month isn't the full monthly_salary.
export function workedDaysInMonth(member, month) {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const start = member.start_date ? new Date(member.start_date) : null;
  const end = member.end_date ? new Date(member.end_date) : null;
  const isStartMonth = start && start.getFullYear() === y && start.getMonth() + 1 === m;
  const isEndMonth = end && end.getFullYear() === y && end.getMonth() + 1 === m;
  const fromDay = isStartMonth ? start.getDate() : 1;
  const toDay = isEndMonth ? end.getDate() : daysInMonth;
  return { fromDay, toDay, daysInMonth, workedDays: Math.max(0, toDay - fromDay + 1), isPartial: isStartMonth || isEndMonth };
}

// Salary due for a given 'YYYY-MM': the full monthly_salary, except a month
// containing the start_date and/or end_date, which is prorated by days worked
// (so starting on 27/4 only counts the ~4 remaining days of April, not a full month;
// same for the final month once an assignment is ended mid-month).
export function proratedSalaryForMonth(member, month) {
  const salary = Number(member.monthly_salary || 0);
  const [y, m] = month.split("-").map(Number);
  if (member.end_date) {
    const end = new Date(member.end_date);
    if (end.getFullYear() < y || (end.getFullYear() === y && end.getMonth() + 1 < m)) return 0;
  }
  const { daysInMonth, workedDays, isPartial } = workedDaysInMonth(member, month);
  if (!isPartial) return salary;
  return Math.round((salary / daysInMonth) * workedDays);
}

export function sum(rows, key) {
  return (rows || []).reduce((a, r) => a + Number(r[key] || 0), 0);
}

// The claim's amount is tax-inclusive (a gross invoice total), so the VAT riyal
// amount is extracted proportionally rather than added on top — e.g. a 115,000
// invoice at 15% VAT is 100,000 net + 15,000 VAT, so 115,000 × 15 ÷ 115 = 15,000.
// Derived from the amount and percentage, not stored redundantly, so it always
// matches even if the claim amount is edited later.
export function claimVatAmount(claim) {
  if (!claim.includes_vat) return 0;
  const rate = Number(claim.vat_rate || 0);
  return rate > 0 ? (Number(claim.amount || 0) * rate) / (100 + rate) : 0;
}

// The real cost of a claim once its recoverable VAT is excluded — VAT paid to a
// subcontractor is reclaimed from the tax authority later, so it isn't an actual
// project expense.
export function netClaimAmount(claim) {
  return Number(claim.amount || 0) - claimVatAmount(claim);
}

export function sumNetClaims(claims) {
  return (claims || []).reduce((a, c) => a + netClaimAmount(c), 0);
}

export function sumClaimsVat(claims) {
  return (claims || []).reduce((a, c) => a + claimVatAmount(c), 0);
}

function groupSum(rows, key, valueKey) {
  const map = {};
  for (const r of rows || []) {
    map[r[key]] = (map[r[key]] || 0) + Number(r[valueKey] || 0);
  }
  return map;
}

// Aggregated expenses/revenue/needs per project, across every project the
// caller's RLS allows them to see — used by the Company Overview and Needs pages.
export async function fetchCompanyFinancials(supabase, projects) {
  const [custodyReceived, custodySpent, laborCosts, laborPayments, staff, revenues, subcontractors] = await Promise.all([
    supabase.from("custody_received").select("project_id, amount"),
    supabase.from("custody_spent").select("project_id, amount"),
    supabase.from("labor_costs").select("project_id, cost"),
    supabase.from("labor_payments").select("project_id, amount"),
    supabase.from("staff").select("project_id, monthly_salary, start_date, end_date, staff_payments(month, amount, overtime)"),
    supabase.from("revenues").select("project_id, amount"),
    supabase.from("subcontractors").select("project_id, subcontractor_claims(amount, includes_vat, vat_rate), subcontractor_payments(amount)"),
  ]);
  for (const r of [custodyReceived, custodySpent, laborCosts, laborPayments, staff, revenues, subcontractors]) {
    if (r.error) throw r.error;
  }

  const custodyReceivedByProject = groupSum(custodyReceived.data, "project_id", "amount");
  const custodySpentByProject = groupSum(custodySpent.data, "project_id", "amount");
  const laborCostByProject = groupSum(laborCosts.data, "project_id", "cost");
  const laborPaidByProject = groupSum(laborPayments.data, "project_id", "amount");
  const revenueByProject = groupSum(revenues.data, "project_id", "amount");

  const staffByProject = {};
  for (const s of staff.data || []) {
    (staffByProject[s.project_id] = staffByProject[s.project_id] || []).push(s);
  }

  const subClaimsByProject = {};
  const subVatByProject = {};
  const subPaidByProject = {};
  for (const s of subcontractors.data || []) {
    subClaimsByProject[s.project_id] = (subClaimsByProject[s.project_id] || 0) + sum(s.subcontractor_claims, "amount");
    subVatByProject[s.project_id] = (subVatByProject[s.project_id] || 0) + sumClaimsVat(s.subcontractor_claims);
    subPaidByProject[s.project_id] = (subPaidByProject[s.project_id] || 0) + sum(s.subcontractor_payments, "amount");
  }

  return projects.map((p) => {
    const custodyReceivedAmt = custodyReceivedByProject[p.id] || 0;
    const custodySpentAmt = custodySpentByProject[p.id] || 0;
    const laborCost = laborCostByProject[p.id] || 0;
    const laborPaid = laborPaidByProject[p.id] || 0;
    const subClaims = subClaimsByProject[p.id] || 0;
    const subVat = subVatByProject[p.id] || 0;
    const subPaid = subPaidByProject[p.id] || 0;
    const subPaidNet = subPaid - subVat;
    const projectStaff = staffByProject[p.id] || [];
    const staffPaid = staffPaidTotal(projectStaff);
    const staffOverdue = staffOverdueTotal(projectStaff);
    const revenue = revenueByProject[p.id] || 0;
    const expenses = custodySpentAmt + laborCost + staffPaid + subPaidNet;
    return {
      id: p.id,
      name: p.name,
      expenses,
      revenue,
      profit: revenue - expenses,
      custodyNeeded: Math.max(0, -(custodyReceivedAmt - custodySpentAmt)),
      laborNeeded: Math.max(0, laborCost - laborPaid),
      subcontractorsNeeded: Math.max(0, subClaims - subPaid),
      staffNeeded: staffOverdue,
    };
  }).map((f) => ({ ...f, totalNeeded: f.custodyNeeded + f.laborNeeded + f.subcontractorsNeeded + f.staffNeeded }));
}
