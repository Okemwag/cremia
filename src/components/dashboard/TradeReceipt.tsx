import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { formatMoney, type OrderReceipt } from "../../features/platform/services/synexApi";

const statusView = {
  succeeded: { label: "Order completed", icon: CheckCircle2, className: "bg-[#e0eadb] text-[#46683c]" },
  pending: { label: "Confirmation pending", icon: Clock3, className: "bg-amber-100 text-amber-900" },
  review: { label: "Under review", icon: AlertTriangle, className: "bg-amber-100 text-amber-900" },
  failed: { label: "Order not completed", icon: AlertTriangle, className: "bg-red-50 text-red-700" },
} as const;

export default function TradeReceipt({ receipt, feeDisclosure }: { receipt: OrderReceipt; feeDisclosure: string }) {
  const view = statusView[receipt.status];
  const StatusIcon = view.icon;

  return (
    <section aria-labelledby="trade-receipt-title">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2"><ReceiptText size={18} className="text-black/35" /><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Order receipt</p></div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${view.className}`}><StatusIcon size={13} /> {view.label}</span>
      </div>

      <h2 id="trade-receipt-title" className="mt-6 text-2xl font-medium tracking-[-.04em]">{receipt.contract_type} · {receipt.symbol}</h2>
      <p className="mt-2 text-xs font-medium text-black/35">Synex reference {receipt.order_id}</p>

      <dl className="mt-6 divide-y divide-black/[.07] border-y border-black/[.07] text-sm">
        <ReceiptRow label="Account" value={`${receipt.login_id} · ${receipt.is_virtual ? "Practice" : "Real money"}`} />
        {!receipt.is_virtual && <ReceiptRow label="Risk confirmation" value={receipt.real_money_confirmed ? "Acknowledged" : "Not recorded"} />}
        <ReceiptRow label="Amount at risk" value={formatMoney(receipt.maximum_loss, receipt.currency)} />
        <ReceiptRow label="Potential payout" value={formatMoney(receipt.potential_payout, receipt.currency)} />
        <ReceiptRow label="Synex fee or markup" value={formatMoney(receipt.synex_fee, receipt.currency)} />
        {receipt.contract_id ? <ReceiptRow label="Deriv contract" value={String(receipt.contract_id)} /> : null}
        {receipt.provider_transaction_id ? <ReceiptRow label="Deriv transaction" value={String(receipt.provider_transaction_id)} /> : null}
        <ReceiptRow label="Submitted" value={new Date(receipt.created_at).toLocaleString()} />
      </dl>

      <p className="mt-5 text-xs font-medium leading-relaxed text-black/40">{feeDisclosure}</p>
      {receipt.longcode && <p className="mt-3 text-xs font-medium leading-relaxed text-black/40">{receipt.longcode}</p>}

      {receipt.contract_id && receipt.status === "succeeded" && (
        <Link to={`/app/portfolio/${receipt.contract_id}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white">
          View position <ExternalLink size={14} />
        </Link>
      )}
    </section>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-5 py-3.5"><dt className="text-black/40">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>;
}
