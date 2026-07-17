import { BadgeCheck, ExternalLink, KeyRound, LoaderCircle, Plus, ShieldCheck, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { useDerivConnection } from "../../features/platform/hooks/useDerivConnection";
import { apiErrorMessage, useSynexAPI } from "../../features/platform/services/synexApi";

export default function ConnectPage() {
  const api = useSynexAPI();
  const { connectDeriv, connecting } = useDerivConnection();
  const [params] = useSearchParams();
  const { accounts, refreshAccounts, loadingAccounts } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const result = params.get("result");
  const linked = result === "linked";

  useEffect(() => {
    if (result) void refreshAccounts();
  }, [result, refreshAccounts]);

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

  const securityItems = [
    { icon: KeyRound, title: "Your password stays private", copy: "You sign in directly with Deriv. Synex never sees your Deriv password." },
    { icon: ShieldCheck, title: "You stay in control", copy: "You review access before connecting and can disconnect whenever you choose." },
    { icon: ExternalLink, title: "Trades remain with Deriv", copy: "Your account, funds and completed trades continue to be held by Deriv." },
  ];

  const resultMessage: Record<string, string> = {
    linked: "Your Deriv accounts are ready to use.",
    cancelled: "Nothing was changed. You can connect whenever you are ready.",
    expired: "That connection request expired. Please try again.",
    "no-accounts": "We could not find an options trading account to connect.",
    "already-linked": "One of these accounts is already connected to another Synex profile.",
    failed: "We could not connect your account. Please try again.",
  };

  return (
    <>
      <PageHeader eyebrow="Your accounts" title="Trading accounts" description="Connect your Deriv account, then choose between your practice and real accounts from Synex." action={<button type="button" onClick={() => void connect()} disabled={busy || connecting} className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{connecting ? <LoaderCircle size={15} className="animate-spin"/> : <Plus size={15}/>} {connecting ? "Opening Deriv…" : "Connect Deriv"}</button>} />
      {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}
      {result && resultMessage[result] && <div className="mt-6"><Feedback tone={linked ? "success" : "info"}>{resultMessage[result]}</Feedback></div>}
      <div className="mt-8 grid gap-4">
        {loadingAccounts ? <Surface className="grid min-h-[220px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></Surface> : accounts.length ? accounts.map((account) => <Surface key={account.id} className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe9d9] text-[#426337]"><BadgeCheck size={21}/></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{account.login_id}</h2><span className="rounded-full bg-black/[.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-black/40">{account.is_virtual ? "Practice" : "Real"}</span></div><p className="mt-1 text-sm text-black/40">{account.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {account.currency} · {account.balance_fresh ? "Updated now" : "Last known balance"}</p></div><span className={`flex items-center gap-2 text-xs font-semibold ${account.status === "active" ? "text-[#568f47]" : "text-black/35"}`}><span className={`h-2 w-2 rounded-full ${account.status === "active" ? "bg-[#6ca95b]" : "bg-black/20"}`}/> {account.status === "active" ? "Ready" : "Unavailable"}</span></Surface>) : <EmptyAccountState />}
      </div>
      {accounts.length > 0 && <button type="button" onClick={() => void disconnect()} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/45 transition-colors hover:bg-white hover:text-black disabled:opacity-40"><Unlink size={14}/> Disconnect Deriv</button>}
      <Surface className="mt-4 p-6 sm:p-8"><div className="grid gap-6 md:grid-cols-3">{securityItems.map(({ icon: Icon, title, copy }) => <div key={title}><Icon size={19} className="text-black/30"/><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs font-medium leading-relaxed text-black/40">{copy}</p></div>)}</div></Surface>
    </>
  );
}
