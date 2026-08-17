import { type FormEvent, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, KeyRound, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { apiErrorMessage, useSynexAPI } from "../../features/platform/services/synexApi";
import BulkTradingPanel from "./BulkTradingPanel";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

export default function OperationsPage() {
  const api = useSynexAPI();
  const [key, setKey] = useState("");
  const [dateFrom, setDateFrom] = useState(weekAgo);
  const [dateTo, setDateTo] = useState(today);
  const [payload, setPayload] = useState<Record<string, unknown>>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const metrics = useMemo(() => numericLeaves(payload), [payload]);

  const load = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setPayload(undefined);
    try { setPayload(await api.applicationMarkupStatistics(key, dateFrom, dateTo)); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-[#edede8] px-5 py-10 text-[#0b0c0b] sm:px-10"><div className="mx-auto max-w-6xl"><Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-black/45"><ArrowLeft size={15}/> Synex</Link><div className="mt-10 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#111310] text-white"><BarChart3 size={20}/></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-black/30">Restricted operations</p><h1 className="text-3xl font-semibold tracking-[-.05em]">Application statistics</h1></div></div><p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/45">This page never receives the Deriv application-owner credential. Enter the separate Synex operations key; the backend uses its server-only <code>application_read</code> credential to retrieve aggregated markup and trading statistics.</p>
    <form onSubmit={load} className="mt-8 grid gap-4 rounded-3xl border border-black/[.07] bg-white/55 p-6 shadow-sm md:grid-cols-4"><label className="text-xs font-bold uppercase tracking-[.12em] text-black/35 md:col-span-2">Operations key<div className="relative mt-2"><KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"/><input type="password" autoComplete="off" required minLength={32} value={key} onChange={(event) => setKey(event.target.value)} className="w-full rounded-xl border border-black/[.08] bg-white px-11 py-3.5 text-sm font-semibold normal-case outline-none"/></div></label><DateField label="From (UTC)" value={dateFrom} onChange={setDateFrom}/><DateField label="To (UTC)" value={dateTo} onChange={setDateTo}/><button disabled={busy} className="rounded-full bg-[#111310] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-40 md:col-span-4">{busy ? <><LoaderCircle size={15} className="mr-2 inline animate-spin"/>Loading</> : "Load Deriv statistics"}</button></form>
    {error && <div className="mt-5 rounded-2xl border border-red-900/10 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {payload && <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_420px]"><section className="rounded-3xl border border-black/[.07] bg-white/55 p-6"><h2 className="text-xl font-semibold">Aggregated metrics</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{metrics.length ? metrics.map(([label,value]) => <div key={label} className="rounded-2xl bg-black/[.035] p-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-black/35">{label.replace(/[._]/g," ")}</p><p className="mt-2 text-xl font-semibold">{value.toLocaleString()}</p></div>) : <p className="text-sm text-black/40">Deriv returned no numeric totals for this period.</p>}</div></section><section className="rounded-3xl border border-black/[.07] bg-[#111310] p-6 text-white"><h2 className="text-lg font-semibold">Provider response</h2><pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap break-all text-xs leading-relaxed text-white/65">{JSON.stringify(payload, null, 2)}</pre></section></div>}
    <BulkTradingPanel/>
    </div></div>;
}

function numericLeaves(value: unknown, prefix = ""): Array<[string, number]> { if (!value || typeof value !== "object") return []; return Object.entries(value as Record<string, unknown>).flatMap(([key,item]) => { const label = prefix ? `${prefix}.${key}` : key; if (typeof item === "number" && Number.isFinite(item)) return [[label, item] as [string, number]]; if (typeof item === "string" && item.trim() && Number.isFinite(Number(item))) return [[label, Number(item)] as [string, number]]; return numericLeaves(item, label); }).slice(0, 24); }
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<input type="date" required value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white px-4 py-3.5 text-sm font-semibold normal-case outline-none"/></label>; }
