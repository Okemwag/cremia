import { ArrowRight, BadgeCheck, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";

const steps = [
  ["Your details", "profile_complete"],
  ["Your experience", "suitability_complete"],
  ["Know the risks", "risk_acknowledged"],
  ["Connect Deriv", "deriv_connected"],
] as const;

export default function OnboardingBanner() {
  const { onboarding } = useWorkspace();
  if (!onboarding || onboarding.ready_for_live) return null;

  const done = steps.filter(([, key]) => onboarding[key]).length;

  return (
    <div className="mt-6 flex flex-col gap-5 rounded-[22px] border border-black/[0.07] bg-[#111310] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">
          {onboarding.deriv_connected
            ? "Your Deriv account is connected — practice trading is ready."
            : done === 0
              ? "Let's get you set up."
              : `Almost there — ${done} of ${steps.length} steps done.`}
        </p>
        <p className="mt-1 text-sm font-medium text-white/45">
          {onboarding.deriv_connected
            ? "Complete the remaining checks when you want to unlock real-money trading."
            : "Connect Deriv to start practice trading. The other checks are only required for real-money trading."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map(([label, key]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                onboarding[key] ? "bg-[#9de783]/15 text-[#9de783]" : "bg-white/[0.07] text-white/45"
              }`}
            >
              {onboarding[key] ? <BadgeCheck size={13} /> : <Circle size={11} />} {label}
            </span>
          ))}
        </div>
      </div>
      <Link
        to="/app/onboarding"
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
      >
        {onboarding.deriv_connected ? "Set up live trading" : "Continue setup"} <ArrowRight size={15} />
      </Link>
    </div>
  );
}
