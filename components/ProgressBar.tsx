type ProgressBarProps = {
  value: number;
  label?: string;
};

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label ? <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div> : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 via-blue-300 to-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition-all"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
