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

export default function ActivityPage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID } = useWorkspace();
  const [tab, setTab] = useState<ActivityTab>("statement");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeLoginID) { setLoading(false); return; }
    setLoading(true); setError("");
    const request = tab === "statement" ? api.statement(activeLoginID) : api.profitTable(activeLoginID);
    void request.then(setRows).catch((reason) => setError(apiErrorMessage(reason))).finally(() => setLoading(false));
  }, [activeLoginID, api, tab]);

  if (!activeAccount) {
    return <><PageHeader eyebrow="Account history" title="Activity" description="Statements and completed contract results appear here." /><EmptyAccountState /></>;
  }

  return (
    <>
      <PageHeader eyebrow="Account history" title="Activity" description="Review account transactions and realised contract results directly from Deriv." />
      <div className="mt-8 flex w-fit rounded-full border border-black/[.08] bg-white/45 p-1">
        {(["statement", "profit"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === item ? "bg-[#111310] text-white" : "text-black/40"}`}>{item === "statement" ? "Statement" : "Profit table"}</button>)}
      </div>
      {error && <div className="mt-5"><Feedback>{error}</Feedback></div>}
      <Surface className="mt-4 overflow-hidden">
        {loading ? <div className="grid min-h-[320px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : rows.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-black/[.07] text-[11px] uppercase tracking-[.13em] text-black/30"><th className="px-6 py-5">Type</th><th className="px-4 py-5">Reference</th><th className="px-4 py-5">Amount</th><th className="px-6 py-5 text-right">Time</th></tr></thead><tbody>{rows.map((row, index) => { const epoch = Number(firstValue(row, ["transaction_time", "purchase_time", "sell_time", "date_start"]) || 0); const amount = Number(firstValue(row, ["amount", "profit", "sell_price", "buy_price"]) || 0); return <tr key={String(firstValue(row, ["transaction_id", "contract_id"]) || index)} className="border-b border-black/[.06] last:border-0"><td className="px-6 py-5 text-sm font-semibold">{String(firstValue(row, ["action_type", "transaction_type", "contract_type", "shortcode"]) || "Transaction")}</td><td className="px-4 py-5 text-sm text-black/45">{String(firstValue(row, ["contract_id", "transaction_id", "reference_id"]) || "—")}</td><td className={`px-4 py-5 text-sm font-semibold ${amount >= 0 ? "text-[#568f47]" : "text-red-600"}`}>{formatMoney(amount, String(firstValue(row, ["currency"]) || activeAccount.currency))}</td><td className="px-6 py-5 text-right text-sm text-black/40">{epoch ? new Date(epoch * 1000).toLocaleString() : "—"}</td></tr>; })}</tbody></table></div>
        ) : <div className="grid min-h-[320px] place-items-center text-center"><div><RefreshCw className="mx-auto text-black/20"/><p className="mt-4 text-sm font-medium text-black/40">No activity returned for this account.</p></div></div>}
      </Surface>
    </>
  );
}
