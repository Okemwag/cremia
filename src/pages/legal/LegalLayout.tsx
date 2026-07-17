import { ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { legalConfig } from "../../features/legal/legalConfig";

export default function LegalLayout() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] text-[#11120f]">
      <header className="border-b border-black/10 px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-[-0.06em]">SYNEX</Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-black">
            <ArrowLeft size={15} /> Back to Synex
          </Link>
        </div>
      </header>
      <div className="border-b border-amber-900/10 bg-amber-100 px-5 py-3 text-center text-xs font-semibold text-amber-950/75 sm:px-10">
        {legalConfig.legalReviewStatus} · Not approved for public launch
      </div>
      <Outlet />
      <footer className="border-t border-black/10 px-5 py-8 text-center text-xs text-black/40 sm:px-10">
        © 2026 Synex · Trading involves substantial risk · Operator details pending legal approval
      </footer>
    </div>
  );
}
