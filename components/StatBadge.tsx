import type { ReactNode } from "react";

export default function StatBadge({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "violet" | "slate" | "green" }) {
  const tones = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    slate: "border-white/10 bg-white/[0.08] text-slate-300",
    green: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
  };

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
