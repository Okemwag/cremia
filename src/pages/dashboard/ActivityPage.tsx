import { LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, formatMoney, useSynexAPI } from "../../features/platform/services/synexApi";

type ActivityTab = "statement" | "profit";

function firstValue(row: Record<string, unknown>, keys: string[]) {
  return keys.map((key) => row[key]).find((item) => item !== undefined && item !== null);
}

function numericValue(row: Record<string, unknown>, key: string) {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function TransactionRows({ rows, currency }: { rows: Record<string, unknown>[]; currency: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-black/[.07] text-[11px] uppercase tracking-[.13em] text-black/30"><th className="px-6 py-5">Type</th><th className="px-4 py-5">Transaction</th><th className="px-4 py-5">Contract / reference</th><th className="px-4 py-5">Amount</th><th className="px-4 py-5">Balance after</th><th className="px-6 py-5 text-right">Time</th></tr></thead><tbody>{rows.map((row, index) => {
    const epoch = Number(firstValue(row, ["transaction_time", "purchase_time"]) || 0);
    const amount = numericValue(row, "amount");
    const rowCurrency = String(row.currency || currency);
    return <tr key={String(row.transaction_id || index)} className="border-b border-black/[.06] last:border-0"><td className="px-6 py-5 text-sm font-semibold">{String(firstValue(row, ["action_type", "transaction_type", "shortcode"]) || "Transaction")}</td><td className="px-4 py-5 text-sm font-medium text-black/55">{String(row.transaction_id || "—")}</td><td className="px-4 py-5 text-sm text-black/40">{String(firstValue(row, ["contract_id", "reference_id"]) || "—")}</td><td className={`px-4 py-5 text-sm font-semibold ${amount >= 0 ? "text-[#568f47]" : "text-red-600"}`}>{formatMoney(amount, rowCurrency)}</td><td className="px-4 py-5 text-sm font-medium text-black/50">{row.balance_after == null ? "—" : formatMoney(numericValue(row, "balance_after"), rowCurrency)}</td><td className="px-6 py-5 text-right text-sm text-black/40">{epoch ? new Date(epoch * 1000).toLocaleString() : "—"}</td></tr>;
  })}</tbody></table></div>;
}

function TradeResultRows({ rows, currency }: { rows: Record<string, unknown>[]; currency: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead><tr className="border-b border-black/[.07] text-[11px] uppercase tracking-[.13em] text-black/30"><th className="px-6 py-5">Trade</th><th className="px-4 py-5">Contract</th><th className="px-4 py-5">Transaction</th><th className="px-4 py-5">Paid</th><th className="px-4 py-5">Returned</th><th className="px-4 py-5">Result</th><th className="px-6 py-5 text-right">Settled</th></tr></thead><tbody>{rows.map((row, index) => {
    const buyPrice = numericValue(row, "buy_price");
    const sellPrice = numericValue(row, "sell_price");
    const sellTime = Number(row.sell_time || 0);
    const settled = sellTime > 0;
    const profit = sellPrice - buyPrice;
    const outcome = !settled ? "Open" : profit > 0 ? "Won" : profit < 0 ? "Lost" : "Break even";
    return <tr key={String(row.contract_id || row.transaction_id || index)} className="border-b border-black/[.06] last:border-0"><td className="px-6 py-5"><p className="text-sm font-semibold">{String(firstValue(row, ["contract_type", "shortcode"]) || "Trade")}</p><p className="mt-1 max-w-[260px] truncate text-xs text-black/35">{String(firstValue(row, ["underlying_symbol", "longcode"]) || "")}</p></td><td className="px-4 py-5 text-sm font-medium text-black/55">{String(row.contract_id || "—")}</td><td className="px-4 py-5 text-sm text-black/40">{String(row.transaction_id || "—")}</td><td className="px-4 py-5 text-sm font-medium">{formatMoney(buyPrice, currency)}</td><td className="px-4 py-5 text-sm font-medium">{settled ? formatMoney(sellPrice, currency) : "—"}</td><td className={`px-4 py-5 text-sm font-semibold ${!settled ? "text-black/35" : profit >= 0 ? "text-[#568f47]" : "text-red-600"}`}><span className="block">{outcome}</span><span className="mt-1 block text-xs">{settled ? formatMoney(profit, currency) : "Awaiting settlement"}</span></td><td className="px-6 py-5 text-right text-sm text-black/40">{settled ? new Date(sellTime * 1000).toLocaleString() : "—"}</td></tr>;
  })}</tbody></table></div>;
}

export default function ActivityPage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID, lastTransaction } = useWorkspace();
  const [tab, setTab] = useState<ActivityTab>("statement");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeLoginID) { setLoading(false); return; }
    setLoading(true); setError("");
    const request = tab === "statement" ? api.statement(activeLoginID) : api.profitTable(activeLoginID);
    void request.then(setRows).catch((reason) => setError(apiErrorMessage(reason))).finally(() => setLoading(false));
  }, [activeLoginID, api, tab, lastTransaction?.transaction_id]);

  if (!activeAccount) {
    return <><PageHeader eyebrow="Your history" title="Activity" description="Once you're connected, every transaction and trade result will show up here." /><EmptyAccountState /></>;
  }

  return (
    <>
      <PageHeader eyebrow="Your history" title="Activity" description="Every transaction and every trade result — straight from your Deriv account." />
      <div className="mt-8 flex w-fit rounded-full border border-black/[.08] bg-white/45 p-1">
        {(["statement", "profit"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === item ? "bg-[#111310] text-white" : "text-black/40"}`}>{item === "statement" ? "Transactions" : "Trade results"}</button>)}
      </div>
      {error && <div className="mt-5"><Feedback>{error}</Feedback></div>}
      <Surface className="mt-4 overflow-hidden">
        {loading ? <div className="grid min-h-[320px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : rows.length ? (
          tab === "statement" ? <TransactionRows rows={rows} currency={activeAccount.currency}/> : <TradeResultRows rows={rows} currency={activeAccount.currency}/>
        ) : <div className="grid min-h-[320px] place-items-center text-center"><div><RefreshCw className="mx-auto text-black/20"/><p className="mt-4 text-sm font-medium text-black/40">Nothing here yet. Once you start trading, your history will build up automatically.</p></div></div>}
      </Surface>
    </>
  );
}
