import type { LucideIcon } from "lucide-react";

export type AppTab = "dashboard" | "program" | "session" | "tracking" | "history" | "settings";

type BottomNavProps = {
  items: { id: AppTab; label: string; icon: LucideIcon }[];
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export default function BottomNav({ items, activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/[0.82] px-2 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.64rem] font-bold transition active:scale-95 ${
                isActive
                  ? "bg-gradient-to-br from-violet-300/20 via-blue-300/[0.16] to-cyan-200/[0.18] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                  : "text-slate-500"
              }`}
              aria-label={item.label}
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
