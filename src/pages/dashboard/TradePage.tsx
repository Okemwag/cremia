import { CircleDollarSign, LoaderCircle, Sparkles } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const { activeAccount, activeLoginID, onboarding } = useWorkspace();
  const [params] = useSearchParams();
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);
  const [symbol, setSymbol] = useState(params.get("symbol") || "");
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [contractType, setContractType] = useState("");
  const [amount, setAmount] = useState("10");
  const [basis, setBasis] = useState<"stake" | "payout">("stake");
  const [duration, setDuration] = useState("5");
  const [durationUnit, setDurationUnit] = useState("m");
  const [expiryMode, setExpiryMode] = useState<"duration" | "date">("duration");
  const [dateExpiry, setDateExpiry] = useState("");
  const [barrier, setBarrier] = useState("");
  const [barrier2, setBarrier2] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [cancellation, setCancellation] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [payoutPerPoint, setPayoutPerPoint] = useState("");
  const [selectedTick, setSelectedTick] = useState("");
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
  const selectedContract = contracts.find((item) => item.contract_type === contractType);
  const fields = contractFields(selectedContract);

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
      const input: Record<string, unknown> = {
        login_id: activeLoginID,
        contract_type: contractType,
        symbol,
        amount: Number(amount),
        basis,
        currency: activeAccount.currency,
      };
      if (expiryMode === "duration") {
        input.duration = Number(duration);
        input.duration_unit = durationUnit;
      } else if (dateExpiry) {
        input.date_expiry = Math.floor(new Date(dateExpiry).getTime() / 1000);
      }
      assignText(input, "barrier", fields.barrier ? barrier : "");
      assignText(input, "barrier2", fields.barrier2 ? barrier2 : "");
      assignNumber(input, "multiplier", fields.multiplier ? multiplier : "");
      assignNumber(input, "growth_rate", fields.growthRate ? growthRate : "");
      assignText(input, "cancellation", fields.cancellation ? cancellation : "");
      assignNumber(input, "stop_loss", fields.limitOrder ? stopLoss : "");
      assignNumber(input, "take_profit", fields.limitOrder ? takeProfit : "");
      assignNumber(input, "payout_per_point", fields.payoutPerPoint ? payoutPerPoint : "");
      assignNumber(input, "selected_tick", fields.selectedTick ? selectedTick : "");
      const nextProposal = await api.proposal(input);
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
      {!activeAccount.is_virtual && onboarding && !onboarding.ready_for_live && (
        <div className="mt-6">
          <Feedback tone="info">
            <span className="font-bold">Real-money trading is locked</span> until you finish setting up —
            it takes about two minutes.{" "}
            <Link to="/app/onboarding" className="font-bold underline underline-offset-2">Finish setup</Link>.
            You can switch to your practice account and trade freely in the meantime.
          </Feedback>
        </div>
      )}
      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_420px]">
        <Surface className="p-6 sm:p-8">
          <form onSubmit={requestProposal} className="grid gap-6">
            <div className="flex items-center justify-between rounded-2xl bg-[#171917] p-5 text-white"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-white/35">Market price now</p><p className="mt-2 text-sm font-semibold">{selectedMarket?.display_name || symbol || "Pick a market"}</p></div><div className="text-right"><div className="flex items-center justify-end gap-2 text-xs font-semibold text-white/40"><span className={`h-2 w-2 rounded-full ${market.status === "connected" ? "bg-[#8ac777]" : "animate-pulse bg-amber-400"}`}/>{marketStreamLabel(market.status)}</div><p className="mt-2 text-2xl font-medium tabular-nums">{formatMarketQuote(market.tick?.quote, market.tick?.pip_size ?? selectedMarket?.pip ?? 2)}</p></div></div>
            <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Market<select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30">{symbols.map((item) => <option key={item.symbol} value={item.symbol}>{item.display_name} · {item.symbol}</option>)}</select></label>
            <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Trade type<select value={contractType} onChange={(event) => setContractType(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30">{contracts.map((item) => <option key={item.contract_type} value={item.contract_type}>{item.contract_display || item.contract_type}</option>)}</select><span className="mt-2 block text-xs font-normal normal-case text-black/35">Showing the trade types available for this market right now.</span></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Amount<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></label>
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Amount means<select value={basis} onChange={(event) => setBasis(event.target.value as "stake" | "payout")} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none"><option value="stake">My stake</option><option value="payout">Target payout</option></select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Expiry<select value={expiryMode} onChange={(event) => setExpiryMode(event.target.value as "duration" | "date")} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none"><option value="duration">Duration</option><option value="date">Date and time</option></select></label>
              {expiryMode === "duration" ? <>
                <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Duration<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></label>
                <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">Unit<select value={durationUnit} onChange={(event) => setDurationUnit(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none"><option value="t">Ticks</option><option value="s">Seconds</option><option value="m">Minutes</option><option value="h">Hours</option><option value="d">Days</option></select></label>
              </> : <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35 sm:col-span-2">Expires at<input type="datetime-local" value={dateExpiry} onChange={(event) => setDateExpiry(event.target.value)} className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none"/></label>}
            </div>
            {(fields.barrier || fields.barrier2) && <div className="grid gap-4 sm:grid-cols-2">
              {fields.barrier && <TradeField label={fields.digitBarrier ? "Predicted digit / barrier" : "Barrier"} value={barrier} onChange={setBarrier} placeholder={fields.barrierHint}/>}
              {fields.barrier2 && <TradeField label="Second barrier" value={barrier2} onChange={setBarrier2} placeholder={fields.secondBarrierHint}/>}
            </div>}
            {(fields.multiplier || fields.growthRate || fields.selectedTick || fields.payoutPerPoint) && <div className="grid gap-4 sm:grid-cols-2">
              {fields.multiplier && <TradeField label="Multiplier" value={multiplier} onChange={setMultiplier} type="number" placeholder={fields.multiplierHint}/>}
              {fields.growthRate && <TradeField label="Growth rate" value={growthRate} onChange={setGrowthRate} type="number" placeholder={fields.growthRateHint}/>}
              {fields.selectedTick && <TradeField label="Selected tick" value={selectedTick} onChange={setSelectedTick} type="number" placeholder={fields.selectedTickHint}/>}
              {fields.payoutPerPoint && <TradeField label="Payout per point" value={payoutPerPoint} onChange={setPayoutPerPoint} type="number" placeholder={fields.payoutHint}/>}
            </div>}
            {fields.cancellation && <TradeField label="Cancellation duration" value={cancellation} onChange={setCancellation} placeholder={fields.cancellationHint}/>}
            {fields.limitOrder && <div className="grid gap-4 sm:grid-cols-2">
              <TradeField label="Stop loss" value={stopLoss} onChange={setStopLoss} type="number" placeholder="Optional"/>
              <TradeField label="Take profit" value={takeProfit} onChange={setTakeProfit} type="number" placeholder="Optional"/>
            </div>}
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

type TradeFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
};

function TradeField({ label, value, onChange, type = "text", placeholder }: TradeFieldProps) {
  return (
    <label className="text-xs font-bold uppercase tracking-[.13em] text-black/35">
      {label}
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold normal-case outline-none focus:border-black/30"
      />
    </label>
  );
}

function assignText(target: Record<string, unknown>, key: string, value: string) {
  const normalized = value.trim();
  if (normalized) target[key] = normalized;
}

function assignNumber(target: Record<string, unknown>, key: string, value: string) {
  if (!value.trim()) return;
  const number = Number(value);
  if (Number.isFinite(number)) target[key] = number;
}

function contractFields(contract?: ContractOption) {
  const contractType = contract?.contract_type || "";
  const digitBarrier = ["DIGITDIFF", "DIGITMATCH", "DIGITOVER", "DIGITUNDER"].includes(contractType);
  const barrierCount = contract?.barriers ?? 0;
  const twoBarriers = barrierCount >= 2 || ["RANGE", "UPORDOWN", "EXPIRYRANGE", "EXPIRYRANGEE", "EXPIRYMISS", "EXPIRYMISSE"].includes(contractType);
  const barrier = barrierCount >= 1 || digitBarrier || twoBarriers || [
    "HIGHER", "LOWER", "ONETOUCH", "NOTOUCH", "TURBOSLONG", "TURBOSSHORT",
  ].includes(contractType);
  const multiplier = Boolean(contract?.multiplier_range?.length) || ["MULTUP", "MULTDOWN"].includes(contractType);
  const accumulator = Boolean(contract?.growth_rate_range?.length) || contractType === "ACCU";
  const vanilla = ["VANILLALONGCALL", "VANILLALONGPUT"].includes(contractType);
  const barrierChoices = contract?.available_barriers || contract?.barrier_choices || contract?.last_digit_range || [];

  return {
    barrier,
    barrier2: twoBarriers,
    digitBarrier,
    multiplier,
    growthRate: accumulator,
    cancellation: Boolean(contract?.cancellation_range?.length) || multiplier,
    limitOrder: multiplier || accumulator,
    payoutPerPoint: Boolean(contract?.payout_choices?.length) || vanilla || contractType.startsWith("TURBOS"),
    selectedTick: ["TICKHIGH", "TICKLOW"].includes(contractType),
    barrierHint: digitBarrier ? "0 to 9" : String(barrierChoices[0] ?? "+0.10 or 123.45"),
    secondBarrierHint: String(barrierChoices[1] ?? "-0.10 or 120.00"),
    multiplierHint: String(contract?.multiplier_range?.[0] ?? 100),
    growthRateHint: String(contract?.growth_rate_range?.[0] ?? 0.01),
    cancellationHint: String(contract?.cancellation_range?.[0] ?? "5m"),
    selectedTickHint: String(contract?.last_digit_range?.[0] ?? 1),
    payoutHint: String(contract?.payout_choices?.[0] ?? 1),
  };
}
