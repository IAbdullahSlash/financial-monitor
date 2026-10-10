import { useMemo, useState } from "react";
import { SketchCard, SectionLabel, StatusChip } from "@/components/fintwin/ui";
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
import { newId } from "@/hooks/use-loans";
import { cn } from "@/lib/utils";

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

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr] items-start">
      <div className="grid gap-5">
        <SketchCard hoverable={false}>
          <SectionLabel>What kind of loan?</SectionLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {(Object.keys(loanKinds) as LoanKind[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={d.kind === k}
                onClick={() => {
                  set("kind", k);
                  if (k === "no_cost_emi" || k === "bnpl") set("rate", "0");
                }}
                className={cn("sketch-btn-ghost text-sm", d.kind === k && "bg-marker")}
              >
                {loanKinds[k].emoji} {loanKinds[k].label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-5">
            <Field label="Name it" hint="So you recognise it">
              <input
                className="sketch-input"
                value={d.name}
                placeholder={loanKinds[d.kind].label}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Lender" hint="Optional">
              <input
                className="sketch-input"
                value={d.lender}
                placeholder="e.g. HDFC, SBI, Bajaj"
                onChange={(e) => set("lender", e.target.value)}
              />
            </Field>
          </div>
        </SketchCard>

        <SketchCard hoverable={false}>
          {!existing && (
            <div className="flex flex-wrap gap-2 mb-5" role="tablist">
              <ModeButton active={mode === "original"} onClick={() => setMode("original")}>
                I know the original loan
              </ModeButton>
              <ModeButton active={mode === "remaining"} onClick={() => setMode("remaining")}>
                I only know my EMI & what's left
              </ModeButton>
            </div>
          )}

          {mode === "original" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Amount borrowed (₹)">
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className="sketch-input"
                  value={d.principal}
                  placeholder="2500000"
                  onChange={(e) => set("principal", e.target.value)}
                />
              </Field>
              <RateField d={d} set={set} />
              <Field label="Tenure">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    className="sketch-input"
                    value={d.years}
                    placeholder="20"
                    aria-label="Years"
                    onChange={(e) => set("years", e.target.value)}
                  />
                  <span className="self-center text-sm">yrs</span>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    className="sketch-input"
                    value={d.months}
                    placeholder="0"
                    aria-label="Months"
                    onChange={(e) => set("months", e.target.value)}
                  />
                  <span className="self-center text-sm">mos</span>
                </div>
              </Field>
              <Field label="First EMI date">
                <input
                  type="date"
                  className="sketch-input"
                  value={d.firstEmiDate}
                  onChange={(e) => set("firstEmiDate", e.target.value)}
                />
              </Field>
              <Field label="Bank's exact EMI (₹)" hint="Optional — if it differs from ours">
                <input
                  type="number"
                  min={0}
                  className="sketch-input"
                  value={d.bankEmi}
                  placeholder={previewEmi ? String(Math.round(previewEmi)) : ""}
                  onChange={(e) => set("bankEmi", e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Current EMI (₹)">
                <input
                  type="number"
                  min={1}
                  className="sketch-input"
                  value={d.currentEmi}
                  placeholder="23500"
                  onChange={(e) => set("currentEmi", e.target.value)}
                />
              </Field>
              <Field label="EMIs left">
                <input
                  type="number"
                  min={1}
                  className="sketch-input"
                  value={d.emisLeft}
                  placeholder="48"
                  onChange={(e) => set("emisLeft", e.target.value)}
                />
              </Field>
              <RateField d={d} set={set} />
              <Field label="Next EMI date">
                <input
                  type="date"
                  className="sketch-input"
                  value={d.nextEmiDate}
                  onChange={(e) => set("nextEmiDate", e.target.value)}
                />
              </Field>
            </div>
          )}
        </SketchCard>
      </div>

      <SketchCard className="lg:sticky lg:top-24 bg-marker" hoverable={false}>
        <SectionLabel>Preview</SectionLabel>
        {preview ? (
          <>
            <div className="font-headline text-3xl">{inrFull(previewEmi)}/month</div>
            <dl className="mt-3 grid gap-1 text-sm">
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
              <div className="mt-3">
                <StatusChip tone="info">0% — we split it evenly</StatusChip>
              </div>
            )}
          </>
        ) : (
          <p className="hand text-lg">Fill in the numbers to see your EMI.</p>
        )}
        {touched && result.error && (
          <div className="chip bg-coral text-white text-xs mt-4">{result.error}</div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="sketch-btn w-full justify-center mt-5 disabled:opacity-60"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <p className="text-xs mt-3 opacity-80">
          Estimates use standard reducing-balance maths. Your bank's figures may differ by a few
          rupees.
        </p>
      </SketchCard>
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
      <input
        type="number"
        min={0}
        max={60}
        step="0.01"
        className="sketch-input"
        value={d.rate}
        placeholder={String(loanKinds[d.kind].typicalRate)}
        onChange={(e) => set("rate", e.target.value)}
      />
    </Field>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn("sketch-btn-ghost text-sm", active && "bg-ink text-paper")}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mini-label">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="opacity-80">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
