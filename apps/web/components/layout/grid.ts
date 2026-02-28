import { cn } from "@/lib/utils";

/**
 * Standard grid layout class strings. Use with cn(GRID_CLASS.variant, className)
 * to preserve DOM structure (e.g. <div className={cn(GRID_CLASS.footer)}>).
 */
export const GRID_CLASS = {
  footer: "grid gap-8 sm:grid-cols-2 lg:grid-cols-4",
  form: "grid gap-4 sm:grid-cols-2",
  twoCol: "grid gap-10 lg:grid-cols-2 lg:gap-12",
  list: "grid gap-4",
  features: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  twoColRows: "grid gap-4 md:grid-cols-2 md:grid-rows-[1fr_1fr]",
} as const;

export type GridVariant = keyof typeof GRID_CLASS;

export function getGridClass(
  variant: GridVariant,
  className?: string
): string {
  return cn(GRID_CLASS[variant], className);
}
