export async function fetchProfiles(supabase) {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
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

export async function fetchProjectDetail(supabase, projectId) {
  const [updates, photos, custodyReceived, custodySpent, laborCosts, laborPayments, salaries, revenues, subcontractors] =
    await Promise.all([
      supabase.from("updates").select("*").eq("project_id", projectId).order("date", { ascending: false }),
      supabase.from("photos").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("custody_received").select("*").eq("project_id", projectId),
      supabase.from("custody_spent").select("*").eq("project_id", projectId),
      supabase.from("labor_costs").select("*").eq("project_id", projectId),
      supabase.from("labor_payments").select("*").eq("project_id", projectId),
      supabase.from("salaries").select("*").eq("project_id", projectId),
      supabase.from("revenues").select("*").eq("project_id", projectId),
      supabase.from("subcontractors").select("*, subcontractor_claims(*), subcontractor_payments(*)").eq("project_id", projectId),
    ]);

  for (const r of [updates, photos, custodyReceived, custodySpent, laborCosts, laborPayments, salaries, revenues, subcontractors]) {
    if (r.error) throw r.error;
  }

  return {
    updates: updates.data,
    photos: photos.data,
    custodyReceived: custodyReceived.data,
    custodySpent: custodySpent.data,
    laborCosts: laborCosts.data,
    laborPayments: laborPayments.data,
    salaries: salaries.data,
    revenues: revenues.data,
    subcontractors: subcontractors.data,
  };
}

export function sum(rows, key) {
  return (rows || []).reduce((a, r) => a + Number(r[key] || 0), 0);
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
  const [custodyReceived, custodySpent, laborCosts, laborPayments, salaries, revenues, subcontractors] = await Promise.all([
    supabase.from("custody_received").select("project_id, amount"),
    supabase.from("custody_spent").select("project_id, amount"),
    supabase.from("labor_costs").select("project_id, cost"),
    supabase.from("labor_payments").select("project_id, amount"),
    supabase.from("salaries").select("project_id, amount"),
    supabase.from("revenues").select("project_id, amount"),
    supabase.from("subcontractors").select("project_id, subcontractor_claims(amount), subcontractor_payments(amount)"),
  ]);
  for (const r of [custodyReceived, custodySpent, laborCosts, laborPayments, salaries, revenues, subcontractors]) {
    if (r.error) throw r.error;
  }

  const custodyReceivedByProject = groupSum(custodyReceived.data, "project_id", "amount");
  const custodySpentByProject = groupSum(custodySpent.data, "project_id", "amount");
  const laborCostByProject = groupSum(laborCosts.data, "project_id", "cost");
  const laborPaidByProject = groupSum(laborPayments.data, "project_id", "amount");
  const salariesByProject = groupSum(salaries.data, "project_id", "amount");
  const revenueByProject = groupSum(revenues.data, "project_id", "amount");

  const subClaimsByProject = {};
  const subPaidByProject = {};
  for (const s of subcontractors.data || []) {
    subClaimsByProject[s.project_id] = (subClaimsByProject[s.project_id] || 0) + sum(s.subcontractor_claims, "amount");
    subPaidByProject[s.project_id] = (subPaidByProject[s.project_id] || 0) + sum(s.subcontractor_payments, "amount");
  }

  return projects.map((p) => {
    const custodyReceivedAmt = custodyReceivedByProject[p.id] || 0;
    const custodySpentAmt = custodySpentByProject[p.id] || 0;
    const laborCost = laborCostByProject[p.id] || 0;
    const laborPaid = laborPaidByProject[p.id] || 0;
    const subClaims = subClaimsByProject[p.id] || 0;
    const subPaid = subPaidByProject[p.id] || 0;
    const salariesAmt = salariesByProject[p.id] || 0;
    const revenue = revenueByProject[p.id] || 0;
    const expenses = custodySpentAmt + laborCost + salariesAmt + subClaims;
    return {
      id: p.id,
      name: p.name,
      expenses,
      revenue,
      profit: revenue - expenses,
      custodyNeeded: Math.max(0, -(custodyReceivedAmt - custodySpentAmt)),
      laborNeeded: Math.max(0, laborCost - laborPaid),
      subcontractorsNeeded: Math.max(0, subClaims - subPaid),
    };
  }).map((f) => ({ ...f, totalNeeded: f.custodyNeeded + f.laborNeeded + f.subcontractorsNeeded }));
}
