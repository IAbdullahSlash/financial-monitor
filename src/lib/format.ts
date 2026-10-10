import { parseDate } from "@/lib/loans";

/** Compact rupees: ₹8.7k, ₹12.50L, ₹1.20Cr. */
export function inr(n: number) {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 10000000) return `${sign}₹${(a / 10000000).toFixed(2)}Cr`;
  if (a >= 100000) return `${sign}₹${(a / 100000).toFixed(2)}L`;
  if (a >= 1000) return `${sign}₹${(a / 1000).toFixed(1)}k`;
  return `${sign}₹${Math.round(a)}`;
}

const fullFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Exact rupees with Indian grouping: ₹8,67,823. */
export const inrFull = (n: number) =>
  Number.isFinite(n) ? fullFormatter.format(Math.round(n)) : "—";

export function monthYear(iso: string | null | undefined) {
  if (!iso) return "—";
  return parseDate(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function dayMonth(iso: string | null | undefined) {
  if (!iso) return "—";
  return parseDate(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** 38 → "3 yrs 2 mos". */
export function duration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y === 1 ? "" : "s"}`);
  if (m || !y) parts.push(`${m} mo${m === 1 ? "" : "s"}`);
  return parts.join(" ");
}
