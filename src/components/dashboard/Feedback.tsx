import type { ReactNode } from "react";

type FeedbackProps = {
  children: ReactNode;
  tone?: "error" | "info" | "success";
};

const toneClass = {
  error: "border-red-900/10 bg-red-50 text-red-800",
  info: "border-black/[0.08] bg-white/55 text-black/55",
  success: "border-green-900/10 bg-green-50 text-green-800",
};

export default function Feedback({ children, tone = "error" }: FeedbackProps) {
  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneClass[tone]}`}>{children}</div>;
}
