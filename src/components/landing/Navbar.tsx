import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Globe, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const navItems = [
  ["PLATFORM", "dashboard"],
  ["MARKETS", "markets"],
  ["SECURITY", "security"],
  ["ABOUT", "about"],
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center bg-[#f2f2f0]/85 px-5 py-4 backdrop-blur-xl sm:px-10"
    >
      <a href="/" className="justify-self-start" aria-label="Synex home">
        <img
          src="/assets/synex/logo.svg"
          alt="Synex"
          className="h-7 w-auto"
        />
      </a>

      <div className="col-start-2 hidden items-center justify-self-center lg:flex">
        {navItems.map(([item, anchor]) => (
          <a
            key={item}
            href={`#${anchor}`}
            className="px-3.5 py-2 text-[13px] font-semibold tracking-[1.5px] text-[#111] transition-opacity duration-200 hover:opacity-55"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="col-start-3 flex items-center gap-3 justify-self-end sm:gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <Globe size={16} strokeWidth={1.8} className="text-[#111]" />
          <span className="text-[13px] font-normal text-[#111]">English</span>
        </div>

        <Link
          to="/login"
          className="flex items-center gap-2 rounded-full bg-[#111] py-2.5 pl-2.5 pr-4 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#333] sm:pr-5"
        >
          <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Log in
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full text-[#111] transition-colors hover:bg-black/[0.06] lg:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu size={21} strokeWidth={1.8} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[60] flex min-h-[100svh] flex-col bg-[#f2f2f0] px-5 py-4 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <a href="/" aria-label="Synex home" onClick={() => setMenuOpen(false)}>
                <img src="/assets/synex/logo.svg" alt="Synex" className="h-7 w-auto" />
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-[#111] transition-colors hover:bg-black/[0.06]"
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={1.8} />
              </button>
            </div>

            <div className="mt-10 flex flex-col">
              {navItems.map(([item, anchor], index) => (
                <motion.a
                  key={item}
                  href={`#${anchor}`}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 + index * 0.05, ease: "easeOut" }}
                  className="flex items-center justify-between border-b border-black/[0.08] py-5 text-[26px] font-medium tracking-[-0.03em] text-[#0a0a0d]"
                >
                  {item[0] + item.slice(1).toLowerCase()}
                  <ArrowUpRight size={20} className="text-black/30" />
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.32, ease: "easeOut" }}
              className="mt-auto pb-4"
            >
              <div className="flex items-center gap-2 text-black/45">
                <Globe size={15} strokeWidth={1.8} />
                <span className="text-[13px] font-medium">English</span>
              </div>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#111] py-4 text-sm font-semibold text-white"
              >
                Log in
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
