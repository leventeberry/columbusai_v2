import type { ReactNode } from "react";

const MAX_WIDTH_CLASS: Record<MaxWidth, string> = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "3xl": "max-w-3xl",
  "2xl": "max-w-2xl",
  xl: "max-w-xl",
};

export type MaxWidth = "5xl" | "6xl" | "3xl" | "2xl" | "xl";

type ContainerProps = {
  children: ReactNode;
  maxWidth?: MaxWidth;
  variant?: "default" | "footer" | "header";
  className?: string;
};

export function Container({
  children,
  maxWidth = "5xl",
  variant = "default",
  className,
}: ContainerProps) {
  let combined: string;
  if (variant === "footer") {
    combined = "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8";
  } else if (variant === "header") {
    combined =
      "mx-auto flex w-4/5 max-w-6xl items-center justify-between gap-3";
  } else {
    combined = `mx-auto ${MAX_WIDTH_CLASS[maxWidth]}`;
  }
  return (
    <div className={className ? `${combined} ${className}`.trim() : combined}>
      {children}
    </div>
  );
}
