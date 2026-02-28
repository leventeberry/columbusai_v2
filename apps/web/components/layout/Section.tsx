import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section vertical rhythm: py-12 md:py-16 for all variants. */
const SECTION_VARIANT_CLASS: Record<SectionVariant, string> = {
  default: "bg-background px-4 py-12 md:py-16",
  muted: "bg-muted px-4 py-12 md:py-16",
  bare: "px-4 py-12 md:py-16",
};

export type SectionVariant = "default" | "muted" | "bare";

type SectionProps = {
  children: ReactNode;
  as?: "section" | "article";
  id?: string;
  ariaLabelledby?: string;
  variant?: SectionVariant;
  className?: string;
};

export function Section({
  children,
  as: Tag = "section",
  id,
  ariaLabelledby,
  variant = "default",
  className,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(SECTION_VARIANT_CLASS[variant], className)}
    >
      {children}
    </Tag>
  );
}
