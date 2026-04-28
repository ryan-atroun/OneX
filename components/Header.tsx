import { CalendarDays } from "lucide-react";
import OneXLogo from "./OneXLogo";

export default function Header({ date, week }: { date: string; week: string }) {
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-4 border-b border-white/5 bg-[#050509]/[0.78] px-4 pb-4 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div>
          <OneXLogo size="sm" />
          <p className="mt-3 text-sm capitalize text-slate-400">{date}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-right shadow-glow">
          <CalendarDays className="ml-auto mb-1 text-cyan-200" size={16} />
          <p className="text-xs font-bold text-slate-200">{week}</p>
        </div>
      </div>
    </header>
  );
}
