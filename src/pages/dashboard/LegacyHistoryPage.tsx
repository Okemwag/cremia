import { ArchiveRestore, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { APIError, apiErrorMessage, useSynexAPI } from "../../features/platform/services/synexApi";

const pageSize = 100;

export default function LegacyHistoryPage() {
  const api = useSynexAPI();
  const [status, setStatus] = useState("loading");
  const [accountsPayload, setAccountsPayload] = useState<Record<string, unknown>>({});
  const [loginID, setLoginID] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [statement, setStatement] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [error, setError] = useState("");

  const loginIDs = useMemo(() => extractLoginIDs(accountsPayload), [accountsPayload]);
  const rows = useMemo(() => extractTransactions(statement), [statement]);
  const total = useMemo(() => extractCount(statement, rows.length), [statement, rows.length]);

  useEffect(() => {
    void Promise.all([api.legacyMigrationStatus(), api.legacyAccounts()]).then(([nextStatus, nextAccounts]) => {
      setStatus(extractStatus(nextStatus));
      setAccountsPayload(nextAccounts);
      const ids = extractLoginIDs(nextAccounts);
      setLoginID(ids[0] || "");
    }).catch((reason) => {
      if (reason instanceof APIError && reason.status === 404) setStatus("not_applicable");
      else setError(apiErrorMessage(reason));
    }).finally(() => setLoading(false));
  }, [api]);

  const loadStatement = async (nextOffset = offset) => {
    if (!loginID) return;
    setLoadingStatement(true); setError("");
    try {
      const value = await api.legacyStatement({
        loginid: loginID,
        date_from: dateFrom ? Math.floor(new Date(`${dateFrom}T00:00:00Z`).getTime() / 1000) : undefined,
        date_to: dateTo ? Math.floor(new Date(`${dateTo}T00:00:00Z`).getTime() / 1000) + 86400 : undefined,
        action_type: action || undefined,
        limit: pageSize,
        offset: nextOffset,
      });
      setStatement(value); setOffset(nextOffset);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoadingStatement(false); }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void loadStatement(0); };

  return <>
    <PageHeader eyebrow="Historical records" title="Legacy Deriv history" description="Read-only records from Deriv's pre-upgrade Options platform."/>
    <div className="mt-6"><Feedback tone="info"><ArchiveRestore size={15} className="mr-2 inline"/><b>Temporary feature:</b> Deriv will retire these endpoints after platform migration is complete. Current trading, balances, and statements remain in the normal Synex screens.</Feedback></div>
    {error && <div className="mt-4"><Feedback>{error}</Feedback></div>}
    {loading ? <Surface className="mt-8 grid min-h-[220px] place-items-center"><LoaderCircle className="animate-spin"/></Surface> : loginIDs.length === 0 ? <Surface className="mt-8 p-8"><h2 className="text-xl font-semibold">No legacy mapping</h2><p className="mt-2 text-sm text-black/45">Migration status: <b>{status.replace(/_/g, " ")}</b>. Accounts created after Deriv's platform upgrade normally have no legacy history.</p></Surface> : <>
      <Surface className="mt-8 p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Migration status</p><p className="mt-2 text-xl font-semibold capitalize">{status.replace(/_/g, " ")}</p></div><p className="max-w-md text-sm text-black/40">Legacy accounts and statements are read-only. A pending or failed migration may temporarily block history retrieval.</p></div>
        <form onSubmit={submit} className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5"><SelectField label="Legacy account" value={loginID} onChange={setLoginID} options={loginIDs}/><SelectField label="Transaction type" value={action} onChange={setAction} options={["", "buy", "sell", "deposit", "withdrawal", "transfer", "hold", "release", "adjustment", "escrow"]}/><DateField label="From" value={dateFrom} onChange={setDateFrom}/><DateField label="To" value={dateTo} onChange={setDateTo}/><button disabled={loadingStatement} className="self-end rounded-full bg-[#111310] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-40">Load history</button></form>
      </Surface>
      <Surface className="mt-4 overflow-hidden"><div className="flex items-center justify-between border-b border-black/[.06] px-6 py-5"><div><h2 className="text-lg font-semibold">Legacy statement</h2><p className="mt-1 text-xs text-black/35">{total} transaction{total === 1 ? "" : "s"}</p></div>{loadingStatement && <LoaderCircle size={18} className="animate-spin"/>}</div>{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-black/[.025] text-[10px] uppercase tracking-[.12em] text-black/35"><tr><th className="px-6 py-3">Time</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Balance after</th><th className="px-6 py-3">Transaction ID</th></tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.transaction_id ?? index)} className="border-t border-black/[.05]"><td className="px-6 py-4">{formatTime(row.transaction_time)}</td><td className="px-6 py-4 capitalize">{String(row.action_type ?? "—")}</td><td className="px-6 py-4 font-semibold">{String(row.amount ?? "—")} {String(row.currency ?? "")}</td><td className="px-6 py-4">{String(row.balance_after ?? "—")}</td><td className="px-6 py-4 font-mono text-xs">{String(row.transaction_id ?? "—")}</td></tr>)}</tbody></table></div> : <p className="px-6 py-10 text-sm text-black/35">Choose filters and load the legacy statement.</p>}<div className="flex justify-end gap-2 border-t border-black/[.06] px-6 py-4"><button disabled={offset === 0 || loadingStatement} onClick={() => void loadStatement(Math.max(0, offset - pageSize))} className="rounded-full border border-black/10 p-2.5 disabled:opacity-30"><ChevronLeft size={15}/></button><button disabled={rows.length < pageSize || offset + pageSize >= total || loadingStatement} onClick={() => void loadStatement(offset + pageSize)} className="rounded-full border border-black/10 p-2.5 disabled:opacity-30"><ChevronRight size={15}/></button></div></Surface>
    </>}
  </>;
}

function payloadData(payload: Record<string, unknown>): Record<string, unknown> { const data = payload.data; return data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : payload; }
function extractStatus(payload: Record<string, unknown>): string { const data = payloadData(payload); return String(data.status ?? data.migration_status ?? "unknown"); }
function extractLoginIDs(payload: Record<string, unknown>): string[] { const data = payloadData(payload); const map = data.loginids; if (!map || typeof map !== "object" || Array.isArray(map)) return []; return Object.keys(map).filter((key) => /^[A-Z]+[0-9]+$/.test(key)).sort(); }
function extractTransactions(payload: Record<string, unknown>): Record<string, unknown>[] { const data = payloadData(payload); const statement = data.statement && typeof data.statement === "object" ? data.statement as Record<string, unknown> : data; const rows = statement.transactions; return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")) : []; }
function extractCount(payload: Record<string, unknown>, fallback: number): number { const data = payloadData(payload); const statement = data.statement && typeof data.statement === "object" ? data.statement as Record<string, unknown> : data; const count = Number(statement.count ?? fallback); return Number.isFinite(count) ? count : fallback; }
function formatTime(value: unknown): string { const epoch = Number(value); return Number.isFinite(epoch) && epoch > 0 ? new Date(epoch * 1000).toLocaleString() : "—"; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none">{options.map((option) => <option key={option || "all"} value={option}>{option ? option.replace(/_/g," ") : "All types"}</option>)}</select></label>; }
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3 text-sm font-semibold normal-case outline-none"/></label>; }
