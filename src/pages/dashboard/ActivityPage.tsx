import { Download, LoaderCircle, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, formatMoney, type ActivityQuery, useSynexAPI } from "../../features/platform/services/synexApi";

type ActivityTab = "statement" | "profit";
const pageSize = 50;
const filterClass = "rounded-xl border border-black/[.08] bg-white/60 px-3 py-2.5 text-sm font-semibold outline-none focus:border-black/30";

function firstValue(row: Record<string, unknown>, keys: string[]) {
  return keys.map((key) => row[key]).find((item) => item !== undefined && item !== null);
}

function numericValue(row: Record<string, unknown>, key: string) {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function rowEpoch(row: Record<string, unknown>) {
  return Number(firstValue(row, ["sell_time", "transaction_time", "purchase_time"]) || 0);
}

function DetailsCell({ row }: { row: Record<string, unknown> }) {
  return <td className="px-4 py-5 align-top"><details className="max-w-[320px]"><summary className="cursor-pointer text-xs font-semibold text-black/45">View all</summary><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-black/[.04] p-3 text-[11px] leading-relaxed text-black/55">{JSON.stringify(row, null, 2)}</pre></details></td>;
}

function TransactionRows({ rows, currency }: { rows: Record<string, unknown>[]; currency: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead><tr className="border-b border-black/[.07] text-[11px] uppercase tracking-[.13em] text-black/30"><th className="px-6 py-5">Type</th><th className="px-4 py-5">Transaction</th><th className="px-4 py-5">Contract / reference</th><th className="px-4 py-5">Amount</th><th className="px-4 py-5">Balance after</th><th className="px-4 py-5">Details</th><th className="px-6 py-5 text-right">Time</th></tr></thead><tbody>{rows.map((row, index) => {
    const epoch = rowEpoch(row);
    const amount = numericValue(row, "amount");
    const rowCurrency = String(row.currency || currency);
    return <tr key={String(row.transaction_id || index)} className="border-b border-black/[.06] last:border-0"><td className="px-6 py-5 text-sm font-semibold">{String(firstValue(row, ["action_type", "transaction_type", "shortcode"]) || "Transaction")}</td><td className="px-4 py-5 text-sm font-medium text-black/55">{String(row.transaction_id || "—")}</td><td className="px-4 py-5 text-sm text-black/40">{String(firstValue(row, ["contract_id", "reference_id"]) || "—")}</td><td className={`px-4 py-5 text-sm font-semibold ${amount >= 0 ? "text-[#568f47]" : "text-red-600"}`}>{formatMoney(amount, rowCurrency)}</td><td className="px-4 py-5 text-sm font-medium text-black/50">{row.balance_after == null ? "—" : formatMoney(numericValue(row, "balance_after"), rowCurrency)}</td><DetailsCell row={row}/><td className="px-6 py-5 text-right text-sm text-black/40">{epoch ? new Date(epoch * 1000).toLocaleString() : "—"}</td></tr>;
  })}</tbody></table></div>;
}

function TradeResultRows({ rows, currency }: { rows: Record<string, unknown>[]; currency: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1220px] text-left"><thead><tr className="border-b border-black/[.07] text-[11px] uppercase tracking-[.13em] text-black/30"><th className="px-6 py-5">Trade</th><th className="px-4 py-5">Contract</th><th className="px-4 py-5">Transaction</th><th className="px-4 py-5">Paid</th><th className="px-4 py-5">Returned</th><th className="px-4 py-5">Result</th><th className="px-4 py-5">Details</th><th className="px-6 py-5 text-right">Settled</th></tr></thead><tbody>{rows.map((row, index) => {
    const buyPrice = numericValue(row, "buy_price");
    const sellPrice = numericValue(row, "sell_price");
    const settledAt = rowEpoch(row);
    const settled = row.sell_price !== undefined && row.sell_price !== null;
    const profit = sellPrice - buyPrice;
    const outcome = !settled ? "Open" : profit > 0 ? "Won" : profit < 0 ? "Lost" : "Break even";
    return <tr key={String(row.contract_id || row.transaction_id || index)} className="border-b border-black/[.06] last:border-0"><td className="px-6 py-5"><p className="text-sm font-semibold">{String(firstValue(row, ["contract_type", "shortcode"]) || "Trade")}</p><p className="mt-1 max-w-[260px] truncate text-xs text-black/35">{String(firstValue(row, ["underlying_symbol", "longcode"]) || "")}</p></td><td className="px-4 py-5 text-sm font-medium text-black/55">{String(row.contract_id || "—")}</td><td className="px-4 py-5 text-sm text-black/40">{String(row.transaction_id || "—")}</td><td className="px-4 py-5 text-sm font-medium">{formatMoney(buyPrice, currency)}</td><td className="px-4 py-5 text-sm font-medium">{settled ? formatMoney(sellPrice, currency) : "—"}</td><td className={`px-4 py-5 text-sm font-semibold ${!settled ? "text-black/35" : profit >= 0 ? "text-[#568f47]" : "text-red-600"}`}><span className="block">{outcome}</span><span className="mt-1 block text-xs">{settled ? formatMoney(profit, currency) : "Awaiting settlement"}</span></td><DetailsCell row={row}/><td className="px-6 py-5 text-right text-sm text-black/40">{settledAt ? new Date(settledAt * 1000).toLocaleString() : "—"}</td></tr>;
  })}</tbody></table></div>;
}

export default function ActivityPage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID, lastTransaction } = useWorkspace();
  const [tab, setTab] = useState<ActivityTab>("statement");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionType, setActionType] = useState("");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo<ActivityQuery>(() => ({
    limit: pageSize,
    offset,
    sort,
    ...(dateFrom ? { date_from: dateEpoch(dateFrom, false) } : {}),
    ...(dateTo ? { date_to: dateEpoch(dateTo, true) } : {}),
    ...(tab === "statement" && actionType ? { action_type: actionType as ActivityQuery["action_type"] } : {}),
  }), [actionType, dateFrom, dateTo, offset, sort, tab]);

  useEffect(() => {
    setOffset(0);
  }, [activeLoginID, tab]);

  useEffect(() => {
    if (!activeLoginID) { setLoading(false); return; }
    setLoading(true); setError("");
    const request = tab === "statement" ? api.statement(activeLoginID, query) : api.profitTable(activeLoginID, query);
    void request.then((result) => { setRows(result.rows); setCount(result.count); }).catch((reason) => setError(apiErrorMessage(reason))).finally(() => setLoading(false));
  }, [activeLoginID, api, query, tab, lastTransaction?.transaction_id]);

  const displayRows = useMemo(() => [...rows].sort((left, right) => sort === "ASC" ? rowEpoch(left) - rowEpoch(right) : rowEpoch(right) - rowEpoch(left)), [rows, sort]);
  const hasNext = rows.length === pageSize && (count <= rows.length || offset + rows.length < count);

  if (!activeAccount) {
    return <><PageHeader eyebrow="Your history" title="Activity" description="Once you're connected, every transaction and trade result will show up here." /><EmptyAccountState /></>;
  }

  return (
    <>
      <PageHeader eyebrow="Your history" title="Activity" description="Every transaction and every trade result — straight from your Deriv account." action={<button type="button" onClick={() => exportCSV(displayRows, tab)} disabled={!displayRows.length} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold disabled:opacity-35"><Download size={15}/> Export CSV</button>} />
      <div className="mt-8 flex w-fit rounded-full border border-black/[.08] bg-white/45 p-1">
        {(["statement", "profit"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === item ? "bg-[#111310] text-white" : "text-black/40"}`}>{item === "statement" ? "Transactions" : "Trade results"}</button>)}
      </div>
      <Surface className="mt-4 p-4 sm:p-5"><div className="flex flex-wrap items-end gap-3"><Filter label="From"><input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setOffset(0); }} className={filterClass}/></Filter><Filter label="To"><input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setOffset(0); }} className={filterClass}/></Filter>{tab === "statement" && <Filter label="Type"><select value={actionType} onChange={(event) => { setActionType(event.target.value); setOffset(0); }} className={filterClass}><option value="">All</option><option value="buy">Buy</option><option value="sell">Sell</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select></Filter>}<Filter label="Order"><select value={sort} onChange={(event) => setSort(event.target.value as "ASC" | "DESC")} className={filterClass}><option value="DESC">{tab === "statement" ? "Newest on page" : "Newest first"}</option><option value="ASC">{tab === "statement" ? "Oldest on page" : "Oldest first"}</option></select></Filter><button type="button" onClick={() => { setDateFrom(""); setDateTo(""); setActionType(""); setSort("DESC"); setOffset(0); }} className="rounded-full px-4 py-2.5 text-xs font-semibold text-black/45">Clear filters</button></div></Surface>
      {error && <div className="mt-5"><Feedback>{error}</Feedback></div>}
      <Surface className="mt-4 overflow-hidden">
        {loading ? <div className="grid min-h-[320px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : displayRows.length ? (tab === "statement" ? <TransactionRows rows={displayRows} currency={activeAccount.currency}/> : <TradeResultRows rows={displayRows} currency={activeAccount.currency}/>) : <div className="grid min-h-[320px] place-items-center text-center"><div><RefreshCw className="mx-auto text-black/20"/><p className="mt-4 text-sm font-medium text-black/40">Nothing matches these filters yet.</p></div></div>}
      </Surface>
      <div className="mt-4 flex items-center justify-between"><p className="text-xs font-medium text-black/35">Showing {displayRows.length ? offset + 1 : 0}–{offset + displayRows.length}{count > displayRows.length ? ` of ${count}` : ""}</p><div className="flex gap-2"><button type="button" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - pageSize))} className="rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-30">Previous</button><button type="button" disabled={!hasNext || loading} onClick={() => setOffset(offset + pageSize)} className="rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-30">Next</button></div></div>
    </>
  );
}

function Filter({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-black/35">{label}{children}</label>;
}

function dateEpoch(value: string, endOfDay: boolean) {
  return Math.floor(new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`).getTime() / 1000);
}

function exportCSV(rows: Record<string, unknown>[], tab: ActivityTab) {
  if (!rows.length) return;
  const preferred = tab === "statement" ? ["transaction_id", "action_type", "contract_id", "amount", "balance_after", "currency", "transaction_time"] : ["transaction_id", "contract_id", "contract_type", "underlying_symbol", "buy_price", "sell_price", "purchase_time", "sell_time"];
  const keys = Array.from(new Set([...preferred, ...rows.flatMap((row) => Object.keys(row))]));
  const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.map(quote).join(","), ...rows.map((row) => keys.map((key) => quote(typeof row[key] === "object" ? JSON.stringify(row[key]) : row[key])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `synex-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
