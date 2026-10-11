// The financial twin: a month-by-month projection of someone's money, and the same
// projection with "what if" changes applied. Pure functions (tested with `node --test`).
import { addMonths, loanStatus, monthlyRate, parseDate, toISODate, type Loan } from "./loans.ts";

export type Goal = { id: string; name: string; target: number; date: string };

export type Assumptions = {
  /** Yearly increase in take-home pay, %. */
  raisePct: number;
  /** Yearly increase in spending, %. */
  inflationPct: number;
  /** Yearly return on investments, %. */
  returnPct: number;
};

export type Twin = {
  takeHome: number; // monthly
  spending: number; // monthly, excluding EMIs
  savings: number; // cash, bank, FDs
  investments: number; // mutual funds, stocks, EPF/PPF…
  monthlySip: number; // already invested every month
  goals: Goal[];
  assumptions: Assumptions;
};

export const defaultAssumptions: Assumptions = { raisePct: 7, inflationPct: 6, returnPct: 8 };

/** Interest earned on cash (savings account), % a year. */
export const SAVINGS_RATE_PCT = 3;
/** Months of spending + EMIs that cash should cover. */
export const CUSHION_TARGET = 3;
/** Projection length: long enough to see most loans and goals finish. */
export const HORIZON_MONTHS = 360;

export type Change =
  | {
      type: "purchase";
      label: string;
      amount: number;
      date: string;
      financing: "cash" | "loan";
      downPayment: number;
      rate: number;
      months: number;
    }
  /** New monthly take-home pay from `date`; temporary if `months` is set (0 = a break). */
  | { type: "income"; amount: number; date: string; months: number | null }
  /** Extra (or, if negative, less) monthly spending from `date`. */
  | { type: "spending"; delta: number; date: string; months: number | null }
  | { type: "prepay"; loanId: string; amount: number; date: string }
  /** Extra monthly investing from `date`. */
  | { type: "sip"; delta: number; date: string };

export type Scenario = { id: string; name: string; changes: Change[]; createdAt: string };

export type Point = {
  date: string;
  netWorth: number;
  cash: number;
  investments: number;
  debt: number;
  income: number;
  /** Spending + EMIs. */
  outgo: number;
  /** Left over after spending, EMIs and investing. */
  free: number;
};

export type GoalOutcome = { goal: Goal; reached: string | null; monthsLate: number | null };
export type LoanEnd = { id: string; name: string; date: string; emi: number };

export type Projection = {
  start: string;
  points: Point[];
  goals: GoalOutcome[];
  loanEnds: LoanEnd[];
  hasDebt: boolean;
  /** Null when there's no debt, or it isn't repaid within the horizon. */
  debtFreeDate: string | null;
  /** First month cash covers less than CUSHION_TARGET months of outgo. */
  lowCushionFrom: string | null;
  lowestCushion: number;
  lowestCushionDate: string;
  /** First month money runs out (savings and investments both empty). */
  runsOutFrom: string | null;
};

const EPS = 0.5;

export const monthStart = (today: Date) =>
  toISODate(new Date(today.getFullYear(), today.getMonth(), 1));

export function monthIndex(startIso: string, iso: string) {
  const a = parseDate(startIso);
  const b = parseDate(iso);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/** The loan a "buy it on EMI" change creates. */
export function loanForPurchase(c: Extract<Change, { type: "purchase" }>, key: string): Loan {
  return {
    id: `whatif-${key}`,
    name: c.label || "New loan",
    kind: "other",
    lender: "",
    principal: Math.max(0, c.amount - c.downPayment),
    annualRate: c.rate,
    tenureMonths: Math.max(1, c.months),
    firstEmiDate: addMonths(c.date, 1),
    createdAt: c.date,
  };
}

export function project(
  twin: Twin,
  loans: Loan[],
  changes: Change[] = [],
  today: Date = new Date(),
): Projection {
  const start = monthStart(today);
  const at = (iso: string) => Math.max(0, monthIndex(start, iso));
  const a = twin.assumptions;
  const raise = 1 + a.raisePct / 100;
  const inflation = 1 + a.inflationPct / 100;
  const investGrowth = 1 + a.returnPct / 100 / 12;
  const cashGrowth = 1 + SAVINGS_RATE_PCT / 100 / 12;

  const allLoans = [
    ...loans,
    ...changes.flatMap((c, i) =>
      c.type === "purchase" && c.financing === "loan" && c.amount > c.downPayment
        ? [loanForPurchase(c, String(i))]
        : [],
    ),
  ];
  const debts = allLoans
    .map((loan) => ({ loan, s: loanStatus(loan, today) }))
    .filter(({ s }) => !s.closed)
    .map(({ loan, s }) => ({
      id: loan.id,
      name: loan.name,
      r: monthlyRate(loan.annualRate),
      emi: s.emi,
      bal: s.outstanding,
      from: at(s.nextDue!),
      end: null as string | null,
    }));

  const goals = [...twin.goals]
    .sort((x, y) => x.date.localeCompare(y.date))
    .map((goal) => ({
      goal,
      due: at(goal.date),
      reached: null as string | null,
      late: null as number | null,
    }));

  let cash = twin.savings;
  let invested = twin.investments;
  const points: Point[] = [];
  const loanEnds: LoanEnd[] = [];
  let lowCushionFrom: string | null = null;
  let lowestCushion = Infinity;
  let lowestCushionDate = start;
  let runsOutFrom: string | null = null;

  for (let m = 0; m < HORIZON_MONTHS; m++) {
    const date = addMonths(start, m);
    const year = Math.floor(m / 12);
    const active = (from: number, months: number | null) =>
      m >= from && (months === null || m < from + months);

    // Income: the latest income change in effect, otherwise the usual pay with yearly raises.
    let income = twin.takeHome * Math.pow(raise, year);
    for (const c of changes) {
      if (c.type !== "income") continue;
      const from = at(c.date);
      if (!active(from, c.months)) continue;
      income =
        c.months === null ? c.amount * Math.pow(raise, Math.floor((m - from) / 12)) : c.amount;
    }

    let spending = twin.spending;
    let sip = twin.monthlySip;
    let oneOff = 0;
    for (const c of changes) {
      if (c.type === "spending" && active(at(c.date), c.months)) spending += c.delta;
      if (c.type === "sip" && m >= at(c.date)) sip += c.delta;
      if (c.type === "purchase" && at(c.date) === m) {
        oneOff += c.financing === "cash" ? c.amount : Math.min(c.downPayment, c.amount);
      }
    }
    spending = Math.max(0, spending) * Math.pow(inflation, year);
    sip = Math.max(0, sip);

    let emis = 0;
    for (const d of debts) {
      if (m < d.from || d.bal <= EPS) continue;
      const interest = d.bal * d.r;
      const pay = Math.min(d.emi, d.bal + interest);
      d.bal += interest - pay;
      emis += pay;
    }
    for (const c of changes) {
      if (c.type !== "prepay" || at(c.date) !== m) continue;
      const d = debts.find((x) => x.id === c.loanId);
      if (!d) continue;
      const pay = Math.min(c.amount, d.bal);
      d.bal -= pay;
      oneOff += pay;
    }
    for (const d of debts) {
      if (d.end === null && d.bal <= EPS && m >= d.from) {
        d.bal = 0;
        d.end = date;
        loanEnds.push({ id: d.id, name: d.name, date, emi: d.emi });
      }
    }

    const outgo = spending + emis;
    const free = income - outgo - sip;
    cash += free - oneOff;
    invested += sip;

    // Goals are paid for in date order, as soon as there's enough money.
    for (const g of goals) {
      if (g.reached) continue;
      if (m < g.due) break;
      if (cash + invested < g.goal.target) break;
      cash -= g.goal.target;
      g.reached = date;
      g.late = m - g.due;
    }

    // Cover any cash shortfall from investments; beyond that, money has run out.
    if (cash < 0) {
      invested += cash;
      cash = 0;
      if (invested < 0) {
        cash = invested;
        invested = 0;
      }
    }
    if (cash < 0 && runsOutFrom === null) runsOutFrom = date;

    cash = cash > 0 ? cash * cashGrowth : cash;
    invested *= investGrowth;

    const cushion = outgo > 0 ? cash / outgo : Infinity;
    if (cushion < lowestCushion) {
      lowestCushion = cushion;
      lowestCushionDate = date;
    }
    if (cushion < CUSHION_TARGET && lowCushionFrom === null) lowCushionFrom = date;

    const debt = debts.reduce((sum, d) => sum + d.bal, 0);
    points.push({
      date,
      netWorth: cash + invested - debt,
      cash,
      investments: invested,
      debt,
      income,
      outgo,
      free,
    });
  }

  const hasDebt = debts.length > 0;
  const allRepaid = debts.every((d) => d.end !== null);
  const ends = debts
    .map((d) => d.end)
    .filter((e): e is string => !!e)
    .sort();
  return {
    start,
    points,
    goals: goals.map((g) => ({ goal: g.goal, reached: g.reached, monthsLate: g.late })),
    loanEnds,
    hasDebt,
    debtFreeDate: hasDebt && allRepaid ? ends[ends.length - 1] : null,
    lowCushionFrom,
    lowestCushion,
    lowestCushionDate,
    runsOutFrom,
  };
}

/** Months from `before` to `after` (positive = later); null if either is missing. */
const shift = (before: string | null, after: string | null) =>
  before && after ? monthIndex(before, after) : null;

export function compareProjections(base: Projection, alt: Projection) {
  const netWorthAt = (p: Projection, m: number) =>
    p.points[Math.min(m, p.points.length - 1)].netWorth;
  return {
    netWorth5: netWorthAt(alt, 59) - netWorthAt(base, 59),
    netWorth10: netWorthAt(alt, 119) - netWorthAt(base, 119),
    goals: base.goals.map((g, i) => ({
      goal: g.goal,
      before: g.reached,
      after: alt.goals[i]?.reached ?? null,
      shift: shift(g.reached, alt.goals[i]?.reached ?? null),
    })),
    debtFree: {
      before: base.debtFreeDate,
      after: alt.debtFreeDate,
      shift: shift(base.debtFreeDate, alt.debtFreeDate),
    },
    cushion: { before: base.lowestCushion, after: alt.lowestCushion },
    runsOut: { before: base.runsOutFrom, after: alt.runsOutFrom },
  };
}
