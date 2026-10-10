import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Lock, PlusCircle, Rocket } from "lucide-react";
import {
  PageShell,
  SketchCard,
  SectionLabel,
  Marker,
  StatTile,
  StatusChip,
  DashedCard,
} from "@/components/fintwin/ui";
import { PaidBar } from "@/components/fintwin/loan-charts";
import { useLoans, useSettings } from "@/hooks/use-loans";
import {
  loanKinds,
  loanStatus,
  parseDate,
  simulatePortfolio,
  type Loan,
  type LoanStatus,
} from "@/lib/loans";
import { dayMonth, duration, inr, inrFull, monthYear } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fin Twin — EMI & Loan Tracker" },
      {
        name: "description",
        content:
          "Every EMI and loan in one place: paid vs remaining, interest, and your debt-free date. No bank connection needed.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { loans, loading } = useLoans();

  if (loading) {
    return (
      <PageShell>
        <div className="hand text-lg">Loading your loans…</div>
      </PageShell>
    );
  }
  return <PageShell>{loans.length ? <LoanOverview loans={loans} /> : <EmptyState />}</PageShell>;
}

function EmptyState() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
      <div className="animate-fade-in">
        <h1 className="font-headline text-5xl md:text-6xl leading-[0.95]">
          All your EMIs. <Marker>One honest picture</Marker>.
        </h1>
        <p className="hand text-xl md:text-2xl mt-5 text-foreground/80 max-w-xl">
          Home loan, car loan, that phone on “no-cost” EMI — see what you’ve paid, what’s left, and
          the day you’ll be debt-free.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/loans/new" className="sketch-btn">
            <PlusCircle className="h-4 w-4" /> Add your first loan
          </Link>
        </div>
        <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground max-w-md">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" />
          No bank connection, no sign-up. Your loans stay on this device unless you choose to create
          an account.
        </div>
      </div>
      <DashedCard>
        <SectionLabel>What you’ll see</SectionLabel>
        <ol className="space-y-3 text-sm mt-2">
          <li className="flex gap-2">
            <span className="chip bg-mint">1</span> Paid vs remaining for every loan
          </li>
          <li className="flex gap-2">
            <span className="chip bg-sky">2</span> How much of your EMI is just interest
          </li>
          <li className="flex gap-2">
            <span className="chip bg-butter">3</span> Your debt-free date — and how to pull it
            closer
          </li>
        </ol>
      </DashedCard>
    </section>
  );
}

function LoanOverview({ loans }: { loans: Loan[] }) {
  const { settings } = useSettings();
  const rows = loans.map((loan) => ({ loan, s: loanStatus(loan) }));
  const open = rows.filter((r) => !r.s.closed);
  const closed = rows.filter((r) => r.s.closed);

  const owed = open.reduce((a, r) => a + r.s.outstanding, 0);
  const borrowed = open.reduce((a, r) => a + r.loan.principal, 0);
  const monthlyEmi = open.reduce((a, r) => a + r.s.emi, 0);
  const interestLeft = open.reduce((a, r) => a + r.s.interestRemaining, 0);
  const progress = borrowed > 0 ? 1 - owed / borrowed : 1;

  const base = simulatePortfolio(loans);
  const teaser = simulatePortfolio(loans, { extraMonthly: 5000, rollover: true });
  const monthsSooner = base.months - teaser.months;

  const emiShare = settings.takeHome ? monthlyEmi / settings.takeHome : null;

  // Due dates in the next ~5 weeks, soonest first.
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 35);
  const upcoming = open
    .filter((r) => r.s.nextDue && parseDate(r.s.nextDue) <= horizon)
    .sort((a, b) => a.s.nextDue!.localeCompare(b.s.nextDue!));

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <SectionLabel>My loans</SectionLabel>
          {base.neverEnds ? (
            <h1 className="font-headline text-4xl md:text-5xl">
              One loan <Marker>never ends</Marker> at its current EMI.
            </h1>
          ) : open.length ? (
            <h1 className="font-headline text-4xl md:text-5xl">
              Debt-free in <Marker>{monthYear(base.debtFreeDate)}</Marker>.
            </h1>
          ) : (
            <h1 className="font-headline text-4xl md:text-5xl">
              You’re <Marker>debt-free</Marker>. 🎉
            </h1>
          )}
          {open.length > 0 && !base.neverEnds && (
            <p className="hand text-lg mt-1 text-muted-foreground">
              {duration(base.months)} to go across {open.length} loan{open.length === 1 ? "" : "s"}.
            </p>
          )}
        </div>
        <Link to="/loans/new" className="sketch-btn">
          <PlusCircle className="h-4 w-4" /> Add a loan
        </Link>
      </div>

      {open.length > 0 && (
        <>
          <SketchCard className="mt-8" hoverable={false}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold">
                {Math.round(progress * 100)}% of what you borrowed is repaid
              </span>
              <span className="mini-label">
                {inr(borrowed - owed)} paid · {inr(owed)} left
              </span>
            </div>
            <PaidBar progress={progress} size="lg" />
          </SketchCard>

          <div className="grid gap-5 grid-cols-2 md:grid-cols-4 mt-6">
            <StatTile
              tone="coral"
              label="Still owed"
              value={inr(owed)}
              hint="principal outstanding"
            />
            <StatTile
              tone="sky"
              label="EMIs each month"
              value={inr(monthlyEmi)}
              hint={
                emiShare !== null ? (
                  `${Math.round(emiShare * 100)}% of take-home pay`
                ) : (
                  <Link to="/settings" className="underline">
                    Add take-home pay to see %
                  </Link>
                )
              }
            />
            <StatTile
              tone="butter"
              label="Interest still to pay"
              value={inr(interestLeft)}
              hint="if nothing changes"
            />
            <StatTile
              tone="mint"
              label="Repaid so far"
              value={inr(borrowed - owed)}
              hint={`of ${inr(borrowed)}`}
            />
          </div>
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mt-8 items-start">
        <div className="grid gap-4">
          {open.map(({ loan, s }) => (
            <LoanCard key={loan.id} loan={loan} s={s} />
          ))}
          {closed.length > 0 && (
            <details className="dashed-card p-4">
              <summary className="cursor-pointer font-semibold text-sm">
                Closed loans ({closed.length})
              </summary>
              <div className="grid gap-3 mt-3">
                {closed.map(({ loan, s }) => (
                  <LoanCard key={loan.id} loan={loan} s={s} />
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="grid gap-5">
          {open.length > 0 && !base.neverEnds && monthsSooner > 0 && (
            <SketchCard className="bg-marker" hoverable={false}>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <SectionLabel>Get out faster</SectionLabel>
              </div>
              <div className="font-headline text-2xl">
                ₹5,000 extra a month → debt-free {duration(monthsSooner)} sooner.
              </div>
              <p className="hand text-base mt-1">
                and about {inr(base.totalInterest - teaser.totalInterest)} less interest.
              </p>
              <Link to="/plan" className="sketch-btn text-sm mt-4">
                Try your own numbers <ArrowRight className="h-4 w-4" />
              </Link>
            </SketchCard>
          )}

          {open.length > 0 && (
            <SketchCard hoverable={false}>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                <SectionLabel>Coming up</SectionLabel>
              </div>
              {upcoming.length ? (
                <ul className="divide-y divide-ink/15">
                  {upcoming.map(({ loan, s }) => (
                    <li key={loan.id} className="flex items-center justify-between py-2 text-sm">
                      <span>
                        <span className="font-semibold">{dayMonth(s.nextDue)}</span> · {loan.name}
                      </span>
                      <span className="font-headline">{inrFull(s.emi)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No EMIs due in the next few weeks.</p>
              )}
            </SketchCard>
          )}
        </div>
      </div>
    </>
  );
}

function LoanCard({ loan, s }: { loan: Loan; s: LoanStatus }) {
  const kind = loanKinds[loan.kind];
  return (
    <Link
      to="/loans/$id"
      params={{ id: loan.id }}
      className="sketch-card sketch-card-hover p-5 block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 shrink-0 grid place-items-center rounded-xl border-2 border-ink bg-butter text-xl">
            {kind.emoji}
          </div>
          <div className="min-w-0">
            <div className="font-headline text-lg truncate">{loan.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {kind.label}
              {loan.lender ? ` · ${loan.lender}` : ""} · {loan.annualRate}%
            </div>
          </div>
        </div>
        {s.closed ? (
          <StatusChip tone="good">Closed</StatusChip>
        ) : s.neverEnds ? (
          <StatusChip tone="risk">Check EMI</StatusChip>
        ) : (
          <StatusChip tone="neutral">{s.emisLeft} EMIs left</StatusChip>
        )}
      </div>
      <PaidBar progress={s.progress} className="mt-4" />
      <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs">
        <span>
          <span className="font-semibold">{Math.round(s.progress * 100)}% paid</span> ·{" "}
          {inr(s.outstanding)} left
        </span>
        <span className="text-muted-foreground">
          {inrFull(s.emi)}/mo · ends {monthYear(s.endDate)}
        </span>
      </div>
    </Link>
  );
}
