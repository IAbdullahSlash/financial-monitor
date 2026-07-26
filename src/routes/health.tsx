import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionLabel, Marker, SketchCard, StatusChip, StatTile } from "@/components/fintwin/ui";
import { computeHealthScore, healthBreakdown } from "@/lib/fintwin-data";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Money Health Score — Fin Twin" },
      { name: "description", content: "A weighted, honest score of how your money life is doing — and what to fix first." },
      { property: "og:title", content: "Money Health Score" },
      { property: "og:description", content: "See exactly what's dragging your financial health down." },
    ],
  }),
  component: Health,
});

const toneIcon = {
  good: { icon: CheckCircle2, chip: "good" as const },
  warn: { icon: AlertTriangle, chip: "warn" as const },
  risk: { icon: XCircle, chip: "risk" as const },
};

function Health() {
  const score = computeHealthScore();
  const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  return (
    <PageShell>
      <SectionLabel>Money Health</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl">Your score, <Marker>graded honestly</Marker>.</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] mt-8 items-start">
        <SketchCard className="text-center bg-marker" hoverable={false}>
          <SectionLabel>Overall score</SectionLabel>
          <div className="font-headline text-[9rem] leading-none">{score}</div>
          <div className="hand text-xl">Grade {grade} — room to grow</div>
          <div className="mt-4 flex justify-center"><StatusChip tone="info">Weighted across 6 pillars</StatusChip></div>
        </SketchCard>

        <div className="grid gap-3">
          {healthBreakdown.map((b) => {
            const T = toneIcon[b.tone];
            return (
              <SketchCard key={b.label} className="p-4" hoverable={false}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <T.icon className="h-4 w-4" />
                    <span className="font-semibold">{b.label}</span>
                    <span className="mini-label">weight {b.weight}%</span>
                  </div>
                  <StatusChip tone={T.chip}>{b.score}/100</StatusChip>
                </div>
                <div className="mt-2 h-2 rounded-full border-2 border-ink overflow-hidden bg-card">
                  <div className="h-full bg-ink" style={{ width: `${b.score}%` }} />
                </div>
              </SketchCard>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-10">
        <StatTile tone="butter" label="Fix first" value="Insurance" hint="you have almost none" />
        <StatTile tone="mint" label="Doing well" value="Savings" hint="+18% YoY" />
        <StatTile tone="sky" label="Watch" value="Debts" hint="EMI is 24% of income" />
      </div>

      <SketchCard className="mt-8" hoverable={false}>
        <SectionLabel>Top 3 recommendations</SectionLabel>
        <ol className="space-y-3 mt-3">
          <Rec title="Buy term insurance (₹1Cr cover)" body="Roughly ₹900/month at your age. Biggest score jump." />
          <Rec title="Move ₹1L to a liquid fund for emergency" body="Get your cushion to 4+ months of expenses." />
          <Rec title="Pause the ₹8k gadget SIP for 6 months" body="Redirect it into your home down-payment goal." />
        </ol>
      </SketchCard>
    </PageShell>
  );
}

function Rec({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="chip bg-mint mt-1">Do</span>
      <div>
        <div className="font-headline text-lg">{title}</div>
        <p className="hand text-base text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}
