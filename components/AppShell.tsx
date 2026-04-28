import type { ReactNode } from "react";
import BottomNav, { type AppTab } from "./BottomNav";
import Header from "./Header";

type AppShellProps = {
  children: ReactNode;
  date: string;
  week: string;
  navItems: { id: AppTab; label: string; icon: import("lucide-react").LucideIcon }[];
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export default function AppShell({ children, date, week, navItems, activeTab, onTabChange }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050509] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-500/[0.18] blur-3xl" />
        <div className="absolute right-[-7rem] top-28 h-80 w-80 rounded-full bg-cyan-400/[0.12] blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28">
        <Header date={date} week={week} />
        <div className="flex-1">{children}</div>
      </div>
      <BottomNav items={navItems} activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}
