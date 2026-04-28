import BrandSignature from "./BrandSignature";

type OneXLogoProps = {
  size: "sm" | "md" | "lg";
  showSignature?: boolean;
  className?: string;
};

const sizes = {
  sm: {
    logo: "text-2xl",
    mark: "h-10 w-10 text-lg",
    subtitle: "text-[0.62rem]",
    gap: "gap-2"
  },
  md: {
    logo: "text-3xl",
    mark: "h-12 w-12 text-xl",
    subtitle: "text-[0.68rem]",
    gap: "gap-3"
  },
  lg: {
    logo: "text-5xl",
    mark: "h-16 w-16 text-3xl",
    subtitle: "text-xs",
    gap: "gap-4"
  }
};

export default function OneXLogo({ size, showSignature = false, className = "" }: OneXLogoProps) {
  const style = sizes[size];

  return (
    <div className={`min-w-0 ${className}`}>
      <div className={`flex min-w-0 items-center ${style.gap}`}>
        <div
          aria-hidden="true"
          className={`grid shrink-0 place-items-center rounded-[1.15rem] border border-cyan-200/20 bg-gradient-to-br from-violet-300 via-blue-300 to-cyan-200 font-black text-black shadow-[0_0_34px_rgba(34,211,238,0.22)] ${style.mark}`}
        >
          X
        </div>
        <div className="min-w-0">
          <p
            className={`${style.logo} leading-none font-black tracking-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-[0_0_18px_rgba(255,255,255,0.09)]`}
            aria-label="OneX"
          >
            One
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-violet-300 via-blue-300 to-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
              X
            </span>
          </p>
          <p className={`${style.subtitle} mt-1 font-bold uppercase tracking-[0.2em] text-cyan-100/80`}>
            Train. Track. Progress.
          </p>
        </div>
      </div>
      {showSignature ? <BrandSignature className="mt-2" /> : null}
    </div>
  );
}
