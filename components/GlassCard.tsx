import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
};

export default function GlassCard({ children, className = "", as: Tag = "section" }: GlassCardProps) {
  return (
    <Tag
      className={`rounded-[1.65rem] border border-white/10 bg-white/[0.065] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl ${className}`}
    >
      {children}
    </Tag>
  );
}
