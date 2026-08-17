import { Bot, LoaderCircle, Pause, Play, ShieldAlert, Square, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, type ActiveSymbol, type AutomationEvent, type AutomationRun, type AutomationStrategy, type ContractOption, useSynexAPI } from "../../features/platform/services/synexApi";

type StrategyForm = Record<string, string>;
const initialForm: StrategyForm = { name: "", symbol: "", contract_type: "", amount: "10", basis: "stake", duration: "5", duration_unit: "m", barrier: "", barrier2: "", multiplier: "", growth_rate: "", cancellation: "", stop_loss: "", take_profit: "", payout_per_point: "", selected_tick: "", interval_seconds: "60", max_trades: "10", max_loss: "100", max_duration_minutes: "60", max_concurrent_positions: "1" };
const inputClass = "mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3 text-sm font-semibold normal-case outline-none focus:border-black/30";

export default function AutomationPage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID } = useWorkspace();
  const [strategies, setStrategies] = useState<AutomationStrategy[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [form, setForm] = useState<StrategyForm>(initialForm);
  const [editingID, setEditingID] = useState("");
  const [killSwitch, setKillSwitch] = useState(false);
  const [selectedRun, setSelectedRun] = useState<AutomationRun>();
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [nextStrategies, nextRuns, safety, nextSymbols] = await Promise.all([api.automationStrategies(), api.automationRuns(), api.automationSafety(), api.symbols()]);
      setStrategies(nextStrategies); setRuns(nextRuns); setKillSwitch(safety.kill_switch_enabled); setSymbols(nextSymbols);
      setForm((current) => ({ ...current, symbol: current.symbol || nextSymbols[0]?.symbol || "" }));
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!form.symbol) return;
    void api.contracts(form.symbol).then((items) => {
      const unique = Array.from(new Map(items.map((item) => [item.contract_type, item])).values());
      setContracts(unique);
      setForm((current) => ({ ...current, contract_type: unique.some((item) => item.contract_type === current.contract_type) ? current.contract_type : unique[0]?.contract_type || "" }));
    }).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api, form.symbol]);
  useEffect(() => {
    const timer = window.setInterval(() => void api.automationRuns().then(setRuns).catch(() => undefined), 5000);
    return () => window.clearInterval(timer);
  }, [api]);

  if (!activeAccount) return <><PageHeader eyebrow="Repeat safely" title="Automation" description="Connect Deriv before creating a strategy."/><EmptyAccountState/></>;

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    const payload: Record<string, unknown> = { login_id: activeLoginID, name: form.name, symbol: form.symbol, contract_type: form.contract_type, currency: activeAccount.currency, basis: form.basis };
    ["amount","duration","multiplier","growth_rate","stop_loss","take_profit","payout_per_point","selected_tick","interval_seconds","max_trades","max_loss","max_duration_minutes","max_concurrent_positions"].forEach((key) => { if (form[key]) payload[key] = Number(form[key]); });
    ["duration_unit","barrier","barrier2","cancellation"].forEach((key) => { if (form[key]) payload[key] = form[key]; });
    try {
      if (editingID) await api.updateAutomationStrategy(editingID, payload); else await api.createAutomationStrategy(payload);
      setSuccess(editingID ? "Strategy updated." : "Strategy created. Review its safety limits before starting it.");
      setEditingID(""); setForm({ ...initialForm, symbol: form.symbol, contract_type: form.contract_type }); await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const edit = (strategy: AutomationStrategy) => {
    const parameters = strategy.contract_parameters || {};
    const value = (key: string, fallback: unknown = "") => String(parameters[key] ?? fallback ?? "");
    setEditingID(strategy.id);
    setForm({ name: strategy.name, symbol: strategy.symbol, contract_type: strategy.contract_type, amount: String(strategy.amount), basis: strategy.basis, duration: value("duration"), duration_unit: value("duration_unit", "m"), barrier: value("barrier"), barrier2: value("barrier2"), multiplier: value("multiplier"), growth_rate: value("growth_rate"), cancellation: value("cancellation"), stop_loss: value("stop_loss"), take_profit: value("take_profit"), payout_per_point: value("payout_per_point"), selected_tick: value("selected_tick"), interval_seconds: String(strategy.interval_seconds), max_trades: String(strategy.max_trades), max_loss: String(strategy.max_loss), max_duration_minutes: String(strategy.max_duration_minutes), max_concurrent_positions: String(strategy.max_concurrent_positions) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const start = async (strategy: AutomationStrategy) => {
    const real = !strategy.is_virtual;
    if (real && !window.confirm(`Start repeated REAL-MONEY trades for “${strategy.name}”? It may place up to ${strategy.max_trades} trades and commit up to ${strategy.max_loss} ${strategy.currency} of loss budget.`)) return;
    setBusy(true); setError("");
    try { await api.startAutomation(strategy.id, real); setSuccess("Automation started."); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const transition = async (run: AutomationRun, action: "pause" | "resume" | "stop") => {
    if (action === "stop" && !window.confirm("Stop this automation permanently? The current in-flight request, if any, may still finish.")) return;
    setBusy(true); setError("");
    try { await api.transitionAutomation(run.id, action); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const emergency = async () => {
    const enabled = !killSwitch;
    if (enabled && !window.confirm("Emergency stop every active and paused automation? Stopped runs cannot resume.")) return;
    setBusy(true); setError("");
    try { const result = await api.setAutomationKillSwitch(enabled); setKillSwitch(result.kill_switch_enabled); setSuccess(result.message); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const inspect = async (run: AutomationRun) => {
    setSelectedRun(run); setEvents([]);
    try { const detail = await api.automationRun(run.id); setSelectedRun(detail.run); setEvents(detail.events); }
    catch (reason) { setError(apiErrorMessage(reason)); }
  };

  return <>
    <PageHeader eyebrow="Repeat safely" title="Automation" description="Create bounded Deriv Options strategies that survive restarts and stop automatically at your trade, time, loss, or concurrency limits." action={<button type="button" disabled={busy} onClick={() => void emergency()} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${killSwitch ? "bg-[#568f47] text-white" : "bg-red-600 text-white"}`}><ShieldAlert size={15}/>{killSwitch ? "Enable new runs" : "Emergency stop"}</button>}/>
    {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}{success && <div className="mt-6"><Feedback tone="success">{success}</Feedback></div>}
    {killSwitch && <div className="mt-6"><Feedback tone="info"><b>Emergency stop is active.</b> New runs and resumes are blocked.</Feedback></div>}
    <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_390px]">
      <Surface className="p-6 sm:p-8"><form onSubmit={submit} className="grid gap-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">{editingID ? "Edit strategy" : "New strategy"}</p><h2 className="mt-2 text-2xl font-semibold">Contract and schedule</h2></div>
        <Field label="Strategy name" value={form.name} onChange={(value) => set("name", value)}/>
        <div className="grid gap-4 sm:grid-cols-2"><Select label="Market" value={form.symbol} onChange={(value) => set("symbol", value)} options={symbols.map((item) => [item.symbol, item.display_name])}/><Select label="Contract" value={form.contract_type} onChange={(value) => set("contract_type", value)} options={contracts.map((item) => [item.contract_type, item.contract_display || item.contract_type])}/></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label={`Amount (${activeAccount.currency})`} value={form.amount} onChange={(value) => set("amount", value)} number/><Select label="Amount means" value={form.basis} onChange={(value) => set("basis", value)} options={[["stake","Stake"],["payout","Target payout"]]}/></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Contract duration" value={form.duration} onChange={(value) => set("duration", value)} number/><Select label="Duration unit" value={form.duration_unit} onChange={(value) => set("duration_unit", value)} options={[["t","Ticks"],["s","Seconds"],["m","Minutes"],["h","Hours"],["d","Days"]]}/></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["barrier","Barrier"],["barrier2","Second barrier"],["multiplier","Multiplier"],["growth_rate","Growth rate"],["cancellation","Cancellation"],["selected_tick","Selected tick"],["payout_per_point","Payout per point"],["stop_loss","Stop loss"],["take_profit","Take profit"]].map(([key,label]) => <Field key={key} label={`${label} (if required)`} value={form[key]} onChange={(value) => set(key, value)} number={!key.includes("barrier") && key !== "cancellation"}/>)}</div>
        <div className="border-t border-black/[.07] pt-5"><h3 className="text-lg font-semibold">Safety limits</h3><p className="mt-1 text-sm text-black/40">All limits are mandatory. Account stake, daily-loss, and session-loss limits still apply on top.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Seconds between trades" value={form.interval_seconds} onChange={(value) => set("interval_seconds", value)} number/><Field label="Maximum trades" value={form.max_trades} onChange={(value) => set("max_trades", value)} number/><Field label={`Maximum loss budget (${activeAccount.currency})`} value={form.max_loss} onChange={(value) => set("max_loss", value)} number/><Field label="Maximum run minutes" value={form.max_duration_minutes} onChange={(value) => set("max_duration_minutes", value)} number/><Field label="Maximum open positions" value={form.max_concurrent_positions} onChange={(value) => set("max_concurrent_positions", value)} number/></div>
        <div className="flex gap-2"><button disabled={busy || !form.contract_type} className="rounded-full bg-[#111310] px-6 py-3 text-sm font-semibold text-white disabled:opacity-35">{editingID ? "Save changes" : "Create strategy"}</button>{editingID && <button type="button" onClick={() => { setEditingID(""); setForm({ ...initialForm, symbol: form.symbol }); }} className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold">Cancel edit</button>}</div>
      </form></Surface>
      <div className="space-y-4"><Feedback tone="info"><Bot size={15} className="mr-2 inline"/><b>How execution works:</b> every order gets a fresh Deriv proposal. The backend checks onboarding, open positions, your Synex risk limits, and unresolved orders before purchase.</Feedback>{selectedRun && <Surface className="p-6"><h2 className="text-lg font-semibold">{selectedRun.strategy_name}</h2><p className="mt-1 text-sm capitalize text-black/40">{selectedRun.status} · {selectedRun.login_id}</p><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Attempts" value={selectedRun.trade_count}/><Metric label="Succeeded" value={selectedRun.successful_trades}/><Metric label="Failed" value={selectedRun.failed_trades}/><Metric label="Settled P/L" value={`${selectedRun.realized_profit} (${selectedRun.settled_trades} settled)`}/><Metric label="Loss budget committed" value={selectedRun.committed_loss}/></div>{selectedRun.last_error && <p className="mt-4 text-sm text-red-600">{selectedRun.last_error}</p>}<div className="mt-5 space-y-3">{events.slice(0, 12).map((event) => <div key={event.id} className="border-t border-black/[.06] pt-3"><p className="text-xs font-semibold capitalize">{event.event_type.replace(/_/g," ")}</p><p className="mt-1 text-[11px] text-black/35">{new Date(event.created_at).toLocaleString()}</p></div>)}</div></Surface>}</div>
    </div>
    <h2 className="mt-10 text-2xl font-semibold">Strategies</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{loading ? <Surface className="grid min-h-[180px] place-items-center"><LoaderCircle className="animate-spin"/></Surface> : strategies.length ? strategies.map((strategy) => <Surface key={strategy.id} className="p-6"><div className="flex justify-between gap-4"><div><h3 className="text-lg font-semibold">{strategy.name}</h3><p className="mt-1 text-sm text-black/40">{strategy.contract_type} · {strategy.symbol} · {strategy.login_id}</p></div><span className="rounded-full bg-black/[.05] px-3 py-1.5 text-[10px] font-bold uppercase">{strategy.is_virtual ? "Practice" : "Real"}</span></div><p className="mt-4 text-sm text-black/45">Every {strategy.interval_seconds}s · up to {strategy.max_trades} trades · {strategy.max_loss} {strategy.currency} loss budget</p><div className="mt-5 flex flex-wrap gap-2"><button disabled={busy || killSwitch} onClick={() => void start(strategy)} className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-35"><Play size={13}/> Start</button><button onClick={() => edit(strategy)} className="rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold">Edit</button><button disabled={busy} onClick={() => void api.deleteAutomationStrategy(strategy.id).then(load).catch((reason) => setError(apiErrorMessage(reason)))} className="rounded-full border border-black/10 px-3 py-2.5 text-black/40"><Trash2 size={13}/></button></div></Surface>) : <Feedback tone="info">Create your first strategy above. Start with a practice account.</Feedback>}</div>
    <h2 className="mt-10 text-2xl font-semibold">Runs</h2><div className="mt-4 grid gap-3">{runs.length ? runs.map((run) => <Surface key={run.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><button type="button" onClick={() => void inspect(run)} className="text-left"><p className="font-semibold">{run.strategy_name}</p><p className="mt-1 text-xs text-black/40">{run.login_id} · {run.successful_trades}/{run.trade_count} successful · next {new Date(run.next_execution_at).toLocaleString()}</p>{run.last_error && <p className="mt-2 text-xs text-red-600">{run.last_error}</p>}</button><div className="flex items-center gap-2"><span className="rounded-full bg-black/[.05] px-3 py-2 text-[10px] font-bold uppercase">{run.status}</span>{run.status === "active" && <button disabled={busy} onClick={() => void transition(run,"pause")} className="rounded-full border border-black/10 p-2.5"><Pause size={14}/></button>}{run.status === "paused" && <button disabled={busy || killSwitch} onClick={() => void transition(run,"resume")} className="rounded-full border border-black/10 p-2.5"><Play size={14}/></button>}{["active","paused"].includes(run.status) && <button disabled={busy} onClick={() => void transition(run,"stop")} className="rounded-full border border-black/10 p-2.5"><Square size={14}/></button>}</div></Surface>) : <p className="text-sm text-black/35">No automation runs yet.</p>}</div>
  </>;
}

function Field({ label, value, onChange, number = false }: { label: string; value: string; onChange: (value: string) => void; number?: boolean }) { return <label className="text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<input required={!label.includes("if required")} type={number ? "number" : "text"} min={number ? "0" : undefined} step={number ? "any" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}/></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <label className="text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>{options.map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-black/[.04] p-3"><p className="text-[10px] uppercase tracking-[.1em] text-black/35">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
