import { useId, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { ToneBadge } from "@/components/fintwin/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calcEmi,
  loanKinds,
  monthlyRate,
  presentValue,
  toISODate,
  addMonths,
  type Loan,
  type LoanKind,
} from "@/lib/loans";
import { duration, inrFull, monthYear } from "@/lib/format";
import { newId } from "@/hooks/use-store";

type Mode = "original" | "remaining";

type Draft = {
  kind: LoanKind;
  name: string;
  lender: string;
  rate: string;
  // "original" mode
  principal: string;
  years: string;
  months: string;
  firstEmiDate: string;
  bankEmi: string;
  // "remaining" mode
  currentEmi: string;
  emisLeft: string;
  nextEmiDate: string;
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function draftFrom(loan?: Loan): Draft {
  const today = toISODate(new Date());
  return {
    kind: loan?.kind ?? "home",
    name: loan?.name ?? "",
    lender: loan?.lender ?? "",
    rate: loan ? String(loan.annualRate) : "",
    principal: loan ? String(Math.round(loan.principal)) : "",
    years: loan ? String(Math.floor(loan.tenureMonths / 12)) : "",
    months: loan ? String(loan.tenureMonths % 12) : "",
    firstEmiDate: loan?.firstEmiDate ?? today,
    bankEmi: loan?.emi ? String(loan.emi) : "",
    currentEmi: "",
    emisLeft: "",
    nextEmiDate: addMonths(today, 1).slice(0, 8) + "05",
  };
}

/** Turns the form into a loan, or explains what's missing. */
function build(d: Draft, mode: Mode, existing?: Loan): { loan?: Loan; error?: string } {
  const rate = num(d.rate);
  if (!(rate >= 0 && rate <= 60)) return { error: "Enter the interest rate (0 for no-cost EMI)." };
  const base = {
    id: existing?.id ?? newId(),
    kind: d.kind,
    name: d.name.trim() || loanKinds[d.kind].label,
    lender: d.lender.trim(),
    annualRate: rate,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    balanceCheck: existing?.balanceCheck ?? null,
  };

  if (mode === "original") {
    const principal = num(d.principal);
    const tenure = (num(d.years) || 0) * 12 + (num(d.months) || 0);
    if (!(principal > 0)) return { error: "Enter how much you borrowed." };
    if (!(tenure >= 1)) return { error: "Enter the loan tenure." };
    if (!d.firstEmiDate) return { error: "Enter the date of your first EMI." };
    const bankEmi = num(d.bankEmi);
    if (bankEmi > 0 && bankEmi <= principal * monthlyRate(rate))
      return { error: "That EMI doesn't cover the monthly interest. Check the numbers." };
    return {
      loan: {
        ...base,
        principal,
        tenureMonths: tenure,
        firstEmiDate: d.firstEmiDate,
        emi: bankEmi > 0 ? bankEmi : null,
      },
    };
  }

  const emi = num(d.currentEmi);
  const left = Math.round(num(d.emisLeft));
  if (!(emi > 0)) return { error: "Enter your current EMI." };
  if (!(left >= 1)) return { error: "Enter how many EMIs are left." };
  if (!d.nextEmiDate) return { error: "Enter the date of your next EMI." };
  // Tracking starts today: the balance is whatever those remaining EMIs pay off.
  return {
    loan: {
      ...base,
      principal: Math.round(presentValue(emi, rate, left)),
      tenureMonths: left,
      firstEmiDate: d.nextEmiDate,
      emi,
    },
  };
}

export function LoanForm({
  existing,
  onSubmit,
  saving,
  submitLabel,
}: {
  existing?: Loan;
  onSubmit: (loan: Loan) => void;
  saving: boolean;
  submitLabel: string;
}) {
  const [d, setD] = useState<Draft>(() => draftFrom(existing));
  const [mode, setMode] = useState<Mode>("original");
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const result = useMemo(() => build(d, mode, existing), [d, mode, existing]);
  const preview = result.loan;
  const previewEmi = preview
    ? (preview.emi ?? calcEmi(preview.principal, preview.annualRate, preview.tenureMonths))
    : 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (result.loan) onSubmit(result.loan);
  }

  const originalFields = (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Amount borrowed (₹)">
        {(id) => (
          <Input
            id={id}
            type="number"
            min={1}
            inputMode="numeric"
            value={d.principal}
            placeholder="2500000"
            onChange={(e) => set("principal", e.target.value)}
          />
        )}
      </Field>
      <RateField d={d} set={set} />
      <Field label="Tenure">
        {(id) => (
          <div className="flex items-center gap-2">
            <Input
              id={id}
              type="number"
              min={0}
              value={d.years}
              placeholder="20"
              aria-label="Years"
              onChange={(e) => set("years", e.target.value)}
            />
            <span className="text-sm">yrs</span>
            <Input
              type="number"
              min={0}
              max={11}
              value={d.months}
              placeholder="0"
              aria-label="Months"
              onChange={(e) => set("months", e.target.value)}
            />
            <span className="text-sm">mos</span>
          </div>
        )}
      </Field>
      <Field label="First EMI date">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={d.firstEmiDate}
            onChange={(e) => set("firstEmiDate", e.target.value)}
          />
        )}
      </Field>
      <Field label="Bank's exact EMI (₹)" hint="Optional — if it differs from ours">
        {(id) => (
          <Input
            id={id}
            type="number"
            min={0}
            value={d.bankEmi}
            placeholder={previewEmi ? String(Math.round(previewEmi)) : ""}
            onChange={(e) => set("bankEmi", e.target.value)}
          />
        )}
      </Field>
    </div>
  );

  const remainingFields = (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Current EMI (₹)">
        {(id) => (
          <Input
            id={id}
            type="number"
            min={1}
            value={d.currentEmi}
            placeholder="23500"
            onChange={(e) => set("currentEmi", e.target.value)}
          />
        )}
      </Field>
      <Field label="EMIs left">
        {(id) => (
          <Input
            id={id}
            type="number"
            min={1}
            value={d.emisLeft}
            placeholder="48"
            onChange={(e) => set("emisLeft", e.target.value)}
          />
        )}
      </Field>
      <RateField d={d} set={set} />
      <Field label="Next EMI date">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={d.nextEmiDate}
            onChange={(e) => set("nextEmiDate", e.target.value)}
          />
        )}
      </Field>
    </div>
  );

  return (
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What kind of loan?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(loanKinds) as LoanKind[]).map((k) => (
                <Button
                  key={k}
                  type="button"
                  size="sm"
                  variant={d.kind === k ? "default" : "neutral"}
                  aria-pressed={d.kind === k}
                  onClick={() => {
                    set("kind", k);
                    if (k === "no_cost_emi" || k === "bnpl") set("rate", "0");
                  }}
                >
                  {loanKinds[k].emoji} {loanKinds[k].label}
                </Button>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name it" hint="So you recognise it">
                {(id) => (
                  <Input
                    id={id}
                    value={d.name}
                    placeholder={loanKinds[d.kind].label}
                    onChange={(e) => set("name", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Lender" hint="Optional">
                {(id) => (
                  <Input
                    id={id}
                    value={d.lender}
                    placeholder="e.g. HDFC, SBI, Bajaj"
                    onChange={(e) => set("lender", e.target.value)}
                  />
                )}
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">The numbers</CardTitle>
          </CardHeader>
          <CardContent>
            {existing ? (
              originalFields
            ) : (
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="mb-4 h-auto flex-wrap justify-start">
                  <TabsTrigger value="original">I know the original loan</TabsTrigger>
                  <TabsTrigger value="remaining">I only know my EMI & what's left</TabsTrigger>
                </TabsList>
                <TabsContent value="original">{originalFields}</TabsContent>
                <TabsContent value="remaining">{remainingFields}</TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-main lg:sticky lg:top-24">
        <CardHeader>
          <CardDescription className="font-heading uppercase tracking-widest">
            Preview
          </CardDescription>
          <CardTitle className="font-display text-3xl">
            {preview ? `${inrFull(previewEmi)}/month` : "Your EMI"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {preview ? (
            <>
              <dl className="grid gap-1.5 text-sm">
                <Row
                  label={mode === "remaining" ? "Balance today" : "Borrowed"}
                  value={inrFull(preview.principal)}
                />
                <Row
                  label="Total interest"
                  value={inrFull(previewEmi * preview.tenureMonths - preview.principal)}
                />
                <Row
                  label="EMIs"
                  value={`${preview.tenureMonths} (${duration(preview.tenureMonths)})`}
                />
                <Row
                  label="Last EMI"
                  value={monthYear(addMonths(preview.firstEmiDate, preview.tenureMonths - 1))}
                />
              </dl>
              {preview.annualRate === 0 && (
                <ToneBadge tone="info">0% — we split it evenly</ToneBadge>
              )}
            </>
          ) : (
            <p>Fill in the numbers to see your EMI.</p>
          )}
          {touched && result.error && (
            <Alert className="bg-bad">
              <AlertCircle />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" variant="neutral" size="lg" disabled={saving} className="w-full">
            {saving ? "Saving…" : submitLabel}
          </Button>
          <p className="text-xs">
            Estimates use standard reducing-balance maths. Your bank's figures may differ by a few
            rupees.
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}

function RateField({
  d,
  set,
}: {
  d: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
}) {
  return (
    <Field label="Interest rate (% a year)" hint={`Typical: ${loanKinds[d.kind].typicalRate}%`}>
      {(id) => (
        <Input
          id={id}
          type="number"
          min={0}
          max={60}
          step="0.01"
          value={d.rate}
          placeholder={String(loanKinds[d.kind].typicalRate)}
          onChange={(e) => set("rate", e.target.value)}
        />
      )}
    </Field>
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
    <div className="grid content-start gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {hint && <p className="text-xs text-foreground/70">{hint}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="font-heading">{value}</dd>
    </div>
  );
}
