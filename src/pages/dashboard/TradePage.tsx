import { CircleDollarSign, LoaderCircle, Sparkles } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import TradeQuote from "../../components/dashboard/TradeQuote";
import TradeReceipt from "../../components/dashboard/TradeReceipt";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { formatMarketQuote, marketStreamLabel, useMarketStream } from "../../features/platform/services/marketStream";
import { apiErrorMessage, type ActiveSymbol, type ContractOption, type OrderReceipt, type Proposal, useSynexAPI } from "../../features/platform/services/synexApi";

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
  const [instructionKey, setInstructionKey] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [realMoneyConfirmed, setRealMoneyConfirmed] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt>();
  const [feeDisclosure, setFeeDisclosure] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingInstruction, setPendingInstruction] = useState("");
  const market = useMarketStream(symbol);
  const selectedMarket = symbols.find((item) => item.symbol === symbol);

  const loadReceipt = useCallback(async (key: string) => {
    const result = await api.orderReceipt(key);
    setReceipt(result.data);
    setFeeDisclosure(result.fee_disclosure);
    return result.data;
  }, [api]);

  useEffect(() => {
    void api.symbols().then((items) => {
      setSymbols(items);
      setSymbol((current) => current || items[0]?.symbol || "");
    }).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api]);

  useEffect(() => {
    if (!symbol) return;
    setProposal(undefined);
    setRealMoneyConfirmed(false);
    void api.contracts(symbol).then((items) => {
      const unique = Array.from(new Map(items.map((item) => [item.contract_type, item])).values());
      setContracts(unique);
      setContractType(unique[0]?.contract_type || "");
    }).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api, symbol]);

  useEffect(() => {
    if (!proposal?.synex_expires_at) {
      setSecondsRemaining(0);
      return;
    }
    const update = () => setSecondsRemaining(Math.max(0, Math.ceil((new Date(proposal.synex_expires_at).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [proposal]);

  useEffect(() => {
    if (!pendingInstruction) return;
    let stopped = false;
    const check = async () => {
      try {
        const order = await api.orderStatus(pendingInstruction);
        if (stopped || order.status === "pending") return;
        const finalReceipt = await loadReceipt(pendingInstruction);
        if (stopped) return;
        setPendingInstruction("");
        setProposal(undefined);
        if (order.status === "succeeded") {
          setSuccess(`Trade placed${finalReceipt.contract_id ? ` · Contract ${finalReceipt.contract_id}` : ""}. You can follow it in your portfolio.`);
        } else if (order.status === "review") {
          setError("We’re double-checking this trade with Deriv. Please don’t place another trade on this account until it’s confirmed.");
        } else {
          setError("This trade didn’t go through. Get a fresh price and try again.");
        }
      } catch {
        // Keep checking the same instruction. Submitting another order could duplicate it.
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 3000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [api, loadReceipt, pendingInstruction]);

  if (!activeAccount) {
    return <><PageHeader eyebrow="Place a trade" title="Trade" description="Connect your Deriv account to get live prices and start trading." /><EmptyAccountState /></>;
  }

  const requestProposal = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess(""); setProposal(undefined); setReceipt(undefined); setFeeDisclosure(""); setRealMoneyConfirmed(false);
    try {
      const nextProposal = await api.proposal({ login_id: activeLoginID, contract_type: contractType, symbol, amount: Number(amount), basis: "stake", currency: activeAccount.currency, duration: Number(duration), duration_unit: durationUnit });
      setProposal(nextProposal);
      setInstructionKey(createInstructionKey());
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  };

  const execute = async () => {
    if (!proposal || secondsRemaining <= 0) {
      setProposal(undefined);
      setError("That quote expired — prices move fast. Get a fresh price and try again.");
      return;
    }
    if (!activeAccount.is_virtual && !realMoneyConfirmed) {
      setError("Tick the confirmation box first — this trade uses real money you could lose.");
      return;
    }
    setLoading(true); setError("");
    try {
      const result = await api.buy({ login_id: activeLoginID, proposal_id: proposal.id, max_price: proposal.ask_price, symbol, contract_type: contractType, currency: activeAccount.currency, real_money_confirmed: !activeAccount.is_virtual && realMoneyConfirmed }, instructionKey);
      const finalReceipt = await loadReceipt(instructionKey);
      setSuccess(`Trade placed${finalReceipt.contract_id || result.contract_id ? ` · Contract ${String(finalReceipt.contract_id || result.contract_id)}` : ""}. You can follow it in your portfolio.`);
      setProposal(undefined);
    } catch (reason) {
      try {
        const order = await api.orderStatus(instructionKey);
        if (order.status === "pending") {
          setPendingInstruction(instructionKey);
          setError("");
        } else {
          const finalReceipt = await loadReceipt(instructionKey);
          setProposal(undefined);
          if (order.status === "succeeded") {
            setSuccess(`Trade placed${finalReceipt.contract_id ? ` · Contract ${finalReceipt.contract_id}` : ""}. You can follow it in your portfolio.`);
          } else if (order.status === "review") {
            setError("We’re double-checking this trade with Deriv. Please don’t place another trade on this account until it’s confirmed.");
          } else {
            setError("This trade didn’t go through. Get a fresh price and try again.");
          }
        }
      } catch {
        setError(apiErrorMessage(reason));
      }
    }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader eyebrow="Place a trade" title="Trade" description="Pick a market, get a live price, and confirm only when you're happy with it. Nothing happens without your final say." />
      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_420px]">
        <Surface className="p-6 sm:p-8">
          <form onSubmit={requestProposal} className="grid gap-6">
            <div className="flex items-center justify-between rounded-2xl bg-[#171917] p-5 text-white"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-white/35">Market price now</p><p className="mt-2 text-sm font-semibold">{selectedMarket?.display_name || symbol || "Pick a market"}</p></div><div className="text-right"><div className="flex items-center justify-end gap-2 text-xs font-semibold text-white/40"><span className={`h-2 w-2 rounded-full ${market.status === "connected" ? "bg-[#8ac777]" : "animate-pulse bg-amber-400"}`}/>{marketStreamLabel(market.status)}</div><p className="mt-2 text-2xl font-medium tabular-nums">{formatMarketQuote(market.tick?.quote, market.tick?.pip_size ?? selectedMarket?.pip ?? 2)}</p></div></div>
            <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Market<select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30">{symbols.map((item) => <option key={item.symbol} value={item.symbol}>{item.display_name} · {item.symbol}</option>)}</select></label>
            <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Trade type<select value={contractType} onChange={(event) => setContractType(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30">{contracts.map((item) => <option key={item.contract_type} value={item.contract_type}>{item.contract_display || item.contract_type}</option>)}</select><span className="mt-2 block text-xs font-normal normal-case text-black/35">Showing the trade types available for this market right now.</span></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Stake<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></label>
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Duration<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></label>
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Unit<select value={durationUnit} onChange={(event) => setDurationUnit(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none"><option value="t">Ticks</option><option value="m">Minutes</option><option value="h">Hours</option><option value="d">Days</option></select></label>
            </div>
            {error && <Feedback>{error}</Feedback>}{success && <Feedback tone="success">{success}</Feedback>}{pendingInstruction && <Feedback tone="info">Your trade is being confirmed. Keep this page open — don’t submit it again.</Feedback>}
            <button disabled={loading || !contractType || Boolean(pendingInstruction)} className="flex items-center justify-center gap-2 rounded-full bg-[#111310] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <Sparkles size={16}/>} Get my live price</button>
          </form>
        </Surface>
        <div className="space-y-4">
          <Surface className="p-6 sm:p-8">
            {receipt ? <TradeReceipt receipt={receipt} feeDisclosure={feeDisclosure} /> : <p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Your quote</p>}
            {!receipt && proposal ? (
              <TradeQuote
                proposal={proposal}
                currency={activeAccount.currency}
                isVirtual={activeAccount.is_virtual}
                secondsRemaining={secondsRemaining}
                realMoneyConfirmed={realMoneyConfirmed}
                disabled={loading || Boolean(pendingInstruction)}
                onRealMoneyConfirmed={setRealMoneyConfirmed}
                onExecute={() => void execute()}
              />
            ) : !receipt ? <div className="grid min-h-[240px] place-items-center text-center"><div><CircleDollarSign className="mx-auto text-black/20"/><p className="mt-4 text-sm font-medium text-black/35">Set up your trade on the left and your live quote will appear here.</p></div></div> : null}
          </Surface>
          <Feedback tone="info"><span className="font-bold">A word on risk:</span> Fast-moving trades can lose money just as quickly as they win it. Practise on your free demo account first, and never stake money you can't afford to lose.</Feedback>
        </div>
      </div>
    </>
  );
}

function createInstructionKey() {
  const random = globalThis.crypto;
  if (random?.randomUUID) return random.randomUUID();
  if (random?.getRandomValues) {
    const values = new Uint32Array(4);
    random.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("-");
  }
  return `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
