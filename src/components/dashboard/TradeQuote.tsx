import { Check, ShieldAlert, Zap } from "lucide-react";
import type { Proposal } from "../../features/platform/services/synexApi";
import { formatMoney } from "../../features/platform/services/synexApi";

type Props = {
  proposal: Proposal;
  currency: string;
  isVirtual: boolean;
  secondsRemaining: number;
  realMoneyConfirmed: boolean;
  disabled: boolean;
  onRealMoneyConfirmed: (checked: boolean) => void;
  onExecute: () => void;
};

export default function TradeQuote({
  proposal,
  currency,
  isVirtual,
  secondsRemaining,
  realMoneyConfirmed,
  disabled,
  onRealMoneyConfirmed,
  onExecute,
}: Props) {
  const maximumLoss = proposal.maximum_loss ?? proposal.ask_price;
  const potentialProfit = proposal.payout === undefined ? undefined : proposal.payout - proposal.ask_price;
  const canConfirm = secondsRemaining > 0 && !disabled && (isVirtual || realMoneyConfirmed);

  return (
    <>
      <div className="mt-5 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isVirtual ? "bg-[#e0eadb] text-[#46683c]" : "bg-amber-100 text-amber-900"}`}>
          {isVirtual ? "Practice account" : "Real-money account"}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${secondsRemaining > 8 ? "bg-[#e0eadb] text-[#46683c]" : "bg-amber-100 text-amber-800"}`}>
          {secondsRemaining > 0 ? `${secondsRemaining}s` : "Expired"}
        </span>
      </div>

      <p className="mt-6 text-sm font-medium text-black/40">Amount at risk</p>
      <p className="mt-1 text-[38px] font-medium tracking-[-.05em]">{formatMoney(maximumLoss, currency)}</p>

      <dl className="mt-5 divide-y divide-black/[.07] border-y border-black/[.07] text-sm">
        <div className="flex justify-between py-3.5"><dt className="text-black/40">Purchase price</dt><dd className="font-semibold">{formatMoney(proposal.ask_price, currency)}</dd></div>
        {proposal.payout !== undefined && <div className="flex justify-between py-3.5"><dt className="text-black/40">Potential payout</dt><dd className="font-semibold">{formatMoney(proposal.payout, currency)}</dd></div>}
        {potentialProfit !== undefined && <div className="flex justify-between py-3.5"><dt className="text-black/40">Potential profit</dt><dd className={`font-semibold ${potentialProfit >= 0 ? "text-[#568f47]" : "text-red-600"}`}>{formatMoney(potentialProfit, currency)}</dd></div>}
        <div className="flex justify-between py-3.5"><dt className="text-black/40">Synex fee or markup</dt><dd className="font-semibold">{formatMoney(proposal.synex_fee ?? 0, currency)}</dd></div>
      </dl>

      <p className="mt-5 text-xs font-medium leading-relaxed text-black/45">{proposal.longcode || "Review this price and confirm before the timer ends."}</p>
      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-black/35"><Check size={13} /> Executable price supplied by Deriv</p>

      {!isVirtual && (
        <label className="mt-5 flex cursor-pointer gap-3 rounded-2xl border border-amber-900/15 bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-950/75">
          <input
            type="checkbox"
            checked={realMoneyConfirmed}
            onChange={(event) => onRealMoneyConfirmed(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#111310]"
          />
          <span><strong className="flex items-center gap-1.5 text-amber-950"><ShieldAlert size={15} /> Real-money confirmation</strong>I understand that I may lose the full amount at risk.</span>
        </label>
      )}

      <button
        type="button"
        onClick={onExecute}
        disabled={!canConfirm}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45 ${isVirtual ? "bg-[#6fa45e]" : "bg-[#111310]"}`}
      >
        <Zap size={16} />
        {secondsRemaining <= 0 ? "Request a new price" : isVirtual ? "Confirm practice order" : "Confirm real-money order"}
      </button>
    </>
  );
}
