import { ArrowLeft, Ban, LoaderCircle, RefreshCw, ShieldAlert, SlidersHorizontal, XCircle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, formatMoney, useSynexAPI } from "../../features/platform/services/synexApi";

export default function PositionDetailPage() {
  const api = useSynexAPI();
  const navigate = useNavigate();
  const { contractID = "" } = useParams();
  const { activeAccount, activeLoginID } = useWorkspace();
  const parsedID = Number(contractID);
  const [position, setPosition] = useState<Record<string, unknown>>();
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!activeLoginID || !Number.isFinite(parsedID) || parsedID <= 0) return;
    try {
      const [status, updates] = await Promise.all([
        api.position(activeLoginID, parsedID),
        api.contractUpdateHistory(activeLoginID, parsedID).catch(() => []),
      ]);
      setPosition(status);
      setHistory(updates);
      setError("");
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [activeLoginID, api, parsedID]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(timer);
  }, [load]);

  const update = async (event: FormEvent) => {
    event.preventDefault();
    if (!stopLoss && !takeProfit) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await api.updateContract({ login_id: activeLoginID, contract_id: parsedID, ...(stopLoss ? { stop_loss: Number(stopLoss) } : {}), ...(takeProfit ? { take_profit: Number(takeProfit) } : {}) });
      setSuccess("Limit orders updated."); setStopLoss(""); setTakeProfit(""); await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const sell = async () => {
    if (!window.confirm("Close this contract at the current market price?")) return;
    setBusy(true); setError("");
    try { await api.sell({ login_id: activeLoginID, contract_id: parsedID, price: 0, currency: activeAccount?.currency }); navigate("/app/portfolio"); }
    catch (reason) { setError(apiErrorMessage(reason)); setBusy(false); }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel this contract? Only eligible contracts can be cancelled.")) return;
    setBusy(true); setError("");
    try { await api.cancelContract(activeLoginID, parsedID); navigate("/app/portfolio"); }
    catch (reason) { setError(apiErrorMessage(reason)); setBusy(false); }
  };

  if (!activeAccount) return <div className="rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-10 text-center"><p className="text-sm text-black/40">Connect a Deriv account to view position details.</p></div>;
  if (loading) return <div className="grid min-h-[500px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div>;

  const numberValue = (key: string) => Number(position?.[key] || 0);
  const textValue = (key: string) => String(position?.[key] || "—");
  const profit = numberValue("profit");
  const terminal = Boolean(position?.is_sold || position?.is_expired);

  return (
    <>
      <Link to="/app/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-black"><ArrowLeft size={15}/> Back to portfolio</Link>
      <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Live contract monitor</p><h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-.05em] sm:text-[44px]">Contract #{parsedID}</h1><p className="mt-3 text-sm font-medium text-black/40">{textValue("longcode")}</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button></div>
      {error && <div className="mt-6 rounded-xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}{success && <div className="mt-6 rounded-xl border border-green-900/10 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{success}</div>}
      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="rounded-[22px] border border-black/[.07] bg-[#111310] p-7 text-white sm:p-9">
          <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-white/35">{textValue("contract_type")} · {textValue("underlying")}</p><p className="mt-5 text-sm font-medium text-white/40">Current profit</p><p className={`mt-1 text-[48px] font-medium tracking-[-.06em] ${profit >= 0 ? "text-[#9de783]" : "text-[#f09b90]"}`}>{formatMoney(profit, activeAccount.currency)}</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] ${terminal ? "bg-white/10 text-white/50" : "bg-[#9de783]/15 text-[#9de783]"}`}>{textValue("status")}</span></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">{[["Buy price", numberValue("buy_price")],["Current spot", numberValue("current_spot")],["Return", numberValue("profit_percentage")]].map(([label, value]) => <div key={String(label)} className="bg-[#191b19] p-5"><p className="text-xs text-white/35">{String(label)}</p><p className="mt-2 text-lg font-semibold">{label === "Return" ? `${Number(value).toFixed(2)}%` : formatMoney(Number(value), activeAccount.currency)}</p></div>)}</div>
          <div className="mt-8 flex flex-wrap gap-3"><button disabled={busy || terminal} onClick={() => void sell()} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-30"><XCircle size={15}/> Sell at market</button><button disabled={busy || terminal} onClick={() => void cancel()} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white disabled:opacity-30"><Ban size={15}/> Cancel if eligible</button></div>
        </section>
        <div className="space-y-4">
          <section className="rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold tracking-[-.03em]">Risk controls</h2><SlidersHorizontal size={17} className="text-black/30"/></div><form onSubmit={update} className="mt-5 space-y-3"><label className="block text-xs font-bold uppercase tracking-[.12em] text-black/35">Stop loss<input type="number" min="0" step="any" value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none" placeholder="Amount"/></label><label className="block text-xs font-bold uppercase tracking-[.12em] text-black/35">Take profit<input type="number" min="0" step="any" value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none" placeholder="Amount"/></label><button disabled={busy || terminal || (!stopLoss && !takeProfit)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111310] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-35"><ShieldAlert size={15}/> Update limit orders</button></form></section>
          <section className="rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6"><h2 className="text-lg font-semibold tracking-[-.03em]">Update history</h2>{history.length ? <div className="mt-4 space-y-3">{history.slice(0, 8).map((item, index) => <div key={`${String(item.order_date)}-${index}`} className="flex items-center justify-between border-t border-black/[.06] pt-3 text-sm"><div><p className="font-semibold">{String(item.display_name || item.order_type || "Limit order")}</p><p className="mt-1 text-xs text-black/35">{item.order_date ? new Date(Number(item.order_date) * 1000).toLocaleString() : ""}</p></div><span className="font-semibold">{String(item.display_order_amount || item.order_amount || "—")}</span></div>)}</div> : <p className="mt-4 text-sm font-medium text-black/35">No limit-order changes returned.</p>}</section>
        </div>
      </div>
    </>
  );
}
