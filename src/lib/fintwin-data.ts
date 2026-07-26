export type Cashflow = { month: string; income: number; expenses: number };
export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  targetDate: string;
  monthly: number;
  emoji: string;
};

export const profile = {
  name: "Aarav",
  age: 28,
  city: "Bengaluru",
  income: 145000,
  expenses: 78000,
  savings: 420000,
  emergencyFund: 210000,
  debts: 260000,
  riskAppetite: "Moderate" as "Low" | "Moderate" | "High",
};

export const cashflow: Cashflow[] = [
  { month: "Feb", income: 140000, expenses: 82000 },
  { month: "Mar", income: 145000, expenses: 76000 },
  { month: "Apr", income: 145000, expenses: 88000 },
  { month: "May", income: 148000, expenses: 74000 },
  { month: "Jun", income: 145000, expenses: 79000 },
  { month: "Jul", income: 152000, expenses: 78000 },
];

export const goals: Goal[] = [
  { id: "g1", name: "Emergency Fund", target: 500000, saved: 210000, targetDate: "Dec 2026", monthly: 15000, emoji: "🛟" },
  { id: "g2", name: "Japan Trip", target: 250000, saved: 90000, targetDate: "Mar 2027", monthly: 12000, emoji: "🗾" },
  { id: "g3", name: "Home Down Payment", target: 2500000, saved: 320000, targetDate: "Jul 2029", monthly: 35000, emoji: "🏡" },
  { id: "g4", name: "New MacBook", target: 180000, saved: 65000, targetDate: "Nov 2026", monthly: 8000, emoji: "💻" },
];

export const healthBreakdown = [
  { label: "Emergency Fund", weight: 25, score: 62, tone: "warn" },
  { label: "Savings Rate", weight: 20, score: 78, tone: "good" },
  { label: "Debt Load", weight: 20, score: 55, tone: "warn" },
  { label: "Goal Progress", weight: 15, score: 71, tone: "good" },
  { label: "Investment Mix", weight: 10, score: 48, tone: "risk" },
  { label: "Insurance", weight: 10, score: 40, tone: "risk" },
] as const;

export const netWorth = [
  { name: "Cash & Bank", value: 420000, color: "var(--sky)" },
  { name: "Mutual Funds", value: 380000, color: "var(--mint)" },
  { name: "Stocks", value: 220000, color: "var(--butter)" },
  { name: "EPF/PPF", value: 310000, color: "var(--coral)" },
  { name: "Gold", value: 90000, color: "var(--ink)" },
];

export const decisionExamples = [
  "Buy an iPhone 16 Pro",
  "Move to Bengaluru",
  "Quit my job for 6 months",
  "Take a ₹8L personal loan",
  "Start a SIP of ₹20k",
  "Buy a car worth ₹12L",
];

export const lifeEvents = [
  { id: "wedding", title: "Wedding in 18 months", cost: 1500000, monthly: 62000, feasible: true },
  { id: "kid", title: "First child in 2 years", cost: 800000, monthly: 22000, feasible: true },
  { id: "sabbatical", title: "Sabbatical for 6 months", cost: 900000, monthly: 0, feasible: false },
  { id: "mba", title: "MBA abroad in 3 years", cost: 4500000, monthly: 80000, feasible: false },
];

export function inr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

export function simulateDecision(amount: number, months: number) {
  const monthly = Math.round(amount / Math.max(months, 1));
  const surplus = profile.income - profile.expenses;
  const emergencyMonths = profile.emergencyFund / profile.expenses;
  const ratio = monthly / surplus;
  let verdict: "safe" | "risky" | "no" = "safe";
  if (ratio > 0.7 || emergencyMonths < 3) verdict = "no";
  else if (ratio > 0.4) verdict = "risky";
  const emergencyImpact = Math.min(100, Math.round(ratio * 60));
  const goalDelayMonths = Math.round(ratio * 8);
  return { monthly, surplus, ratio, verdict, emergencyImpact, goalDelayMonths, emergencyMonths };
}

export function computeHealthScore() {
  const total = healthBreakdown.reduce((a, b) => a + (b.score * b.weight) / 100, 0);
  return Math.round(total);
}
