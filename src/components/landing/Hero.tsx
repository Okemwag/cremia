import { motion } from "framer-motion";
import Navbar from "./Navbar";
import StoneReveal from "./StoneReveal";

const ASSET_ROOT = "https://qclay.design/lovable/synex";

const blurUp = (delay: number, duration: number, y: number, blur: number) => ({
  initial: { opacity: 0, y, filter: `blur(${blur}px)` },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration, delay, ease: "easeOut" as const },
});

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
          <img
            src={`${ASSET_ROOT}/Dashboard.png`}
            alt="Synex online trading dashboard"
            className="h-auto w-full rounded-t-xl object-contain shadow-[0_-8px_80px_rgba(0,0,0,0.12),0_40px_120px_rgba(0,0,0,0.10)]"
          />
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
