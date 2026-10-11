import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Plus, PlusCircle, Trash2 } from "lucide-react";
import { Loading, Marker, PageHeading, PageShell, ToneBadge } from "@/components/fintwin/ui";
import { pressable } from "@/components/fintwin/tones";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newId, useLoans, useSaveTwin, useTwin } from "@/hooks/use-store";
import { addMonths, loanKinds, loanStatus, toISODate } from "@/lib/loans";
import { defaultAssumptions, type Goal, type Twin } from "@/lib/twin";
import { inr, inrFull, monthYear } from "@/lib/format";
import { friendlyError } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "My twin — Fin Twin" }] }),
  component: Setup,
});

type GoalDraft = { id: string; name: string; target: string; date: string };
type Draft = {
  takeHome: string;
  spending: string;
  savings: string;
  investments: string;
  monthlySip: string;
  goals: GoalDraft[];
  raisePct: string;
  inflationPct: string;
  returnPct: string;
};

const str = (n: number | undefined | null) => (n || n === 0 ? String(n) : "");

function draftFrom(t: Twin | null): Draft {
  const a = t?.assumptions ?? defaultAssumptions;
  return {
    takeHome: str(t?.takeHome),
    spending: str(t?.spending),
    savings: str(t?.savings),
    investments: str(t?.investments),
    monthlySip: str(t?.monthlySip),
    goals: (t?.goals ?? []).map((g) => ({ ...g, target: String(g.target) })),
    raisePct: String(a.raisePct),
    inflationPct: String(a.inflationPct),
    returnPct: String(a.returnPct),
  };
}

const n = (s: string) => (s.trim() === "" ? 0 : Math.max(0, Number(s) || 0));

function build(d: Draft): { twin?: Twin; error?: string } {
  if (!(n(d.takeHome) > 0)) return { error: "Enter your monthly take-home pay." };
  if (!(n(d.spending) > 0)) return { error: "Enter roughly what you spend in a month." };
  const goals: Goal[] = [];
  for (const g of d.goals) {
    if (!g.name.trim() && !g.target) continue;
    if (!g.name.trim() || !(n(g.target) > 0) || !g.date)
      return { error: "Give each goal a name, an amount and a date." };
    goals.push({ id: g.id, name: g.name.trim(), target: n(g.target), date: g.date });
  }
  return {
    twin: {
      takeHome: n(d.takeHome),
      spending: n(d.spending),
      savings: n(d.savings),
      investments: n(d.investments),
      monthlySip: n(d.monthlySip),
      goals,
      assumptions: {
        raisePct: Number(d.raisePct) || 0,
        inflationPct: Number(d.inflationPct) || 0,
        returnPct: Number(d.returnPct) || 0,
      },
    },
  };
}

function Setup() {
  const { twin, loading } = useTwin();
  if (loading) return <Loading>Loading your twin…</Loading>;
  return (
    <PageShell>
      <TwinForm initial={twin} />
    </PageShell>
  );
}

// Unsaved edits survive a detour to add a loan.
const DRAFT_KEY = "fintwin.setupDraft";

function loadDraft(initial: Twin | null): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw) as Draft;
  } catch {
    // Fall through to the saved twin.
  }
  return draftFrom(initial);
}

function TwinForm({ initial }: { initial: Twin | null }) {
  const navigate = useNavigate();
  const save = useSaveTwin();
  const [d, setD] = useState<Draft>(() => loadDraft(initial));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {
      // Not critical.
    }
  }, [d, dirty]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDirty(true);
    setD((x) => ({ ...x, [k]: v }));
  };
  const setGoal = (id: string, patch: Partial<GoalDraft>) =>
    set(
      "goals",
      d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );

  const inTwoYears = addMonths(toISODate(new Date()), 24).slice(0, 8) + "01";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = build(d);
    if (!r.twin) return setError(r.error ?? "Check the numbers.");
    setError(null);
    save.mutate(r.twin, {
      onSuccess: () => {
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          // Not critical.
        }
        toast.success(initial ? "Twin updated" : "Your twin is ready");
        navigate({ to: "/" });
      },
      onError: (err) => setError(friendlyError(err, err.message || "Couldn't save.")),
    });
  }

  return (
    <form onSubmit={submit} className="max-w-4xl">
      <PageHeading
        eyebrow={initial ? "My twin" : "Build your twin · about 2 minutes"}
        description="Rough numbers are fine — your twin only needs to be roughly right to be useful."
      >
        {initial ? (
          <>
            Keep your twin <Marker>up to date</Marker>.
          </>
        ) : (
          <>
            Teach your twin <Marker>your money</Marker>.
          </>
        )}
      </PageHeading>

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Every month</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <MoneyField
              label="Take-home pay"
              hint="After tax, what lands in your account"
              value={d.takeHome}
              onChange={(v) => set("takeHome", v)}
              placeholder="95000"
            />
            <MoneyField
              label="Spending"
              hint="Rent, bills, food, fun — not EMIs or investments"
              value={d.spending}
              onChange={(v) => set("spending", v)}
              placeholder="50000"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What you have</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <MoneyField
              label="Savings"
              hint="Bank balance, FDs, cash"
              value={d.savings}
              onChange={(v) => set("savings", v)}
              placeholder="200000"
            />
            <MoneyField
              label="Investments"
              hint="Mutual funds, stocks, EPF/PPF"
              value={d.investments}
              onChange={(v) => set("investments", v)}
              placeholder="300000"
            />
            <MoneyField
              label="Invested every month"
              hint="SIPs, RD, etc."
              value={d.monthlySip}
              onChange={(v) => set("monthlySip", v)}
              placeholder="10000"
            />
          </CardContent>
        </Card>

        <LoansCard />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Goals (up to 3)</CardTitle>
            <CardDescription>Something you're saving for, with a date.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {d.goals.map((g) => (
              <div key={g.id} className="grid items-center gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                <Input
                  placeholder="e.g. House down payment"
                  value={g.name}
                  aria-label="Goal name"
                  onChange={(e) => setGoal(g.id, { name: e.target.value })}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Amount ₹"
                  value={g.target}
                  aria-label="Goal amount"
                  onChange={(e) => setGoal(g.id, { target: e.target.value })}
                />
                <Input
                  type="date"
                  value={g.date}
                  aria-label="Goal date"
                  onChange={(e) => setGoal(g.id, { date: e.target.value })}
                />
                <Button
                  type="button"
                  variant="neutral"
                  size="icon"
                  aria-label={`Remove ${g.name || "goal"}`}
                  onClick={() =>
                    set(
                      "goals",
                      d.goals.filter((x) => x.id !== g.id),
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {d.goals.length < 3 && (
              <Button
                type="button"
                variant="neutral"
                className="w-fit"
                onClick={() =>
                  set("goals", [
                    ...d.goals,
                    { id: newId(), name: "", target: "", date: inTwoYears },
                  ])
                }
              >
                <Plus /> Add a goal
              </Button>
            )}
          </CardContent>
        </Card>

        <Accordion>
          <AccordionItem value="assumptions">
            <AccordionTrigger>
              Assumptions · pay rise {d.raisePct}%, inflation {d.inflationPct}%, returns{" "}
              {d.returnPct}% a year
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-5 md:grid-cols-3">
                <PercentField
                  label="Yearly pay rise"
                  value={d.raisePct}
                  onChange={(v) => set("raisePct", v)}
                />
                <PercentField
                  label="Yearly rise in spending"
                  value={d.inflationPct}
                  onChange={(v) => set("inflationPct", v)}
                />
                <PercentField
                  label="Investment return"
                  value={d.returnPct}
                  onChange={(v) => set("returnPct", v)}
                />
              </div>
              <p className="mt-4 text-foreground/70">
                Savings earn 3% a year. These are long-run averages, not predictions.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {error && (
          <Alert className="bg-bad">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <Button type="submit" size="lg" disabled={save.isPending}>
            {save.isPending ? "Saving…" : initial ? "Save changes" : "Meet my twin"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function LoansCard() {
  const { loans } = useLoans();
  const open = loans.map((l) => ({ l, s: loanStatus(l) })).filter(({ s }) => !s.closed);
  const totalEmi = open.reduce((a, { s }) => a + s.emi, 0);
  return (
    <Card id="loans" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">Loans & EMIs</CardTitle>
          {open.length > 0 && <ToneBadge>{inrFull(totalEmi)}/month</ToneBadge>}
        </div>
        <CardDescription>
          {loans.length === 0
            ? "No loans? Lucky you. Add any home, car, personal or “no-cost” EMIs."
            : "Changes to loans are saved straight away."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {loans.map((l) => {
          const s = loanStatus(l);
          return (
            <Link
              key={l.id}
              to="/loans/$id"
              params={{ id: l.id }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background px-4 py-3 text-sm shadow-shadow",
                pressable,
              )}
            >
              <span className="truncate font-heading">
                {loanKinds[l.kind].emoji} {l.name}
              </span>
              <span className="shrink-0 text-foreground/70">
                {s.closed ? "closed" : `${inr(s.outstanding)} left · ends ${monthYear(s.endDate)}`}
              </span>
            </Link>
          );
        })}
        <Link
          to="/loans/new"
          className={buttonVariants({ variant: "neutral", className: "w-fit" })}
        >
          <PlusCircle /> Add a loan
        </Link>
      </CardContent>
    </Card>
  );
}

function MoneyField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label} (₹)</Label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-foreground/70">{hint}</p>
    </div>
  );
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label} (%)</Label>
      <Input
        id={id}
        type="number"
        step="0.5"
        min={0}
        max={30}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
