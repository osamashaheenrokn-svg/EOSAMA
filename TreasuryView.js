"use client";

import { Vault, FileSpreadsheet, Upload, Plus, Check, Pencil } from "lucide-react";
import { PrintHeader } from "../PrintHeader";
import { PrintButton } from "../PrintButton";
import { RowActions } from "../RowActions";

export function TreasuryView({
  isAdmin, treasuryData, t, totalDeposits, totalWithdrawals, netInvested, custodyRemaining, netProfit,
  setTreasuryField, setOverride, clearOverride,
  newDeposit, setNewDeposit, addDeposit, deleteDeposit,
  newWithdrawal, setNewWithdrawal, addWithdrawal, deleteWithdrawal,
  importMessage, importTreasuryFromExcel, grantableRoster, setUserFlag,
}) {
  if (!t) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto print-area">
      <PrintHeader title="تقرير الخزينة الرئيسية" />
      <PrintButton />
      <div className="flex items-center gap-2 mb-1">
        <Vault className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>الخزينة الرئيسية</h1>
      </div>
      <div className="text-sm text-stone-500 mb-5">مرئية فقط للمدير، أو لمن يمنحه المدير الصلاحية صراحةً — لا تظهر لأي مهندس آخر.</div>

      {isAdmin && (
        <div className="no-print bg-white border border-stone-200 rounded-lg p-4 mb-6">
          <div className="text-sm font-bold mb-1 flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4 text-emerald-700" /> تحديث الأرقام من ملف إكسل</div>
          <div className="text-xs text-stone-500 mb-3">ارفع ملف إكسل وهيحاول النظام يتعرّف على الأرقام ويعبّيها تلقائيًا — تقدر برضه تدخل أو تعدّل أي رقم يدويًا في أي وقت.</div>
          <label className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">
            <Upload className="w-4 h-4" /> اختيار ملف إكسل
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files[0] && importTreasuryFromExcel(e.target.files[0])} />
          </label>
          {importMessage && (
            <div className="mt-3 text-xs bg-stone-50 border border-stone-200 rounded-lg p-3 whitespace-pre-line text-stone-700">{importMessage}</div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">صافي رأس المال المستثمر حتى تاريخه</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{netInvested.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">صافي الربح / الخسارة</div>
          <div className={`text-lg font-bold ${netProfit < 0 ? "text-rose-700" : "text-emerald-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">إجمالي الرصيد المتبقي بالعهد</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{custodyRemaining.toLocaleString()} ر.س</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs text-stone-500 mb-1">مستخلصات خارجية وتعليات</div>
          <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(t.external_claims).toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-6">
        <div className="text-sm font-bold mb-3">بيان حركة الحسابات</div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-stone-500">
            المدفوع من رأس المال <span className="text-stone-400">({t.override_capital_paid != null ? "معدَّل يدويًا" : "محسوب تلقائيًا"})</span>
            {isAdmin ? (
              <div className="flex items-center gap-1 mt-1">
                <input defaultValue={totalDeposits} onBlur={(e) => setOverride("override_capital_paid", e.target.value.replace(/[^0-9.-]/g, ""))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                {t.override_capital_paid != null && <button onClick={() => clearOverride("override_capital_paid")} className="text-xs text-amber-700 border border-amber-300 rounded px-2 py-2 whitespace-nowrap">تلقائي</button>}
              </div>
            ) : (
              <div className="mt-1 font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{totalDeposits.toLocaleString()}</div>
            )}
          </label>
          <label className="text-xs text-stone-500">
            الراجع من رأس المال للشركاء <span className="text-stone-400">({t.override_capital_returned != null ? "معدَّل يدويًا" : "محسوب تلقائيًا"})</span>
            {isAdmin ? (
              <div className="flex items-center gap-1 mt-1">
                <input defaultValue={totalWithdrawals} onBlur={(e) => setOverride("override_capital_returned", e.target.value.replace(/[^0-9.-]/g, ""))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                {t.override_capital_returned != null && <button onClick={() => clearOverride("override_capital_returned")} className="text-xs text-amber-700 border border-amber-300 rounded px-2 py-2 whitespace-nowrap">تلقائي</button>}
              </div>
            ) : (
              <div className="mt-1 font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{totalWithdrawals.toLocaleString()}</div>
            )}
          </label>
          <label className="text-xs text-stone-500">
            صافي الربح والخسارة <span className="text-stone-400">({t.override_net_profit != null ? "معدَّل يدويًا" : "محسوب تلقائيًا"})</span>
            {isAdmin ? (
              <div className="flex items-center gap-1 mt-1">
                <input defaultValue={netProfit} onBlur={(e) => setOverride("override_net_profit", e.target.value.replace(/[^0-9.-]/g, ""))} className={`w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-bold ${netProfit < 0 ? "text-rose-700" : "text-emerald-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
                {t.override_net_profit != null && <button onClick={() => clearOverride("override_net_profit")} className="text-xs text-amber-700 border border-amber-300 rounded px-2 py-2 whitespace-nowrap">تلقائي</button>}
              </div>
            ) : (
              <div className={`mt-1 font-bold ${netProfit < 0 ? "text-rose-700" : "text-emerald-700"}`} style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            )}
          </label>
          {[
            ["external_claims", "رصيد الشركة من مستخلصات خارجية وتعليات"],
            ["cash_custody_remaining", "المتبقي بالعهدة (كاش)"],
            ["company_sheet_remaining", "المتبقي بشيت الشركة"],
          ].map(([key, label]) => (
            <label key={key} className="text-xs text-stone-500">
              {label}
              {isAdmin ? (
                <input defaultValue={t[key]} onBlur={(e) => setTreasuryField(key, e.target.value.replace(/[^0-9.-]/g, ""))} className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
              ) : (
                <div className="mt-1 font-bold text-slate-900" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(t[key]).toLocaleString()}</div>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm font-bold mb-2">إيداعات رأس المال</div>
          {isAdmin && (
            <div className="flex gap-2 mb-3">
              <input value={newDeposit.amount} onChange={(e) => setNewDeposit((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="المبلغ" className="w-24 border border-stone-300 rounded-lg px-2 py-2 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
              <input value={newDeposit.desc} onChange={(e) => setNewDeposit((f) => ({ ...f, desc: e.target.value }))} placeholder="البيان" className="flex-1 border border-stone-300 rounded-lg px-2 py-2 text-sm" />
              <button onClick={addDeposit} className="bg-slate-900 text-white px-3 py-2 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
          )}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">التاريخ</th><th className="text-right p-2">المبلغ</th><th className="text-right p-2">البيان</th>{isAdmin && <th className="text-right p-2">إجراءات</th>}</tr></thead>
              <tbody>
                {treasuryData.deposits.map((dep) => (
                  <tr key={dep.id} className="border-t border-stone-100">
                    <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{dep.date}</td>
                    <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(dep.amount).toLocaleString()}</td>
                    <td className="p-2 text-stone-600">{dep.description}</td>
                    {isAdmin && <td className="p-2"><RowActions canManage={true} onDelete={() => deleteDeposit(dep.id)} /></td>}
                  </tr>
                ))}
                <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-2" colSpan={2}>الإجمالي</td><td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{totalDeposits.toLocaleString()}</td>{isAdmin && <td className="p-2"></td>}</tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold mb-2">الراجع للشركاء من رأس المال</div>
          {isAdmin && (
            <div className="flex gap-2 mb-3">
              <input value={newWithdrawal.amount} onChange={(e) => setNewWithdrawal((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="المبلغ" className="w-24 border border-stone-300 rounded-lg px-2 py-2 text-sm" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }} />
              <input value={newWithdrawal.notes} onChange={(e) => setNewWithdrawal((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات" className="flex-1 border border-stone-300 rounded-lg px-2 py-2 text-sm" />
              <button onClick={addWithdrawal} className="bg-slate-900 text-white px-3 py-2 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
          )}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs"><tr><th className="text-right p-2">التاريخ</th><th className="text-right p-2">المبلغ</th><th className="text-right p-2">ملاحظات</th>{isAdmin && <th className="text-right p-2">إجراءات</th>}</tr></thead>
              <tbody>
                {treasuryData.withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-stone-100">
                    <td className="p-2 text-stone-500" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{w.date}</td>
                    <td className="p-2 font-bold" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{Number(w.amount).toLocaleString()}</td>
                    <td className="p-2 text-stone-600">{w.notes}</td>
                    {isAdmin && <td className="p-2"><RowActions canManage={true} onDelete={() => deleteWithdrawal(w.id)} /></td>}
                  </tr>
                ))}
                <tr className="border-t border-stone-200 bg-stone-50 font-bold"><td className="p-2" colSpan={2}>الإجمالي</td><td className="p-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>{totalWithdrawals.toLocaleString()}</td>{isAdmin && <td className="p-2"></td>}</tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4">
          <div className="text-sm font-bold mb-3">منح صلاحية اطّلاع على الخزينة الرئيسية</div>
          <div className="space-y-2">
            {grantableRoster.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!r.treasury_access} onChange={(e) => setUserFlag(r.id, "treasury_access", e.target.checked)} />
                {r.name}
                {r.treasury_access && <span className="text-xs text-emerald-700 flex items-center gap-0.5"><Check className="w-3 h-3" /> ممنوح</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-sm font-bold mb-1 flex items-center gap-1.5"><Pencil className="w-4 h-4 text-amber-600" /> منح صلاحية تعديل وحذف العهدة والمصروفات</div>
          <div className="text-xs text-stone-500 mb-3">بشكل افتراضي، التعديل والحذف على بنود العهدة والمصروفات متاح للمدير فقط.</div>
          <div className="space-y-2">
            {grantableRoster.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!r.edit_access} onChange={(e) => setUserFlag(r.id, "edit_access", e.target.checked)} />
                {r.name}
                {r.edit_access && <span className="text-xs text-emerald-700 flex items-center gap-0.5"><Check className="w-3 h-3" /> ممنوح</span>}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
