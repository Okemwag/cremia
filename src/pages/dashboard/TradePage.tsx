import { CircleDollarSign, LoaderCircle, Sparkles, Zap } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, formatMoney, type ActiveSymbol, type ContractOption, type Proposal, useSynexAPI } from "../../features/platform/services/synexApi";

export default function TradePage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID } = useWorkspace();
  const [params] = useSearchParams();
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);
  const [symbol, setSymbol] = useState(params.get("symbol") || "");
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [contractType, setContractType] = useState("");
  const [amount, setAmount] = useState("10");
  const [duration, setDuration] = useState("5");
  const [durationUnit, setDurationUnit] = useState("m");
  const [proposal, setProposal] = useState<Proposal>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void api.symbols().then((items) => {
      setSymbols(items);
      setSymbol((current) => current || items[0]?.symbol || "");
    }).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api]);

  useEffect(() => {
    if (!symbol) return;
    setProposal(undefined);
    void api.contracts(symbol).then((items) => {
      const unique = Array.from(new Map(items.map((item) => [item.contract_type, item])).values());
      setContracts(unique);
      setContractType(unique[0]?.contract_type || "");
    }).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api, symbol]);

  if (!activeAccount) {
    return <><PageHeader eyebrow="Direct execution" title="Trade" description="Connect an account before requesting live contract prices." /><EmptyAccountState /></>;
  }

  const requestProposal = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess(""); setProposal(undefined);
    try {
      setProposal(await api.proposal({ login_id: activeLoginID, contract_type: contractType, symbol, amount: Number(amount), basis: "stake", currency: activeAccount.currency, duration: Number(duration), duration_unit: durationUnit }));
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  };

  const execute = async () => {
    if (!proposal || !window.confirm(`Buy this contract for up to ${formatMoney(proposal.ask_price, activeAccount.currency)}?`)) return;
    setLoading(true); setError("");
    try {
      const result = await api.buy({ login_id: activeLoginID, proposal_id: proposal.id, max_price: proposal.ask_price, symbol, contract_type: contractType, currency: activeAccount.currency });
      setSuccess(`Trade placed successfully${result.contract_id ? ` · Contract ${String(result.contract_id)}` : ""}.`);
      setProposal(undefined);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader eyebrow="Direct execution" title="Trade" description="Request a live price from Deriv, review the terms, then explicitly confirm execution." />
      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_420px]">
        <Surface className="p-6 sm:p-8">
          <form onSubmit={requestProposal} className="grid gap-6">
            <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Instrument<select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30">{symbols.map((item) => <option key={item.symbol} value={item.symbol}>{item.display_name} · {item.symbol}</option>)}</select></label>
            <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Contract<select value={contractType} onChange={(event) => setContractType(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30">{contracts.map((item) => <option key={item.contract_type} value={item.contract_type}>{item.contract_display || item.contract_type}</option>)}</select><span className="mt-2 block text-xs font-normal normal-case text-black/35">Only contracts currently reported for this symbol are shown.</span></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Stake<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></label>
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Duration<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></label>
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Unit<select value={durationUnit} onChange={(event) => setDurationUnit(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none"><option value="t">Ticks</option><option value="m">Minutes</option><option value="h">Hours</option><option value="d">Days</option></select></label>
            </div>
            {error && <Feedback>{error}</Feedback>}{success && <Feedback tone="success">{success}</Feedback>}
            <button disabled={loading || !contractType} className="flex items-center justify-center gap-2 rounded-full bg-[#111310] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <Sparkles size={16}/>} Request live price</button>
          </form>
        </Surface>
        <div className="space-y-4">
          <Surface className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Live proposal</p>
            {proposal ? <><p className="mt-6 text-sm font-medium text-black/40">Maximum purchase price</p><p className="mt-1 text-[38px] font-medium tracking-[-.05em]">{formatMoney(proposal.ask_price, activeAccount.currency)}</p>{proposal.payout !== undefined && <div className="mt-5 flex justify-between border-y border-black/[.07] py-4 text-sm"><span className="text-black/40">Potential payout</span><span className="font-semibold">{formatMoney(proposal.payout, activeAccount.currency)}</span></div>}<p className="mt-5 text-xs font-medium leading-relaxed text-black/40">{proposal.longcode || "Review this quote before execution. Deriv proposals expire quickly and may need to be refreshed."}</p><button type="button" onClick={() => void execute()} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#6fa45e] px-5 py-4 text-sm font-bold text-white disabled:opacity-50"><Zap size={16}/> Confirm and buy</button></> : <div className="grid min-h-[240px] place-items-center text-center"><div><CircleDollarSign className="mx-auto text-black/20"/><p className="mt-4 text-sm font-medium text-black/35">Configure the contract to request a live Deriv proposal.</p></div></div>}
          </Surface>
          <Feedback tone="info"><span className="font-bold">Risk notice:</span> Trading leveraged or short-duration products can result in loss. Use a Deriv virtual account first and never stake money you cannot afford to lose.</Feedback>
        </div>
      </div>
    </>
  );
}
