import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, FlaskConical, Lock, XCircle } from "lucide-react";
import {
  Loading,
  Marker,
  PageHeading,
  PageShell,
  SectionLabel,
  StatTile,
  ToneBadge,
} from "@/components/fintwin/ui";
import { type Tone } from "@/components/fintwin/tones";
import { NetWorthChart } from "@/components/fintwin/twin-charts";
import { moments, type Moment } from "@/components/fintwin/moments";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoans, useTwin } from "@/hooks/use-store";
import { project, type Twin } from "@/lib/twin";
import { loanStatus, type Loan } from "@/lib/loans";
import { inr, monthYear } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fin Twin — Test money decisions on your twin first" },
      {
        name: "description",
        content:
          "Build a simple financial twin from a few numbers, see where your money is heading, and try decisions on it before you make them for real.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { twin, loading } = useTwin();
  const { loans, loading: loansLoading } = useLoans();
  if (loading || loansLoading) return <Loading>Waking up your twin…</Loading>;
  return <PageShell>{twin ? <Future twin={twin} loans={loans} /> : <Landing />}</PageShell>;
}

const steps = [
  { tone: "good", text: "Tell it your pay, spending, savings, loans and goals" },
  { tone: "info", text: "See your future: net worth, goals, debt-free date" },
  { tone: "warn", text: "Ask “what if…?” and compare the two futures" },
] as const;

function Landing() {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="font-display text-5xl leading-tight md:text-6xl">
          Try money decisions on your <Marker>twin</Marker> first.
        </h1>
        <p className="mt-5 max-w-xl text-xl text-foreground/80">
          Give it a few numbers. It shows where your money is heading over the next 10 years — and
          what a car, a loan, a job switch or a break would do to that future.
        </p>
        <Link to="/setup" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          Build my twin — 2 minutes <ArrowRight />
        </Link>
        <p className="mt-6 flex max-w-md items-start gap-2 text-sm text-foreground/70">
          <Lock className="mt-0.5 size-4 shrink-0" />
          No bank connection, no sign-up. Your numbers stay on this device unless you create an
          account.
        </p>
      </div>
      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle className="text-xl">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-4">
            {steps.map((s, i) => (
              <li key={s.text} className="flex items-center gap-3">
                <ToneBadge tone={s.tone} className="size-7 justify-center text-sm">
                  {i + 1}
                </ToneBadge>
                {s.text}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}

const toneIcon = { good: CheckCircle2, warn: AlertTriangle, risk: XCircle };
const toneOf: Record<Moment["tone"], Tone> = { good: "good", warn: "warn", risk: "bad" };

function Future({ twin, loans }: { twin: Twin; loans: Loan[] }) {
  const p = useMemo(() => project(twin, loans), [twin, loans]);
  const list = useMemo(() => moments(p), [p]);
  // Next month is a typical month; this one may already have had its EMIs paid.
  const typical = p.points[1];
  const debtToday = loans.reduce((sum, l) => sum + loanStatus(l).outstanding, 0);
  const netWorthToday = twin.savings + twin.investments - debtToday;
  const in5 = p.points[59];
  const in10 = p.points[119];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading eyebrow="Your future" description="If nothing changes. Want to test a change?">
          In 10 years your twin is worth <Marker>{inr(in10.netWorth)}</Marker>.
        </PageHeading>
        <div className="flex gap-3">
          <Link to="/setup" className={buttonVariants({ variant: "neutral" })}>
            Edit my twin
          </Link>
          <Link to="/what-if" className={buttonVariants()}>
            <FlaskConical /> Try a what-if
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatTile
          tone={typical.free >= 0 ? "good" : "bad"}
          label="Left each month"
          value={inr(typical.free)}
          hint="after spending, EMIs & investing"
        />
        <StatTile
          tone="info"
          label="Net worth today"
          value={inr(netWorthToday)}
          hint="what you own − what you owe"
        />
        <StatTile
          tone="warn"
          label="In 5 years"
          value={inr(in5.netWorth)}
          hint={monthYear(in5.date)}
        />
        <StatTile
          tone="neutral"
          label="In 10 years"
          value={inr(in10.netWorth)}
          hint={monthYear(in10.date)}
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Net worth, next 10 years</CardTitle>
            <CardDescription>
              Assumes {twin.assumptions.raisePct}% pay rise, {twin.assumptions.inflationPct}% rise
              in spending and {twin.assumptions.returnPct}% investment return a year, and that
              anything left over is saved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NetWorthChart base={p.points} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What your twin sees coming</CardTitle>
          </CardHeader>
          <CardContent>
            {list.length ? (
              <ol className="grid gap-4">
                {list.slice(0, 7).map((m, i) => {
                  const Icon = toneIcon[m.tone];
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <ToneBadge tone={toneOf[m.tone]} className="shrink-0">
                        <Icon /> {monthYear(m.date)}
                      </ToneBadge>
                      <span className="text-sm">{m.text}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-foreground/70">
                Nothing dramatic ahead. Add a goal or a loan on{" "}
                <Link to="/setup" className="font-heading underline underline-offset-4">
                  your twin
                </Link>{" "}
                to see more.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <SectionLabel className="mt-8 normal-case tracking-normal">
        A projection from your own numbers and assumptions — not financial advice.
      </SectionLabel>
    </>
  );
}
