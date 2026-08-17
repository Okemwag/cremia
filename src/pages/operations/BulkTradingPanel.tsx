import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { AlertTriangle, History, KeyRound, LoaderCircle, RefreshCw, Send } from "lucide-react";
import {
  apiErrorMessage,
  type BulkContractParameters,
  type BulkPurchaseAccount,
  type BulkPurchaseOperation,
  type BulkProviderError,
  type BulkPurchaseTransaction,
  useSynexAPI,
} from "../../features/platform/services/synexApi";

const defaultContract = JSON.stringify({
  contract_type: "CALL",
  underlying_symbol: "R_100",
  amount: 1,
  basis: "stake",
  currency: "USD",
  duration: 5,
  duration_unit: "t",
}, null, 2);

function newIdempotencyKey() {
  return `bulk:${crypto.randomUUID()}`;
}

export default function BulkTradingPanel() {
  const api = useSynexAPI();
  const [bulkKey, setBulkKey] = useState("");
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [contractJSON, setContractJSON] = useState(defaultContract);
  const [accountRows, setAccountRows] = useState("");
  const [realConfirmed, setRealConfirmed] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [operation, setOperation] = useState<BulkPurchaseOperation>();
  const [history, setHistory] = useState<BulkPurchaseOperation[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [error, setError] = useState("");

  const accounts = useMemo(() => parseAccounts(accountRows), [accountRows]);
  const accountLineCount = useMemo(() => accountRows.split(/\r?\n/).filter((line) => line.trim()).length, [accountRows]);
  const confirmationPhrase = `BUY REAL CONTRACTS FOR ${accounts.length} ACCOUNTS`;
  const transactions = operation?.response_payload?.data?.transactions || [];
  const providerErrors = operation?.response_payload?.errors || [];

  const execute = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setOperation(undefined);
    if (!accounts.length) {
      setError("Enter at least one account as account_id,PAT.");
      return;
    }
    if (accounts.length !== accountLineCount) {
      setError("Every non-empty account row must use the exact account_id,PAT format.");
      return;
    }
    let contractParameters: BulkContractParameters;
    try {
      contractParameters = JSON.parse(contractJSON) as BulkContractParameters;
    } catch {
      setError("Contract parameters must be valid JSON.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.executeBulkPurchase(bulkKey, mode, idempotencyKey, {
        contract_parameters: contractParameters,
        accounts,
        ...(mode === "real" ? { real_money_confirmed: realConfirmed, confirmation_text: confirmation } : {}),
      });
      setOperation(result.operation);
      setHistory((current) => [result.operation, ...current.filter((item) => item.id !== result.operation.id)]);
      if (!result.replayed) setIdempotencyKey(newIdempotencyKey());
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      // PATs are intentionally held only in component/request memory and are
      // removed immediately after every network attempt.
      setAccountRows("");
      setConfirmation("");
      setRealConfirmed(false);
      setBusy(false);
    }
  };

  const loadHistory = async () => {
    setHistoryBusy(true);
    setError("");
    try {
      setHistory(await api.bulkPurchaseOperations(bulkKey));
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setHistoryBusy(false);
    }
  };

  return <section className="mt-12 border-t border-black/[.08] pt-10">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.15em] text-black/30">bulk_trade_operator only</p><h2 className="mt-1 text-3xl font-semibold tracking-[-.05em]">Bulk contract execution</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-black/45">Paste one Deriv account and trade-scoped PAT per row. PATs are sent directly through the backend to Deriv, are never saved by Synex, and are cleared from this page after each request.</p></div>
      <button type="button" disabled={historyBusy || bulkKey.length < 32} onClick={loadHistory} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold disabled:opacity-40">{historyBusy ? <LoaderCircle size={15} className="animate-spin"/> : <History size={15}/>}Audit history</button>
    </div>
    <div className="mt-5 flex gap-3 rounded-2xl border border-amber-800/15 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"><AlertTriangle className="mt-0.5 shrink-0" size={18}/><p>Deriv validates each PAT/account pair and account type. A response can be partially successful. Never retry a partial or unknown result with a new idempotency key until every account is reconciled.</p></div>

    <form onSubmit={execute} className="mt-6 grid gap-5 rounded-3xl border border-black/[.07] bg-white/55 p-6 shadow-sm lg:grid-cols-2">
      <Field label="Dedicated bulk operator key"><div className="relative mt-2"><KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"/><input type="password" autoComplete="off" required minLength={32} value={bulkKey} onChange={(event) => setBulkKey(event.target.value)} className="w-full rounded-xl border border-black/[.08] bg-white py-3.5 pl-11 pr-4 text-sm font-semibold normal-case outline-none"/></div></Field>
      <Field label="Execution environment"><div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-black/[.04] p-1">{(["demo", "real"] as const).map((value) => <button key={value} type="button" onClick={() => { setMode(value); setConfirmation(""); setRealConfirmed(false); }} className={`rounded-lg px-4 py-3 text-sm font-semibold capitalize ${mode === value ? "bg-[#111310] text-white" : "text-black/45"}`}>{value}</button>)}</div></Field>
      <Field label="Idempotency key"><div className="mt-2 flex gap-2"><input required minLength={8} maxLength={128} value={idempotencyKey} onChange={(event) => setIdempotencyKey(event.target.value)} className="w-full rounded-xl border border-black/[.08] bg-white px-4 py-3.5 font-mono text-xs font-semibold normal-case outline-none"/><button type="button" onClick={() => setIdempotencyKey(newIdempotencyKey())} title="Generate a new key" className="rounded-xl border border-black/[.08] bg-white px-4"><RefreshCw size={15}/></button></div></Field>
      <Field label={`Accounts and PATs (${accounts.length}/100)`}><textarea required autoComplete="off" spellCheck={false} value={accountRows} onChange={(event) => setAccountRows(event.target.value)} placeholder={"CR123456,trade-scoped-PAT\nCR987654,trade-scoped-PAT"} className="mt-2 min-h-32 w-full resize-y rounded-xl border border-black/[.08] bg-white px-4 py-3.5 font-mono text-xs font-semibold normal-case outline-none"/><p className="mt-2 text-xs font-medium normal-case tracking-normal text-black/35">One <code>account_id,PAT</code> pair per line. Do not paste more than 100.</p></Field>
      <Field label="Contract parameters JSON" className="lg:col-span-2"><textarea required spellCheck={false} value={contractJSON} onChange={(event) => setContractJSON(event.target.value)} className="mt-2 min-h-64 w-full resize-y rounded-xl border border-black/[.08] bg-white px-4 py-3.5 font-mono text-xs font-semibold leading-relaxed normal-case outline-none"/></Field>
      {mode === "real" && <div className="rounded-2xl border border-red-900/15 bg-red-50 p-5 lg:col-span-2"><label className="flex items-start gap-3 text-sm font-semibold text-red-950"><input type="checkbox" required checked={realConfirmed} onChange={(event) => setRealConfirmed(event.target.checked)} className="mt-1"/>I have verified every account, amount, contract term, and understand this will spend real money.</label><label className="mt-4 block text-xs font-bold uppercase tracking-[.12em] text-red-900/60">Type exactly: <span className="select-all text-red-950">{confirmationPhrase}</span><input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-red-900/15 bg-white px-4 py-3.5 text-sm font-semibold normal-case outline-none"/></label></div>}
      <button disabled={busy || accounts.length < 1 || accounts.length > 100} className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white disabled:opacity-40 lg:col-span-2 ${mode === "real" ? "bg-red-700" : "bg-[#111310]"}`}>{busy ? <><LoaderCircle size={15} className="animate-spin"/>Sending once</> : <><Send size={15}/>Execute {mode} bulk purchase</>}</button>
    </form>

    {error && <div className="mt-5 rounded-2xl border border-red-900/10 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {operation && <OperationResult operation={operation} transactions={transactions} providerErrors={providerErrors}/>}
    {history.length > 0 && <div className="mt-8 overflow-hidden rounded-3xl border border-black/[.07] bg-white/55"><div className="border-b border-black/[.06] px-6 py-5"><h3 className="text-lg font-semibold">Credential-free audit history</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-[10px] uppercase tracking-[.1em] text-black/35"><tr><th className="px-6 py-3">Created</th><th>Reference</th><th>Mode</th><th>Contract</th><th>Accounts</th><th>Status</th></tr></thead><tbody>{history.map((item) => <tr key={item.id} className="border-t border-black/[.05]"><td className="px-6 py-4 text-black/45">{new Date(item.created_at).toLocaleString()}</td><td className="max-w-64 truncate pr-4 font-mono text-xs">{item.idempotency_key}</td><td className="font-semibold uppercase">{item.mode}</td><td>{item.contract_type} · {item.symbol}</td><td>{item.account_count}</td><td><Status value={item.status}/></td></tr>)}</tbody></table></div></div>}
  </section>;
}

function parseAccounts(raw: string): BulkPurchaseAccount[] {
  return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).flatMap((line) => {
    const separator = line.indexOf(",");
    if (separator < 1) return [];
    const accountID = line.slice(0, separator).trim();
    const token = line.slice(separator + 1).trim();
    return accountID && token ? [{ account_id: accountID, token }] : [];
  });
}

function OperationResult({ operation, transactions, providerErrors }: { operation: BulkPurchaseOperation; transactions: BulkPurchaseTransaction[]; providerErrors: BulkProviderError[] }) {
  return <div className="mt-8 rounded-3xl border border-black/[.07] bg-white/55 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs text-black/40">{operation.idempotency_key}</p><h3 className="mt-1 text-xl font-semibold">{operation.contract_type} on {operation.symbol}</h3></div><Status value={operation.status}/></div>{providerErrors.length > 0 && <div className="mt-5 space-y-2">{providerErrors.map((item, index) => <div key={`${item.code}-${index}`} className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"><strong>{item.code}</strong>{item.field ? ` · ${item.field}` : ""}: {item.message}</div>)}</div>}{transactions.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-[10px] uppercase tracking-[.1em] text-black/35"><tr><th className="py-3">Account</th><th>Contract</th><th>Transaction</th><th>Buy price</th><th>Result</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.account_id} className="border-t border-black/[.06]"><td className="py-4 font-semibold">{item.account_id}</td><td>{item.contract_id || "—"}</td><td>{item.transaction_id || "—"}</td><td>{item.buy_price || "—"}</td><td className={item.error ? "max-w-sm text-red-700" : "text-emerald-700"}>{item.error ? `${item.error.code}: ${item.error.message}` : "Purchased"}</td></tr>)}</tbody></table></div>}</div>;
}

function Status({ value }: { value: BulkPurchaseOperation["status"] }) { const tone = value === "succeeded" ? "bg-emerald-100 text-emerald-800" : value === "failed" ? "bg-red-100 text-red-800" : value === "partial" || value === "unknown" ? "bg-amber-100 text-amber-900" : "bg-black/5 text-black/55"; return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.08em] ${tone}`}>{value}</span>; }
function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) { return <label className={`text-xs font-bold uppercase tracking-[.12em] text-black/35 ${className}`}>{label}{children}</label>; }
