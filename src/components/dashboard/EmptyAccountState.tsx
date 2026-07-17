import { ArrowRight, Link2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useDerivConnection } from "../../features/platform/hooks/useDerivConnection";
import { apiErrorMessage } from "../../features/platform/services/synexApi";
import Surface from "./Surface";

export default function EmptyAccountState() {
  const { connectDeriv, connecting } = useDerivConnection();
  const [error, setError] = useState("");

  const connect = async () => {
    setError("");
    try { await connectDeriv(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
  };

  return (
    <Surface className="mt-8 grid min-h-[360px] place-items-center p-8 text-center">
      <div className="max-w-[440px]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#dfe9d9] text-[#3d6033]">
          <Link2 size={22} />
        </span>
        <h2 className="mt-5 text-2xl font-medium tracking-[-0.04em]">Connect your Deriv account</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-black/40">
          Your money and trades stay safely with Deriv — Synex is where you see and control it all. Start with a free practice account and get a feel for things.
        </p>
        <button
          type="button"
          onClick={() => void connect()}
          disabled={connecting}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white"
        >
          {connecting ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {connecting ? "Opening Deriv…" : "Connect Deriv"}
        </button>
        {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}
      </div>
    </Surface>
  );
}
