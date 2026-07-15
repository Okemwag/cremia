import { ArrowDownLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { apiErrorMessage, useSynexAPI } from "../../features/platform/services/synexApi";

export default function FundingPage() {
  const api = useSynexAPI();
  const [message, setMessage] = useState("Checking the payment integration boundary…");

  useEffect(() => {
    void api.fundingMethods().then((result) => setMessage(result.message)).catch((reason) => setMessage(apiErrorMessage(reason)));
  }, [api]);

  return (
    <>
      <PageHeader eyebrow="Money movement" title="Funding" description="Deposit and withdrawal controls are prepared for your separate payment gateway and intentionally cannot move funds yet." />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Surface className="p-7 sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe9d9] text-[#426337]"><ArrowDownLeft size={20}/></span><h2 className="mt-12 text-2xl font-medium tracking-[-.04em]">Deposit</h2><p className="mt-3 text-sm font-medium leading-relaxed text-black/40">Fund your trading flow through the payment gateway once merchant settlement and reconciliation are connected.</p><button disabled className="mt-7 w-full rounded-full bg-black/10 px-5 py-4 text-sm font-semibold text-black/35">Gateway coming next</button></Surface>
        <Surface className="p-7 sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#eee3cf] text-[#775c30]"><ArrowUpRight size={20}/></span><h2 className="mt-12 text-2xl font-medium tracking-[-.04em]">Withdraw</h2><p className="mt-3 text-sm font-medium leading-relaxed text-black/40">Withdrawal requests will use the same stable backend contract with provider verification added later.</p><button disabled className="mt-7 w-full rounded-full bg-black/10 px-5 py-4 text-sm font-semibold text-black/35">Gateway coming next</button></Surface>
      </div>
      <div className="mt-4"><Feedback tone="info"><span className="font-bold">Integration status:</span> {message}</Feedback></div>
      <Surface className="mt-4 p-6 sm:p-8"><div className="flex items-start gap-4"><LockKeyhole className="mt-0.5 text-black/30"/><div><h3 className="font-semibold">Separated by design</h3><p className="mt-2 max-w-[720px] text-sm font-medium leading-relaxed text-black/40">Synex trading endpoints never handle gateway secrets. The future payment adapter will record idempotent deposit and withdrawal operations while keeping Deriv execution isolated.</p></div></div></Surface>
    </>
  );
}
