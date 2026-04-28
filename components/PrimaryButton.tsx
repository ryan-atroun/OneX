import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants = {
  primary:
    "bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-200 text-black shadow-[0_18px_45px_rgba(34,211,238,0.22)]",
  secondary: "border border-white/12 bg-white/10 text-white",
  danger: "border border-rose-400/40 bg-rose-500/12 text-rose-100",
  ghost: "border border-transparent bg-transparent text-slate-300"
};

export default function PrimaryButton({ children, className = "", variant = "primary", ...props }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
