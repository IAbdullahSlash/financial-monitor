import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionLabel, Marker } from "@/components/fintwin/ui";
import { SimulatorCard } from "@/components/fintwin/SimulatorCard";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Decision Simulator — Fin Twin" },
      { name: "description", content: "Simulate any money decision — buy, borrow, quit, move — before you commit." },
      { property: "og:title", content: "Decision Simulator" },
      { property: "og:description", content: "Safe, risky, or nope — get a verdict in seconds." },
    ],
  }),
  component: Simulator,
});

function Simulator() {
  return (
    <PageShell>
      <SectionLabel>Simulator</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl">Play the tape <Marker>forward</Marker>.</h1>
      <p className="hand text-lg mt-2 text-muted-foreground max-w-2xl">
        Type a decision. We run it against your income, expenses, cushion, and goals — then tell you the truth.
      </p>
      <div className="mt-8"><SimulatorCard /></div>
    </PageShell>
  );
}
