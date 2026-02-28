// Copied from /columbus-ai:components/Header.tsx (Phase 0 UI shell only)

import RequestDemoBtn from "./RequestDemoBtn";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background py-3">
      <div className="mx-auto flex w-4/5 max-w-6xl items-center justify-between gap-3">
        <Logo />
        <div className="shrink-0">
          <RequestDemoBtn />
        </div>
      </div>
    </header>
  );
}
