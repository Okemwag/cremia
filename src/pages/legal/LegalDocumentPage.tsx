import { Navigate, useParams } from "react-router-dom";
import { findLegalDocument } from "../../features/legal/documents";

export default function LegalDocumentPage() {
  const document = findLegalDocument(useParams().slug);
  if (!document) return <Navigate to="/legal" replace />;

  return (
    <main className="mx-auto max-w-[820px] px-5 py-16 sm:px-10 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Synex legal</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">{document.title}</h1>
      <p className="mt-5 text-lg leading-relaxed text-black/45">{document.summary}</p>
      <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-black/45">
        <span className="rounded-full border border-black/10 bg-white/60 px-3 py-2">Version {document.version}</span>
        <span className="rounded-full border border-black/10 bg-white/60 px-3 py-2">Effective {document.effectiveDate}</span>
        {document.acceptanceRequired && <span className="rounded-full bg-[#dfead9] px-3 py-2 text-[#3f6235]">Acceptance required</span>}
      </div>

      <article className="mt-14 space-y-11">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-[15px] font-medium leading-7 text-black/55">
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul className="space-y-3 pl-5">{section.bullets.map((bullet) => <li key={bullet} className="list-disc pl-1">{bullet}</li>)}</ul>}
            </div>
          </section>
        ))}
      </article>
    </main>
  );
}
