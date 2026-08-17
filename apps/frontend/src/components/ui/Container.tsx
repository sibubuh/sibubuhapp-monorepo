import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Editorial content width: centered, resilient, consistent gutters. */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

export default Container;
