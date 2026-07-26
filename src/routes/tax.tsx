import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, SectionLabel, Marker, SketchCard, StatusChip } from "@/components/fintwin/ui";
import { inr } from "@/lib/fintwin-data";

export const Route = createFileRoute("/tax")({
  head: () => ({
    meta: [
      { title: "Tax Regime Quick Check — Fin Twin" },
      { name: "description", content: "Old vs New tax regime in under 30 seconds. Enter your income and deductions." },
      { property: "og:title", content: "Old vs New Tax Regime" },
      { property: "og:description", content: "Which regime saves you more? Find out instantly." },
    ],
  }),
  component: Tax,
});

function newRegime(income: number) {
  let t = 0;
  const slabs = [
    [400000, 0], [400000, 0.05], [400000, 0.1], [400000, 0.15], [400000, 0.2], [Infinity, 0.3],
  ] as const;
  let remaining = Math.max(0, income - 75000);
  for (const [size, rate] of slabs) {
    const chunk = Math.min(remaining, size);
    t += chunk * rate;
    remaining -= chunk;
    if (remaining <= 0) break;
  }
  return Math.round(t);
}
function oldRegime(income: number, deductions: number) {
  const taxable = Math.max(0, income - 50000 - deductions);
  let t = 0;
  const slabs = [[250000, 0], [250000, 0.05], [500000, 0.2], [Infinity, 0.3]] as const;
  let remaining = taxable;
  for (const [size, rate] of slabs) {
    const chunk = Math.min(remaining, size);
    t += chunk * rate;
    remaining -= chunk;
    if (remaining <= 0) break;
  }
  return Math.round(t);
}

function Tax() {
  const [income, setIncome] = useState(1800000);
  const [deductions, setDeductions] = useState(200000);
  const oldT = useMemo(() => oldRegime(income, deductions), [income, deductions]);
  const newT = useMemo(() => newRegime(income), [income]);
  const winner = newT < oldT ? "new" : "old";

  return (
    <PageShell>
      <SectionLabel>Tax Wizard</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl">Old or new? <Marker>Let's do the math</Marker>.</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] mt-8">
        <SketchCard hoverable={false}>
          <SectionLabel>Your numbers</SectionLabel>
          <div className="mt-3 space-y-4">
            <div>
              <label className="mini-label">Annual income (₹)</label>
              <input type="number" className="sketch-input mt-1" value={income} onChange={(e) => setIncome(+e.target.value || 0)} />
            </div>
            <div>
              <label className="mini-label">80C + 80D + HRA + other (₹)</label>
              <input type="number" className="sketch-input mt-1" value={deductions} onChange={(e) => setDeductions(+e.target.value || 0)} />
            </div>
            <p className="hand text-sm text-muted-foreground">Rough estimate for FY 25-26. Not tax advice — but pretty close.</p>
          </div>
        </SketchCard>

        <div className="grid gap-4 md:grid-cols-2">
          <RegimeCard title="Old Regime" tax={oldT} highlight={winner === "old"} note="Rewards deductions" />
          <RegimeCard title="New Regime" tax={newT} highlight={winner === "new"} note="Lower slabs, no deductions" />
          <SketchCard className="md:col-span-2 bg-marker" hoverable={false}>
            <SectionLabel>Recommendation</SectionLabel>
            <div className="font-headline text-2xl">
              Go with the <Marker>{winner === "new" ? "New" : "Old"} regime</Marker> — save {inr(Math.abs(newT - oldT))} this year.
            </div>
          </SketchCard>
        </div>
      </div>
    </PageShell>
  );
}

function RegimeCard({ title, tax, highlight, note }: { title: string; tax: number; highlight: boolean; note: string }) {
  return (
    <SketchCard className={highlight ? "bg-mint" : ""} hoverable={false}>
      <div className="flex items-center justify-between">
        <div className="font-headline text-xl">{title}</div>
        {highlight && <StatusChip tone="good">Winner</StatusChip>}
      </div>
      <div className="font-headline text-4xl mt-2">{inr(tax)}</div>
      <div className="hand text-sm text-muted-foreground">{note}</div>
    </SketchCard>
  );
}
