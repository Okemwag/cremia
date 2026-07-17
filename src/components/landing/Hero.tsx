import { motion } from "framer-motion";
import Navbar from "./Navbar";
import StoneReveal from "./StoneReveal";

const ASSET_ROOT = "/assets/synex";

const blurUp = (delay: number, duration: number, y: number, blur: number) => ({
  initial: { opacity: 0, y, filter: `blur(${blur}px)` },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration, delay, ease: "easeOut" as const },
});

const heroNav = ["Overview", "Markets", "Trade", "Portfolio", "Activity"];

const heroMetrics = [
  { label: "Available balance", value: "$10,247.82", note: "Live from Deriv" },
  { label: "Open trades", value: "3", note: "Running right now" },
  { label: "Open profit", value: "+$34.60", note: "If you closed now", positive: true },
];

function HeroDashboard() {
  return (
    <div
      role="img"
      aria-label="Preview of the Synex trading dashboard showing balance, open trades and a live market chart"
      className="flex overflow-hidden rounded-t-xl bg-[#edede8] text-left text-[#0b0c0b] shadow-[0_-8px_80px_rgba(0,0,0,0.12),0_40px_120px_rgba(0,0,0,0.10)]"
    >
      <div className="hidden w-[150px] shrink-0 flex-col border-r border-black/[0.08] bg-[#f5f5f1] px-3 py-4 sm:flex">
        <p className="px-2 text-sm font-bold tracking-[-0.06em]">SYNEX</p>
        <div className="mt-4 space-y-1">
          {heroNav.map((item, index) => (
            <p
              key={item}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
                index === 0 ? "bg-[#111310] text-white" : "text-black/45"
              }`}
            >
              {item}
            </p>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/30">Trading account</p>
            <p className="mt-0.5 text-[11px] font-semibold">VRTC 20841 · USD Practice</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/60 px-2.5 py-1 text-[10px] font-semibold text-black/45">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6ca95b]" /> Live
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {heroMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-black/[0.06] bg-[#f7f7f4] p-3">
              <p className="truncate text-[9px] font-semibold text-black/35">{metric.label}</p>
              <p className={`mt-2 truncate text-sm font-medium tracking-[-0.03em] tabular-nums sm:text-lg ${metric.positive ? "text-[#4c7c40]" : ""}`}>
                {metric.value}
              </p>
              <p className="mt-1 truncate text-[9px] font-medium text-black/30">{metric.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-black/[0.06] bg-[#f7f7f4] p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/30">Featured market</p>
              <p className="mt-0.5 text-[12px] font-semibold sm:text-sm">Volatility 75 Index</p>
            </div>
            <span className="rounded-full bg-[#e0eadb] px-2.5 py-1 text-[9px] font-semibold text-[#46683c]">5 minute</span>
          </div>
          <svg viewBox="0 0 320 84" className="mt-3 h-[72px] w-full sm:h-[92px]" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 62H320" stroke="#000" strokeOpacity="0.06" />
            <path d="M0 34H320" stroke="#000" strokeOpacity="0.06" />
            <path
              d="M0 70 C22 64,34 72,52 58 S86 62,104 46 S138 52,158 38 S194 45,214 28 S252 33,272 18 S302 14,320 8"
              fill="none"
              stroke="#4c7c40"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      aria-label="Synex online trading platform"
      className="relative min-h-screen min-h-[100svh] overflow-hidden bg-[#f2f2f0]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(220,220,215,0.6)_0%,transparent_70%)]"
      />

      <Navbar />

      <div className="relative z-10 flex flex-col items-center px-5 pt-[90px] text-center sm:pt-[110px] md:pt-[140px]">
        <motion.p
          {...blurUp(0.1, 0.6, 16, 8)}
          className="mb-3 text-xs font-medium text-black/50 sm:mb-4 sm:text-[13px] md:text-sm"
        >
          Finance Reimagined
        </motion.p>

        <div aria-hidden="true" className="font-medium leading-[1.05] tracking-[-1.36px]">
          <motion.span
            {...blurUp(0.2, 0.7, 24, 12)}
            className="block text-[34px] text-black/20 sm:text-[44px] md:text-[56px] lg:text-[68px] lg:leading-[73.088px]"
          >
            A New Standard
          </motion.span>
          <motion.span
            {...blurUp(0.32, 0.7, 24, 12)}
            className="block text-[34px] text-[#05050c] sm:text-[44px] md:text-[56px] lg:text-[68px] lg:leading-[73.088px]"
          >
            in Online Trading
          </motion.span>
        </div>

        <motion.p
          {...blurUp(0.45, 0.7, 20, 8)}
          className="mt-4 max-w-[460px] text-sm font-medium leading-relaxed text-black/20 sm:text-base md:mt-5 md:text-lg"
        >
          Watch live markets, spot your moment, and place your trade — all in
          one calm, clutter-free space. Just connect your Deriv account and go.
        </motion.p>
      </div>

      <StoneReveal
        side="left"
        baseSrc={`${ASSET_ROOT}/stone-left.png`}
        grassSrc={`${ASSET_ROOT}/stone-g-left.png`}
        zBase={1}
        zGrass={2}
      />

      <div
        id="dashboard"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex justify-center"
      >
        <motion.div
          className="w-[92vw] max-w-[944px] sm:w-[72vw] md:w-[60vw] lg:w-[54vw]"
          initial={{ opacity: 0, y: 80, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1,
            delay: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <HeroDashboard />
        </motion.div>
      </div>

      <StoneReveal
        side="right"
        baseSrc={`${ASSET_ROOT}/stone-right.png`}
        grassSrc={`${ASSET_ROOT}/stone-g-right.png`}
        zBase={4}
        zGrass={5}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[220px] bg-gradient-to-t from-[rgba(5,5,12,0.85)] from-0% via-[rgba(5,5,12,0.5)] via-40% to-transparent"
      />

      <motion.div
        className="absolute inset-x-0 bottom-2.5 z-20 mx-auto flex w-fit items-center gap-2"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 1.2 },
          y: { duration: 2.5, delay: 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <motion.img
          src={`${ASSET_ROOT}/star.svg`}
          alt=""
          aria-hidden="true"
          className="h-3.5 w-3.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-sm font-medium tracking-[-0.28px] text-white">
          Scroll to explore
        </span>
      </motion.div>
    </section>
  );
}
