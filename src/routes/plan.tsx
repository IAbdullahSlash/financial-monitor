import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { PageShell, SketchCard, SectionLabel, Marker, StatusChip } from "@/components/fintwin/ui";
import { PayoffChart } from "@/components/fintwin/loan-charts";
import { useLoans } from "@/hooks/use-loans";
import { loanKinds, simulatePortfolio, type Loan, type Strategy } from "@/lib/loans";
import { duration, inr, monthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Get out faster — Fin Twin" },
      {
        name: "description",
        content: "See how extra payments and prepayments pull your debt-free date closer.",
      },
    ],
  }),
  component: Plan,
});

function Plan() {
  const { loans, loading } = useLoans();
  return (
    <PageShell>
      <SectionLabel>Get out faster</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl">
        Pull your <Marker>debt-free date</Marker> closer.
      </h1>
      {loading ? (
        <div className="hand text-lg mt-6">Loading your loans…</div>
      ) : loans.length === 0 ? (
        <SketchCard className="mt-8" hoverable={false}>
          <p className="hand text-lg">Add a loan first, then come back to plan.</p>
          <Link to="/loans/new" className="sketch-btn mt-4">
            <PlusCircle className="h-4 w-4" /> Add a loan
          </Link>
        </SketchCard>
      ) : (
        <Planner loans={loans} />
      )}
    </PageShell>
  );
}

const strategies: { key: Strategy; title: string; body: string }[] = [
  {
    key: "avalanche",
    title: "Highest interest first",
    body: "Saves the most money.",
  },
  {
    key: "snowball",
    title: "Smallest loan first",
    body: "Closes loans quickest — feels good.",
  },
];

function Planner({ loans }: { loans: Loan[] }) {
  const [extra, setExtra] = useState(5000);
  const [lump, setLump] = useState(0);
  const [strategy, setStrategy] = useState<Strategy>("avalanche");
  const [rollover, setRollover] = useState(true);

  const base = useMemo(() => simulatePortfolio(loans), [loans]);
  const results = useMemo(
    () =>
      Object.fromEntries(
        strategies.map((s) => [
          s.key,
          simulatePortfolio(loans, {
            extraMonthly: extra,
            lumpSum: lump,
            strategy: s.key,
            rollover,
          }),
        ]),
      ) as Record<Strategy, ReturnType<typeof simulatePortfolio>>,
    [loans, extra, lump, rollover],
  );
  const plan = results[strategy];
  const monthsSaved = base.months - plan.months;
  const interestSaved = base.totalInterest - plan.totalInterest;
  const openLoans = loans.filter((l) => base.endDates[l.id] || plan.endDates[l.id]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] mt-8 items-start">
      <SketchCard hoverable={false} className="lg:sticky lg:top-24">
        <SectionLabel>Your plan</SectionLabel>
        <label className="block mt-2">
          <span className="mini-label">Extra each month</span>
          <div className="font-headline text-3xl">{inr(extra)}</div>
          <input
            type="range"
            min={0}
            max={50000}
            step={1000}
            value={extra}
            onChange={(e) => setExtra(Number(e.target.value))}
            className="w-full accent-[var(--ink)]"
          />
        </label>
        <label className="block mt-4">
          <span className="mini-label">One-time payment now (bonus, FD, etc.)</span>
          <input
            type="number"
            min={0}
            step={10000}
            className="sketch-input mt-1"
            value={lump || ""}
            placeholder="0"
            onChange={(e) => setLump(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>

        {loans.length > 1 && (
          <>
            <div className="mini-label mt-5">Where should extra money go?</div>
            <div className="grid gap-2 mt-1">
              {strategies.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={strategy === s.key}
                  onClick={() => setStrategy(s.key)}
                  className={cn(
                    "rounded-xl border-2 border-ink p-3 text-left",
                    strategy === s.key ? "bg-marker" : "bg-card hover:bg-secondary",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{s.title}</span>
                    <span className="text-xs">{monthYear(results[s.key].debtFreeDate)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.body} Total interest {inr(results[s.key].totalInterest)}.
                  </div>
                </button>
              ))}
            </div>
            <label className="flex items-start gap-2 text-sm mt-4">
              <input
                type="checkbox"
                checked={rollover}
                onChange={(e) => setRollover(e.target.checked)}
                className="h-4 w-4 mt-0.5"
              />
              <span>When a loan closes, put its EMI towards the next one</span>
            </label>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-5">
          Check with your lender about prepayment charges. Floating-rate home loans usually have
          none; fixed-rate and personal loans often do.
        </p>
      </SketchCard>

      <div className="grid gap-5">
        <SketchCard className="bg-marker" hoverable={false}>
          {base.neverEnds ? (
            <div className="font-headline text-2xl">
              One loan's EMI doesn't cover its interest. Fix it on the loan page first.
            </div>
          ) : monthsSaved > 0 ? (
            <>
              <SectionLabel>With this plan</SectionLabel>
              <div className="font-headline text-3xl md:text-4xl">
                Debt-free in {monthYear(plan.debtFreeDate)} — {duration(monthsSaved)} sooner.
              </div>
              <p className="hand text-xl mt-2">You'd pay {inr(interestSaved)} less interest.</p>
            </>
          ) : (
            <>
              <SectionLabel>As scheduled</SectionLabel>
              <div className="font-headline text-3xl md:text-4xl">
                Debt-free in {monthYear(base.debtFreeDate)}.
              </div>
              <p className="hand text-xl mt-2">
                Add an extra amount to see how much sooner you could be.
              </p>
            </>
          )}
        </SketchCard>

        <SketchCard hoverable={false}>
          <SectionLabel>Total debt over time</SectionLabel>
          <PayoffChart baseline={base.timeline} plan={plan.timeline} />
        </SketchCard>

        <SketchCard hoverable={false}>
          <SectionLabel>When each loan closes</SectionLabel>
          <ul className="divide-y divide-ink/15">
            {openLoans.map((l) => {
              const before = base.endDates[l.id];
              const after = plan.endDates[l.id];
              return (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="truncate">
                    {loanKinds[l.kind].emoji} {l.name}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {after && before && after < before ? (
                      <>
                        <span className="line-through text-muted-foreground">
                          {monthYear(before)}
                        </span>
                        <StatusChip tone="good">{monthYear(after)}</StatusChip>
                      </>
                    ) : (
                      <span>{monthYear(after ?? before)}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </SketchCard>
      </div>
    </div>
  );
}
