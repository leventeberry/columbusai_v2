import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  as?: "section" | "article";
  id?: string;
  ariaLabelledby?: string;
  className?: string;
};

export function Section({
  children,
  as: Tag = "section",
  id,
  ariaLabelledby,
  className,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      className={className}
    >
      {children}
    </Tag>
  );
}
