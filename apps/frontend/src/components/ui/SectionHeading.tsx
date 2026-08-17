import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface SectionHeadingProps {
  title?: ReactNode;
  lede?: ReactNode;
  eyebrow?: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
}

/** Editorial heading: serif voice, balanced measure, optional lede. */
export function SectionHeading({
  title,
  lede,
  eyebrow,
  as = "h2",
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const Title = as;
  return (
    <div
      className={`${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title ? (
        <Title className="mt-3 font-serif font-medium text-balance text-3xl text-foreground md:text-4xl">
          {title}
        </Title>
      ) : null}
      {lede ? (
        <p
          className={`mt-4 max-w-2xl text-base text-muted-foreground md:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeading;
