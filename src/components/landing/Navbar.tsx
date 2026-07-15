import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  ["PLATFORM", "dashboard"],
  ["MARKETS", "markets"],
  ["SECURITY", "security"],
  ["ABOUT", "about"],
];

export default function Navbar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center bg-[#f2f2f0]/85 px-5 py-4 backdrop-blur-xl sm:px-10"
    >
      <a href="#" className="justify-self-start" aria-label="Synex home">
        <img
          src="https://qclay.design/lovable/synex/logo.svg"
          alt="Synex"
          className="h-7 w-auto"
        />
      </a>

      <div className="hidden items-center justify-self-center lg:flex">
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

      <div className="flex items-center gap-3 justify-self-end sm:gap-4">
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
      </div>
    </nav>
  );
}
