import { ArrowRight, LoaderCircle, RefreshCw, Settings2, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { mergePositionUpdate } from "../../features/platform/services/accountStream";
import { apiErrorMessage, formatMoney, type PortfolioContract, useSynexAPI } from "../../features/platform/services/synexApi";

export default function PortfolioPage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID, lastTransaction, positionUpdates } = useWorkspace();
  const [positions, setPositions] = useState<PortfolioContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!activeLoginID) { setLoading(false); return; }
    setLoading(true); setError("");
    try { setPositions(await api.portfolio(activeLoginID)); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [activeLoginID, api]);

  useEffect(() => { void load(); }, [load]);

  const transactionID = lastTransaction?.transaction_id;
  useEffect(() => {
    if (transactionID) void load();
  }, [load, transactionID]);

  if (!activeAccount) {
    return <><PageHeader eyebrow="Live positions" title="Portfolio" description="Your open Deriv contracts appear here." /><EmptyAccountState /></>;
  }

  const close = async (position: PortfolioContract) => {
    if (!window.confirm(`Close contract ${position.contract_id} at the current market price?`)) return;
    try {
      await api.sell({ login_id: activeLoginID, contract_id: position.contract_id, price: 0, symbol: position.underlying || position.symbol, currency: position.currency || activeAccount.currency });
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
  };

  const livePositions = Object.values(positionUpdates).reduce(mergePositionUpdate, positions);

  return (
    <>
      <PageHeader eyebrow="Live positions" title="Portfolio" description="Monitor contracts, manage risk parameters and close eligible positions through your connected Deriv account." action={<button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button>} />
      {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}
      <Surface className="mt-8 overflow-hidden">
        {loading ? <div className="grid min-h-[300px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : livePositions.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-black/[.07] text-[11px] uppercase tracking-[.13em] text-black/30"><th className="px-6 py-5">Contract</th><th className="px-4 py-5">Market</th><th className="px-4 py-5">Buy price</th><th className="px-4 py-5">Current</th><th className="px-4 py-5">Profit</th><th className="px-6 py-5 text-right">Actions</th></tr></thead><tbody>{livePositions.map((position) => <tr key={position.contract_id} className="border-b border-black/[.06] last:border-0"><td className="px-6 py-5"><p className="text-sm font-semibold">{position.contract_type}</p><p className="mt-1 text-xs text-black/35">#{position.contract_id}</p></td><td className="px-4 py-5 text-sm font-medium">{position.underlying || position.symbol || "—"}</td><td className="px-4 py-5 text-sm">{formatMoney(position.buy_price, position.currency || activeAccount.currency)}</td><td className="px-4 py-5 text-sm">{formatMoney(position.current_spot ?? position.bid_price, position.currency || activeAccount.currency)}</td><td className={`px-4 py-5 text-sm font-semibold ${Number(position.profit || 0) >= 0 ? "text-[#568f47]" : "text-red-600"}`}>{formatMoney(position.profit, position.currency || activeAccount.currency)}</td><td className="px-6 py-5"><div className="flex justify-end gap-2"><Link to={`/app/portfolio/${position.contract_id}`} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"><Settings2 size={13}/> Manage</Link><button type="button" onClick={() => void close(position)} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white">Close</button></div></td></tr>)}</tbody></table></div>
        ) : <div className="grid min-h-[340px] place-items-center p-8 text-center"><div><WalletCards className="mx-auto text-black/20"/><h2 className="mt-4 text-xl font-medium">No open positions</h2><p className="mt-2 text-sm text-black/40">Your active contracts will appear here.</p><Link to="/app/trade" className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Explore markets <ArrowRight size={14}/></Link></div></div>}
      </Surface>
    </>
  );
}
