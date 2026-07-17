import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { formatMoney, type OrderReceipt } from "../../features/platform/services/synexApi";

const statusView = {
  succeeded: { label: "Trade placed", icon: CheckCircle2, className: "bg-[#e0eadb] text-[#46683c]" },
  pending: { label: "Confirming with Deriv", icon: Clock3, className: "bg-amber-100 text-amber-900" },
  review: { label: "Being double-checked", icon: AlertTriangle, className: "bg-amber-100 text-amber-900" },
  failed: { label: "Didn't go through", icon: AlertTriangle, className: "bg-red-50 text-red-700" },
} as const;

export default function TradeReceipt({ receipt, feeDisclosure }: { receipt: OrderReceipt; feeDisclosure: string }) {
  const view = statusView[receipt.status];
  const StatusIcon = view.icon;

  return (
    <section aria-labelledby="trade-receipt-title">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2"><ReceiptText size={18} className="text-black/35" /><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Trade receipt</p></div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${view.className}`}><StatusIcon size={13} /> {view.label}</span>
      </div>

      <h2 id="trade-receipt-title" className="mt-6 text-2xl font-medium tracking-[-.04em]">{receipt.contract_type} · {receipt.symbol}</h2>
      <p className="mt-2 text-xs font-medium text-black/35">Synex reference {receipt.order_id}</p>

      <dl className="mt-6 divide-y divide-black/[.07] border-y border-black/[.07] text-sm">
        <ReceiptRow label="Account" value={`${receipt.login_id} · ${receipt.is_virtual ? "Practice" : "Real money"}`} />
        {!receipt.is_virtual && <ReceiptRow label="Risk confirmation" value={receipt.real_money_confirmed ? "Confirmed by you" : "Not recorded"} />}
        <ReceiptRow label="The most you can lose" value={formatMoney(receipt.maximum_loss, receipt.currency)} />
        <ReceiptRow label="You could get back" value={formatMoney(receipt.potential_payout, receipt.currency)} />
        <ReceiptRow label="Synex fee" value={formatMoney(receipt.synex_fee, receipt.currency)} />
        {receipt.contract_id ? <ReceiptRow label="Deriv contract" value={String(receipt.contract_id)} /> : null}
        {receipt.provider_transaction_id ? <ReceiptRow label="Deriv transaction" value={String(receipt.provider_transaction_id)} /> : null}
        {receipt.duration ? <ReceiptRow label="Duration" value={`${receipt.duration} ${receipt.duration_unit || ""}`.trim()} /> : null}
        {receipt.date_expiry ? <ReceiptRow label="Expiry" value={new Date(receipt.date_expiry * 1000).toLocaleString()} /> : null}
        {receipt.barrier ? <ReceiptRow label="Barrier" value={receipt.barrier} /> : null}
        {receipt.barrier2 ? <ReceiptRow label="Second barrier" value={receipt.barrier2} /> : null}
        {receipt.cancellation ? <ReceiptRow label="Cancellation" value={receipt.cancellation} /> : null}
        {receipt.multiplier ? <ReceiptRow label="Multiplier" value={String(receipt.multiplier)} /> : null}
        {receipt.growth_rate ? <ReceiptRow label="Growth rate" value={String(receipt.growth_rate)} /> : null}
        {receipt.selected_tick ? <ReceiptRow label="Selected tick" value={String(receipt.selected_tick)} /> : null}
        {receipt.payout_per_point ? <ReceiptRow label="Payout per point" value={String(receipt.payout_per_point)} /> : null}
        {receipt.stop_loss ? <ReceiptRow label="Stop loss" value={formatMoney(receipt.stop_loss, receipt.currency)} /> : null}
        {receipt.take_profit ? <ReceiptRow label="Take profit" value={formatMoney(receipt.take_profit, receipt.currency)} /> : null}
        <ReceiptRow label="Submitted" value={new Date(receipt.created_at).toLocaleString()} />
      </dl>

      <p className="mt-5 text-xs font-medium leading-relaxed text-black/40">{feeDisclosure}</p>
      {receipt.longcode && <p className="mt-3 text-xs font-medium leading-relaxed text-black/40">{receipt.longcode}</p>}

      {receipt.contract_id && receipt.status === "succeeded" && (
        <Link to={`/app/portfolio/${receipt.contract_id}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white">
          Follow this trade <ExternalLink size={14} />
        </Link>
      )}
    </section>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-5 py-3.5"><dt className="text-black/40">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>;
}
