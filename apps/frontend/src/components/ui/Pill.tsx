import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

/** Monochrome filter/tag chip. Active state carries the single indigo accent. */
export function Pill({
  children,
  active = false,
  onClick,
  type = "button",
  className = "",
}: PillProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-5 py-2 font-sans text-sm font-medium transition-colors duration-300 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default Pill;
