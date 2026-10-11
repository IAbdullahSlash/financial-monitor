import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Loading, Marker, PageHeading, PageShell, ToneBadge } from "@/components/fintwin/ui";
import { toneBg } from "@/components/fintwin/tones";
import { NetWorthChart } from "@/components/fintwin/twin-charts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { newId, useLoans, useScenarioMutations, useScenarios, useTwin } from "@/hooks/use-store";
import {
  compareProjections,
  monthIndex,
  project,
  type Change,
  type Projection,
  type Scenario,
  type Twin,
} from "@/lib/twin";
import { addMonths, loanStatus, toISODate, type Loan } from "@/lib/loans";
import { duration, inr, inrFull, monthYear } from "@/lib/format";
import { friendlyError } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/what-if")({
  head: () => ({
    meta: [
      { title: "What if… — Fin Twin" },
      {
        name: "description",
        content: "Try a decision on your financial twin and compare the two futures.",
      },
    ],
  }),
  component: WhatIf,
});

function WhatIf() {
  const { twin, loading } = useTwin();
  const { loans, loading: loansLoading } = useLoans();
  if (loading || loansLoading) return <Loading>Loading your twin…</Loading>;
  if (!twin) {
    return (
      <PageShell>
        <PageHeading
          eyebrow="What if…"
          description="It needs your numbers before it can test a decision."
        >
          First, <Marker>build your twin</Marker>.
        </PageHeading>
        <Link to="/setup" className={buttonVariants({ className: "mt-6" })}>
          Build my twin
        </Link>
      </PageShell>
    );
  }
  return (
    <PageShell>
      <Lab twin={twin} loans={loans} />
    </PageShell>
  );
}

// ---------- starting points ----------

const nextMonth = () =>
  addMonths(toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), 1);

type Template = { label: string; build: () => Change };

function templates(twin: Twin, loans: Loan[]): Template[] {
  const start = nextMonth();
  const interestLoan = loans.find((l) => l.annualRate > 0 && !loanStatus(l).closed);
  const list: Template[] = [
    {
      label: "Buy a ₹12L car on EMI",
      build: () => ({
        type: "purchase",
        label: "Car",
        amount: 1_200_000,
        date: start,
        financing: "loan",
        downPayment: 200_000,
        rate: 9.5,
        months: 60,
      }),
    },
    {
      label: "Buy a ₹1.5L phone on no-cost EMI",
      build: () => ({
        type: "purchase",
        label: "Phone",
        amount: 150_000,
        date: start,
        financing: "loan",
        downPayment: 0,
        rate: 0,
        months: 6,
      }),
    },
    {
      label: "Take a 6-month break",
      build: () => ({ type: "income", amount: 0, date: addMonths(start, 2), months: 6 }),
    },
    {
      label: "Switch jobs for +30%",
      build: () => ({
        type: "income",
        amount: Math.round(twin.takeHome * 1.3),
        date: addMonths(start, 1),
        months: null,
      }),
    },
    {
      label: "Move city (+₹15k rent)",
      build: () => ({ type: "spending", delta: 15_000, date: start, months: null }),
    },
    {
      label: "Start a ₹10k SIP",
      build: () => ({ type: "sip", delta: 10_000, date: start }),
    },
  ];
  if (interestLoan) {
    list.push({
      label: `Prepay ₹2L on ${interestLoan.name}`,
      build: () => ({ type: "prepay", loanId: interestLoan.id, amount: 200_000, date: start }),
    });
  }
  return list;
}

const blank: Record<Change["type"], (twin: Twin, loans: Loan[]) => Change> = {
  purchase: () => ({
    type: "purchase",
    label: "",
    amount: 0,
    date: nextMonth(),
    financing: "cash",
    downPayment: 0,
    rate: 9.5,
    months: 36,
  }),
  income: (twin) => ({ type: "income", amount: twin.takeHome, date: nextMonth(), months: null }),
  spending: () => ({ type: "spending", delta: 0, date: nextMonth(), months: null }),
  prepay: (_, loans) => ({
    type: "prepay",
    loanId: loans.find((l) => !loanStatus(l).closed)?.id ?? "",
    amount: 100_000,
    date: nextMonth(),
  }),
  sip: () => ({ type: "sip", delta: 5_000, date: nextMonth() }),
};

const changeNames: Record<Change["type"], string> = {
  purchase: "Buy something",
  income: "Income changes",
  spending: "Spending changes",
  prepay: "Prepay a loan",
  sip: "Invest more",
};

function describe(c: Change, loans: Loan[]): string {
  switch (c.type) {
    case "purchase":
      return `${c.label || "Purchase"} for ${inr(c.amount)}${c.financing === "loan" ? " on EMI" : ""}`;
    case "income":
      return c.amount === 0 ? `${c.months ?? ""}-month break` : `Take-home ${inr(c.amount)}`;
    case "spending":
      return `${c.delta >= 0 ? "+" : "−"}${inr(Math.abs(c.delta))}/month spending`;
    case "prepay":
      return `Prepay ${inr(c.amount)} on ${loans.find((l) => l.id === c.loanId)?.name ?? "a loan"}`;
    case "sip":
      return `Invest ${inr(c.delta)}/month more`;
  }
}

// ---------- the lab ----------

type Draft = { id: string | null; name: string; changes: Change[] };

function Lab({ twin, loans }: { twin: Twin; loans: Loan[] }) {
  const [draft, setDraft] = useState<Draft>({ id: null, name: "", changes: [] });
  const { scenarios } = useScenarios();
  const { save, remove } = useScenarioMutations();
  const openLoans = loans.filter((l) => !loanStatus(l).closed);

  const base = useMemo(() => project(twin, loans), [twin, loans]);
  const alt = useMemo(
    () => (draft.changes.length ? project(twin, loans, draft.changes) : null),
    [twin, loans, draft.changes],
  );

  const setChanges = (changes: Change[]) => setDraft((d) => ({ ...d, changes }));
  const add = (c: Change) => setChanges([...draft.changes, c]);

  function saveScenario() {
    if (!draft.changes.length) return;
    const scenario: Scenario = {
      id: draft.id ?? newId(),
      name: draft.name.trim() || draft.changes.map((c) => describe(c, loans)).join(" + "),
      changes: draft.changes,
      createdAt: scenarios.find((s) => s.id === draft.id)?.createdAt ?? new Date().toISOString(),
    };
    save.mutate(scenario, {
      onSuccess: () => {
        setDraft({ id: scenario.id, name: scenario.name, changes: scenario.changes });
        toast.success("Scenario saved");
      },
      onError: (err) => toast.error(friendlyError(err, err.message || "Couldn't save.")),
    });
  }

  return (
    <>
      <PageHeading eyebrow="What if…">
        Try it on your <Marker>twin</Marker> first.
      </PageHeading>

      <div className="mt-6 flex flex-wrap gap-3">
        {templates(twin, loans).map((t) => (
          <Button
            key={t.label}
            variant="neutral"
            size="sm"
            onClick={() => setDraft({ id: null, name: t.label, changes: [t.build()] })}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your scenario</CardTitle>
              {draft.changes.length === 0 && (
                <CardDescription>
                  Pick a starting point above, or add a change below.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input
                placeholder="Name it, e.g. “Car now vs later”"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                aria-label="Scenario name"
              />
              {draft.changes.map((c, i) => (
                <ChangeEditor
                  key={i}
                  change={c}
                  loans={openLoans}
                  onChange={(next) => setChanges(draft.changes.map((x, j) => (j === i ? next : x)))}
                  onRemove={() => setChanges(draft.changes.filter((_, j) => j !== i))}
                />
              ))}
              <div>
                <p className="mb-2 text-sm font-heading">Add a change</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(blank) as Change["type"][])
                    .filter((t) => t !== "prepay" || openLoans.length > 0)
                    .map((t) => (
                      <Button
                        key={t}
                        variant="neutral"
                        size="xs"
                        onClick={() => add(blank[t](twin, openLoans))}
                      >
                        <Plus /> {changeNames[t]}
                      </Button>
                    ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={!draft.changes.length || save.isPending} onClick={saveScenario}>
                  <Save /> {draft.id ? "Save changes" : "Save scenario"}
                </Button>
                {draft.changes.length > 0 && (
                  <Button
                    variant="neutral"
                    onClick={() => setDraft({ id: null, name: "", changes: [] })}
                  >
                    <RotateCcw /> Start over
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {scenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Saved scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3">
                  {scenarios.map((s) => (
                    <SavedRow
                      key={s.id}
                      scenario={s}
                      base={base}
                      twin={twin}
                      loans={loans}
                      active={draft.id === s.id}
                      onOpen={() => setDraft({ id: s.id, name: s.name, changes: s.changes })}
                      onDelete={() => {
                        if (!window.confirm(`Delete “${s.name}”?`)) return;
                        remove.mutate(s.id, {
                          onSuccess: () => {
                            if (draft.id === s.id) setDraft({ id: null, name: "", changes: [] });
                          },
                        });
                      }}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          {alt ? (
            <Comparison base={base} alt={alt} changes={draft.changes} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your twin today</CardTitle>
                <CardDescription>
                  Worth {inr(base.points[119].netWorth)} in 10 years if nothing changes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NetWorthChart base={base.points} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- comparison ----------

function Comparison({
  base,
  alt,
  changes,
}: {
  base: Projection;
  alt: Projection;
  changes: Change[];
}) {
  const c = compareProjections(base, alt);
  // Show monthly cash flow from the month the first change kicks in.
  const firstMonth = Math.min(
    119,
    ...changes.map((ch) => Math.max(0, monthIndex(base.start, ch.date))),
  );
  const freeMonth = Math.min(119, firstMonth + 1);
  const freeBefore = base.points[freeMonth].free;
  const freeAfter = alt.points[freeMonth].free;

  const runsOut = !!c.runsOut.after && !c.runsOut.before;
  let headline: React.ReactNode;
  if (runsOut) {
    headline = (
      <>
        Your money <Marker>runs out in {monthYear(c.runsOut.after)}</Marker>.
      </>
    );
  } else if (Math.abs(c.netWorth10) < 10_000) {
    headline = <>Barely changes your future.</>;
  } else {
    headline = (
      <>
        In 10 years your twin is{" "}
        <Marker>
          {inr(Math.abs(c.netWorth10))} {c.netWorth10 < 0 ? "poorer" : "richer"}
        </Marker>
        .
      </>
    );
  }

  return (
    <Card className={cn(runsOut && toneBg.bad)}>
      <CardHeader>
        <CardDescription className="font-heading uppercase tracking-widest">
          Your twin vs. with this change
        </CardDescription>
        <CardTitle className="font-display text-2xl leading-snug md:text-3xl">{headline}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Table className="bg-secondary-background">
          <TableHeader>
            <TableRow className="bg-main">
              <TableHead className="h-10 px-3"></TableHead>
              <TableHead className="h-10 px-3">Today's twin</TableHead>
              <TableHead className="h-10 px-3">With change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Row
              label={`Left each month (${monthYear(base.points[freeMonth].date)})`}
              before={inrFull(freeBefore)}
              after={inrFull(freeAfter)}
              worse={freeAfter < freeBefore}
            />
            <Row
              label="Net worth in 5 years"
              before={inr(base.points[59].netWorth)}
              after={inr(alt.points[59].netWorth)}
              worse={c.netWorth5 < 0}
            />
            <Row
              label="Net worth in 10 years"
              before={inr(base.points[119].netWorth)}
              after={inr(alt.points[119].netWorth)}
              worse={c.netWorth10 < 0}
            />
            {c.goals.map((g) => (
              <Row
                key={g.goal.id}
                label={g.goal.name}
                before={g.before ? monthYear(g.before) : "not in 30 yrs"}
                after={
                  g.after
                    ? `${monthYear(g.after)}${g.shift ? ` (${g.shift > 0 ? "+" : "−"}${duration(Math.abs(g.shift))})` : ""}`
                    : "not in 30 yrs"
                }
                worse={g.shift === null ? !g.after && !!g.before : g.shift > 0}
              />
            ))}
            {(base.hasDebt || alt.hasDebt) && (
              <Row
                label="Debt-free"
                before={base.hasDebt ? monthYear(c.debtFree.before) : "no debt"}
                after={alt.hasDebt ? monthYear(c.debtFree.after) : "no debt"}
                worse={(c.debtFree.shift ?? 0) > 0 || (!base.hasDebt && alt.hasDebt)}
              />
            )}
            <Row
              label="Lowest cash cushion"
              before={cushion(c.cushion.before)}
              after={cushion(c.cushion.after)}
              worse={c.cushion.after < Math.min(3, c.cushion.before)}
            />
          </TableBody>
        </Table>
        <NetWorthChart base={base.points} alt={alt.points} />
        <p className="text-xs text-foreground/70">
          A projection from your own numbers and assumptions — not financial advice.
        </p>
      </CardContent>
    </Card>
  );
}

const cushion = (months: number) =>
  !Number.isFinite(months) ? "—" : months < 0 ? "none" : `${months.toFixed(1)} months`;

function Row({
  label,
  before,
  after,
  worse,
}: {
  label: string;
  before: string;
  after: string;
  worse: boolean;
}) {
  return (
    <TableRow className="bg-secondary-background">
      <TableCell className="px-3 py-2.5">{label}</TableCell>
      <TableCell className="px-3 py-2.5">{before}</TableCell>
      <TableCell className="px-3 py-2.5">
        {before === after ? (
          <span className="text-foreground/60">same</span>
        ) : (
          <ToneBadge tone={worse ? "bad" : "good"}>
            {after} {worse ? "↓" : "↑"}
          </ToneBadge>
        )}
      </TableCell>
    </TableRow>
  );
}

function SavedRow({
  scenario,
  base,
  twin,
  loans,
  active,
  onOpen,
  onDelete,
}: {
  scenario: Scenario;
  base: Projection;
  twin: Twin;
  loans: Loan[];
  active: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const diff = useMemo(() => {
    const alt = project(twin, loans, scenario.changes);
    return alt.points[119].netWorth - base.points[119].netWorth;
  }, [twin, loans, scenario.changes, base]);
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-2 rounded-base border-2 border-border p-2 pl-3",
        active ? "bg-main" : "bg-secondary-background",
      )}
    >
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
        <span className="block truncate font-heading text-sm">{scenario.name}</span>
        <span className="text-xs text-foreground/70">
          10 yrs: {diff >= 0 ? "+" : "−"}
          {inr(Math.abs(diff))}
        </span>
      </button>
      <Button
        variant="neutral"
        size="icon-sm"
        aria-label={`Delete ${scenario.name}`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </li>
  );
}

// ---------- editors ----------

function ChangeEditor({
  change: c,
  loans,
  onChange,
  onRemove,
}: {
  change: Change;
  loans: Loan[];
  onChange: (c: Change) => void;
  onRemove: () => void;
}) {
  const num = (v: string) => Math.max(0, Number(v) || 0);
  return (
    <div className="rounded-base border-2 border-border bg-secondary-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <ToneBadge tone="info">{changeNames[c.type]}</ToneBadge>
        <Button variant="neutral" size="icon-xs" aria-label="Remove change" onClick={onRemove}>
          <X />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {c.type === "purchase" && (
          <>
            <Field label="What">
              {(id) => (
                <Input
                  id={id}
                  value={c.label}
                  placeholder="Car"
                  onChange={(e) => onChange({ ...c, label: e.target.value })}
                />
              )}
            </Field>
            <Field label="Price (₹)">
              {(id) => (
                <NumberInput
                  id={id}
                  value={c.amount}
                  onChange={(v) => onChange({ ...c, amount: num(v) })}
                />
              )}
            </Field>
            <Field label="When">
              {(id) => (
                <DateInput id={id} value={c.date} onChange={(v) => onChange({ ...c, date: v })} />
              )}
            </Field>
            <Field label="Pay with">
              {(id) => (
                <Choice
                  id={id}
                  value={c.financing}
                  options={{ cash: "Savings (cash)", loan: "EMI / loan" }}
                  onChange={(v) => onChange({ ...c, financing: v as "cash" | "loan" })}
                />
              )}
            </Field>
            {c.financing === "loan" && (
              <>
                <Field label="Down payment (₹)">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={c.downPayment}
                      onChange={(v) => onChange({ ...c, downPayment: num(v) })}
                    />
                  )}
                </Field>
                <Field label="Interest (% a year)">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={c.rate}
                      step="0.1"
                      onChange={(v) => onChange({ ...c, rate: num(v) })}
                    />
                  )}
                </Field>
                <Field label="EMIs (months)">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={c.months}
                      onChange={(v) => onChange({ ...c, months: Math.max(1, Math.round(num(v))) })}
                    />
                  )}
                </Field>
              </>
            )}
          </>
        )}

        {c.type === "income" && (
          <>
            <Field label="New take-home (₹/month)">
              {(id) => (
                <NumberInput
                  id={id}
                  value={c.amount}
                  allowZero
                  onChange={(v) => onChange({ ...c, amount: num(v) })}
                />
              )}
            </Field>
            <Field label="From">
              {(id) => (
                <DateInput id={id} value={c.date} onChange={(v) => onChange({ ...c, date: v })} />
              )}
            </Field>
            <ForHowLong months={c.months} onChange={(months) => onChange({ ...c, months })} />
          </>
        )}

        {c.type === "spending" && (
          <>
            <Field label="Change per month (₹)" hint="Negative to spend less">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={c.delta || ""}
                  placeholder="15000"
                  onChange={(e) => onChange({ ...c, delta: Number(e.target.value) || 0 })}
                />
              )}
            </Field>
            <Field label="From">
              {(id) => (
                <DateInput id={id} value={c.date} onChange={(v) => onChange({ ...c, date: v })} />
              )}
            </Field>
            <ForHowLong months={c.months} onChange={(months) => onChange({ ...c, months })} />
          </>
        )}

        {c.type === "prepay" && (
          <>
            <Field label="Loan">
              {(id) => (
                <Choice
                  id={id}
                  value={c.loanId}
                  options={Object.fromEntries(loans.map((l) => [l.id, l.name]))}
                  onChange={(v) => onChange({ ...c, loanId: v })}
                />
              )}
            </Field>
            <Field label="Amount (₹)">
              {(id) => (
                <NumberInput
                  id={id}
                  value={c.amount}
                  onChange={(v) => onChange({ ...c, amount: num(v) })}
                />
              )}
            </Field>
            <Field label="When">
              {(id) => (
                <DateInput id={id} value={c.date} onChange={(v) => onChange({ ...c, date: v })} />
              )}
            </Field>
          </>
        )}

        {c.type === "sip" && (
          <>
            <Field label="Extra each month (₹)">
              {(id) => (
                <NumberInput
                  id={id}
                  value={c.delta}
                  onChange={(v) => onChange({ ...c, delta: num(v) })}
                />
              )}
            </Field>
            <Field label="From">
              {(id) => (
                <DateInput id={id} value={c.date} onChange={(v) => onChange({ ...c, date: v })} />
              )}
            </Field>
          </>
        )}
      </div>
    </div>
  );
}

/** A shadcn Select over a simple value → label map. */
function Choice({
  id,
  value,
  options,
  onChange,
}: {
  id?: string;
  value: string;
  options: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => v !== null && onChange(String(v))}>
      <SelectTrigger id={id} className="bg-secondary-background text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options).map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ForHowLong({
  months,
  onChange,
}: {
  months: number | null;
  onChange: (m: number | null) => void;
}) {
  return (
    <Field label="For how long">
      {(id) => (
        <div className="flex gap-2">
          <Choice
            id={id}
            value={months === null ? "always" : "months"}
            options={{ always: "From then on", months: "For…" }}
            onChange={(v) => onChange(v === "always" ? null : 6)}
          />
          {months !== null && (
            <Input
              type="number"
              min={1}
              className="w-20"
              value={months}
              aria-label="Months"
              onChange={(e) => onChange(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            />
          )}
        </div>
      )}
    </Field>
  );
}

function NumberInput({
  id,
  value,
  onChange,
  step,
  allowZero,
}: {
  id?: string;
  value: number;
  onChange: (v: string) => void;
  step?: string;
  allowZero?: boolean;
}) {
  return (
    <Input
      id={id}
      type="number"
      min={0}
      step={step}
      value={value || (allowZero && value === 0 ? 0 : "")}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function DateInput({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      id={id}
      type="date"
      value={value}
      onChange={(e) => e.target.value && onChange(e.target.value)}
    />
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="grid min-w-0 content-start gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {hint && <p className="text-xs text-foreground/70">{hint}</p>}
    </div>
  );
}
