import { ArrowDownLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { apiErrorMessage, useSynexAPI } from "../../features/platform/services/synexApi";

export default function FundingPage() {
  const api = useSynexAPI();
  const [message, setMessage] = useState("Checking payment status…");

  useEffect(() => {
    void api.fundingMethods().then((result) => setMessage(result.message)).catch((reason) => setMessage(apiErrorMessage(reason)));
  }, [api]);

  return (
    <>
      <PageHeader eyebrow="Your money" title="Funding" description="In-app deposits and withdrawals are coming soon. Until then, you can top up and withdraw directly on Deriv as usual." />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Surface className="p-7 sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe9d9] text-[#426337]"><ArrowDownLeft size={20}/></span><h2 className="mt-12 text-2xl font-medium tracking-[-.04em]">Deposit</h2><p className="mt-3 text-sm font-medium leading-relaxed text-black/40">Soon you'll be able to top up your trading account right here, in a few taps. We're making sure it's rock-solid first.</p><button disabled className="mt-7 w-full rounded-full bg-black/10 px-5 py-4 text-sm font-semibold text-black/35">Coming soon</button></Surface>
        <Surface className="p-7 sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#eee3cf] text-[#775c30]"><ArrowUpRight size={20}/></span><h2 className="mt-12 text-2xl font-medium tracking-[-.04em]">Withdraw</h2><p className="mt-3 text-sm font-medium leading-relaxed text-black/40">Withdrawals will land here too — simple, safe, and straight to you. Every step verified before we switch it on.</p><button disabled className="mt-7 w-full rounded-full bg-black/10 px-5 py-4 text-sm font-semibold text-black/35">Coming soon</button></Surface>
      </div>
      <div className="mt-4"><Feedback tone="info"><span className="font-bold">Status:</span> {message}</Feedback></div>
      <Surface className="mt-4 p-6 sm:p-8"><div className="flex items-start gap-4"><LockKeyhole className="mt-0.5 text-black/30"/><div><h3 className="font-semibold">Your money stays safe</h3><p className="mt-2 max-w-[720px] text-sm font-medium leading-relaxed text-black/40">Your funds always sit with Deriv — never with Synex. When payments launch here, they'll be built with the same security-first care as everything else on the platform.</p></div></div></Surface>
    </>
  );
}
