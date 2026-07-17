import { ArrowUpRight, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { legalConfig } from "../../features/legal/legalConfig";
import { legalDocuments } from "../../features/legal/documents";

export default function LegalIndexPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-16 sm:px-10 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Trust and transparency</p>
      <h1 className="mt-4 text-5xl font-medium tracking-[-0.055em] sm:text-7xl">Legal centre</h1>
      <p className="mt-6 max-w-[680px] text-base font-medium leading-relaxed text-black/45 sm:text-lg">
        Understand the Synex service, connected Deriv relationship, trading risk,
        privacy practices, and how to raise a request or complaint.
      </p>

      <section className="mt-12 rounded-[24px] border border-amber-900/15 bg-amber-50 p-6 sm:p-8">
        <div className="flex items-center gap-3"><ShieldAlert size={20} /><h2 className="font-semibold">Counsel completion required</h2></div>
        <p className="mt-3 text-sm leading-relaxed text-black/55">
          These documents are product-ready drafts, not approved legal advice. Public launch remains blocked until the following are confirmed:
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-black/65 sm:grid-cols-2">
          {legalConfig.missingOperatorFields.map((field) => <li key={field}>• {field}</li>)}
        </ul>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {legalDocuments.map((document) => (
          <Link key={document.slug} to={`/legal/${document.slug}`} className="group rounded-[22px] border border-black/10 bg-white/70 p-6 transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.025em]">{document.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-black/45">{document.summary}</p>
              </div>
              <ArrowUpRight size={18} className="shrink-0 text-black/35 group-hover:text-black" />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/30">{document.version}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
