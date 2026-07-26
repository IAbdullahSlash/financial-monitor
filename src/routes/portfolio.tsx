import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionLabel, Marker, SketchCard, StatusChip, StatTile } from "@/components/fintwin/ui";
import { NetWorthPie } from "@/components/fintwin/charts";
import { inr, netWorth } from "@/lib/fintwin-data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio & Net Worth — Fin Twin" },
      { name: "description", content: "A simple, honest snapshot of everything you own — bank, funds, stocks, EPF, gold." },
      { property: "og:title", content: "Portfolio Snapshot" },
      { property: "og:description", content: "Your net worth, drawn in pencil." },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const total = netWorth.reduce((a, b) => a + b.value, 0);
  return (
    <PageShell>
      <SectionLabel>Portfolio X-Ray</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl">Everything you own, <Marker>on one page</Marker>.</h1>

      <div className="grid gap-5 md:grid-cols-4 mt-8">
        <StatTile tone="mint" label="Net worth" value={inr(total)} hint="+₹36k / month" />
        <StatTile tone="sky" label="Liquid" value={inr(420000)} hint="cash + liquid funds" />
        <StatTile tone="butter" label="Long-term" value={inr(690000)} hint="MFs + EPF + PPF" />
        <StatTile tone="coral" label="Risky" value={inr(220000)} hint="direct stocks" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] mt-6">
        <SketchCard hoverable={false}>
          <SectionLabel>Allocation</SectionLabel>
          <NetWorthPie />
        </SketchCard>

        <SketchCard hoverable={false}>
          <SectionLabel>Holdings</SectionLabel>
          <div className="mt-3 divide-y divide-ink/20">
            {netWorth.map((h) => (
              <div key={h.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded border-2 border-ink" style={{ background: h.color }} />
                  <div>
                    <div className="font-semibold">{h.name}</div>
                    <div className="mini-label">{Math.round((h.value / total) * 100)}% of net worth</div>
                  </div>
                </div>
                <div className="font-headline text-lg">{inr(h.value)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4"><StatusChip tone="info">Add asset (soon)</StatusChip></div>
        </SketchCard>
      </div>
    </PageShell>
  );
}
