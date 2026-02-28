// Copied from /columbus-ai:components/Header.tsx (Phase 0 UI shell only)

import { Container } from "@/components/layout/Container";
import RequestDemoBtn from "./RequestDemoBtn";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background py-3">
      <Container variant="header">
        <Logo />
        <div className="shrink-0">
          <RequestDemoBtn />
        </div>
      </Container>
    </header>
  );
}
