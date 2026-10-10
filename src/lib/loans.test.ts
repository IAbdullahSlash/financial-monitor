// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMonths,
  amortize,
  calcEmi,
  comparePrepayment,
  loanSchedule,
  loanStatus,
  monthsToRepay,
  presentValue,
  simulatePortfolio,
  type Loan,
} from "./loans.ts";

const near = (actual: number, expected: number, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

const loan = (over: Partial<Loan>): Loan => ({
  id: "l1",
  name: "Test",
  kind: "home",
  lender: "Bank",
  principal: 1_000_000,
  annualRate: 8.5,
  tenureMonths: 240,
  firstEmiDate: "2024-01-05",
  createdAt: "2024-01-01",
  ...over,
});

test("EMI matches standard bank calculators", () => {
  near(calcEmi(1_000_000, 8.5, 240), 8678.23); // ₹10L, 8.5%, 20 yrs
  near(calcEmi(5_000_000, 8.5, 240), 43391.16); // ₹50L, 8.5%, 20 yrs
  near(calcEmi(500_000, 10.5, 60), 10746.95); // ₹5L, 10.5%, 5 yrs
});

test("0% loans (no-cost EMI) split evenly", () => {
  assert.equal(calcEmi(60_000, 0, 6), 10_000);
  assert.equal(
    amortize({ balance: 60_000, annualRate: 0, emi: 10_000, anchorDate: "2024-01-01" }).length,
    6,
  );
});

test("schedule repays exactly the principal in the stated tenure", () => {
  const emi = calcEmi(1_000_000, 8.5, 240);
  const rows = amortize({ balance: 1_000_000, annualRate: 8.5, emi, anchorDate: "2024-01-05" });
  assert.equal(rows.length, 240);
  near(
    rows.reduce((a, r) => a + r.principal, 0),
    1_000_000,
    0.05,
  );
  near(rows.at(-1)!.closing, 0);
  near(
    rows.reduce((a, r) => a + r.interest, 0),
    emi * 240 - 1_000_000,
    0.05,
  );
});

test("monthsToRepay and presentValue invert calcEmi", () => {
  const emi = calcEmi(750_000, 9.2, 84);
  assert.equal(monthsToRepay(750_000, 9.2, emi), 84);
  near(presentValue(emi, 9.2, 84), 750_000, 0.01);
  assert.equal(monthsToRepay(1_000_000, 12, 5_000), null); // EMI below interest
});

test("addMonths keeps the EMI day and clamps short months", () => {
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2024-01-31", 2), "2024-03-31");
  assert.equal(addMonths("2024-11-15", 3), "2025-02-15");
});

test("status counts EMIs paid up to today", () => {
  const s = loanStatus(loan({}), new Date(2024, 2, 10)); // 10 Mar 2024
  assert.equal(s.emisPaid, 3); // Jan, Feb, Mar
  assert.equal(s.emisLeft, 237);
  assert.equal(s.nextDue, "2024-04-05");
  assert.equal(s.endDate, "2043-12-05");
  assert.ok(s.outstanding < 1_000_000 && s.outstanding > 990_000);
  near(s.principalPaid + s.outstanding, 1_000_000);
});

test("a balance check from the bank statement replaces the calculated balance", () => {
  const l = loan({ balanceCheck: { amount: 900_000, date: "2024-03-20" } });
  const s = loanStatus(l, new Date(2024, 2, 25));
  near(s.outstanding, 900_000);
  assert.equal(loanSchedule(l)[3].date, "2024-04-05");
  assert.ok(s.emisLeft < 237); // lower balance, same EMI → finishes sooner
});

test("prepaying to shorten the loan saves more interest than lowering the EMI", () => {
  const c = comparePrepayment(loan({}), 200_000, new Date(2024, 0, 10));
  assert.ok(c.reduceTenure.interestSaved > c.reduceEmi.interestSaved);
  assert.ok(c.reduceEmi.interestSaved > 0);
  assert.ok(c.reduceTenure.monthsSaved > 0);
  assert.ok(c.reduceEmi.newEmi < calcEmi(1_000_000, 8.5, 240));
});

test("portfolio baseline finishes on the last loan's own end date", () => {
  const today = new Date(2024, 2, 10);
  const loans = [
    loan({}),
    loan({ id: "l2", principal: 300_000, annualRate: 14, tenureMonths: 36 }),
  ];
  const r = simulatePortfolio(loans, {}, today);
  assert.equal(r.debtFreeDate, loanStatus(loans[0], today).endDate);
  assert.equal(r.endDates.l2, loanStatus(loans[1], today).endDate);
});

test("extra payments end debt sooner; avalanche costs no more interest than snowball", () => {
  const today = new Date(2024, 2, 10);
  const loans = [
    loan({}),
    loan({ id: "l2", principal: 300_000, annualRate: 14, tenureMonths: 36 }),
    loan({ id: "l3", principal: 50_000, annualRate: 0, tenureMonths: 10, kind: "no_cost_emi" }),
  ];
  const base = simulatePortfolio(loans, {}, today);
  const ava = simulatePortfolio(loans, { extraMonthly: 10_000, strategy: "avalanche" }, today);
  const snow = simulatePortfolio(loans, { extraMonthly: 10_000, strategy: "snowball" }, today);
  assert.ok(ava.debtFreeDate! < base.debtFreeDate!);
  assert.ok(ava.totalInterest < base.totalInterest);
  assert.ok(ava.totalInterest <= snow.totalInterest + 0.01);
});

test("a loan whose EMI never covers interest is flagged, not looped forever", () => {
  const l = loan({ principal: 1_000_000, annualRate: 12, emi: 5_000 });
  assert.equal(loanStatus(l, new Date(2024, 0, 10)).neverEnds, true);
  assert.equal(simulatePortfolio([l], {}, new Date(2024, 0, 10)).debtFreeDate, null);
});
