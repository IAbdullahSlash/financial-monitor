import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SketchCard, SectionLabel, Marker, StatTile, StatusChip } from "@/components/fintwin/ui";
import { SimulatorCard } from "@/components/fintwin/SimulatorCard";
import { CashflowChart, GoalTimelineChart, NetWorthPie } from "@/components/fintwin/charts";
import { computeHealthScore, goals, inr, profile } from "@/lib/fintwin-data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Fin Twin" },
      { name: "description", content: "Your complete money snapshot: cash flow, goals, net worth, and health score in one editorial view." },
      { property: "og:title", content: "Your Fin Twin dashboard" },
      { property: "og:description", content: "Cash flow, goals, net worth and health — all in one place." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const score = computeHealthScore();
  return (
    <PageShell>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <SectionLabel>Dashboard · {profile.city}</SectionLabel>
          <h1 className="font-headline text-4xl md:text-5xl">Hey {profile.name}, <Marker>here's the truth</Marker>.</h1>
          <p className="hand text-lg mt-1 text-muted-foreground">A snapshot of your money life — no filters, no fluff.</p>
        </div>
        <StatusChip tone="good">Updated just now</StatusChip>
      </div>

      <div className="grid gap-5 md:grid-cols-4 mt-8">
        <StatTile tone="mint" label="Health Score" value={score} hint="out of 100" />
        <StatTile tone="sky" label="Net Worth" value={inr(1420000)} hint="+₹36k this month" />
        <StatTile tone="butter" label="Monthly Surplus" value={inr(profile.income - profile.expenses)} hint="income − expenses" />
        <StatTile tone="coral" label="Debts" value={inr(profile.debts)} hint="2 active loans" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 mt-6">
        <SketchCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>Cash flow — last 6 months</SectionLabel>
              <h3 className="font-headline text-2xl">You're saving <Marker>₹67k/mo</Marker> on average.</h3>
            </div>
            <StatusChip tone="info">Manual entry</StatusChip>
          </div>
          <div className="mt-4"><CashflowChart /></div>
        </SketchCard>

        <SketchCard>
          <SectionLabel>Net worth mix</SectionLabel>
          <h3 className="font-headline text-2xl">Well diversified.</h3>
          <NetWorthPie />
          <Link to="/portfolio" className="sketch-btn-ghost text-sm mt-2">See portfolio</Link>
        </SketchCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <SimulatorCard compact />
        </div>
        <SketchCard>
          <SectionLabel>Goal progress</SectionLabel>
          <h3 className="font-headline text-2xl">4 goals in motion.</h3>
          <GoalTimelineChart />
          <div className="mt-3 space-y-2">
            {goals.slice(0, 3).map((g) => (
              <div key={g.id} className="flex items-center justify-between text-sm">
                <span>{g.emoji} {g.name}</span>
                <span className="mini-label">{Math.round((g.saved / g.target) * 100)}%</span>
              </div>
            ))}
          </div>
        </SketchCard>
      </div>
    </PageShell>
  );
}
