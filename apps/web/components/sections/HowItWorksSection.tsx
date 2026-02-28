export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-background px-4 py-12 md:py-16"
      aria-labelledby="how-title"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="how-title"
          className="mb-2 mt-6 text-2xl font-semibold text-foreground"
        >
          How it works
        </h2>
        <ol className="my-4 list-none space-y-4 pl-0">
          <li className="border-l-4 border-primary pl-4">
            <strong className="text-foreground">Discover</strong> — We map your
            current workflows and identify where automation will have the
            biggest impact.
          </li>
          <li className="border-l-4 border-primary pl-4">
            <strong className="text-foreground">Build</strong> — We design and
            implement automations using your existing tools (CRMs, email,
            scheduling, etc.).
          </li>
          <li className="border-l-4 border-primary pl-4">
            <strong className="text-foreground">Optimize</strong> — We monitor,
            tune, and extend so your systems keep working as you grow.
          </li>
        </ol>
      </div>
    </section>
  );
}
