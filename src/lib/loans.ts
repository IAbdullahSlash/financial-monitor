// Loan maths: EMIs, repayment schedules, prepayment and payoff plans.
// Pure functions with no imports so they can be unit-tested directly with `node --test`.
// Dates are ISO "YYYY-MM-DD" strings interpreted as local calendar dates.

export type LoanKind =
  | "home"
  | "car"
  | "personal"
  | "education"
  | "gold"
  | "credit_card"
  | "no_cost_emi"
  | "bnpl"
  | "other";

export const loanKinds: Record<LoanKind, { label: string; emoji: string; typicalRate: number }> = {
  home: { label: "Home loan", emoji: "🏠", typicalRate: 8.5 },
  car: { label: "Car / bike loan", emoji: "🚗", typicalRate: 9.5 },
  personal: { label: "Personal loan", emoji: "💸", typicalRate: 13 },
  education: { label: "Education loan", emoji: "🎓", typicalRate: 10 },
  gold: { label: "Gold loan", emoji: "🪙", typicalRate: 9.5 },
  credit_card: { label: "Credit card EMI", emoji: "💳", typicalRate: 16 },
  no_cost_emi: { label: "No-cost EMI", emoji: "📱", typicalRate: 0 },
  bnpl: { label: "Pay later", emoji: "🛍️", typicalRate: 0 },
  other: { label: "Other", emoji: "📄", typicalRate: 12 },
};

/** A correction the user enters from their bank statement. */
export type BalanceCheck = { amount: number; date: string };

export type Loan = {
  id: string;
  name: string;
  kind: LoanKind;
  lender: string;
  /** Amount borrowed (or the balance when tracking started, for loans added mid-way). */
  principal: number;
  /** Annual interest rate in percent, e.g. 8.5. */
  annualRate: number;
  tenureMonths: number;
  firstEmiDate: string;
  /** The bank's exact EMI, if it differs from the calculated one. */
  emi?: number | null;
  balanceCheck?: BalanceCheck | null;
  createdAt: string;
};

export type Row = {
  /** 0-based EMI number over the life of the loan. */
  n: number;
  date: string;
  opening: number;
  emi: number;
  interest: number;
  principal: number;
  prepayment: number;
  closing: number;
};

const MAX_MONTHS = 600;
const EPS = 0.005;

// ---------- dates ----------

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Adds months, keeping the anchor's day of month and clamping to month end (31 Jan + 1 → 29 Feb). */
export function addMonths(anchorIso: string, k: number): string {
  const a = parseDate(anchorIso);
  const target = new Date(a.getFullYear(), a.getMonth() + k, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(a.getDate(), lastDay));
  return toISODate(target);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// ---------- core formulas ----------

export const monthlyRate = (annualRate: number) => annualRate / 12 / 100;

/** Standard reducing-balance EMI. A 0% loan is simply split evenly. */
export function calcEmi(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return principal;
  const r = monthlyRate(annualRate);
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

/** Months needed to clear `balance` paying `emi`; null if the EMI never covers the interest. */
export function monthsToRepay(balance: number, annualRate: number, emi: number): number | null {
  if (balance <= EPS) return 0;
  if (emi <= 0) return null;
  const r = monthlyRate(annualRate);
  if (r === 0) return Math.ceil(balance / emi - 1e-9);
  if (emi <= balance * r) return null;
  const n = -Math.log(1 - (balance * r) / emi) / Math.log(1 + r);
  return Math.ceil(n - 1e-9);
}

/** Outstanding balance implied by `months` remaining EMIs. */
export function presentValue(emi: number, annualRate: number, months: number): number {
  const r = monthlyRate(annualRate);
  if (r === 0) return emi * months;
  return (emi * (1 - Math.pow(1 + r, -months))) / r;
}

export type AmortizeOptions = {
  balance: number;
  annualRate: number;
  emi: number;
  /** Date that EMI number 0 falls on; row i is due on anchorDate + (offset + i) months. */
  anchorDate: string;
  offset?: number;
  extraMonthly?: number;
  /** One-off prepayments, keyed by row index (0 = alongside the first EMI simulated). */
  lumpSums?: { index: number; amount: number }[];
  /** What a prepayment does: shorten the loan (keep EMI) or lower the EMI (keep end date). */
  prepayMode?: "tenure" | "emi";
};

export function amortize(o: AmortizeOptions): Row[] {
  const r = monthlyRate(o.annualRate);
  const offset = o.offset ?? 0;
  const extra = o.extraMonthly ?? 0;
  let emi = o.emi;
  let bal = o.balance;
  // Fixed end point used when prepayments lower the EMI instead of the tenure.
  const plannedMonths = monthsToRepay(bal, o.annualRate, emi) ?? MAX_MONTHS;
  const rows: Row[] = [];

  for (let i = 0; bal > EPS && i < MAX_MONTHS; i++) {
    const opening = bal;
    const interest = opening * r;
    const pay = Math.min(emi, opening + interest);
    bal = opening + interest - pay;

    const lump = (o.lumpSums ?? []).filter((l) => l.index === i).reduce((a, l) => a + l.amount, 0);
    const prepayment = Math.min(Math.max(0, extra + lump), bal);
    bal -= prepayment;
    if (bal < EPS) bal = 0;

    rows.push({
      n: offset + i,
      date: addMonths(o.anchorDate, offset + i),
      opening,
      emi: pay,
      interest,
      principal: pay - interest,
      prepayment,
      closing: bal,
    });

    if (o.prepayMode === "emi" && prepayment > 0 && bal > 0) {
      emi = calcEmi(bal, o.annualRate, Math.max(1, plannedMonths - (i + 1)));
    }
  }
  return rows;
}

// ---------- a single loan ----------

export const loanEmi = (loan: Loan) =>
  loan.emi && loan.emi > 0 ? loan.emi : calcEmi(loan.principal, loan.annualRate, loan.tenureMonths);

/** Full schedule, re-based on the latest balance check if the user entered one. */
export function loanSchedule(loan: Loan): Row[] {
  const emi = loanEmi(loan);
  const base = amortize({
    balance: loan.principal,
    annualRate: loan.annualRate,
    emi,
    anchorDate: loan.firstEmiDate,
  });
  const check = loan.balanceCheck;
  if (!check) return base;

  const checkDate = parseDate(check.date);
  const before = base.filter((row) => parseDate(row.date) <= checkDate);
  const after = amortize({
    balance: check.amount,
    annualRate: loan.annualRate,
    emi,
    anchorDate: loan.firstEmiDate,
    offset: before.length,
  });
  return [...before, ...after];
}

export type LoanStatus = {
  emi: number;
  outstanding: number;
  principalPaid: number;
  /** Share of the principal repaid, 0–1. */
  progress: number;
  interestPaid: number;
  interestRemaining: number;
  totalInterest: number;
  emisPaid: number;
  emisLeft: number;
  nextDue: string | null;
  endDate: string | null;
  closed: boolean;
  /** True if the EMI doesn't cover the interest, so the loan never ends. */
  neverEnds: boolean;
};

export function loanStatus(loan: Loan, today: Date = new Date()): LoanStatus {
  const rows = loanSchedule(loan);
  const t = startOfDay(today);
  const paidCount = rows.filter((row) => parseDate(row.date) <= t).length;
  const paid = rows.slice(0, paidCount);
  const remaining = rows.slice(paidCount);
  const outstanding = remaining.length ? remaining[0].opening : 0;
  const principalPaid = Math.max(0, loan.principal - outstanding);
  const interestPaid = paid.reduce((a, row) => a + row.interest, 0);
  const interestRemaining = remaining.reduce((a, row) => a + row.interest, 0);
  const last = rows[rows.length - 1];
  return {
    emi: remaining[0]?.emi ?? loanEmi(loan),
    outstanding,
    principalPaid,
    progress: loan.principal > 0 ? Math.min(1, principalPaid / loan.principal) : 1,
    interestPaid,
    interestRemaining,
    totalInterest: interestPaid + interestRemaining,
    emisPaid: paidCount,
    emisLeft: remaining.length,
    nextDue: remaining[0]?.date ?? null,
    endDate: last?.date ?? null,
    closed: remaining.length === 0,
    neverEnds: !!last && last.closing > EPS,
  };
}

/** Interest vs principal paid per calendar year, for charts. */
export function yearlyBreakdown(rows: Row[]) {
  const byYear = new Map<number, { year: number; principal: number; interest: number }>();
  for (const row of rows) {
    const year = parseDate(row.date).getFullYear();
    const y = byYear.get(year) ?? { year, principal: 0, interest: 0 };
    y.principal += row.principal + row.prepayment;
    y.interest += row.interest;
    byYear.set(year, y);
  }
  return [...byYear.values()];
}

/** Effect of one prepayment made alongside the next EMI: shorter loan vs smaller EMI. */
export function comparePrepayment(loan: Loan, amount: number, today: Date = new Date()) {
  const s = loanStatus(loan, today);
  const common = {
    balance: s.outstanding,
    annualRate: loan.annualRate,
    emi: s.emi,
    anchorDate: s.nextDue ?? toISODate(today),
  };
  const sum = (rows: Row[]) => rows.reduce((a, row) => a + row.interest, 0);
  const base = amortize(common);
  const lumpSums = [{ index: 0, amount }];
  const tenure = amortize({ ...common, lumpSums, prepayMode: "tenure" });
  const emi = amortize({ ...common, lumpSums, prepayMode: "emi" });
  const baseInterest = sum(base);
  return {
    baseline: { months: base.length, interest: baseInterest, endDate: base.at(-1)?.date ?? null },
    reduceTenure: {
      months: tenure.length,
      monthsSaved: base.length - tenure.length,
      interestSaved: baseInterest - sum(tenure),
      endDate: tenure.at(-1)?.date ?? null,
    },
    reduceEmi: {
      newEmi: emi[1]?.emi ?? emi[0]?.emi ?? 0,
      interestSaved: baseInterest - sum(emi),
      endDate: emi.at(-1)?.date ?? null,
    },
  };
}

// ---------- all loans together ----------

export type Strategy = "avalanche" | "snowball";

export type PortfolioPlan = {
  extraMonthly?: number;
  lumpSum?: number;
  strategy?: Strategy;
  /** Put a closed loan's EMI towards the remaining loans (off = everything runs as scheduled). */
  rollover?: boolean;
};

export type PortfolioResult = {
  debtFreeDate: string | null;
  totalInterest: number;
  months: number;
  /** Total outstanding at the end of each month, starting from today's balance. */
  timeline: { date: string; balance: number }[];
  endDates: Record<string, string>;
  /** Some loan's EMI doesn't cover its interest, so it never finishes. */
  neverEnds: boolean;
};

/**
 * Month-by-month simulation of every open loan. Extra money (monthly extra, lump sum, and
 * freed-up EMIs) goes to the highest-rate loan first (avalanche) or smallest balance first (snowball).
 */
export function simulatePortfolio(
  loans: Loan[],
  plan: PortfolioPlan = {},
  today: Date = new Date(),
): PortfolioResult {
  const { extraMonthly = 0, lumpSum = 0, strategy = "avalanche", rollover = false } = plan;
  const state = loans
    .map((loan) => ({ loan, s: loanStatus(loan, today) }))
    .filter(({ s }) => !s.closed)
    .map(({ loan, s }) => ({
      id: loan.id,
      r: monthlyRate(loan.annualRate),
      rate: loan.annualRate,
      emi: s.emi,
      bal: s.outstanding,
      nextDue: s.nextDue as string,
      end: null as string | null,
    }));

  const startMonth = toISODate(new Date(today.getFullYear(), today.getMonth(), 1));
  const timeline = [{ date: startMonth, balance: state.reduce((a, l) => a + l.bal, 0) }];
  const endDates: Record<string, string> = {};
  let totalInterest = 0;
  let freed = 0;
  let k = 0;

  const order = () =>
    state
      .filter((l) => l.bal > EPS)
      .sort((a, b) =>
        strategy === "avalanche"
          ? b.rate - a.rate || a.bal - b.bal
          : a.bal - b.bal || b.rate - a.rate,
      );

  for (; k < MAX_MONTHS && state.some((l) => l.bal > EPS); k++) {
    let closedThisMonth = 0;
    for (const l of state) {
      if (l.bal <= EPS) continue;
      const interest = l.bal * l.r;
      totalInterest += interest;
      l.bal = l.bal + interest - Math.min(l.emi, l.bal + interest);
    }

    let pool = extraMonthly + (rollover ? freed : 0) + (k === 0 ? lumpSum : 0);
    for (const l of order()) {
      if (pool <= 0) break;
      const pay = Math.min(pool, l.bal);
      l.bal -= pay;
      pool -= pay;
    }

    for (const l of state) {
      if (l.end === null && l.bal <= EPS) {
        l.bal = 0;
        l.end = addMonths(l.nextDue, k);
        endDates[l.id] = l.end;
        closedThisMonth += l.emi;
      }
    }
    freed += closedThisMonth;
    timeline.push({
      date: addMonths(startMonth, k + 1),
      balance: state.reduce((a, l) => a + l.bal, 0),
    });
  }

  const ends = Object.values(endDates).sort();
  const neverEnds = state.some((l) => l.end === null);
  return {
    debtFreeDate: neverEnds ? null : (ends[ends.length - 1] ?? null),
    totalInterest,
    months: k,
    timeline,
    endDates,
    neverEnds,
  };
}
