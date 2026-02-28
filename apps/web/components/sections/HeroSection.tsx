import RequestDemoBtn from "@/components/RequestDemoBtn";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-16"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundColor: "var(--background)",
      }}
    >
      <div
        className="absolute inset-0 bg-foreground/60"
        aria-hidden
      />
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground drop-shadow-lg md:text-5xl">
            Automate the busywork. Scale what matters.
          </h1>
          <p className="text-lg text-primary-foreground/90 drop-shadow-md md:text-xl">
            Columbus AI Automation Solutions LLC helps businesses streamline
            workflows, reduce manual tasks, and improve response times with
            reliable automation.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <RequestDemoBtn />
            <Button variant="secondary" asChild>
              <a
                href="#workflows"
                className="bg-primary-foreground/90 text-foreground hover:bg-primary-foreground"
              >
                See Example Workflows
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
