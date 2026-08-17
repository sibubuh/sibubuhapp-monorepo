import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Restrained section label — one indigo accent, never tracked gray microtype. */
export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium font-sans text-primary ${className}`}
    >
      <span aria-hidden className="h-px w-6 bg-primary" />
      {children}
    </span>
  );
}

export default Eyebrow;
