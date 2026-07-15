import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  Radar,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

const ASSET_ROOT = "https://qclay.design/lovable/synex";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Kicker({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={`mb-5 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] ${
        light ? "text-white/50" : "text-black/45"
      }`}
    >
      <img
        src={`${ASSET_ROOT}/star.svg`}
        alt=""
        aria-hidden="true"
        className={`h-3 w-3 ${light ? "invert" : ""}`}
      />
      {children}
    </div>
  );
}

function SectionTitle({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <h2
      className={`max-w-[760px] text-[38px] font-medium leading-[0.98] tracking-[-0.045em] sm:text-[52px] md:text-[64px] lg:text-[76px] ${
        light ? "text-white" : "text-[#0a0a0d]"
      }`}
    >
      {children}
    </h2>
  );
}

function Sparkline({
  path,
  color = "#9ce879",
}: {
  path: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 220 72" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 60H220" stroke="currentColor" strokeOpacity="0.08" />
      <path d="M0 36H220" stroke="currentColor" strokeOpacity="0.08" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const partners = ["FOREX", "STOCK INDICES", "COMMODITIES", "SYNTHETIC INDICES", "CRYPTO"];

function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f2f2f0] px-5 pb-24 pt-28 sm:px-10 md:pb-36 md:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <div className="border-y border-black/10 py-7">
            <p className="mb-7 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-black/35">
              Market access powered by Deriv
            </p>
            <div className="grid grid-cols-2 items-center gap-x-6 gap-y-7 text-center sm:grid-cols-5">
              {partners.map((partner, index) => (
                <span
                  key={partner}
                  className={`text-[13px] font-bold tracking-[0.14em] text-black/35 ${
                    index === partners.length - 1 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-12 pb-20 pt-28 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:pb-32 lg:pt-40">
          <Reveal>
            <Kicker>One trading workspace</Kicker>
            <p className="max-w-[360px] text-base font-medium leading-relaxed text-black/40 md:text-lg">
              Built for traders who want clear market discovery, deliberate execution,
              and an honest view of every open contract.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[38px] font-medium leading-[1.05] tracking-[-0.04em] text-black/25 sm:text-[52px] md:text-[64px] lg:text-[72px]">
              Markets move quickly. <span className="text-[#0a0a0d]">Your trading workflow should stay clear.</span>
            </p>
          </Reveal>
        </div>

        <div className="grid border-y border-black/10 sm:grid-cols-3">
          {[
            ["OAuth", "Secure account connection"],
            ["Live", "Deriv market pricing"],
            ["AES-256", "Token encryption at rest"],
          ].map(([value, label], index) => (
            <Reveal
              key={label}
              delay={index * 0.08}
              className={`py-8 sm:px-8 md:py-10 ${
                index > 0 ? "border-t border-black/10 sm:border-l sm:border-t-0" : ""
              }`}
            >
              <p className="text-[40px] font-medium tracking-[-0.05em] text-[#0a0a0d] md:text-[52px]">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-black/40">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const holdings = [
  { icon: "A", name: "Apple", ticker: "AAPL", allocation: "24.8%", value: "$284,920", gain: "+3.82%" },
  { icon: "N", name: "Nvidia", ticker: "NVDA", allocation: "18.2%", value: "$209,340", gain: "+7.14%" },
  { icon: "V", name: "Vanguard S&P", ticker: "VOO", allocation: "15.6%", value: "$179,400", gain: "+1.28%" },
  { icon: "B", name: "Bitcoin", ticker: "BTC", allocation: "11.4%", value: "$131,120", gain: "+5.46%" },
];

function PortfolioPanel() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#101211] shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
        <div>
          <p className="text-xs font-medium text-white/35">Total portfolio</p>
          <p className="mt-1 text-2xl font-medium tracking-[-0.04em] text-white">$1,148,532.80</p>
        </div>
        <button className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/65 transition-colors hover:bg-white/10">
          1 Year
        </button>
      </div>
      <div className="relative h-[190px] px-5 pb-4 pt-7 sm:h-[230px] sm:px-7">
        <div className="absolute left-7 top-6 flex items-center gap-2 text-xs font-medium text-[#9ce879]">
          <ArrowUpRight size={14} /> +18.42%
        </div>
        <Sparkline path="M0 172 C18 160,28 168,46 143 S76 154,91 120 S123 128,140 91 S171 105,183 65 S207 46,220 18" />
      </div>
      <div className="border-t border-white/10 px-5 py-2 sm:px-7">
        {holdings.map((holding) => (
          <div key={holding.ticker} className="grid grid-cols-[1fr_auto] items-center border-b border-white/[0.07] py-4 last:border-0 sm:grid-cols-[1fr_90px_110px_75px]">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
                {holding.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{holding.name}</p>
                <p className="text-[11px] text-white/30">{holding.ticker}</p>
              </div>
            </div>
            <p className="hidden text-right text-xs text-white/35 sm:block">{holding.allocation}</p>
            <p className="hidden text-right text-sm text-white/75 sm:block">{holding.value}</p>
            <p className="text-right text-xs font-medium text-[#9ce879]">{holding.gain}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsSection() {
  return (
    <section id="assets" className="relative overflow-hidden bg-[#080a09] px-5 py-28 text-white sm:px-10 md:py-40">
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#80c96b]/10 blur-[120px]" />
      <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20">
        <Reveal>
          <Kicker light>Complete visibility</Kicker>
          <SectionTitle light>
            Every position. <span className="text-white/25">One deliberate view.</span>
          </SectionTitle>
          <p className="mt-7 max-w-[470px] text-base font-medium leading-relaxed text-white/45 md:text-lg">
            Connect a Deriv account to see balances, open contracts, statements, and
            realised results without leaving the Synex workspace.
          </p>
          <a href="#analytics" className="group mt-9 inline-flex items-center gap-3 text-sm font-semibold text-white">
            Explore the platform
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition-colors group-hover:bg-white group-hover:text-black">
              <ArrowRight size={15} />
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <PortfolioPanel />
        </Reveal>
      </div>
    </section>
  );
}

const capabilityCards = [
  {
    icon: WalletCards,
    number: "01",
    title: "Everything connected",
    copy: "Link Deriv through OAuth without sharing your trading password with Synex.",
  },
  {
    icon: Layers3,
    number: "02",
    title: "One source of truth",
    copy: "See balances, open exposure, transaction history, and realised results in one precise view.",
  },
  {
    icon: Radar,
    number: "03",
    title: "Always in motion",
    copy: "Live market data and fresh proposals keep each execution decision grounded in current terms.",
  },
];

function CapabilitiesSection() {
  return (
    <section className="bg-[#e8e8e3] px-5 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Kicker>Designed around you</Kicker>
            <SectionTitle>
              Less noise. <span className="text-black/20">More knowing.</span>
            </SectionTitle>
          </div>
          <p className="max-w-[420px] text-base font-medium leading-relaxed text-black/40 md:text-lg">
            A calmer way to explore markets, price contracts, monitor exposure, and
            decide what deserves your attention next.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] bg-black/10 md:grid-cols-3 md:mt-24">
          {capabilityCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.number} delay={index * 0.08} className="h-full bg-[#f2f2f0] p-7 sm:p-9 lg:p-11">
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe4d9] text-black/70">
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <span className="text-xs font-semibold text-black/25">{card.number}</span>
                </div>
                <div className="mt-24 md:mt-36">
                  <h3 className="text-[26px] font-medium tracking-[-0.035em] text-[#0a0a0d]">{card.title}</h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-black/40 md:text-base">{card.copy}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AllocationDonut() {
  return (
    <div className="relative mx-auto grid aspect-square w-[240px] place-items-center sm:w-[280px]">
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#111_0deg_112deg,#a8c99a_112deg_202deg,#d4b978_202deg_276deg,#b5b4d8_276deg_326deg,#d9d9d5_326deg_360deg)]" />
      <div className="absolute inset-[26px] rounded-full bg-[#f7f7f4]" />
      <div className="relative text-center">
        <p className="text-xs font-medium text-black/35">Net worth</p>
        <p className="mt-1 text-2xl font-medium tracking-[-0.04em]">$1.84M</p>
        <p className="mt-2 text-xs font-semibold text-[#568348]">+12.8% YTD</p>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <section id="analytics" className="overflow-hidden bg-[#f2f2f0] px-5 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-end">
          <Reveal>
            <Kicker>Decision intelligence</Kicker>
            <SectionTitle>
              Understand the <span className="text-black/20">story behind every number.</span>
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[500px] text-base font-medium leading-relaxed text-black/40 md:text-lg">
              Go beyond a trade ticket. Synex brings positions, account history, and
              realised results together without overwhelming the execution flow.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] md:mt-24">
          <Reveal className="relative min-h-[520px] overflow-hidden rounded-[24px] bg-[#dce5d6] p-7 sm:p-10">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Performance intelligence</p>
                <h3 className="mt-3 max-w-[420px] text-[30px] font-medium leading-tight tracking-[-0.04em] sm:text-[38px]">
                  Know what is driving your return.
                </h3>
              </div>
              <BarChart3 className="hidden text-black/35 sm:block" strokeWidth={1.4} />
            </div>
            <div className="absolute inset-x-7 bottom-7 rounded-[18px] bg-[#f7f7f4] p-5 shadow-xl shadow-black/5 sm:inset-x-10 sm:bottom-10 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-black/35">Portfolio growth</p>
                  <p className="mt-1 text-2xl font-medium tracking-[-0.04em]">+$188,420</p>
                </div>
                <span className="rounded-full bg-[#dce5d6] px-3 py-1.5 text-xs font-semibold text-[#426238]">+18.42%</span>
              </div>
              <div className="mt-6 h-[150px] text-black">
                <Sparkline color="#111" path="M0 133 C19 123,31 137,50 111 S82 119,102 91 S128 102,146 68 S174 73,190 42 S208 35,220 10" />
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4">
            <Reveal delay={0.08} className="rounded-[24px] bg-[#f7f7f4] p-7 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] sm:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Allocation</p>
                  <h3 className="mt-3 text-[27px] font-medium tracking-[-0.04em]">Built for balance.</h3>
                </div>
                <ScanLine size={22} strokeWidth={1.5} className="text-black/30" />
              </div>
              <AllocationDonut />
            </Reveal>
            <Reveal delay={0.14} className="grid grid-cols-[1fr_auto] items-end rounded-[24px] bg-[#171817] p-7 text-white sm:p-9">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Smart signal</p>
                <p className="mt-5 max-w-[290px] text-xl font-medium leading-snug tracking-[-0.025em]">Technology exposure moved above your target range.</p>
                <button className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#a9e58c]">
                  Review insight <ChevronRight size={14} />
                </button>
              </div>
              <Sparkles className="mb-1 text-[#a9e58c]" size={25} strokeWidth={1.5} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

const markets = [
  ["S&P 500", "5,623.91", "+0.84%", true],
  ["NASDAQ", "18,028.76", "+1.12%", true],
  ["FTSE 100", "8,241.62", "−0.18%", false],
  ["NIKKEI 225", "39,667.07", "+0.56%", true],
] as const;

function MarketsSection() {
  return (
    <section id="markets" className="relative overflow-hidden bg-[#0a0b0b] px-5 py-28 text-white sm:px-10 md:py-40">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="relative mx-auto max-w-[1440px]">
        <Reveal className="text-center">
          <div className="flex justify-center"><Kicker light>Markets without borders</Kicker></div>
          <div className="flex justify-center">
            <SectionTitle light>
              The world moves. <span className="text-white/25">Stay in sync.</span>
            </SectionTitle>
          </div>
          <p className="mx-auto mt-7 max-w-[580px] text-base font-medium leading-relaxed text-white/40 md:text-lg">
            Explore the instruments Deriv makes available to your account, review
            recent price movement, and request current contract terms.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto mt-16 max-w-[1100px] md:mt-24">
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[520px] sm:w-[520px]" />
          <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07] sm:h-[360px] sm:w-[360px]" />
          <div className="relative grid min-h-[520px] place-items-center sm:min-h-[650px]">
            <div className="relative grid h-[220px] w-[220px] place-items-center rounded-full border border-white/10 bg-white/[0.035] shadow-[0_0_120px_rgba(150,220,120,0.12)] sm:h-[300px] sm:w-[300px]">
              <Globe2 size={92} strokeWidth={0.65} className="text-white/55 sm:h-[128px] sm:w-[128px]" />
              <span className="absolute left-3 top-12 h-2 w-2 rounded-full bg-[#a9e58c] shadow-[0_0_16px_#a9e58c]" />
              <span className="absolute bottom-14 right-5 h-2 w-2 rounded-full bg-[#a9e58c] shadow-[0_0_16px_#a9e58c]" />
            </div>

            <div className="absolute inset-x-0 top-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {markets.map(([name, price, change, positive]) => (
                <div key={name} className="rounded-[14px] border border-white/10 bg-[#111313]/90 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-white/35">{name}</p>
                  <p className="mt-2 text-sm font-medium text-white/85">{price}</p>
                  <p className={`mt-1 text-[11px] font-semibold ${positive ? "text-[#9ce879]" : "text-[#e49c91]"}`}>{change}</p>
                </div>
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-0 grid gap-3 sm:grid-cols-3">
              {[
                ["Market source", "Deriv API"],
                ["Price requests", "Live"],
                ["Availability", "Account based"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-t border-white/15 py-4 sm:block sm:text-center">
                  <p className="text-xs text-white/30">{label}</p>
                  <p className="mt-1 text-sm font-medium text-white/80">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const securityItems = [
  { icon: LockKeyhole, title: "Encrypted OAuth tokens", copy: "Connected Deriv tokens are protected with AES-256-GCM encryption before database storage." },
  { icon: Fingerprint, title: "Auth0 platform identity", copy: "Platform sessions stay separate from the Deriv account-linking flow." },
  { icon: ShieldCheck, title: "Explicit execution", copy: "A contract is bought only after you review a live proposal and confirm the maximum price." },
  { icon: BadgeCheck, title: "Auditable actions", copy: "Proposal, buy, and sell attempts are recorded for operational traceability." },
];

function SecuritySection() {
  return (
    <section id="security" className="bg-[#e8e8e3] px-5 py-28 sm:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[0.86fr_1.14fr] lg:gap-24">
        <Reveal>
          <div className="lg:sticky lg:top-32">
            <Kicker>Security is the foundation</Kicker>
            <SectionTitle>
              Your account stays <span className="text-black/20">yours.</span>
            </SectionTitle>
            <p className="mt-7 max-w-[460px] text-base font-medium leading-relaxed text-black/40 md:text-lg">
              Synex connects through Deriv OAuth and keeps platform identity, account
              tokens, execution, and future payment operations clearly separated.
            </p>
            <a href="#get-started" className="group mt-9 inline-flex items-center gap-3 text-sm font-semibold text-black">
              Our security standard
              <span className="grid h-9 w-9 place-items-center rounded-full border border-black/15 transition-colors group-hover:bg-black group-hover:text-white">
                <ArrowUpRight size={15} />
              </span>
            </a>
          </div>
        </Reveal>

        <div className="border-t border-black/10">
          {securityItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.05} className="grid gap-5 border-b border-black/10 py-8 sm:grid-cols-[64px_1fr_1fr] sm:items-start sm:py-10">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#d9ded4]">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
                <h3 className="text-xl font-medium tracking-[-0.025em] sm:pt-2">{item.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-black/40 sm:pt-2 md:text-base">{item.copy}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section id="about" className="bg-[#f2f2f0] px-5 py-28 sm:px-10 md:py-44">
      <Reveal className="mx-auto max-w-[1100px] text-center">
        <CircleDollarSign size={30} strokeWidth={1.2} className="mx-auto mb-10 text-black/25" />
        <blockquote className="text-[34px] font-medium leading-[1.08] tracking-[-0.04em] text-black/25 sm:text-[48px] md:text-[62px]">
          “Price discovery, execution, and position monitoring should feel like one coherent flow. <span className="text-[#0a0a0d]">That is what Synex is built to deliver.</span>”
        </blockquote>
        <div className="mt-10">
          <p className="text-sm font-semibold text-black/75">The Synex principle</p>
          <p className="mt-1 text-xs font-medium text-black/30">Clarity before execution</p>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="get-started" className="relative min-h-[720px] overflow-hidden bg-[#0a0b0b] px-5 py-28 text-white sm:px-10 md:grid md:min-h-[820px] md:place-items-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#799a69]/20 blur-[150px]" />
      <img
        src={`${ASSET_ROOT}/stone-g-left.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-28 h-[360px] w-auto max-w-none opacity-65 sm:h-[500px] lg:h-[650px]"
      />
      <img
        src={`${ASSET_ROOT}/stone-g-right.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-36 h-[360px] w-auto max-w-none opacity-65 sm:h-[500px] lg:h-[650px]"
      />
      <Reveal className="relative z-10 mx-auto max-w-[900px] text-center">
        <div className="mb-7 flex justify-center"><Kicker light>Your markets, in focus</Kicker></div>
        <h2 className="text-[44px] font-medium leading-[0.96] tracking-[-0.05em] sm:text-[64px] md:text-[86px] lg:text-[100px]">
          See everything.<br /><span className="text-white/25">Move with clarity.</span>
        </h2>
        <p className="mx-auto mt-7 max-w-[510px] text-base font-medium leading-relaxed text-white/40 md:text-lg">
          Connect a Deriv virtual or real account and move through a calmer, more
          deliberate trading workflow.
        </p>
        <Link to="/login" className="group mx-auto mt-10 inline-flex items-center gap-4 rounded-full bg-white py-3 pl-3 pr-6 text-sm font-semibold text-black transition-transform hover:scale-[1.02]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-white">
            <ArrowUpRight size={15} />
          </span>
          Launch Synex
        </Link>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a0b0b] px-5 pb-8 pt-16 text-white sm:px-10 md:pt-24">
      <div className="mx-auto max-w-[1440px] border-t border-white/10 pt-12">
        <div className="grid gap-14 md:grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr]">
          <div>
            <img src={`${ASSET_ROOT}/logo.svg`} alt="Synex" className="h-8 w-auto invert" />
            <p className="mt-5 max-w-[330px] text-sm font-medium leading-relaxed text-white/35">
              A focused trading experience powered by Deriv market data and execution.
            </p>
          </div>
          {[
            ["Platform", ["Overview", "Markets", "Trade", "Portfolio"]],
            ["Company", ["About", "Journal", "Careers", "Contact"]],
            ["Legal", ["Security", "Privacy", "Terms", "Disclosures"]],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/30">{heading}</p>
              <div className="mt-5 flex flex-col gap-3">
                {(links as string[]).map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="w-fit text-sm font-medium text-white/65 transition-colors hover:text-white">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-7 text-xs font-medium text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Synex Technologies. Trading involves risk.</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9ce879]" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingSections() {
  return (
    <>
      <IntroSection />
      <AssetsSection />
      <CapabilitiesSection />
      <AnalyticsSection />
      <MarketsSection />
      <SecuritySection />
      <TestimonialSection />
      <FinalCta />
      <Footer />
    </>
  );
}
