type BrandSignatureProps = {
  className?: string;
};

export default function BrandSignature({ className = "" }: BrandSignatureProps) {
  return (
    <p className={`text-[0.62rem] font-bold uppercase tracking-[0.34em] text-violet-100/55 ${className}`}>
      by FRIZZ
    </p>
  );
}
