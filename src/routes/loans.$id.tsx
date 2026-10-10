import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus, Pencil, Scale, Trash2 } from "lucide-react";
import {
  PageShell,
  SketchCard,
  SectionLabel,
  Marker,
  StatTile,
  StatusChip,
} from "@/components/fintwin/ui";
import { PaidBar, YearlyChart } from "@/components/fintwin/loan-charts";
import { useDeleteLoan, useLoan, useSaveLoan } from "@/hooks/use-loans";
import {
  comparePrepayment,
  loanKinds,
  loanSchedule,
  loanStatus,
  toISODate,
  yearlyBreakdown,
  type Loan,
} from "@/lib/loans";
import { duration, inr, inrFull, monthYear } from "@/lib/format";
import { downloadFile, emiCalendar } from "@/lib/calendar";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/loans/$id")({
  head: () => ({ meta: [{ title: "Loan — Fin Twin" }] }),
  component: LoanDetail,
});

function LoanDetail() {
  const { id } = Route.useParams();
  const { loan, loading } = useLoan(id);

  if (loading) {
    return (
      <PageShell>
        <div className="hand text-lg">Loading…</div>
      </PageShell>
    );
  }
  if (!loan) {
    return (
      <PageShell>
        <p className="hand text-lg">That loan doesn't exist any more.</p>
        <Link to="/" className="sketch-btn mt-4">
          Back to my loans
        </Link>
      </PageShell>
    );
  }
  return (
    <PageShell>
      <LoanView loan={loan} />
    </PageShell>
  );
}

function LoanView({ loan }: { loan: Loan }) {
  const navigate = useNavigate();
  const remove = useDeleteLoan();
  const s = loanStatus(loan);
  const kind = loanKinds[loan.kind];
  const yearly = useMemo(() => yearlyBreakdown(loanSchedule(loan)), [loan]);
  const paidInEmis = s.principalPaid + s.interestPaid;
  const interestShare = paidInEmis > 0 ? s.interestPaid / paidInEmis : 0;

  function onDelete() {
    if (!window.confirm(`Delete "${loan.name}"? This can't be undone.`)) return;
    remove.mutate(loan.id, {
      onSuccess: () => {
        toast.success("Loan deleted");
        navigate({ to: "/" });
      },
      onError: (err) => toast.error(friendlyError(err, "Couldn't delete the loan.")),
    });
  }

  return (
    <>
      <Link to="/" className="inline-flex items-center gap-1 text-sm mb-4 hover:underline">
        <ArrowLeft className="h-4 w-4" /> My loans
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 grid place-items-center rounded-2xl border-2 border-ink bg-butter text-3xl">
            {kind.emoji}
          </div>
          <div>
            <SectionLabel>
              {kind.label}
              {loan.lender ? ` · ${loan.lender}` : ""} · {loan.annualRate}% a year
            </SectionLabel>
            <h1 className="font-headline text-4xl md:text-5xl">{loan.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/loans/$id/edit" params={{ id: loan.id }} className="sketch-btn-ghost text-sm">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            onClick={onDelete}
            className="sketch-btn-ghost text-sm"
            disabled={remove.isPending}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {s.neverEnds && (
        <div className="chip bg-coral text-white mt-6">
          This EMI doesn't cover the monthly interest, so the balance never goes down. Check the
          rate and EMI.
        </div>
      )}

      <SketchCard className="mt-6" hoverable={false}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <div className="font-headline text-2xl">
            {s.closed ? (
              <>
                <Marker>Fully repaid</Marker> 🎉
              </>
            ) : (
              <>
                <Marker>{Math.round(s.progress * 100)}% repaid</Marker> — {inr(s.outstanding)} to go
              </>
            )}
          </div>
          <span className="mini-label">
            {s.emisPaid} of {s.emisPaid + s.emisLeft} EMIs paid
          </span>
        </div>
        <PaidBar progress={s.progress} size="lg" />
      </SketchCard>

      <div className="grid gap-5 grid-cols-2 md:grid-cols-4 mt-6">
        <StatTile
          tone="coral"
          label="Still owed"
          value={inr(s.outstanding)}
          hint={`of ${inr(loan.principal)}`}
        />
        <StatTile
          tone="sky"
          label="EMI"
          value={inrFull(s.emi)}
          hint={s.nextDue ? `next on ${monthYear(s.nextDue)}` : "no more EMIs"}
        />
        <StatTile
          tone="butter"
          label="Ends"
          value={monthYear(s.endDate)}
          hint={s.closed ? "closed" : `${duration(s.emisLeft)} left`}
        />
        <StatTile
          tone="mint"
          label="Interest still to pay"
          value={inr(s.interestRemaining)}
          hint={`${inr(s.totalInterest)} over the whole loan`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mt-6 items-start">
        <SketchCard hoverable={false}>
          <SectionLabel>Where your EMIs go</SectionLabel>
          {paidInEmis > 0 ? (
            <h3 className="font-headline text-2xl">
              Of the {inr(paidInEmis)} you’ve paid, <Marker>{inr(s.interestPaid)}</Marker> (
              {Math.round(interestShare * 100)}%) was interest.
            </h3>
          ) : (
            <h3 className="font-headline text-2xl">
              Over the loan you’ll pay <Marker>{inr(s.totalInterest)}</Marker> in interest.
            </h3>
          )}
          <p className="hand text-base text-muted-foreground mt-1">
            Solid bars are years already paid; faded bars are still ahead.
          </p>
          <div className="mt-4">
            <YearlyChart data={yearly} currentYear={new Date().getFullYear()} />
          </div>
        </SketchCard>

        <div className="grid gap-5">
          {!s.closed && <PrepayCard loan={loan} />}
          {!s.closed && <BalanceCheckCard loan={loan} computed={s.outstanding} />}
          {!s.closed && (
            <SketchCard hoverable={false}>
              <SectionLabel>Never miss an EMI</SectionLabel>
              <p className="text-sm">
                Adds all {s.emisLeft} remaining due dates to your calendar, with a reminder the day
                before.
              </p>
              <button
                className="sketch-btn-ghost text-sm mt-3"
                onClick={() =>
                  downloadFile(
                    `${loan.name.replace(/[^\w-]+/g, "-")}-emis.ics`,
                    emiCalendar(loan),
                    "text/calendar",
                  )
                }
              >
                <CalendarPlus className="h-4 w-4" /> Add to calendar
              </button>
            </SketchCard>
          )}
        </div>
      </div>
    </>
  );
}

function PrepayCard({ loan }: { loan: Loan }) {
  const [amount, setAmount] = useState("100000");
  const value = Math.max(0, Number(amount) || 0);
  const c = useMemo(() => comparePrepayment(loan, value), [loan, value]);
  if (loan.annualRate === 0) return null; // nothing to save on a 0% loan

  return (
    <SketchCard className="bg-marker" hoverable={false}>
      <SectionLabel>What if I prepay?</SectionLabel>
      <label className="block">
        <span className="mini-label">One-time prepayment (₹)</span>
        <input
          type="number"
          min={0}
          step={10000}
          className="sketch-input mt-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      {value > 0 && (
        <div className="grid gap-3 mt-4">
          <div className="rounded-xl border-2 border-ink bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">Keep EMI, finish sooner</div>
              <StatusChip tone="good">Best</StatusChip>
            </div>
            <div className="font-headline text-xl mt-1">
              Save {inr(c.reduceTenure.interestSaved)}
            </div>
            <div className="text-xs text-muted-foreground">
              {duration(c.reduceTenure.monthsSaved)} sooner · ends{" "}
              {monthYear(c.reduceTenure.endDate)}
            </div>
          </div>
          <div className="rounded-xl border-2 border-ink bg-card p-3">
            <div className="font-semibold text-sm">Keep end date, lower EMI</div>
            <div className="font-headline text-xl mt-1">Save {inr(c.reduceEmi.interestSaved)}</div>
            <div className="text-xs text-muted-foreground">
              EMI drops to {inrFull(c.reduceEmi.newEmi)}
            </div>
          </div>
          <p className="text-xs">
            Your bank will ask which one you want. Shortening the loan almost always saves more.
          </p>
        </div>
      )}
    </SketchCard>
  );
}

function BalanceCheckCard({ loan, computed }: { loan: Loan; computed: number }) {
  const save = useSaveLoan();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.round(computed)));
  const [date, setDate] = useState(toISODate(new Date()));
  const check = loan.balanceCheck;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!(value >= 0)) return toast.error("Enter the outstanding amount from your statement.");
    save.mutate(
      { ...loan, balanceCheck: { amount: value, date } },
      {
        onSuccess: () => {
          toast.success("Balance updated");
          setOpen(false);
        },
        onError: (err) => toast.error(friendlyError(err, "Couldn't save.")),
      },
    );
  }

  return (
    <SketchCard hoverable={false}>
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4" />
        <SectionLabel>Match your bank</SectionLabel>
      </div>
      <p className="text-sm">
        Rates change and banks round differently. Enter the outstanding amount from your latest
        statement and we’ll recalculate from there.
      </p>
      {check && (
        <p className="text-xs text-muted-foreground mt-2">
          Using {inrFull(check.amount)} from your statement on {monthYear(check.date)}.{" "}
          <button
            className="underline"
            onClick={() => save.mutate({ ...loan, balanceCheck: null })}
            disabled={save.isPending}
          >
            Remove
          </button>
        </p>
      )}
      {open ? (
        <form onSubmit={submit} className="grid gap-3 mt-3">
          <input
            type="number"
            min={0}
            className="sketch-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Outstanding amount"
          />
          <input
            type="date"
            className="sketch-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Statement date"
          />
          <div className="flex gap-2">
            <button type="submit" className="sketch-btn text-sm" disabled={save.isPending}>
              Save
            </button>
            <button
              type="button"
              className="sketch-btn-ghost text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="sketch-btn-ghost text-sm mt-3" onClick={() => setOpen(true)}>
          Update balance
        </button>
      )}
    </SketchCard>
  );
}
