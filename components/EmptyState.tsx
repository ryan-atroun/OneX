import type { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

export default function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <GlassCard className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.08] text-slate-400">
        <Icon size={24} />
      </div>
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-64 text-sm leading-6 text-slate-400">{text}</p>
    </GlassCard>
  );
}
