// Copied from /columbus-ai:components/Logo.tsx (Phase 0 UI shell only)

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex min-w-0 shrink items-center gap-2 text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
    >
      <span className="truncate text-sm font-bold sm:text-base">
        {SITE_NAME}
      </span>
    </Link>
  );
}
