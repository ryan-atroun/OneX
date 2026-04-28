import type { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
};

export default function MetricCard({ icon: Icon, label, value, unit, hint }: MetricCardProps) {
  return (
    <GlassCard className="p-3">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
        <Icon size={18} />
      </div>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black">
        {value} {unit ? <span className="text-[0.7rem] font-semibold text-slate-500">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </GlassCard>
  );
}
