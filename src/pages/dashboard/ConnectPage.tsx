import { BadgeCheck, ExternalLink, KeyRound, LoaderCircle, Plus, RefreshCw, ShieldCheck, SlidersHorizontal, Unlink } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { useDerivConnection } from "../../features/platform/hooks/useDerivConnection";
import { apiErrorMessage, type TradeRiskLimits, useSynexAPI } from "../../features/platform/services/synexApi";

export default function ConnectPage() {
  const api = useSynexAPI();
  const { connectDeriv, connecting } = useDerivConnection();
  const [params] = useSearchParams();
  const { accounts, activeAccount, refreshAccounts, loadingAccounts } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [limits, setLimits] = useState<TradeRiskLimits>();
  const [maxStake, setMaxStake] = useState("0");
  const [dailyLossLimit, setDailyLossLimit] = useState("0");
  const [sessionLossLimit, setSessionLossLimit] = useState("0");
  const result = params.get("result");
  const linked = result === "linked";

  useEffect(() => {
    if (result) void refreshAccounts();
  }, [result, refreshAccounts]);

  useEffect(() => {
    if (!activeAccount) {
      setLimits(undefined);
      return;
    }
    void api.riskLimits(activeAccount.login_id).then((value) => {
      setLimits(value);
      setMaxStake(String(value.max_stake));
      setDailyLossLimit(String(value.daily_loss_limit));
      setSessionLossLimit(String(value.session_loss_limit));
    }).catch((reason) => setError(apiErrorMessage(reason)));
  }, [activeAccount, api]);

  const connect = async () => {
    setError("");
    try { await connectDeriv(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect your Deriv accounts from Synex?")) return;
    setBusy(true);
    try { await api.disconnect(); await refreshAccounts(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const saveLimits = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeAccount) return;
    setBusy(true); setError("");
    try {
      const value = await api.updateRiskLimits({
        login_id: activeAccount.login_id,
        max_stake: Number(maxStake || 0),
        daily_loss_limit: Number(dailyLossLimit || 0),
        session_loss_limit: Number(sessionLossLimit || 0),
      });
      setLimits(value);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const resetSession = async () => {
    if (!activeAccount || !window.confirm("Start a new trading session now? This resets only the session-loss counter, not today's daily-loss counter.")) return;
    setBusy(true); setError("");
    try { setLimits(await api.resetRiskSession(activeAccount.login_id)); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const securityItems = [
    { icon: KeyRound, title: "Your password stays private", copy: "You sign in directly with Deriv. Synex never sees your Deriv password." },
    { icon: ShieldCheck, title: "You stay in control", copy: "You review access before connecting and can disconnect whenever you choose." },
    { icon: ExternalLink, title: "Your money stays with Deriv", copy: "Your account, funds and trades are always held safely by Deriv — Synex just gives you a better view of them." },
  ];

  const resultMessage: Record<string, string> = {
    linked: "You're connected! Your Deriv accounts are ready to trade.",
    cancelled: "Nothing was changed. You can connect whenever you are ready.",
    expired: "That connection request expired. Please try again.",
    "no-accounts": "We could not find an options trading account to connect.",
    "already-linked": "One of these accounts is already connected to another Synex profile.",
    failed: "We could not connect your account. Please try again.",
  };

  return (
    <>
      <PageHeader eyebrow="Your accounts" title="Trading accounts" description="Link your Deriv account once, then switch between practice and real accounts anytime." action={<button type="button" onClick={() => void connect()} disabled={busy || connecting} className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{connecting ? <LoaderCircle size={15} className="animate-spin"/> : <Plus size={15}/>} {connecting ? "Opening Deriv…" : "Connect Deriv"}</button>} />
      {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}
      {result && resultMessage[result] && <div className="mt-6"><Feedback tone={linked ? "success" : "info"}>{resultMessage[result]}</Feedback></div>}
      <div className="mt-8 grid gap-4">
        {loadingAccounts ? <Surface className="grid min-h-[220px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></Surface> : accounts.length ? accounts.map((account) => <Surface key={account.id} className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe9d9] text-[#426337]"><BadgeCheck size={21}/></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{account.login_id}</h2><span className="rounded-full bg-black/[.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-black/40">{account.is_virtual ? "Practice" : "Real"}</span></div><p className="mt-1 text-sm text-black/40">{account.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {account.currency} · {account.balance_fresh ? "Updated now" : "Last known balance"}</p></div><span className={`flex items-center gap-2 text-xs font-semibold ${account.status === "active" ? "text-[#568f47]" : "text-black/35"}`}><span className={`h-2 w-2 rounded-full ${account.status === "active" ? "bg-[#6ca95b]" : "bg-black/20"}`}/> {account.status === "active" ? "Ready" : "Unavailable"}</span></Surface>) : <EmptyAccountState />}
      </div>
      {accounts.length > 0 && <button type="button" onClick={() => void disconnect()} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/45 transition-colors hover:bg-white hover:text-black disabled:opacity-40"><Unlink size={14}/> Disconnect Deriv</button>}
      {activeAccount && <Surface className="mt-4 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-black/30"><SlidersHorizontal size={15}/> Trading limits</span><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Set your own boundaries</h2><p className="mt-2 max-w-[680px] text-sm font-medium leading-relaxed text-black/40">These controls apply to {activeAccount.login_id}. Enter zero to disable a limit. Synex checks them before sending any practice or real order to Deriv.</p></div>{limits && <p className="text-xs font-medium text-black/35">Session started<br/><span className="font-semibold text-black/55">{new Date(limits.session_started_at).toLocaleString()}</span></p>}</div>
        <form onSubmit={saveLimits} className="mt-7 grid gap-4 lg:grid-cols-3">
          <LimitField label={`Maximum stake (${activeAccount.currency})`} value={maxStake} onChange={setMaxStake}/>
          <LimitField label={`Daily loss limit (${activeAccount.currency})`} value={dailyLossLimit} onChange={setDailyLossLimit}/>
          <LimitField label={`Session loss limit (${activeAccount.currency})`} value={sessionLossLimit} onChange={setSessionLossLimit}/>
          <div className="flex flex-wrap gap-3 lg:col-span-3"><button disabled={busy} className="rounded-full bg-[#111310] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-40">Save limits</button><button type="button" onClick={() => void resetSession()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3.5 text-sm font-semibold disabled:opacity-40"><RefreshCw size={15}/> Start new session</button></div>
        </form>
      </Surface>}
      <Surface className="mt-4 p-6 sm:p-8"><div className="grid gap-6 md:grid-cols-3">{securityItems.map(({ icon: Icon, title, copy }) => <div key={title}><Icon size={19} className="text-black/30"/><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs font-medium leading-relaxed text-black/40">{copy}</p></div>)}</div></Surface>
    </>
  );
}

function LimitField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">{label}<input type="number" min="0" max="1000000000" step="0.01" required value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30"/></label>;
}
