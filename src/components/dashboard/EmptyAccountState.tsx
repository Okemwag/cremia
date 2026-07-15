import { ArrowRight, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import Surface from "./Surface";

export default function EmptyAccountState() {
  return (
    <Surface className="mt-8 grid min-h-[360px] place-items-center p-8 text-center">
      <div className="max-w-[440px]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#dfe9d9] text-[#3d6033]">
          <Link2 size={22} />
        </span>
        <h2 className="mt-5 text-2xl font-medium tracking-[-0.04em]">Connect your Deriv account</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-black/40">
          Synex uses Deriv for market access and execution. Start with a virtual account while you learn the workflow.
        </p>
        <Link
          to="/app/connect"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white"
        >
          Connect Deriv <ArrowRight size={15} />
        </Link>
      </div>
    </Surface>
  );
}
