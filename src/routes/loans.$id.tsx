import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, CalendarPlus, Pencil, Scale, Trash2 } from "lucide-react";
import {
  Loading,
  Marker,
  PageShell,
  SectionLabel,
  StatTile,
  ToneBadge,
} from "@/components/fintwin/ui";
import { PaidBar, YearlyChart } from "@/components/fintwin/loan-charts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteLoan, useLoan, useSaveLoan } from "@/hooks/use-store";
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

  if (loading) return <Loading>Loading…</Loading>;
  if (!loan) {
    return (
      <PageShell>
        <p className="font-heading text-lg">That loan doesn't exist any more.</p>
        <Link to="/setup" className={buttonVariants({ className: "mt-4" })}>
          Back to my twin
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
        navigate({ to: "/setup" });
      },
      onError: (err) => toast.error(friendlyError(err, "Couldn't delete the loan.")),
    });
  }

  return (
    <>
      <Link
        to="/setup"
        className={buttonVariants({ variant: "neutral", size: "sm", className: "mb-6" })}
      >
        <ArrowLeft /> My twin
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-base border-2 border-border bg-main text-3xl shadow-shadow">
            {kind.emoji}
          </span>
          <div>
            <SectionLabel className="mb-1">
              {kind.label}
              {loan.lender ? ` · ${loan.lender}` : ""} · {loan.annualRate}% a year
            </SectionLabel>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">{loan.name}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/loans/$id/edit"
            params={{ id: loan.id }}
            className={buttonVariants({ variant: "neutral" })}
          >
            <Pencil /> Edit
          </Link>
          <Button variant="neutral" onClick={onDelete} disabled={remove.isPending}>
            <Trash2 /> Delete
          </Button>
        </div>
      </div>

      {s.neverEnds && (
        <Alert className="mt-6 bg-bad">
          <AlertTriangle />
          <AlertTitle>This loan never ends</AlertTitle>
          <AlertDescription>
            The EMI doesn't cover the monthly interest, so the balance never goes down. Check the
            rate and EMI.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="font-display text-2xl">
              {s.closed ? (
                <>
                  <Marker>Fully repaid</Marker> 🎉
                </>
              ) : (
                <>
                  <Marker>{Math.round(s.progress * 100)}% repaid</Marker> — {inr(s.outstanding)} to
                  go
                </>
              )}
            </CardTitle>
            <ToneBadge>
              {s.emisPaid} of {s.emisPaid + s.emisLeft} EMIs paid
            </ToneBadge>
          </div>
        </CardHeader>
        <CardContent>
          <PaidBar progress={s.progress} size="lg" />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatTile
          tone="bad"
          label="Still owed"
          value={inr(s.outstanding)}
          hint={`of ${inr(loan.principal)}`}
        />
        <StatTile
          tone="info"
          label="EMI"
          value={inrFull(s.emi)}
          hint={s.nextDue ? `next on ${monthYear(s.nextDue)}` : "no more EMIs"}
        />
        <StatTile
          tone="warn"
          label="Ends"
          value={monthYear(s.endDate)}
          hint={s.closed ? "closed" : `${duration(s.emisLeft)} left`}
        />
        <StatTile
          tone="good"
          label="Interest still to pay"
          value={inr(s.interestRemaining)}
          hint={`${inr(s.totalInterest)} over the whole loan`}
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl leading-snug">
              {paidInEmis > 0 ? (
                <>
                  Of the {inr(paidInEmis)} you’ve paid, {inr(s.interestPaid)} (
                  {Math.round(interestShare * 100)}%) was interest.
                </>
              ) : (
                <>Over the loan you’ll pay {inr(s.totalInterest)} in interest.</>
              )}
            </CardTitle>
            <CardDescription>
              Solid bars are years already paid; faded bars are still ahead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <YearlyChart data={yearly} currentYear={new Date().getFullYear()} />
          </CardContent>
        </Card>

        {!s.closed && (
          <div className="grid gap-6">
            <PrepayCard loan={loan} />
            <BalanceCheckCard loan={loan} computed={s.outstanding} />
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Never miss an EMI</CardTitle>
                <CardDescription>
                  Adds all {s.emisLeft} remaining due dates to your calendar, with a reminder the
                  day before.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="neutral"
                  onClick={() =>
                    downloadFile(
                      `${loan.name.replace(/[^\w-]+/g, "-")}-emis.ics`,
                      emiCalendar(loan),
                      "text/calendar",
                    )
                  }
                >
                  <CalendarPlus /> Add to calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

function PrepayCard({ loan }: { loan: Loan }) {
  const id = useId();
  const [amount, setAmount] = useState("100000");
  const value = Math.max(0, Number(amount) || 0);
  const c = useMemo(() => comparePrepayment(loan, value), [loan, value]);
  if (loan.annualRate === 0) return null; // nothing to save on a 0% loan

  return (
    <Card className="bg-main">
      <CardHeader>
        <CardTitle className="text-xl">What if I prepay?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={id}>One-time prepayment (₹)</Label>
          <Input
            id={id}
            type="number"
            min={0}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {value > 0 && (
          <>
            <div className="rounded-base border-2 border-border bg-secondary-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-heading">Keep EMI, finish sooner</span>
                <ToneBadge tone="good">Best</ToneBadge>
              </div>
              <div className="mt-1 font-display text-xl">
                Save {inr(c.reduceTenure.interestSaved)}
              </div>
              <div className="text-xs text-foreground/70">
                {duration(c.reduceTenure.monthsSaved)} sooner · ends{" "}
                {monthYear(c.reduceTenure.endDate)}
              </div>
            </div>
            <div className="rounded-base border-2 border-border bg-secondary-background p-3">
              <span className="text-sm font-heading">Keep end date, lower EMI</span>
              <div className="mt-1 font-display text-xl">Save {inr(c.reduceEmi.interestSaved)}</div>
              <div className="text-xs text-foreground/70">
                EMI drops to {inrFull(c.reduceEmi.newEmi)}
              </div>
            </div>
            <p className="text-xs">
              Your bank will ask which one you want. Shortening the loan almost always saves more.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BalanceCheckCard({ loan, computed }: { loan: Loan; computed: number }) {
  const save = useSaveLoan();
  const amountId = useId();
  const dateId = useId();
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Scale className="size-5" /> Match your bank
        </CardTitle>
        <CardDescription>
          Rates change and banks round differently. Enter the outstanding amount from your latest
          statement and we’ll recalculate from there.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {check && (
          <p className="text-xs text-foreground/70">
            Using {inrFull(check.amount)} from your statement on {monthYear(check.date)}.{" "}
            <button
              className="font-heading underline underline-offset-4"
              onClick={() => save.mutate({ ...loan, balanceCheck: null })}
              disabled={save.isPending}
            >
              Remove
            </button>
          </p>
        )}
        {open ? (
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor={amountId}>Outstanding amount (₹)</Label>
              <Input
                id={amountId}
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={dateId}>Statement date</Label>
              <Input
                id={dateId}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={save.isPending}>
                Save
              </Button>
              <Button type="button" variant="neutral" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="neutral" className="w-fit" onClick={() => setOpen(true)}>
            Update balance
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
