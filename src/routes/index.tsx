import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SketchCard, SectionLabel, Marker, StatusChip, StatTile, DashedCard } from "@/components/fintwin/ui";
import { SimulatorCard } from "@/components/fintwin/SimulatorCard";
import { decisionExamples, inr, profile, computeHealthScore } from "@/lib/fintwin-data";
import { ArrowRight, Compass, LineChart, PiggyBank, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fin Twin" },
      { name: "description", content: "Before you buy, borrow or quit — run it through your Fin Twin. Simulate any financial decision in seconds." },
      { property: "og:title", content: "Fin Twin" },
      { property: "og:description", content: "Try 'Buy an iPhone', 'Move to Bengaluru', 'Quit my job'. See if your future self approves." },
    ],
  }),
  component: Home,
});

function Home() {
  const score = computeHealthScore();
  return (
    <PageShell>
      <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr] items-start">
        <div className="animate-fade-in">
          <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            What <Marker>financial decision</Marker> are you thinking about today?
          </h1>
          <p className="hand text-xl md:text-2xl mt-5 text-foreground/80 max-w-xl">
            Type it, tap it, or just pick one below — your Fin Twin will tell you if future-you is smiling or crying.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {decisionExamples.map((d) => (
              <button key={d} className="sketch-btn-ghost text-sm">
                {d}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
<Link to="/register" className="sketch-btn">
              See my dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/profile" className="sketch-btn-ghost">
              Set up my profile
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatTile tone="mint" label="Money Health" value={score} hint="out of 100" />
            <StatTile tone="sky" label="Monthly Surplus" value={inr(profile.income - profile.expenses)} hint="income − expenses" />
            <StatTile tone="butter" label="Emergency Cushion" value={`${(profile.emergencyFund / profile.expenses).toFixed(1)}mo`} hint="target: 6 months" />
          </div>
        </div>

        <div className="animate-scale-in">
          <SimulatorCard />
          <DashedCard className="mt-6">
            <SectionLabel>How it works</SectionLabel>
            <ol className="space-y-2 text-sm mt-2">
              <li className="flex gap-2"><span className="chip bg-mint">1</span> Add a decision or pick a template</li>
              <li className="flex gap-2"><span className="chip bg-sky">2</span> We simulate against your real cash flow</li>
              <li className="flex gap-2"><span className="chip bg-butter">3</span> Get a verdict — safe, risky, or nope</li>
            </ol>
          </DashedCard>
        </div>
      </section>

      <section className="mt-20">
        <SectionLabel>What Fin Twin can do</SectionLabel>
        <h2 className="font-headline text-3xl md:text-4xl">Everything your money brain forgets — <Marker>in one place</Marker>.</h2>
        <div className="grid gap-5 md:grid-cols-3 mt-6">
          <FeatureCard to="/dashboard" icon={<LineChart className="h-5 w-5" />} title="Cash flow snapshot" body="Six months of income, expenses and what's actually left." tone="bg-sky" />
          <FeatureCard to="/goals" icon={<PiggyBank className="h-5 w-5" />} title="Goal planner" body="Track goals, see projected timelines, and shift priorities." tone="bg-mint" />
          <FeatureCard to="/health" icon={<Compass className="h-5 w-5" />} title="Money health score" body="A weighted score you can actually understand and improve." tone="bg-butter" />
          <FeatureCard to="/tax" icon={<Sparkles className="h-5 w-5" />} title="Tax regime quick check" body="Old vs New in 30 seconds — no CA required." tone="bg-card" />
          <FeatureCard to="/life" icon={<Sparkles className="h-5 w-5" />} title="Life event simulator" body="Wedding, kid, sabbatical, MBA — can you actually afford it?" tone="bg-card" />
          <FeatureCard to="/portfolio" icon={<Sparkles className="h-5 w-5" />} title="Net worth snapshot" body="A simple, honest view of everything you own." tone="bg-card" />
        </div>
      </section>

      <section className="mt-20">
        <SketchCard className="bg-marker" hoverable={false}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div>
              <SectionLabel>Zero bank connections needed</SectionLabel>
              <h3 className="font-headline text-2xl md:text-3xl">Start with what you know. Add data as you go.</h3>
              <p className="hand text-lg mt-2">No screen-scraping. No OAuth loops. Just you and your Fin Twin.</p>
            </div>
            <Link to="/profile" className="sketch-btn">Build my profile <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </SketchCard>
      </section>
    </PageShell>
  );
}

function FeatureCard({ to, icon, title, body, tone }: any) {
  return (
    <Link to={to} className={`sketch-card sketch-card-hover p-5 block ${tone}`}>
      <div className="flex items-center gap-2">
        <div className="rounded-lg border-2 border-ink bg-card p-2">{icon}</div>
        <StatusChip>Module</StatusChip>
      </div>
      <div className="font-headline text-xl mt-3">{title}</div>
      <p className="text-sm mt-1 opacity-80">{body}</p>
      <div className="hand text-sm mt-3 flex items-center gap-1">Open <ArrowRight className="h-3.5 w-3.5" /></div>
    </Link>
  );
}
