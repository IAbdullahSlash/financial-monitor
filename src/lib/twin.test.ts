// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { compareProjections, project, type Change, type Twin } from "./twin.ts";
import type { Loan } from "./loans.ts";

const near = (actual: number, expected: number, tol = 1) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

const today = new Date(2026, 9, 11); // 11 Oct 2026 → projection starts Oct 2026

// A flat world (no raises, inflation or returns) so every figure can be checked by hand.
const twin = (over: Partial<Twin> = {}): Twin => ({
  takeHome: 100_000,
  spending: 60_000,
  savings: 300_000,
  investments: 0,
  monthlySip: 0,
  goals: [],
  assumptions: { raisePct: 0, inflationPct: 0, returnPct: 0 },
  ...over,
});
const loan = (over: Partial<Loan> = {}): Loan => ({
  id: "car",
  name: "Car loan",
  kind: "car",
  lender: "",
  principal: 120_000,
  annualRate: 0,
  tenureMonths: 12,
  firstEmiDate: "2026-10-05",
  createdAt: "2026-10-01",
  ...over,
});

test("surplus accumulates month by month", () => {
  const p = project(twin({ monthlySip: 10_000 }), [], [], today);
  assert.equal(p.start, "2026-10-01");
  assert.equal(p.points[0].free, 30_000);
  near(p.points[0].investments, 10_000);
  assert.ok(p.points[11].cash > 300_000 + 12 * 30_000); // plus savings interest
  assert.equal(p.hasDebt, false);
  assert.equal(p.debtFreeDate, null);
});

test("EMIs come out of the surplus and are freed when the loan ends", () => {
  const p = project(twin(), [loan()], [], today);
  assert.equal(p.points[0].free, 40_000); // EMI already paid on 5 Oct → first in Nov
  assert.equal(p.points[1].free, 40_000 - 10_000);
  assert.equal(p.loanEnds[0].date, "2027-09-01");
  assert.equal(p.debtFreeDate, "2027-09-01");
  assert.equal(p.points[12].free, 40_000);
});

test("a goal is reached on its date when affordable, later when not", () => {
  const goals = [
    { id: "a", name: "Trip", target: 200_000, date: "2027-01-01" },
    { id: "b", name: "Car", target: 2_000_000, date: "2027-06-01" },
  ];
  const p = project(twin({ goals }), [], [], today);
  assert.equal(p.goals[0].reached, "2027-01-01");
  assert.equal(p.goals[0].monthsLate, 0);
  assert.ok(p.goals[1].monthsLate! > 0);
});

test("buying in cash lowers net worth by the price", () => {
  const change: Change = {
    type: "purchase",
    label: "Bike",
    amount: 150_000,
    date: "2026-12-01",
    financing: "cash",
    downPayment: 0,
    rate: 0,
    months: 0,
  };
  const base = project(twin(), [], [], today);
  const alt = project(twin(), [], [change], today);
  near(base.points[1].netWorth - alt.points[1].netWorth, 0);
  near(base.points[2].netWorth - alt.points[2].netWorth, 150_000, 1_000); // + lost savings interest
});

test("buying on a 0% loan costs the same in the end but spreads it out", () => {
  const change: Change = {
    type: "purchase",
    label: "Phone",
    amount: 120_000,
    date: "2026-10-01",
    financing: "loan",
    downPayment: 0,
    rate: 0,
    months: 12,
  };
  const alt = project(twin(), [], [change], today);
  assert.equal(alt.hasDebt, true);
  assert.equal(alt.points[1].free, 30_000); // first EMI in Nov
  assert.equal(alt.debtFreeDate, "2027-10-01");
  // Same total cost, but cash stays in the bank longer, so a true 0% EMI beats paying upfront.
  const cash = project(twin(), [], [{ ...change, financing: "cash" }], today);
  const gap = alt.points[24].netWorth - cash.points[24].netWorth;
  assert.ok(gap > 0 && gap < 5_000, `gap ${gap}`);
});

test("a 6-month break with no income costs six months of pay", () => {
  const change: Change = { type: "income", amount: 0, date: "2027-01-01", months: 6 };
  const base = project(twin(), [], [], today);
  const alt = project(twin(), [], [change], today);
  assert.equal(alt.points[3].income, 0);
  assert.equal(alt.points[9].income, 100_000);
  near(base.points[8].netWorth - alt.points[8].netWorth, 600_000, 15_000);
});

test("prepaying an interest-bearing loan ends it sooner and raises long-term net worth", () => {
  const home = loan({ id: "home", principal: 2_000_000, annualRate: 9, tenureMonths: 180 });
  const prepay: Change = { type: "prepay", loanId: "home", amount: 300_000, date: "2026-11-01" };
  const base = project(twin({ savings: 500_000 }), [home], [], today);
  const alt = project(twin({ savings: 500_000 }), [home], [prepay], today);
  const c = compareProjections(base, alt);
  assert.ok(c.debtFree.shift! < 0);
  assert.ok(alt.points[179].netWorth > base.points[179].netWorth);
});

test("spending more than you earn runs the money out", () => {
  const p = project(twin({ spending: 150_000, savings: 100_000 }), [], [], today);
  assert.equal(p.runsOutFrom, "2026-12-01"); // ₹1L at -₹50k/month: Oct, Nov, then empty
  assert.ok(p.lowCushionFrom! <= "2026-10-01");
});

test("comparison reports goal delays caused by a change", () => {
  const goals = [{ id: "h", name: "House", target: 1_000_000, date: "2027-12-01" }];
  const car: Change = {
    type: "purchase",
    label: "Car",
    amount: 800_000,
    date: "2026-11-01",
    financing: "cash",
    downPayment: 0,
    rate: 0,
    months: 0,
  };
  const c = compareProjections(
    project(twin({ goals }), [], [], today),
    project(twin({ goals }), [], [car], today),
  );
  assert.ok(c.goals[0].shift! > 0);
  assert.ok(c.netWorth5 < 0);
});
