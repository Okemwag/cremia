import { AlertTriangle, ArrowRight, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { useState } from "react";

const lessons = [
  { tag: "Foundation", title: "How trades work", text: "What you stake, what you can win, how long a trade runs — and what happens between seeing a quote and owning a trade." },
  { tag: "Risk", title: "Position sizing before prediction", text: "Set a maximum loss per idea, protect essential funds and decide the exit before entering a market." },
  { tag: "Execution", title: "Quotes, timing and closing trades", text: "Why live prices move, why a quote can expire, and how to watch or close a trade once it's running." },
  { tag: "Markets", title: "Forex, commodities and derived indices", text: "Compare trading hours, volatility and market-specific risks before choosing an instrument." },
];

const faqs = [
  ["Does Synex hold my trading funds?", "No. Your money and trades always stay with your Deriv account. Synex is the platform you view and control them from."],
  ["Can I lose more than my stake?", "It depends on the trade type. Before you buy, always check the quote — it shows the most you can lose, what you could get back, and the cancellation rules."],
  ["Is a demo account realistic?", "It uses virtual funds and is useful for learning execution. It cannot reproduce the emotional or financial consequences of live trading."],
  ["Are returns guaranteed?", "No. Trading involves substantial risk and past outcomes do not predict future results. Synex does not guarantee profit."],
  ["How are deposits and withdrawals handled?", "For now, deposits and withdrawals happen directly on Deriv. In-app funding is coming to Synex soon."],
];

export default function LearnPage() {
  const [open, setOpen] = useState(0);
  return <>
    <div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Knowledge centre</p><h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-.05em] sm:text-[44px]">Trade with context</h1><p className="mt-3 max-w-[650px] text-sm font-medium leading-relaxed text-black/40 sm:text-base">Practical education for understanding products, execution and risk. This content is educational, not personal financial advice.</p></div>

    <section className="mt-8 grid overflow-hidden rounded-[24px] bg-[#111310] text-white lg:grid-cols-[1.15fr_.85fr]">
      <div className="p-7 sm:p-10"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em]"><GraduationCap size={14}/> Start here</span><h2 className="mt-10 max-w-[580px] text-[36px] font-medium leading-[1.02] tracking-[-.05em] sm:text-[52px]">Protect capital before pursuing opportunity.</h2><p className="mt-5 max-w-[560px] text-sm font-medium leading-relaxed text-white/50 sm:text-base">Use a demo account, understand the exact contract, and never trade money required for living expenses, debt or emergencies.</p></div>
      <div className="grid content-center gap-4 bg-[#20231f] p-7 sm:p-10"><div className="rounded-2xl bg-white/[.06] p-5"><ShieldCheck className="text-[#a6cc95]"/><p className="mt-4 text-sm font-semibold">Before every order</p><p className="mt-2 text-sm leading-relaxed text-white/45">Check which account you're on, your stake, the most you can lose, what you could win, and how you'll exit.</p></div><div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-5"><AlertTriangle className="text-amber-300"/><p className="mt-4 text-sm font-semibold">High-risk products</p><p className="mt-2 text-sm leading-relaxed text-white/45">Short-duration derivatives can move quickly and may result in the loss of the full stake.</p></div></div>
    </section>

    <div className="mt-10 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Learning path</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Core modules</h2></div><BookOpen size={20} className="text-black/25"/></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{lessons.map((lesson, index) => <article key={lesson.title} className="group rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-black/30">{String(index + 1).padStart(2, "0")} · {lesson.tag}</span><ArrowRight size={16} className="text-black/20 transition-transform group-hover:translate-x-1"/></div><h3 className="mt-10 text-xl font-semibold tracking-[-.03em]">{lesson.title}</h3><p className="mt-3 text-sm font-medium leading-relaxed text-black/40">{lesson.text}</p></article>)}</div>

    <section className="mt-10 rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6 sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Common questions</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Platform FAQ</h2><div className="mt-6 divide-y divide-black/[.07] border-y border-black/[.07]">{faqs.map(([question, answer], index) => <button key={question} type="button" onClick={() => setOpen(open === index ? -1 : index)} className="block w-full py-5 text-left"><span className="flex items-center justify-between gap-4 text-sm font-semibold sm:text-base">{question}<span className="text-xl font-light text-black/30">{open === index ? "−" : "+"}</span></span>{open === index && <span className="mt-3 block max-w-[760px] text-sm font-medium leading-relaxed text-black/45">{answer}</span>}</button>)}</div></section>
  </>;
}
