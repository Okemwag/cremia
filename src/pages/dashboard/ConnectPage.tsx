import { BadgeCheck, ExternalLink, LoaderCircle, LockKeyhole, Plus, ShieldCheck, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, useSynexAPI } from "../../features/platform/services/synexApi";

export default function ConnectPage() {
  const api = useSynexAPI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { accounts, refreshAccounts, loadingAccounts } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const linked = params.get("linked") === "1";

  useEffect(() => {
    if (linked) { void refreshAccounts(); navigate("/app/connect", { replace: true }); }
  }, [linked, navigate, refreshAccounts]);

  const connect = async () => {
    setBusy(true); setError("");
    try { const result = await api.connectURL(); window.location.assign(result.authorize_url); }
    catch (reason) { setError(apiErrorMessage(reason)); setBusy(false); }
  };

  const disconnect = async (loginID: string) => {
    if (!window.confirm(`Disconnect ${loginID} from Synex?`)) return;
    setBusy(true);
    try { await api.disconnect(loginID); await refreshAccounts(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const securityItems = [
    { icon: ShieldCheck, title: "Encrypted at rest", copy: "OAuth tokens use AES-256-GCM encryption before database storage." },
    { icon: LockKeyhole, title: "Scoped access", copy: "Deriv permissions and account ownership are verified by the backend." },
    { icon: ExternalLink, title: "Executed by Deriv", copy: "Prices, contracts and settlements remain on your Deriv account." },
  ];

  return (
    <>
      <PageHeader eyebrow="Secure account link" title="Trading accounts" description="Connect Deriv through OAuth. Synex receives scoped account tokens, never your Deriv password." action={<button type="button" onClick={() => void connect()} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <Plus size={15}/>} Connect Deriv</button>} />
      {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}
      {linked && <div className="mt-6"><Feedback tone="success">Deriv account connected successfully.</Feedback></div>}
      <div className="mt-8 grid gap-4">
        {loadingAccounts ? <Surface className="grid min-h-[220px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></Surface> : accounts.length ? accounts.map((account) => <Surface key={account.id} className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe9d9] text-[#426337]"><BadgeCheck size={21}/></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{account.login_id}</h2><span className="rounded-full bg-black/[.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-black/40">{account.is_virtual ? "Virtual" : "Real"}</span></div><p className="mt-1 text-sm text-black/40">{account.currency} · {account.landing_company} · Connected {new Date(account.connected_at).toLocaleDateString()}</p></div><div className="flex items-center gap-3"><span className="flex items-center gap-2 text-xs font-semibold text-[#568f47]"><span className="h-2 w-2 rounded-full bg-[#6ca95b]"/> {account.status}</span><button type="button" onClick={() => void disconnect(account.login_id)} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/45 hover:text-black"><Unlink size={14}/> Disconnect</button></div></Surface>) : <EmptyAccountState />}
      </div>
      <Surface className="mt-4 p-6 sm:p-8"><div className="grid gap-6 md:grid-cols-3">{securityItems.map(({ icon: Icon, title, copy }) => <div key={title}><Icon size={19} className="text-black/30"/><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs font-medium leading-relaxed text-black/40">{copy}</p></div>)}</div></Surface>
    </>
  );
}
